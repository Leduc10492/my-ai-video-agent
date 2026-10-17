import assert from "node:assert/strict";
import test from "node:test";

import { extractScene, routeRequest } from "./router.ts";
import type { RouteContext } from "./types.ts";

const context: RouteContext = {
  source: "example",
  sourceLabel: "示例数据《末班》",
  slots: [
    { slot: "script.primary", skill: "screenwriter-workflow", owner: "script-writer", output: "deliverables/1_story/01_script_v{N}.md", canonicalOutputs: ["deliverables/1_story/01_script_v{N}.md", "deliverables/1_story/01_audit_report_v{N}.md"] },
    { slot: "story.mckee_router", skill: "mckee-coordinator", owner: "script-writer", output: "审计 packet", canonicalOutputs: ["structure packet"] },
    { slot: "guides.primary", skill: "guide-workflow", owner: "guide-director", output: "deliverables/2_assets/", canonicalOutputs: ["deliverables/2_assets/02_asset_guide_v{N}.md", "deliverables/2_assets/02_style_guide_v{N}.md"] },
    { slot: "shotlist.breakdown", skill: "shotlist-breakdown-workflow", owner: "storyboard-director", output: "breakdown", canonicalOutputs: ["deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md"] },
    { slot: "shotlist.primary", skill: "sketch-shotlist-workflow", owner: "storyboard-director", output: "html", canonicalOutputs: ["deliverables/3_shotlist/<scene-label>_v{N}/Shotlist_<scene-label>_ZH_v{N}.html"] },
    { slot: "qa.primary", skill: "qa-workflow", owner: "qa-check", output: "对话 QA", canonicalOutputs: ["deliverables/0_admin/qa_reports/qa_report_<stage>_v{N}.md"] },
    { slot: "qa.checklists", skill: "qa-checklists", owner: "qa-check", output: "清单", canonicalOutputs: [] },
    { slot: "version.manager", skill: "version-management", owner: "当前写入者", output: "归档", canonicalOutputs: [] },
  ],
  skillOutputs: {
    "screenwriter-workflow": ["deliverables/1_story/01_script_v{N}.md", "deliverables/1_story/01_audit_report_v{N}.md"],
    "mckee-source": ["source packet"],
    "guide-workflow": ["deliverables/2_assets/02_asset_guide_v{N}.md", "deliverables/2_assets/02_style_guide_v{N}.md"],
    "shotlist-breakdown-workflow": ["deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md"],
    "sketch-shotlist-workflow": ["deliverables/3_shotlist/<scene-label>_v{N}/Shotlist_<scene-label>_ZH_v{N}.html"],
    "qa-workflow": ["deliverables/0_admin/qa_reports/qa_report_<stage>_v{N}.md"],
  },
  agents: [
    { name: "storyboard-director", description: "", inputs: ["latest script"], outputs: [], slots: [], skills: [] },
    { name: "script-writer", description: "", inputs: ["locks"], outputs: [], slots: [], skills: [] },
  ],
  stages: [
    { id: "script", label: "剧本", summary: "", slot: "script.primary", skill: "screenwriter-workflow", owner: "script-writer", output: "", status: "已完成", detail: "有剧本", evidence: [] },
    { id: "audit", label: "剧本审核", summary: "", slot: "script.primary", skill: "screenwriter-workflow", owner: "script-writer", output: "", status: "已通过", detail: "未解决的 P0 / P1 都是无。", evidence: [] },
    { id: "guides", label: "资产与风格", summary: "", slot: "guides.primary", skill: "guide-workflow", owner: "guide-director", output: "", status: "已完成", detail: "", evidence: [] },
    { id: "breakdown", label: "Scene 分镜拆解", summary: "", slot: "shotlist.breakdown", skill: "shotlist-breakdown-workflow", owner: "storyboard-director", output: "", status: "进行中", detail: "已有一场", evidence: [] },
    { id: "html", label: "中文分镜表", summary: "", slot: "shotlist.primary", skill: "sketch-shotlist-workflow", owner: "storyboard-director", output: "", status: "进行中", detail: "", evidence: [] },
    { id: "qa", label: "QA", summary: "", slot: "qa.primary", skill: "qa-workflow", owner: "qa-check", output: "", status: "未开始", detail: "", evidence: [] },
  ],
  ruleLines: [
    "进入资产与分镜阶段前，当前剧本必须有对应版本的审计报告，且没有未解决的 P0/P1。",
    "图片或视频生成必须由用户单独授权；完成 HTML 不自动触发生成。",
    "默认一次只完成一个 Scene。",
    "只有用户明确要求 Sub Agent、并行或委派时，才读取对应说明。",
  ],
  files: ["3_shotlist/scene-002_v1/03_shotlist_breakdown_scene-002_v1.md"],
};

test("第二场拆成分镜走到 breakdown", () => {
  const result = routeRequest("把第二场拆成分镜", context);
  assert.equal(result.slot, "shotlist.breakdown");
  assert.equal(result.skill, "shotlist-breakdown-workflow");
  assert.equal(result.owner, "storyboard-director");
  assert.equal(result.sceneLabel, "scene-002");
  assert.match(result.outputPath, /03_shotlist_breakdown_scene-002_v1\.md/);
  assert.equal(result.gates.some((gate) => gate.level === "block"), false);
  assert.match(result.prompt, /shotlist-breakdown-workflow/);
});

test("生成视频会警告且不自动开做", () => {
  const result = routeRequest("把第二场生成视频", context);
  assert.equal(result.slot, "shotlist.primary");
  assert.equal(result.generation, true);
  assert.equal(result.gates.some((gate) => gate.title === "生成需要单独授权"), true);
  assert.equal(result.delegation, false);
});

test("审核剧本走审核门", () => {
  const blocked = {
    ...context,
    stages: context.stages.map((stage) => (stage.id === "audit" ? { ...stage, status: "阻断" as const, detail: "没有审核。" } : stage)),
  };
  const result = routeRequest("审核最新剧本", context);
  assert.equal(result.slot, "script.primary");
  assert.equal(result.pluginSlot, "story.mckee_router");
  assert.match(result.outputPath, /01_audit_report_v1\.md/);
  const downstream = routeRequest("把第二场拆成分镜", blocked);
  assert.equal(downstream.gates.some((gate) => gate.level === "block"), true);
});

test("场次中文数字", () => {
  assert.equal(extractScene("第十二场").label, "scene-012");
  assert.equal(extractScene("scene-021").label, "scene-021");
});
