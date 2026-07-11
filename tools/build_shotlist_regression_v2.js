#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const testRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(testRoot, "..");
const mainRoot = path.join(workspaceRoot, "main");
const candidateFile = path.join(testRoot, "fixtures", "shotlist-workflow-v2", "candidate.html");
const houseFile = path.join(mainRoot, ".agents", "skills", "sketch-shotlist-workflow", "assets", "shotlist-house-template.html");
const scriptFile = path.join(testRoot, "deliverables", "10_story", "01_script_v10.md");
const auditFile = path.join(testRoot, "deliverables", "10_story", "01_audit_report_v10.md");
const v1Breakdown = path.join(testRoot, "deliverables", "30_shotlist", "03_shotlist_breakdown_v1.md");
const v2Breakdown = path.join(testRoot, "deliverables", "30_shotlist", "03_shotlist_breakdown_v2.md");
const v1Package = path.join(testRoot, "deliverables", "30_shotlist", "scenes", "scenes-078-085_096-098_v1");
const v2Package = path.join(testRoot, "deliverables", "30_shotlist", "scenes", "scenes-078-085_096-098_v2");
const archiveBreakdown = path.join(testRoot, "archives", "30_shotlist", "03_shotlist_breakdown_v1.md");
const archivePackage = path.join(testRoot, "archives", "30_shotlist", "scenes", "scenes-078-085_096-098_v1");

const BREAKDOWN_ID = "A-20260628-001";
const PACKAGE_ID = "A-20260711-001";
const PREVIEW_ID = "A-20260711-002";
const BLOCKING_ID = "A-20260711-003";
const PROMPT_START = 429;
const refresh = process.argv.includes("--refresh");

for (const file of [candidateFile, houseFile, scriptFile, auditFile]) {
  if (!fs.existsSync(file)) fail(`Missing required input: ${file}`);
}
if (!refresh) {
  const hasV1Breakdown = fs.existsSync(v1Breakdown);
  const hasV1Package = fs.existsSync(v1Package);
  if (hasV1Breakdown !== hasV1Package) fail("v1 migration inputs are incomplete");
  if (hasV1Breakdown) {
    for (const file of [v2Breakdown, v2Package, archiveBreakdown, archivePackage]) {
      if (fs.existsSync(file)) fail(`Refusing to overwrite existing path: ${file}`);
    }
  } else if (fs.existsSync(v2Breakdown) || fs.existsSync(v2Package)) {
    fail("v2 outputs already exist; rerun with --refresh");
  }
}

const candidate = fs.readFileSync(candidateFile, "utf8");
const house = fs.readFileSync(houseFile, "utf8");
const scenes = splitCombinedScenes(parseScenes(candidate));
repairSourceFidelity(scenes);
const allRows = scenes.flatMap((scene) => scene.rows);
const groups = scenes.flatMap((scene) => scene.groups);

if (allRows.length !== 52) fail(`Expected 52 shot rows, found ${allRows.length}`);
if (groups.length !== 23) fail(`Expected 23 prompt envelopes, found ${groups.length}`);

const oldRowToNew = new Map();
for (const scene of scenes) {
  scene.rows.forEach((row, index) => {
    row.rowId = `${scene.id}-R${String(index + 1).padStart(2, "0")}`;
    oldRowToNew.set(row.oldId, row.rowId);
  });
}

groups.forEach((group, index) => {
  group.promptId = `P${String(PROMPT_START + index).padStart(3, "0")}`;
  group.promptText = replaceLegacyIds(group.promptText, oldRowToNew)
    .replace(/text_dna_draft/g, "generated_from_text，reference_approval=draft");
  group.promptText = tailorPrompt(group);
});

const promptEnd = PROMPT_START + groups.length - 1;
const html = buildHtml(house, scenes, groups, promptEnd);
const breakdown = buildBreakdown(scenes, groups, promptEnd);
const manifest = buildManifest(scenes, groups, promptEnd);
const previews = buildPreviewManifest(groups);
const blocking = buildSpatialBlocking();

if (!refresh && fs.existsSync(v1Breakdown)) {
  fs.mkdirSync(path.dirname(archiveBreakdown), { recursive: true });
  fs.mkdirSync(path.dirname(archivePackage), { recursive: true });
  fs.renameSync(v1Breakdown, archiveBreakdown);
  fs.renameSync(v1Package, archivePackage);
}

fs.mkdirSync(path.join(v2Package, "previews"), { recursive: true });
fs.writeFileSync(v2Breakdown, breakdown);
fs.writeFileSync(path.join(v2Package, "Shotlist_scenes-078-085_096-098_ZH_v2.html"), html);
fs.writeFileSync(path.join(v2Package, "manifest.md"), manifest);
fs.writeFileSync(path.join(v2Package, "previews", "manifest.md"), previews);
fs.writeFileSync(path.join(v2Package, "spatial_blocking.md"), blocking);

