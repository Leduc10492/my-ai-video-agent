import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registrySkills } from "./skill-settings.mjs";
import {
  readState,
  initialize,
  editLocal,
  selectWorking,
  resolveArtifact,
  selectProduction,
} from "../../.agents/skills/version-management/scripts/script-store.mjs";
import {
  atomic,
  check,
  contained,
  sha,
  id,
  now,
  unwrapScript,
  walk,
  assetName,
} from "./files.mjs";
export const templateRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export function skills(root) {
  return registrySkills(root);
}
export function scriptStatus(root) {
  const state = readState(root, { optional: true });
  const candidates = walk(
    path.join(root, "deliverables/1_story"),
    (n) => /^01_script_v\d+\.md$/.test(n),
    0,
  ).map((f) => path.relative(root, f));
  if (!state)
    return { state: null, body: "", candidates, versions: [], audit: null };
  const resolved = resolveArtifact(root, { kind: "working" });
  const auditPath = `deliverables/1_story/01_audit_report_v${resolved.version}.md`;
  const auditFile = contained(root, auditPath);
  const audit = fs.existsSync(auditFile)
    ? {
        path: auditPath,
        text: fs.readFileSync(auditFile, "utf8"),
        sha256: sha(fs.readFileSync(auditFile)),
      }
    : null;
  return {
    state,
    body: unwrapScript(
      fs.readFileSync(contained(root, resolved.resolved_path), "utf8"),
    ),
    candidates,
    versions: Object.values(state.artifacts).filter((a) => a.kind === "script"),
    audit,
  };
}
export function saveScript(root, input) {
  check(typeof input.body === "string" && input.body.trim(), "剧本不能为空");
  const current = scriptStatus(root);
  if (!current.state) {
    check(
      !current.candidates.length,
      "已有剧本文件，请先选择工作版本；导入不会覆盖既有稿件",
    );
    const file = "deliverables/1_story/01_script_v1.md";
    atomic(
      contained(root, file),
      `# Artifact: 剧本\n- id: script-${id()}\n- version: v1\n- upstream: []\n\n---\n\n${input.body}`,
    );
    return initialize(root, { script: file });
  }
  check(
    input.expected_sha256 === current.state.working_script.sha256,
    "工作稿已变化，请先重新载入再保存",
    409,
  );
  if (input.body === current.body)
    return { state: current.state, unchanged: true };
  return editLocal(root, {
    expected_sha256: input.expected_sha256,
    edits: [{ before: current.body, after: input.body }],
    scene_bindings: input.scene_bindings,
  });
}
export function chooseScript(root, input) {
  const state = readState(root, { optional: true });
  return state
    ? selectWorking(root, input)
    : initialize(root, { script: input.script });
}
export function approveScript(root, input) {
  const current = scriptStatus(root);
  check(current.audit, "先完成同版本审核，再确认进入生产");
  check(
    input.script_sha256 === current.state.working_script.sha256 &&
      input.audit_sha256 === current.audit.sha256,
    "剧本或审核已更新，请重新审阅",
    409,
  );
  // User supplies the reviewed conclusion; an audit file alone is not a pass.
  check(
    input.confirm_no_p0_p1 === true &&
      typeof input.evidence === "string" &&
      input.evidence.trim(),
    "请记录审阅结论及未解决 P0/P1 情况",
  );
  return selectProduction(root, {
    script_sha256: input.script_sha256,
    audit: {
      path: current.audit.path,
      sha256: current.audit.sha256,
      script_sha256: input.script_sha256,
      coverage: "full",
      unresolved_p0_p1: [],
    },
    authorization: {
      mode: "interactive",
      evidence: input.evidence,
      recorded_at: now(),
      script_sha256: input.script_sha256,
      audit_sha256: input.audit_sha256,
      scope: input.scope || ["*"],
    },
  });
}
export function importStoryboard(store, input) {
  const previous = store.meta("storyboard");
  if (Object.hasOwn(input, "expected_sha256"))
    check(
      input.expected_sha256 === (previous?.sha256 ?? null),
      "分镜已有更新，请重新载入后再保存；本地草稿仍保留",
      409,
    );
  const {
    expected_sha256,
    imported_at,
    sha256,
    path: oldPath,
    ...content
  } = input;
  input = content;
  check(
    Array.isArray(input.envelopes) && input.envelopes.length > 0,
    "需要 envelopes 数组",
  );
  const seen = new Set(),
    rows = new Set(),
    names = new Set();
  for (const env of input.envelopes) {
    check(
      typeof env.id === "string" && env.id.trim() && !seen.has(env.id),
      "Prompt Envelope ID 必须唯一",
    );
    seen.add(env.id);
    assetName(env.asset_name);
    check(!names.has(env.asset_name), "不同 Envelope 不能共用同一视频文件名");
    names.add(env.asset_name);
    const old = previous?.envelopes?.find((e) => e.id === env.id);
    if (old)
      check(
        old.asset_name === env.asset_name,
        "已有 Envelope 的标准文件名已固定，修改需要先迁移引用",
        409,
      );
    check(/^scene-[\w-]+$/.test(env.scene), "每个 Envelope 需要 Scene 标识");
    check(
      Number.isFinite(env.duration_seconds) &&
        env.duration_seconds > 0 &&
        env.duration_seconds <= 300,
      "Envelope 时长无效",
    );
    check(
      Array.isArray(env.source_rows) && env.source_rows.length > 0,
      "必须保留 Shot Row 映射",
    );
    check(typeof env.prompt === "string", "需要独立的生成 Prompt 字段");
    for (const row of env.source_rows) {
      const key = JSON.stringify([env.scene, row]);
      check(
        typeof row === "string" && row.trim() && !rows.has(key),
        "同一 Scene 的 Shot Row 必须唯一且只属于一个 Envelope",
      );
      rows.add(key);
    }
    check(
      env.markers === undefined || Array.isArray(env.markers),
      "markers 必须是数组",
    );
    for (const marker of env.markers || [])
      check(
        Number.isFinite(marker.time) &&
          marker.time >= 0 &&
          marker.time < env.duration_seconds,
        "计划镜头标记越界，请先调整标记或时长",
      );
  }
  check(
    input.shots === undefined || Array.isArray(input.shots),
    "shots 必须是数组",
  );
  const detailed = new Set();
  for (const shot of input.shots || []) {
    const key = JSON.stringify([shot.scene, shot.id]);
    check(
      rows.has(key) && !detailed.has(key),
      "镜头详情必须对应唯一的 Scene / Shot Row",
    );
    detailed.add(key);
    for (const field of ["title", "description", "camera", "sound"])
      check(
        shot[field] === undefined || typeof shot[field] === "string",
        `镜头 ${field} 必须是文本`,
      );
    check(
      shot.references === undefined ||
        (Array.isArray(shot.references) &&
          shot.references.every((r) => typeof r === "string" && r.length)),
      "参考素材必须使用标准文件名数组",
    );
  }
  const board = { ...input, imported_at: now(), sha256: sha(input) };
  const relative = `deliverables/0_admin/workbench/storyboards/${id()}.json`;
  atomic(contained(store.root, relative), board);
  return store.meta("storyboard", { ...board, path: relative });
}
export function existingOutputs(root) {
  return walk(
    path.join(root, "deliverables"),
    (n) => /\.(md|html|json)$/.test(n),
    3,
  )
    .map((f) => path.relative(root, f))
    .filter(
      (relative) =>
        !relative.startsWith("deliverables/0_admin/workbench/") &&
        !relative.startsWith("deliverables/4_edit/"),
    )
    .map((relative) => ({ path: relative, name: path.basename(relative) }));
}
