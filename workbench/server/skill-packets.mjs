import fs from "node:fs";
import { outputRoots, projectRelative } from "../../.agents/project-layout.mjs";
import path from "node:path";
import {
  check,
  contained,
  sha,
  unwrapScript,
  walk,
  assetName,
} from "./files.mjs";
import { parseScreenplay } from "../../.agents/skills/shotlist-breakdown-workflow/scripts/index-screenplay-scenes.mjs";
import { importMarkdown } from "../shared/screenplay.ts";

const str = { type: "string" },
  strings = { type: "array", items: str };
const array = (items) => ({ type: "array", items });
const object = (properties) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const dialogue = object({
  speaker_cue: str,
  text: str,
  mode: { type: "string", enum: ["lip_sync", "os", "vo"] },
  addressee: str,
});
export const planSchemas = {
  storyboard: object({
    summary: str,
    synopsis: str,
    emotion: str,
    blocking: str,
    continuity_notes: strings,
    shots: array(
      object({
        id: str,
        title: str,
        description: str,
        camera: str,
        sound: str,
        duration_seconds: { type: "number" },
        source_shot_numbers: array({ type: "integer" }),
        dialogue: array(dialogue),
        references: strings,
        risks: strings,
      }),
    ),
    envelopes: array(
      object({ id: str, source_rows: strings, grouping_reason: str }),
    ),
  }),
  assets: object({
    summary: str,
    continuity_rules: strings,
    open_gaps: strings,
    style: object({
      thesis: str,
      palette: str,
      lighting: str,
      texture: str,
      composition: str,
      avoid: str,
    }),
    assets: array(
      object({
        asset_name: str,
        display_name: str,
        kind: { type: "string", enum: ["image", "video", "audio"] },
        category: {
          type: "string",
          enum: ["character", "location", "prop", "audio", "graphic"],
        },
        scenes: strings,
        description: str,
        tag: str,
        source_quote: str,
        state_variants: array(
          object({ state: str, scenes: strings, facts: str }),
        ),
        continuity_notes: strings,
      }),
    ),
  }),
};

function validateSchema(value, schema, at = "结果") {
  if (schema.type === "object") {
    check(
      value && typeof value === "object" && !Array.isArray(value),
      `${at} 需要对象`,
    );
    for (const key of schema.required)
      check(Object.hasOwn(value, key), `${at} 缺少 ${key}`);
    for (const [key, item] of Object.entries(value)) {
      check(schema.properties[key], `${at} 出现未声明字段 ${key}`);
      validateSchema(item, schema.properties[key], `${at}.${key}`);
    }
  } else if (schema.type === "array") {
    check(Array.isArray(value), `${at} 需要数组`);
    value.forEach((v, i) => validateSchema(v, schema.items, `${at}[${i}]`));
  } else if (schema.type === "number" || schema.type === "integer") {
    check(
      Number.isFinite(value) &&
        (schema.type !== "integer" || Number.isInteger(value)),
      `${at} 数字无效`,
    );
  } else check(typeof value === schema.type, `${at} 类型无效`);
  if (schema.enum) check(schema.enum.includes(value), `${at} 不在允许值内`);
}
const read = (root, file) => fs.readFileSync(contained(root, file), "utf8");
const optional = (root, file) =>
  fs.existsSync(contained(root, file)) ? read(root, file) : "";
const pick = (value, keys) =>
  Object.fromEntries(
    keys.filter((k) => value[k] !== undefined).map((k) => [k, value[k]]),
  );
const compactAsset = (a) =>
  pick(a, [
    "asset_name",
    "display_name",
    "kind",
    "category",
    "scenes",
    "scene",
    "description",
    "tag",
    "state_variants",
    "continuity_notes",
    "reference_approval",
    "asset_origin",
    "reference_binding",
  ]);
export function sceneSlice(board, scene) {
  return {
    shots: (board?.shots || []).filter((s) => s.scene === scene),
    envelopes: (board?.envelopes || []).filter((e) => e.scene === scene),
    plan: board?.scene_plans?.[scene] ?? null,
  };
}
export const sceneHash = (board, scene) => sha(sceneSlice(board, scene));