process.stdout.write(`Built ${path.relative(testRoot, v2Breakdown)}\n`);
process.stdout.write(`Built ${path.relative(testRoot, v2Package)} with ${allRows.length} rows and ${groups.length} prompts (${groups[0].promptId}-${groups.at(-1).promptId})\n`);

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function decode(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function strip(value) {
  return decode(String(value || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).trim();
}

function cell(rowHtml, className) {
  const match = rowHtml.match(new RegExp(`<td[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/td>`, "i"));
  return match ? match[1] : "";
}

function parseScenes(html) {
  const output = [];
  for (const sectionMatch of html.matchAll(/<section class="scene[^"]*" id="([^"]+)">([\s\S]*?)<\/section>/g)) {
    const section = sectionMatch[2];
    const id = sectionMatch[1];
    const title = strip((section.match(/<h2 class="scene-title">([\s\S]*?)<\/h2>/) || [])[1]);
    const meta = strip((section.match(/<div class="scene-meta">([\s\S]*?)<\/div>/) || [])[1]).replace(/\s+/g, " ");
    const rows = [];
    for (const rowMatch of section.matchAll(/<tr data-scene="([^"]+)" data-plan="([^"]+)">([\s\S]*?)<\/tr>/g)) {
      const body = rowMatch[3];
      const promptCell = cell(body, "c-prompt");
      const scriptCell = cell(body, "c-script");
      const pre = promptCell.match(/<pre[^>]+id="(P\d{3})"[^>]*>([\s\S]*?)<\/pre>/);
      const tag = strip((promptCell.match(/<div class="prompt-head">[\s\S]*?<span>([\s\S]*?)<\/span>/) || [])[1]);
      const promptTd = body.match(/<td[^>]+class="c-prompt"([^>]*)>/);
      rows.push({
        scene: rowMatch[1],
        plan: rowMatch[2],
        oldId: strip(cell(body, "c-num")),
        planLabel: strip(cell(body, "c-plan")),
        camera: strip(cell(body, "c-cam")),
        actionHtml: cell(body, "c-act"),
        action: strip(cell(body, "c-act")),
        scriptHtml: scriptCell ? (scriptCell.match(/<div class="script-inner">([\s\S]*?)<\/div>/) || ["", scriptCell])[1] : "",
        groupSize: promptTd ? Number((promptTd[1].match(/rowspan="(\d+)"/) || ["", "1"])[1]) : 0,
        oldPromptId: pre ? pre[1] : "",
        promptText: pre ? pre[2] : "",
        tag,
      });
    }

    const groups = [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row.oldPromptId) continue;
      const size = row.groupSize || 1;
      const groupRows = rows.slice(i, i + size);
      if (groupRows.length !== size) fail(`Invalid rowspan for ${row.oldPromptId}`);
      groups.push({ sceneId: id, rows: groupRows, oldPromptId: row.oldPromptId, promptText: row.promptText, tag: row.tag, scriptHtml: row.scriptHtml });
    }
    output.push({ id, title, meta, rows, groups });
  }
  return output;
}

function splitCombinedScenes(sceneList) {
  const output = [];
  for (const scene of sceneList) {
    if (scene.id === "scene-078-079") {
      output.push(
        sliceScene(scene, {
          id: "scene-078",
          title: "scene-078 — 学校体育馆外避难入口",
          meta: "地点：体育馆南门与北墙方向；情绪：临时行动转成入口秩序",
          start: 0,
          end: 4,
          scriptHeader: "EXT. SCHOOL GYM - NIGHT",
          nextHeader: "INT. SCHOOL GYM - NIGHT",
        }),
        sliceScene(scene, {
          id: "scene-079",
          title: "scene-079 — 体育馆内红绳固门",
          meta: "地点：体育馆垫区与门把手；情绪：物理门锁转为共同承担",
          start: 4,
          end: 6,
          scriptHeader: "INT. SCHOOL GYM - NIGHT",
        }),
      );
      continue;
    }
    if (scene.id === "scene-096-097") {
      output.push(
        sliceScene(scene, {
          id: "scene-096",
          title: "scene-096 — 平行列车一秒识别",
          meta: "地点：东京平行地铁车门；情绪：无名识别被列车切断",
          start: 0,
          end: 2,
          scriptHeader: "INT. SUBWAY - MORNING",
          nextHeader: "EXT. TOKYO STREETS - CONTINUOUS",
        }),
        sliceScene(scene, {
          id: "scene-097",
          title: "scene-097 — 东京雨街错身追逐",
          meta: "地点：站口、楼梯与公交遮挡；情绪：追逐转成身体记忆",
          start: 2,
          end: 5,
          scriptHeader: "EXT. TOKYO STREETS - CONTINUOUS",
        }),
      );
      continue;
    }
    output.push(scene);
  }
  return output;
}

function sliceScene(scene, spec) {
  const rows = scene.rows.slice(spec.start, spec.end);
  const rowSet = new Set(rows);
  const groups = scene.groups.filter((group) => group.rows.every((row) => rowSet.has(row)));
  if (!rows.length || !groups.length) fail(`Cannot split ${scene.id} into ${spec.id}`);
  for (const row of rows) row.scene = spec.id;
  for (const group of groups) {
    group.sceneId = spec.id;
    group.scriptHtml = scriptExcerpt(group.scriptHtml, spec.scriptHeader, spec.nextHeader);
  }
  return { id: spec.id, title: spec.title, meta: spec.meta, rows, groups };
}

function scriptExcerpt(value, header, nextHeader) {
  const start = value.indexOf(header);
  if (start < 0) fail(`Script excerpt is missing ${header}`);
  const end = nextHeader ? value.indexOf(nextHeader, start + header.length) : -1;
  return value.slice(start, end >= 0 ? end : undefined).trim();
}

function replaceLegacyIds(value, mapping) {
  return value.replace(/P\d{3}/g, (id) => mapping.get(id) || id);
}

function tailorPrompt(group) {
  let text = group.promptText
    .replace(/摄影：Emmanuel Lubezki × Roger Deakins。/g, "")
    .replace(/风格：8K IMAX。超写实/g, "风格：超写实自然主义电影摄影")
    .replace(/表演：好莱坞级/g, "表演：克制、可读、基于具体微动作")
    .replace(/不声称 image-reference-bound production lock/g, "图片已映射到本测试包，但 reference_approval=draft、output_status=prompt_only，不声称 production_approved");

  for (const row of group.rows) {
    const marker = new RegExp(`(?:⚠️⚠️⚠️)?微表演细节：①${escapeRegex(row.rowId)}[^\\n]*`, "g");
    text = text.replace(marker, `微表演细节：${microBeats(row)}`);
  }
  if (group.promptId === "P433") {
    text = text
      .replace(
        "⚠️对白规则：一句台词=一个镜头；每句对白只在说话者可见口型镜头内出现；禁止字幕。",
        "⚠️对白规则：一句台词=一个镜头；每句对白只在说话者可见口型镜头内出现；禁止字幕。\n⚠️对白保留：Officer严格朝Daichi说出原文台词 \"This road is closed.\"，中文只描述表演和镜头，不翻译台词。",
      )
      .replace(
        "⚠️动作边界：本prompt只拍路障建立；禁止提前出现“Officer说路关闭”，禁止回到上一个已经完成的beat。",
        "⚠️动作边界：本prompt只拍路障建立与Officer封路台词；Daichi回应、Officer看天和最终放行保留给后续prompt。",
      )
      .replace(
        "- 7-11秒：Officer身体保持堵路姿态，视线压向Daichi，不看天空。",
        "- 7-11秒：Officer身体保持堵路姿态，视线压向Daichi，在口型可读的同一远景内清晰说出原文台词 \"This road is closed.\"，此时不看天空。",
      )
      .replace(
        "- 11-15秒：画面停在路障、Officer、农用车三点关系，下一条才进入Daichi争辩。",
        "- 11-15秒：Officer最后一个词后保持堵路姿态，画面停在路障、Officer、农用车三点关系；下一条才进入Daichi回应。",
      )
      .replace(/禁提前出现“Officer说路关闭”/g, "禁提前出现“Daichi回应、Officer看天或放行”");
  }
  return text;
}

function repairSourceFidelity(sceneList) {
  const checkpoint = sceneList.find((scene) => scene.id === "scene-081");
  if (!checkpoint || checkpoint.rows.length < 2) fail("scene-081 fixture rows are missing");
  checkpoint.rows[0].action = "红色路障挡住农用车，Officer举着交通棒站在东侧，直视Daichi说 \"This road is closed.\"";
  checkpoint.rows[1].action = "Daichi指向车斗老人并划向上坡，说 \"Then arrest me uphill.\"；Officer随后看向天空碎片，交通棒降到腰侧。";
  checkpoint.rows[0].actionHtml = escapeHtml(checkpoint.rows[0].action);
  checkpoint.rows[1].actionHtml = escapeHtml(checkpoint.rows[1].action);
}

function microBeats(row) {
  const action = row.action;
  const dialogue = quoted(action);
  if (dialogue) {
    return `①台词前先把视线锁定在明确对象，短吸气后下颌稳定；②口型逐词绑定${dialogue}，重音处鼻翼或喉结出现一次可见变化；③最后一个词后保持视线0.4秒，再以本镜头终态结束：${action}`;
  }
  if (/手|绳|夹板|电话|现金盒|后视镜|交通棒|伞|道具|仪表|栏杆/.test(action)) {
    return `①接触前手指先张开并对准目标，腕部保持与${row.camera}一致；②指腹或掌心真实接触并完成动作：${action}；③抓握力度在终点稳定，物体重量、位置和接触阴影保持不跳变`;
  }
  if (/跑|走|进入|到达|冲|跳|上坡|下坡|穿过|追|移动|挤出|转向/.test(action)) {
    return `①前脚掌先落地，重心从后腿移到前腿，肩线跟随行进轴；②呼吸与步频同步完成：${action}；③最后一步踩实后身体保留惯性，视线停在下一空间目标但不提前执行后续beat`;
  }
  if (/看|抬头|眼|脸|笑|停|冻结|安静|声音|白光|冲击/.test(action)) {
    return `①眼球先于头部0.2秒转向触发源，呼吸短暂停住；②瞳孔、下颌和肩线按事件压力变化并完成：${action}；③反应停在可读终态0.4秒，不追加哭泣、夸张表情或下一beat`;
  }
  if (/人群|孩子|车辆|司机|消防员|背景|镇/.test(action)) {
    return `①前景主体先启动，背景群体保持0.3-0.5秒错峰；②不同人物沿既定轴线完成：${action}；③群体终态保持层次和间距，禁止同步转头、空背景或随机逆向移动`;
  }
  return `①动作开始前保持当前重心和视线0.3秒；②用可见身体路径完成：${action}；③在最后接触点或位置停住0.4秒，禁止用抽象情绪替代物理终态`;
}

function buildHtml(template, sceneList, promptGroups, promptEnd) {
  const planOptions = [
    ["WS", "远景"], ["MS", "中景"], ["CU", "近景/特写"], ["ECU", "大特写"],
    ["MACRO", "微距"], ["PAN", "摇镜"], ["OS", "画外声"], ["VO", "旁白"], ["DISSOLVE", "叠化"],
  ].map(([code, label]) => `<option value="${code}">${label}</option>`).join("");
  const toc = sceneList.map((scene) => `<a href="#${scene.id}">${scene.id}</a>`).join("");
  const sections = sceneList.map(renderScene).join("\n");
  const assetSummary = [
    "<p><b>资产来源：</b>22 张由文本生成的测试参考图，集中存放于 <code>deliverables/20_assets/generated_ref_v1/</code>。</p>",
    "<p><b>状态：</b><code>asset_origin: generated_from_text</code>；<code>reference_binding: images_attached</code>；<code>reference_approval: draft</code>；<code>output_status: prompt_only</code>。</p>",
    "<p><b>限制：</b>本包用于工作流与 Prompt 回归，参考图未由资产指南提升为锁定生产资产，未生成新视频或线稿预览。</p>",
  ].join("");
  const replacements = {
    "{{ARTIFACT_ID}}": PACKAGE_ID,
    "{{ARTIFACT_VERSION}}": "v2",
    "{{SOURCE_ARTIFACT_IDS}}": `A-20260530-004,A-20260530-005,${BREAKDOWN_ID}`,
    "{{PROJECT_TITLE}}": "《无名之绳》v10",
    "{{SCOPE}}": "scenes-078-085_096-098",
    "{{N_SCENES}}": "11",
    "{{N_ROWS}}": String(sceneList.flatMap((scene) => scene.rows).length),
    "{{N_PROMPTS}}": String(promptGroups.length),
    "{{REFERENCE_SUMMARY}}": `测试范围 · P429-P${promptEnd} · 已映射图片 / draft / prompt_only`,
    "{{PLAN_OPTIONS}}": planOptions,
    "{{TOC_LINKS}}": toc,
    "{{ASSET_SUMMARY}}": assetSummary,
    "{{SCENE_BLOCKS}}": sections,
  };
  let html = template;
  for (const [token, value] of Object.entries(replacements)) html = html.split(token).join(value);
  if (/\{\{[^}]+\}\}/.test(html)) fail("House template still contains unreplaced placeholders");
  return html;
}

function renderScene(scene) {
  let rowsHtml = "";
  const groupByFirstRow = new Map(scene.groups.map((group) => [group.rows[0], group]));
  const groupedRows = new Set(scene.groups.flatMap((group) => group.rows.slice(1)));
  for (const row of scene.rows) {
    const group = groupByFirstRow.get(row);
    rowsHtml += `<tr data-scene="${scene.id}" data-row-id="${row.rowId}" data-plan="${row.plan}">`;
    rowsHtml += `<td class="c-num">${row.rowId}</td>`;
    rowsHtml += `<td class="c-plan"><span class="badge p-${row.plan.toLowerCase().replace(/\+.*/, "")}">${row.planLabel}</span></td>`;
    rowsHtml += `<td class="c-cam">${escapeHtml(row.camera)}</td><td class="c-act">${row.actionHtml}</td>`;
    if (group) {
      const count = group.rows.length;
      rowsHtml += `<td class="c-script" rowspan="${count}"><div class="script-inner">${group.scriptHtml}</div></td>`;
      rowsHtml += `<td class="c-prompt" rowspan="${count}"><article class="prompt-card" data-prompt-id="${group.promptId}"><div class="prompt-head"><b>提示词 ${group.promptId}</b><span>${escapeHtml(group.tag)}</span><button class="copy" type="button" data-copy-target="${group.promptId}">复制</button></div><pre class="prompt-block" id="${group.promptId}">${group.promptText}</pre></article></td>`;
      rowsHtml += `<td class="c-preview" rowspan="${count}"><span class="preview-state">${group.promptId}：本轮为 prompt_only，未生成线稿预览。</span></td>`;
    } else if (!groupedRows.has(row)) {
      fail(`Row ${row.oldId} is not assigned to a prompt group`);
    }
    rowsHtml += "</tr>";
  }
  return `<section class="scene" id="${scene.id}"><div class="scene-head"><div class="scene-num">${scene.id}</div><h2 class="scene-title">${escapeHtml(scene.title)}</h2><div class="scene-meta"><span>${escapeHtml(scene.meta)}</span><span>${scene.rows.length} 条镜头行 / ${scene.groups.length} 条提示词</span></div></div><div class="table-wrap"><table class="shotlist"><thead><tr><th>镜头行</th><th>类型</th><th>机位</th><th>动作</th><th>剧本内容</th><th>Seedance 2.0 提示词</th><th>线稿预览</th></tr></thead><tbody>${rowsHtml}</tbody></table></div></section>`;
}

function buildBreakdown(sceneList, promptGroups, promptEnd) {
  const sceneInventory = [
    ["scene-078", "EXT. SCHOOL GYM - NIGHT", "Hana, Teacher, children", "体育馆南门到北墙", "临时行动转成秩序"],
    ["scene-079", "INT. SCHOOL GYM - NIGHT", "Asa, Sora, children", "体育馆垫区与门口", "物理门锁转为共同承担"],
    ["scene-080", "EXT. NAGI BRIDGE - NIGHT", "Daichi, elders, drivers", "夜雨桥面与堵车轴线", "焦急转成强行动"],
    ["scene-081", "EXT. BRIDGE CHECKPOINT - NIGHT", "Daichi, Officer, elders", "桥东检查点到上坡出口", "权威由阻拦转为放行"],
    ["scene-082", "EXT. NAGI STREET - NIGHT", "Hana, old vendor, crowd", "祭典街与学校上坡", "嘲笑转成跟随"],
    ["scene-083", "INT. TOWN HALL - NIGHT", "Yuna, Mayor, aides", "门口、办公桌、紧急电话", "否认转成官方命令"],
    ["scene-084", "EXT. NAGI - NIGHT", "townspeople, responders", "镇街到学校上坡", "私人恐慌转为公共移动"],
    ["scene-085", "EXT. SCHOOL HILL - NIGHT", "Yuna, evacuees", "山丘前景与镇盆地", "抵达安全区后直面冲击"],
    ["scene-096", "INT. SUBWAY - MORNING", "Adult Ren, Adult Yuna", "平行列车门", "无名识别被列车切断"],
    ["scene-097", "EXT. TOKYO STREETS - CONTINUOUS", "Adult Ren, Adult Yuna", "站口、楼梯、公交遮挡", "追逐转成身体记忆"],
    ["scene-098", "EXT. SHRINE STAIRS - LATE AFTERNOON", "Adult Ren, Adult Yuna", "湿石阶中央轴线", "身体先认出，语言后追上"],
  ].map((row) => `| \`${row[0]}\` | \`${row[1]}\` | ${row[2]} | ${row[3]} | ${row[4]} |`).join("\n");

  const beatMap = promptGroups.map((group) => {
    const dialogue = quoted(group.rows.map((row) => row.action).join(" ")) || "无";
    return `| \`${group.rows[0].scene}\` | \`${group.promptId}\` | ${md(group.rows[0].action)} → ${md(group.rows.at(-1).action)} | ${md(dialogue)} | ${group.rows.length > 1 ? "多镜头连续因果/情绪单元" : "独立机位或表演边界"} |`;
  }).join("\n");

  const rowPlan = sceneList.flatMap((scene) => scene.rows).map((row) =>
    `| \`${row.scene}\` | \`${row.rowId}\` | \`${row.plan}\` / ${md(row.camera)} | ${md(row.action)} | v10 \`${row.scene}\` | generated_ref_v1 | 见空间 Blocking |`
  ).join("\n");

  const envelopePlan = promptGroups.map((group, index) => {
    const rows = group.rows.map((row) => row.rowId).join(", ");
    const internal = group.rows.map((row, shotIndex) => `镜头${shotIndex + 1}:${row.plan}/${row.camera}`).join("；");
    const boundary = `${group.rows[0].action} → ${group.rows.at(-1).action}`;
    const dialogue = quoted(group.rows.map((row) => row.action).join(" ")) || "无";
    const assets = [...new Set([...group.promptText.matchAll(/@image\d+\s*\(([^)]+)\)/g)].map((match) => match[1]))].join(", ") || "见 Prompt handles";
    const reason = group.rows.length > 1 ? `同地点、同轴线的一次连续转折；${group.rows.length}个内部镜头总计15秒` : "独立机位/对白/表演边界";
    const next = promptGroups[index + 1] ? promptGroups[index + 1].promptId : "none";
    return `| \`${group.promptId}\` | \`${group.sceneId}\` | ${md(rows)} | ${md(internal)} | ${md(boundary)} | ${md(dialogue)} | ${md(assets)} | ${md(reason)} | \`${next}\` |`;
  }).join("\n");

  return `# Artifact: Shotlist Breakdown
- id: ${BREAKDOWN_ID}
- version: v2
- upstream: [A-20260530-004, A-20260530-005]
- locks:
  - must_keep:
    - Use v10 screenplay scene labels and preserve exact source dialogue.
    - Keep the archived v1 package and retained P389 generation test as history only.
  - must_avoid:
    - Do not reuse P377-P428 for new prompt envelopes.
    - Do not treat generated-from-text references as locked production identity.
  - budget_notes:
    - Regression scope: scenes 078-085 and 096-098.
    - Prompt envelope duration: 15 seconds, 21:9.

---

- source_script: deliverables/10_story/01_script_v10.md
- source_audit: deliverables/10_story/01_audit_report_v10.md
- workflow_slot: shotlist.breakdown
- workflow_skill: shotlist-breakdown-workflow
- execution_mode: draft
- asset_origin: generated_from_text
- reference_binding: images_attached
- reference_approval: draft
- output_status: prompt_only
- blocking_approval: approved_for_test

## Phase 1 - 剧本拆解

### 场景清单

| Scene | Header | Characters | Location | Emotional Register |
| --- | --- | --- | --- | --- |
${sceneInventory}

### 动作 / 对白 Beat Map

| Scene Group | Prompt | 动作来源与边界 | 对白来源 | Prompt Envelope 建议 |
| --- | --- | --- | --- | --- |
${beatMap}

### 情绪与镜头倾向

- 避难段以清楚空间轴线和实际行动为先，不用抽象灾难蒙太奇替代因果动作。
- 检查点、镇公所和神社台阶保留对白原文，并将提问、回答、决定放在明确口型镜头中。
- 短连续动作合并为15秒 multi-shot；独立表演或揭示边界保留单独 envelope。

### 导演拆分备注

- v1 的52条 Prompt 把多处短动作拆得过细；v2 保留52条镜头行，但合并为23条 Prompt Envelope。
- 每条镜头行使用 scene-native \`RNN\`；新 Prompt 使用预留的 P429-P${promptEnd}。
- 任何分组变化都必须保留源行映射，不得以减少 Prompt 为目的删除动作。

## Phase 2 - 资产请求

### 人物

- 使用 \`deliverables/20_assets/generated_ref_v1/\` 中现有角色参考；均由文本生成，审批状态为 draft。

### 地点

- 体育馆、夜雨桥、祭典街、镇公所、学校山丘、东京地铁/雨街、神社台阶参考均已存在。

### 道具

- 红绳、载老人农用车、交通棒/路障、现金盒、紧急电话是连续性关键道具。

### 风格参考

- 沿用自然主义实际光源、阴影侧摄影、真实重量与克制表演；不使用具体摄影师姓名作为风格捷径。

## Phase 3 - 范围与空间调度

### 范围锁定

- Scope: \`scenes-078-085_096-098_v2\`
- Execution mode: \`draft\`
- Blocking approval: \`approved_for_test\`

### 图片到资产映射

- Common asset root: \`deliverables/20_assets/generated_ref_v1/\`
- Asset count: 22
- Ambiguous filenames: none
- \`asset_origin: generated_from_text\`
- \`reference_binding: images_attached\`
- \`reference_approval: draft\`
- \`output_status: prompt_only\`

### 空间 Blocking 队列

- 所有${sceneList.length}个场景段均在 \`spatial_blocking.md\` 中记录主视轴、人物/道具位置、距离和机位族。
- 测试批准只证明夹具可运行，不代表用户对最终生产站位的审批。

### 俯视图 / 站位图需求

- 本轮使用可审计的 Markdown 坐标/站位表；生产模式应根据最终资产重新确认或渲染图示。

## Phase 4 - HTML 分镜生成计划

### Shot Row Plan

| Scene | Row | Lens / Plan Code | Action Beat | Scene Text Source | Asset / Reference Need | Blocking Note |
| --- | --- | --- | --- | --- | --- | --- |
${rowPlan}

### Prompt Envelope Plan

| Prompt | Scene | Source Rows | Internal Shot Plan | Beat Boundary | Dialogue Boundary | Character / Asset Set | 15s Grouping Reason | Next Beat Reserved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${envelopePlan}

### Prompt Density Notes

- 52条镜头行合并为23条 Prompt Envelope；最大组为5条快速内部镜头，均在 Prompt 内写明时间分配。
- 合并依据是同地点、同角色集、同空间轴线和一个立即因果/情绪转折；对白揭示与独立表演保持边界。

### Prompt ID Reservation

| Reserved Range | Scan Scope | Existing Maximum | Reserved By | Collision Check |
| --- | --- | --- | --- | --- |
| P429-P${promptEnd} | active + archived scene packages | P428 | shotlist regression v2 | no collision |

### Scene Package Recommendation

- Package: \`deliverables/30_shotlist/scenes/scenes-078-085_096-098_v2/\`
- HTML: \`Shotlist_scenes-078-085_096-098_ZH_v2.html\`
- Shot rows: 52
- Prompt envelopes: 23
- Preview status: \`prompt_only\`
`;
}