export function sourceScenes(root, ref) {
  const bytes = fs.readFileSync(contained(root, ref.path));
  check(sha(bytes) === ref.sha256, "剧本文件与登记哈希不一致", 409);
  const body = unwrapScript(bytes.toString("utf8"));
  const parsed = parseScreenplay(body, ref.path, {
    previousScenes: ref.scene_map,
    numbering: ref.numbering,
  });
  check(
    !ref.scene_map?.length ||
      parsed.scenes.every((s) =>
        ref.scene_map.some(
          (m) => m.label === s.label && m.contentHash === s.contentHash,
        ),
      ),
    "Scene 索引与源剧本不一致",
    409,
  );
  return { body, scenes: parsed.scenes };
}

function inventory(store) {
  const selected = store.meta("asset_inventory");
  // Old projects already keep their adopted names/details in SQLite. Do not guess a guide version.
  return { ...(selected || {}), assets: store.list("asset").map(compactAsset) };
}
function selectedStyle(store, inv) {
  if (inv.style) return inv.style;
  let ref = store.meta("style_reference");
  if (!ref) {
    const applied = store
      .list("job")
      .filter((j) => j.stage === "assets" && j.applied_at)
      .sort((a, b) => b.applied_at.localeCompare(a.applied_at));
    const artifact = applied
      .flatMap((j) => j.result?.artifacts || [])
      .find((a) => /\/02_style_guide_v\d+\.md$/.test(a.path));
    if (artifact) ref = { path: artifact.path, sha256: sha(artifact.content) };
  }
  if (!ref) return null;
  const text = read(store.root, ref.path);
  check(
    sha(text) === ref.sha256,
    "已选风格指南发生变化，请先核对并登记版本",
    409,
  );
  return { reference: ref, markdown: unwrapScript(text) };
}
function sourceRows(body, scene, scenes) {
  const rows = [];
  for (const line of body.split(/\r?\n/)) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((s) => s.trim());
    if (
      cells.length < 4 ||
      !/^\d+$/.test(cells[0]) ||
      !/^\d+(?:\.\d+)?\s*s$/i.test(cells[2])
    )
      continue;
    const label = /^\d+$/.test(cells[1])
      ? `scene-${cells[1].padStart(3, "0")}`
      : cells[1];
    // A table's unscoped end cards stay with the last Scene; retain the original line verbatim.
    if (
      label === scene ||
      (["—", "-", ""].includes(label) && scene === scenes.at(-1)?.label)
    )
      rows.push({ number: Number(cells[0]), text: line });
  }
  return rows;
}
export function sourceDialogue(text) {
  // Reuse the editor's typed parser: Markdown blockquotes also contain phone messages,
  // prop cards and subtitles. They are not automatically spoken dialogue.
  const prepared = text.replace(
    /^([^\n：:]{1,45}(?:播报|旁白|画外|声音|耳麦)[^\n：:]{0,35})[：:]\s*\n(?=>)/gm,
    "**$1**：\n",
  );
  const blocks = importMarkdown(prepared).blocks,
    result = [];
  let speaker = "",
    aside = "";
  for (const b of blocks) {
    if (b.type === "character") {
      speaker = b.text;
      aside = "";
    } else if (b.type === "parenthetical") aside = b.text;
    else if (b.type === "dialogue")
      result.push({ speaker_cue: speaker + aside, text: b.text });
    else {
      speaker = "";
      aside = "";
    }
  }
  return result;
}

function auditExcerpt(text, scene) {
  const sections = text.split(/(?=^#{2,4}\s)/m);
  const n = Number(scene.match(/\d+/)?.[0]);
  const local = new RegExp(
    `${scene}|第\\s*${n}\\s*场|S0?${n}(?!\\d)|全剧|全片|P0|P1`,
    "i",
  );
  const selected = sections.filter((s, i) => i === 0 || local.test(s));
  return {
    section_index: sections.map((s) => s.split("\n")[0]),
    relevant_sections: selected.join("\n"),
    complete: selected.length === sections.length,
  };
}

export function makePacket(store, input, scriptRef, audit, selected) {
  const root = store.root,
    source = sourceScenes(root, scriptRef),
    inv = inventory(store),
    board = store.meta("storyboard");
  const common = {
    protocol: "workbench-plan-v1",
    stage: input.stage,
    mode: input.mode || "production",
    output_status:
      input.mode === "planning" ? "text_only_draft" : "design_draft",
    source_script: pick(scriptRef, [
      "artifact_id",
      "path",
      "version",
      "sha256",
    ]),
    scene_order: source.scenes.map((s) => s.label),
    source_audit: audit ? pick(audit, ["path", "sha256"]) : null,
    registry_skills: selected.map((s) =>
      pick(s, ["slot", "name", "path", "sha256"]),
    ),
    locks: optional(root, "deliverables/0_admin/locks.md"),
    naming:
      "保留既有 asset_name 和手动 tag 的每个字符；未提供真实 tag 时为空。新增名称是待审阅候选。",
    design_requirements: [
      "原分镜行只作来源覆盖索引，不要求一行对应一个 Shot Row。独立对白、反应、接触动作与空间转换需要可读的独立镜头设计。",
      "复杂动作可以在同一 Envelope 中保持连续，但不能为凑原表秒数把多次身体接触和位移挤成一个难以执行的短镜头；按可信表演调整设计时长，并保留原表作为对照。",
      "保持全部原动作、台词、声画信息和因果顺序。摄影写清景别、方向、运动及切镜理由；空间写清人物、关键道具、朝向、主轴、相机和遮挡。",
      "可修的镜头密度和时长问题在本次设计中处理；高影响剧情与几何冲突提供明确候选和风险，不替用户改 canon 或假称已批准。",
    ],
    instruction: input.instruction,
  };
  let packet;
  if (input.stage === "assets") {
    packet = {
      ...common,
      screenplay: source.body,
      scene_index: source.scenes.map((s) => ({
        scene: s.label,
        header: s.header,
      })),
      existing_assets: inv.assets,
      existing_style: selectedStyle(store, inv),
      audit: audit?.text || "",
    };
  } else {
    check(typeof input.scene === "string", "分镜任务需要明确选择一个 Scene");
    const index = source.scenes.findIndex((s) => s.label === input.scene),
      scene = source.scenes[index];
    check(scene, "所选 Scene 不在当前剧本中");
    const current = sceneSlice(board, scene.label);
    const related = new Set(current.shots.flatMap((s) => s.references || []));
    const assets = inv.assets
      .filter(
        (a) =>
          related.has(a.asset_name) ||
          a.scenes?.includes(scene.label) ||
          a.scene === scene.label ||
          (!a.scene && !a.scenes?.length),
      )
      .map((a) => {
        const stored = store.get("asset", a.asset_name),
          take =
            stored?.selected_take_id &&
            store.get("take", stored.selected_take_id);
        return {
          ...a,
          ...(take?.path
            ? {
                reference_media: pick(take, [
                  "take_id",
                  "path",
                  "sha256",
                  "kind",
                  "status",
                ]),
              }
            : {}),
        };
      });
    packet = {
      ...common,
      scene: scene.label,
      header: scene.header,
      source: source.body.slice(scene.startOffset, scene.endOffset),
      context: source.body.slice(0, source.scenes[0].startOffset),
      adjacent_headers: [
        source.scenes[index - 1]?.header,
        source.scenes[index + 1]?.header,
      ].filter(Boolean),
      source_rows: sourceRows(source.body, scene.label, source.scenes),
      audit: audit ? auditExcerpt(audit.text, scene.label) : null,
      assets,
      style: selectedStyle(store, inv),
      continuity_rules: inv.continuity_rules || [],
      adjacent_continuity: [source.scenes[index - 1], source.scenes[index + 1]]
        .filter(Boolean)
        .map((s) => ({
          scene: s.label,
          notes: board?.scene_plans?.[s.label]?.continuity_notes || [],
        })),
      existing_scene: current,
      identifier_rules:
        "修改既有镜头/Envelope 时沿用输入中的 id；新项使用 new-1、new-2 等本场临时 id。不要扫描全项目或分配 P###、文件名、版本、时长合计、markers；服务统一分配。仅返回当前 Scene，其他场由服务合并。",
    };
    packet.exact_dialogue = sourceDialogue(packet.source);
  }
  return {
    packet,
    baseline:
      input.stage === "storyboard"
        ? sceneHash(board, input.scene)
        : sha(inv.assets),
    input_hash: sha(packet),
  };
}

export function validatePlan(job, value) {
  validateSchema(value, planSchemas[job.stage]);
  const p = job.packet;
  if (job.stage === "assets") {
    check(value.assets.length > 0, "资产清单为空");
    const seen = new Set(),
      scenes = new Set(p.scene_index.map((s) => s.scene));
    for (const a of value.assets) {
      assetName(a.asset_name);
      check(!seen.has(a.asset_name), "重复的标准资产文件名");
      seen.add(a.asset_name);
      check(
        a.scenes.every((s) => scenes.has(s)),
        "资产引用了范围外 Scene",
      );
      const old = p.existing_assets.find((v) => v.asset_name === a.asset_name);
      check(
        old ||
          !/\.(?:png|jpe?g|webp|gif|svg|mp4|mov|wav|mp3|aac)$/i.test(
            a.asset_name,
          ),
        "新增资产标识必须是文件名主干，扩展名单独保存",
      );
      check(a.tag === (old?.tag || ""), "不得猜测或改写真实平台 tag");
      check(!old || old.kind === a.kind, "已有资产不能更改媒体类型");
      check(
        !a.source_quote || p.screenplay.includes(a.source_quote),
        "资产来源摘录不在源剧本中",
      );
    }
    return;
  }
  check(
    value.shots.length && value.envelopes.length,
    "需要完整 Shot Rows 和 Envelopes",
  );
  const ids = new Set(),
    envs = new Set(),
    used = new Set(),
    names = new Set(p.assets.map((a) => a.asset_name));
  const oldRows = new Set(p.existing_scene.shots.map((s) => s.id)),
    oldEnvs = new Set(p.existing_scene.envelopes.map((e) => e.id));
  for (const s of value.shots) {
    check(
      (oldRows.has(s.id) || /^new-[1-9]\d*$/.test(s.id)) && !ids.has(s.id),
      "镜头 ID 必须是既有 ID 或唯一 new-N",
    );
    ids.add(s.id);
    check(
      s.description.trim() && s.camera.trim(),
      "镜头画面与摄影设计不能为空",
    );
    check(s.duration_seconds > 0 && s.duration_seconds <= 300, "镜头时长无效");
    check(
      s.references.every((r) => names.has(r)),
      "镜头引用了输入清单之外的资产",
    );
  }
  for (const e of value.envelopes) {
    check(
      (oldEnvs.has(e.id) || /^new-[1-9]\d*$/.test(e.id)) && !envs.has(e.id),
      "Envelope ID 必须是既有 ID 或唯一 new-N",
    );
    envs.add(e.id);
    check(e.source_rows.length > 0, "空 Envelope");
    for (const id of e.source_rows) {
      check(
        ids.has(id) && !used.has(id),
        "Shot Row 必须存在并且只属于一个 Envelope",
      );
      used.add(id);
    }
    check(
      e.source_rows.reduce(
        (n, id) => n + value.shots.find((s) => s.id === id).duration_seconds,
        0,
      ) <= 300,
      "Envelope 超过规划时长上限",
    );
  }
  check(used.size === ids.size, "存在未分配到 Envelope 的镜头");
  check(
    JSON.stringify(value.envelopes.flatMap((e) => e.source_rows)) ===
      JSON.stringify(value.shots.map((s) => s.id)),
    "Envelope 必须按 Shot Row 顺序连续分组，不能重排或交叉引用",
  );
  const expected = p.source_rows.map((r) => r.number),
    actual = new Set(value.shots.flatMap((s) => s.source_shot_numbers));
  check(
    expected.every((n) => actual.has(n)) &&
      [...actual].every((n) => expected.includes(n)),
    "原分镜行覆盖不完整或引用了其他 Scene",
  );
  const spoken = value.shots.flatMap((s) => s.dialogue.map((d) => d.text));
  const expectedDialogue = sourceDialogue(p.source).map((d) => d.text);
  check(
    !expectedDialogue.length ||
      JSON.stringify(spoken) === JSON.stringify(expectedDialogue),
    "原对白必须逐字、逐轮保留，并保持顺序",
  );
  check(
    value.shots.every((s) => s.dialogue.length <= 1),
    "每轮独立对白需要独立 Shot Row",
  );
}

function nextVersion(root, stage, scene, store) {
  const prefix =
    stage === "assets" ? "deliverables/2_assets" : "deliverables/3_shotlist";
  const files = walk(contained(root, prefix), () => true, 2).map((f) =>
    path.relative(root, f),
  );
  for (const j of store.list("job"))
    for (const a of j.result?.artifacts || []) files.push(a.path);
  const pattern =
    stage === "assets"
      ? /(?:asset_inventory|02_asset_guide|02_style_guide)_v(\d+)/
      : new RegExp(`${scene}(?:_v|/v)(\\d+)`);
  return (
    Math.max(0, ...files.map((f) => Number(f.match(pattern)?.[1] || 0))) + 1
  );
}
const cell = (text) =>
  String(text ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
const bullets = (lines) =>
  lines?.length ? lines.map((s) => `- ${s}`).join("\n") : "- 无新增项。";
function artifactFamily(store, key, files) {
  const cached = store.meta(`artifact_family:${key}`);
  if (cached) return cached;
  for (const file of files) {
    const prior = fs.readFileSync(file, "utf8").match(/^- id:\s*(\S+)/m)?.[1];
    if (prior) return store.meta(`artifact_family:${key}`, prior);
  }
  const known = outputRoots(store.root).flatMap(folder => walk(
    contained(store.root, folder),
    (n) => /\.md$/.test(n),
    3,
  )).concat(walk(contained(store.root, "archives"), (n) => /\.md$/.test(n), 3));
  let sequence = store.meta("artifact_sequence") || 0;
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  for (const file of known) {
    const n = fs
      .readFileSync(file, "utf8")
      .match(new RegExp(`^- id: A-${date}-(\\d+)`, "m"));
    if (n) sequence = Math.max(sequence, Number(n[1]));
  }
  store.meta("artifact_sequence", ++sequence);
  return store.meta(
    `artifact_family:${key}`,
    `A-${date}-${String(sequence).padStart(3, "0")}`,
  );
}
function header(title, family, version, packet) {
  return `# Artifact: ${title}\n- id: ${family}\n- version: v${version}\n- upstream: [${packet.source_script.artifact_id || packet.source_script.path}]\n- source_script: ${packet.source_script.path}@v${packet.source_script.version}\n- source_sha256: ${packet.source_script.sha256}\n- source_audit: ${packet.source_audit?.path || "未提供"}\n- source_audit_sha256: ${packet.source_audit?.sha256 || ""}\n- source_locks_sha256: ${sha(packet.locks)}\n- output_status: ${packet.output_status}\n- locks:\n  - must_keep: [原文台词、标准文件名、真实 tag、Scene → Shot Row → Prompt Envelope]\n  - must_avoid: [虚构参考锁定、视觉 QA 或用户接受]\n  - budget_notes: [本阶段仅设计，不生成媒体]\n\n---\n\n${packet.locks ? `## 继承的项目锁定条件\n\n${packet.locks}\n\n` : ""}`;
}
function boardMarkdown(board, packet, version, family) {
  const s = board.shots,
    es = board.envelopes,
    plan = board.scene_plans[packet.scene];
  const table = (heads, rows) =>
    `| ${heads.join(" | ")} |\n| ${heads.map(() => "---").join(" | ")} |\n${rows.map((r) => `| ${r.map(cell).join(" | ")} |`).join("\n")}\n`;
  let out = header(`${packet.scene} 分镜拆解`, family, version, packet);
  out += `## Phase 1 - 剧本拆解\n\n### 场景清单\n\n${packet.header}\n\n${plan.synopsis}\n\n### 情绪与镜头倾向\n\n${plan.emotion}\n\n### 动作 / 对白 Beat Map\n\n`;
  out += table(
    [
      "Scene",
      "Beat",
      "动作来源",
      "对白来源",
      "情绪变化",
      "视觉焦点",
      "镜头拆分建议",
      "Prompt Envelope 建议",
    ],
    s.map((r) => [
      r.scene,
      r.id,
      r.source_shot_numbers.join(","),
      r.dialogue.map((d) => `${d.speaker_cue} ${d.text}`).join("\n"),
      plan.emotion,
      r.description,
      r.camera,
      es.find((e) => e.source_rows.includes(r.id))?.id,
    ]),
  );
  out += `\n### 导演拆分备注\n\n${bullets(plan.continuity_notes)}\n\n## Phase 2 - 资产请求\n\n`;
  for (const [kind, label] of [
    ["character", "人物"],
    ["location", "地点"],
    ["prop", "道具"],
    ["audio", "音频"],
    ["graphic", "图文"],
  ])
    out += `### ${label}\n\n${bullets(packet.assets.filter((a) => a.category === kind).map((a) => `${a.asset_name}：${a.description || a.display_name || "待补充"}；tag=${a.tag || "未绑定"}`))}\n\n`;
  out += `### 风格参考\n\n${packet.style?.thesis || "沿用上游风格；缺口待审阅。"}\n\n## Phase 3 - 范围与空间调度\n\n### 范围锁定\n\n${packet.scene}；${packet.output_status}。仅完成该场设计，未编译生产 Prompt。\n\n### 图片到资产映射\n\n${bullets(packet.assets.map((a) => `${a.asset_name}：${a.reference_approval || "missing"}；${a.reference_binding || "none"}`))}\n\n### 空间 Blocking 队列 / 俯视图与站位\n\n${plan.blocking}\n\n## Phase 4 - Prompt 编译与 HTML 汇总计划\n\n### Shot Row Plan\n\n`;
  out += table(
    [
      "Scene",
      "Row",
      "Lens / Plan Code",
      "Action Beat",
      "Scene Text Source",
      "Asset / Reference Need",
      "Blocking Note",
    ],
    s.map((r) => [
      r.scene,
      r.id,
      r.camera,
      r.description,
      r.source_shot_numbers.join(","),
      r.references.join(","),
      r.risks.join("；"),
    ]),
  );
  out += "\n### Prompt Envelope Plan\n\n";
  out += table(
    [
      "Prompt",
      "Scene",
      "Source Rows",
      "Internal Shot Plan",
      "Beat Boundary",
      "Dialogue Boundary",
      "Character / Asset Set",
      "Intended Duration / Grouping Reason",
      "Next Beat Reserved",
    ],
    es.map((e, i) => {
      const rows = e.source_rows.map((id) => s.find((r) => r.id === id));
      return [
        e.id,
        e.scene,
        e.source_rows.join(","),
        rows.map((r) => `${r.id} ${r.duration_seconds}s ${r.title}`).join("；"),
        `${rows[0].description} → ${rows.at(-1).description}`,
        rows.flatMap((r) => r.dialogue.map((d) => d.text)).join("；"),
        [...new Set(rows.flatMap((r) => r.references))].join(","),
        `${e.duration_seconds}s；${e.grouping_reason}`,
        es[i + 1]?.source_rows[0] || "场末",
      ];
    }),
  );
  out += `\n### Prompt ID Reservation\n\n服务统一分配并检查活跃、历史与待保存结果：${es.map((e) => e.id).join(", ")}。\n\n### Prompt Density Notes\n\n${bullets(s.flatMap((r) => r.risks.map((v) => `${r.id}：${v}`)))}\n\n### Production Batch Plan\n\n`;
  for (let i = 0; i < es.length; i += 8)
    out += `- 批次 ${i / 8 + 1}：${es
      .slice(i, i + 8)
      .map((e) => e.id)
      .join(", ")}；空间与参考确认后再进入 Prompt 编译。\n`;
  return (
    out +
    "\n### Scene Package Recommendation\n\n源对白、原分镜行与结构映射已做程序检查；创作质量、空间方向与参考仍待人工审阅。\n"
  );
}

export function materializePlan(store, job, value) {
  validatePlan(job, value);
  const p = job.packet,
    version = nextVersion(store.root, job.stage, job.scene, store);
  if (job.stage === "assets") {
    const assets = value.assets.map((a) => {
      const old = p.existing_assets.find((v) => v.asset_name === a.asset_name);
      return {
        ...a,
        scene: a.scenes.length === 1 ? a.scenes[0] : "",
        prompt: "",
        output_status: p.output_status,
        asset_origin: old?.asset_origin || "not_created",
        reference_binding: old?.reference_binding || "none",
        reference_approval: old?.reference_approval || "missing",
      };
    });
    const data = {
      ...value,
      assets,
      source_script: p.source_script,
      source_audit: p.source_audit,
      output_status: p.output_status,
      version,
    };
    const family = artifactFamily(
      store,
      "asset-guide",
      walk(
        contained(store.root, "deliverables/2_assets"),
        (n) => /^02_asset_guide_v\d+\.md$/.test(n),
        0,
      ),
    );
    const styleFamily = artifactFamily(
      store,
      "style-guide",
      walk(
        contained(store.root, "deliverables/2_assets"),
        (n) => /^02_style_guide_v\d+\.md$/.test(n),
        0,
      ),
    );
    data.artifact_id = family;
    const guide =
      header("资产指南", family, version, p) +
      assets
        .map(
          (a) =>
            `## ${a.display_name}\n\n- 标准文件名：${a.asset_name}\n- Scene：${a.scenes.join(", ")}\n- 真实 tag：${a.tag || "未提供"}\n\n${a.description}\n\n${bullets(a.state_variants.map((v) => `${v.state}（${v.scenes.join(",")}）：${v.facts}`))}\n\n${bullets(a.continuity_notes)}`,
        )
        .join("\n\n") +
      `\n\n## 连续性规则\n\n${bullets(value.continuity_rules)}\n\n## 参考缺口\n\n${bullets(value.open_gaps)}\n`;
    const style =
      header("风格指南", styleFamily, version, p) +
      Object.entries(value.style)
        .map(
          ([k, v]) =>
            `## ${{ thesis: "视觉主张", palette: "色彩", lighting: "光线", texture: "材质与媒介", composition: "构图与运动", avoid: "避免事项" }[k]}\n\n${v}`,
        )
        .join("\n\n");
    return {
      summary: value.summary,
      structured: data,
      artifacts: [
        {
          path: `deliverables/2_assets/asset_inventory_v${version}.json`,
          content: JSON.stringify(data, null, 2) + "\n",
        },
        {
          path: `deliverables/2_assets/02_asset_guide_v${version}.md`,
          content: guide,
        },
        {
          path: `deliverables/2_assets/02_style_guide_v${version}.md`,
          content: style,
        },
      ],
    };
  }
  const board = store.meta("storyboard"),
    old = p.existing_scene;
  const existingIds = new Set((board?.envelopes || []).map((e) => e.id));
  for (const j of store.list("job"))
    for (const e of j.result?.structured?.envelopes || [])
      existingIds.add(e.id);
  for (const folder of ["deliverables/3_shotlist", "archives/3_shotlist"])
    for (const f of walk(
      contained(store.root, folder),
      (n) => /\.(md|json|html)$/.test(n),
      2,
    ))
      for (const m of fs.readFileSync(f, "utf8").matchAll(/\bP(\d{3,})\b/g))
        existingIds.add(`P${m[1]}`);
  let next =
    Math.max(
      store.meta("envelope_sequence") || 0,
      ...[...existingIds].map((v) => Number(v.match(/^P(\d+)$/)?.[1] || 0)),
    ) + 1;
  let nextRow =
    Math.max(
      0,
      ...old.shots.map((s) => Number(s.id.match(/-R(\d+)$/)?.[1] || 0)),
    ) + 1;
  const rowIds = new Map(
    value.shots.map((s) => [
      s.id,
      s.id.startsWith("new-")
        ? `${p.scene}-R${String(nextRow++).padStart(2, "0")}`
        : s.id,
    ]),
  );
  const shots = value.shots.map((s) => ({
    ...old.shots.find((r) => r.id === s.id),
    ...s,
    id: rowIds.get(s.id),
    scene: p.scene,
  }));
  const envelopes = value.envelopes.map((e) => {
    const prior = old.envelopes.find((v) => v.id === e.id),
      id = prior?.id || `P${String(next++).padStart(3, "0")}`;
    let time = 0;
    const markers = e.source_rows.map((key) => {
      const r = shots.find((s) => s.id === rowIds.get(key));
      const m = { id: r.id, title: r.title, time };
      time += r.duration_seconds;
      return m;
    });
    return {
      ...prior,
      ...e,
      id,
      scene: p.scene,
      asset_name: prior?.asset_name || `${p.scene}_${id}`,
      source_rows: e.source_rows.map((k) => rowIds.get(k)),
      markers,
      duration_seconds: Number(time.toFixed(4)),
      prompt: "",
      output_status: p.output_status,
    };
  });
  store.meta("envelope_sequence", next - 1);
  const data = {
    output_status: p.output_status,
    source_script: p.source_script,
    source_audit: p.source_audit,
    source_scene: p.scene,
    shots,
    envelopes,
    scene_plans: {
      [p.scene]: pick(value, [
        "synopsis",
        "emotion",
        "blocking",
        "continuity_notes",
      ]),
    },
  };
  const dir = `deliverables/3_shotlist/${p.scene}_v${version}`;
  const family = artifactFamily(
    store,
    `breakdown:${p.scene}`,
    walk(
      contained(store.root, "deliverables/3_shotlist"),
      (n) =>
        new RegExp(`^03_shotlist_breakdown_${p.scene}_v\\d+\\.md$`).test(n),
      2,
    ),
  );
  return {
    summary: value.summary,
    structured: data,
    artifacts: [
      {
        path: `${dir}/storyboard_v${version}.json`,
        content: JSON.stringify(data, null, 2) + "\n",
      },
      {
        path: `${dir}/03_shotlist_breakdown_${p.scene}_v${version}.md`,
        content: boardMarkdown(data, p, version, family),
      },
    ],
  };
}

export function checkPlanBaseline(store, job) {
  if (!job.packet || job.applied_at) return;
  const state = JSON.parse(
    read(store.root, "deliverables/0_admin/workflow_state.json"),
  );
  const selected =
    job.mode === "planning"
      ? state.working_script
      : state.production_inputs?.script;
  check(
    selected?.sha256 === job.input_script.sha256 &&
      selected?.path === job.input_script.path,
    "所选剧本版本已改变，候选保留但不能合并",
    409,
  );
  check(
    sha(fs.readFileSync(contained(store.root, job.input_script.path))) ===
      job.input_script.sha256,
    "源剧本已改变，结果保留但不能直接合并",
    409,
  );
  const current =
    job.stage === "storyboard"
      ? sceneHash(store.meta("storyboard"), job.scene)
      : sha(inventory(store).assets);
  check(
    current === job.baseline,
    "目标内容已有手动编辑或其他结果，请重新核对；本次候选已保留",
    409,
  );
}

export function mergedScene(store, job) {
  const current = store.meta("storyboard") || {},
    patch = job.result.structured,
    scene = job.scene;
  const order = job.packet.scene_order;
  const merge = (before, after) =>
    [...(before || []).filter((s) => s.scene !== scene), ...after].sort(
      (a, b) =>
        (order.includes(a.scene) ? order.indexOf(a.scene) : order.length) -
        (order.includes(b.scene) ? order.indexOf(b.scene) : order.length),
    );
  return {
    ...current,
    source_script: patch.source_script,
    output_status: patch.output_status,
    shots: merge(current.shots, patch.shots),
    envelopes: merge(current.envelopes, patch.envelopes),
    scene_sources: {
      ...Object.fromEntries(
        (current.envelopes || []).map((e) => [
          e.scene,
          current.source_script || null,
        ]),
      ),
      ...current.scene_sources,
      [scene]: patch.source_script,
    },
    scene_plans: { ...current.scene_plans, ...patch.scene_plans },
    expected_sha256: current.sha256 ?? null,
  };
}