function buildManifest(sceneList, promptGroups, promptEnd) {
  const qaReportPath = path.join("deliverables", "00_admin", "qa_reports", "qa_report_shotlist_workflow_v2.md");
  const qaReport = fs.existsSync(path.join(testRoot, qaReportPath)) ? qaReportPath : "pending until validator and manual review complete";
  return `# Artifact: Scene Package Manifest
- id: ${PACKAGE_ID}
- version: v2
- upstream: [A-20260530-004, A-20260530-005, ${BREAKDOWN_ID}]
- locks:
  - must_keep:
    - Preserve scene order, row mapping, exact source dialogue, and P429-P${promptEnd} reservation.
  - must_avoid:
    - Do not call this regression package production-approved.
  - budget_notes:
    - 23 prompt envelopes at 15 seconds each; 21:9.

---

- package_version: v2
- workflow_slot: shotlist.primary
- workflow_skill: sketch-shotlist-workflow
- contract_version: 1
- source_script: deliverables/10_story/01_script_v10.md
- source_audit: deliverables/10_story/01_audit_report_v10.md
- source_breakdown: deliverables/30_shotlist/03_shotlist_breakdown_v2.md
- shotlist_html: Shotlist_scenes-078-085_096-098_ZH_v2.html
- spatial_blocking: spatial_blocking.md
- blocking_approval: approved_for_test
- screenplay_scenes: 11
- scene_sections: ${sceneList.length}
- shot_rows: ${sceneList.flatMap((scene) => scene.rows).length}
- prompt_envelopes: ${promptGroups.length}
- prompt_ids: P429-P${promptEnd}
- asset_origin: generated_from_text
- reference_binding: images_attached
- reference_approval: draft
- output_status: prompt_only
- legacy_reference_mode: text_dna_draft
- common_assets:
  - \`deliverables/20_assets/generated_ref_v1/\`
- scene_specific_assets: none
- previews_manifest: previews/manifest.md
- generated_tests: none for v2; archived v1 retains the P389 smoke test
- qa_report: ${qaReport}
- known_limitations:
  - Existing references were generated from text and are not locked by an asset guide.
  - Blocking approval is for regression testing only.
  - No new preview images or video clips were generated.
`;
}

function buildPreviewManifest(promptGroups) {
  const rows = promptGroups.map((group) => `| \`${group.promptId}\` | ${group.rows.map((row) => `\`${row.rowId}\``).join(", ")} | 15s | none | prompt_only | HTML prompt exists; preview not generated |`).join("\n");
  return `# Artifact: Preview Manifest
- id: ${PREVIEW_ID}
- version: v2
- upstream: [${PACKAGE_ID}]
- locks:
  - must_keep: []
  - must_avoid:
    - Do not claim prompt-only entries have rendered previews.
  - budget_notes: []

---

- source_html: Shotlist_scenes-078-085_096-098_ZH_v2.html
- source_breakdown: deliverables/30_shotlist/03_shotlist_breakdown_v2.md
- scope: scenes-078-085_096-098
- prompt_envelope_count: ${promptGroups.length}
- preview_count: 0
- asset_origin: generated_from_text
- reference_binding: images_attached
- reference_approval: draft
- output_status: prompt_only
- image_tool: none
- known_limitations: prompt manifests only; no images generated

| Prompt ID | Source rows | Duration | Preview path | Status | Notes |
| --- | --- | ---: | --- | --- | --- |
${rows}
`;
}

function buildSpatialBlocking() {
  const rows = [
    ["scene-078", "南门→北墙", "Hana南门内侧偏西；Teacher偏东约2m；儿童向北墙方向移动", "南门远景、门内对峙、北墙指令中景"],
    ["scene-079", "门把手→北墙垫区", "Asa留在门把手旁系绳；Sora贴近Asa；儿童位于北墙垫区", "门把手插入、Sora/Asa低声反应"],
    ["scene-080", "桥入口→上坡出口", "农用车居中；老人留在车斗；堵车分列两侧；Daichi沿中心线下车", "桥面远景、仪表插入、车辆侧面动作"],
    ["scene-081", "检查点东侧→上坡", "Officer在东侧路障；Daichi在车头西侧；老人位于后景车斗", "检查点远景、双方中景、Officer特写、交通棒插入"],
    ["scene-082", "祭典街下坡→学校上坡", "Hana从摊位侧夺现金盒后沿上坡轴线跑；摊主从后景跟随", "摊位中景、现金盒插入、上坡远景"],
    ["scene-083", "办公室门口→Mayor办公桌", "Yuna在门口/桌前轴线；Mayor桌后；aides沿侧墙；电话在桌面右前方", "办公室建立、双向特写、停手中景、电话插入"],
    ["scene-084", "镇街→学校上坡", "消防员在车流侧；孩子沿学校轴线；发电机靠校门；Yuna留在街心", "镇街远景、交通中景、街心仰视"],
    ["scene-085", "山丘前景→镇盆地", "Yuna在山丘前景；撤离人群在后方25m外；冲击光来自南侧下方", "山丘远景、脸部特写、镇盆地远景、红绳插入"],
    ["scene-096", "平行列车门", "Ren在近侧车厢；Yuna在对面列车门边；两车沿相反方向分离", "平行列车远景、Ren反应特写"],
    ["scene-097", "西侧站口→东侧楼梯", "Ren从西侧站口跑出；Yuna从东侧楼梯下行；公交横向遮挡", "街口追逐、公交遮挡、红绳插入"],
    ["scene-098-pass", "下方街口→上方街口", "Ren沿左下向上；Yuna沿右上向下；中央擦肩后停在相邻台阶", "台阶远景、擦肩中景、脚步/肩背反应"],
    ["scene-098-recognition", "台阶中央轴线", "Ren在下一级；Yuna在上一级；距离约1.2m；红绳分别位于手腕和包带", "对话特写、红绳插入、最终口型特写"],
  ].map((row) => `| \`${row[0]}\` | ${row[1]} | ${row[2]} | ${row[3]} |`).join("\n");
  return `# Artifact: Spatial Blocking
- id: ${BLOCKING_ID}
- version: v2
- upstream: [${BREAKDOWN_ID}]
- locks:
  - must_keep:
    - Preserve main axes and character/prop sides in the v2 prompt set.
  - must_avoid:
    - Do not interpret test approval as production approval.
  - budget_notes: []

---

- blocking_approval: approved_for_test
- approval_basis: user requested execution of the existing regression scope; current mappings are unambiguous
- production_reapproval_required: yes

| Scene Group | Main View Axis | Positions | Camera Families |
| --- | --- | --- | --- |
${rows}
`;
}

function quoted(value) {
  const matches = [...String(value).matchAll(/"([^"]+)"/g)].map((match) => `"${match[1]}"`);
  return matches.join(" / ");
}

function md(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
