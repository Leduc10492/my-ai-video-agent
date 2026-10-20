import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Store } from "../server/store.mjs";
import { startSkill } from "../server/codex.mjs";
import { saveScript, scriptStatus, chooseScript } from "../server/workflow.mjs";
import { parseScreenplay } from "../../.agents/skills/shotlist-breakdown-workflow/scripts/index-screenplay-scenes.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "film-planning-"));
  const store = new Store(root);
  fs.mkdirSync(path.join(root, ".agents/skills/test-skill"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, ".agents/skills/test-skill/SKILL.md"),
    "# Test fixture",
  );
  fs.writeFileSync(
    path.join(root, ".agents/skill_registry.md"),
    ["guides.primary", "shotlist.breakdown", "shotlist.prompt_compiler"]
      .map((slot) => `| \`${slot}\` | \`test-skill\` |`)
      .join("\n"),
  );
  t.after(() => {
    store.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  return store;
}
const source =
  "# 概念\r\n\r\n### 第 1 场 · 城市 · 日\r\n原话 @char_Exact-A\r\n\r\n### 第 7 场 · 出租屋 · 夜\r\n最后动作。\r\n\r\n## 分镜表\r\n| 1 | 数据 |\r\n";
test("a proposed filename does not replace an explicitly unbound platform tag", (t) => {
  const store = fixture(t);
  const a = store.ensureAsset({
    asset_name: "@char_Planned-A",
    kind: "image",
    tag: "",
    output_status: "text_only_draft",
  });
  assert.equal(a.tag, "");
  assert.equal(
    store.ensureAsset({
      asset_name: "@char_Real-B",
      kind: "image",
      tag: "@Manual_Tag-B",
    }).tag,
    "@Manual_Tag-B",
  );
});
test("Chinese Markdown scenes retain source IDs and byte ranges, excluding the shot table", () => {
  const parsed = parseScreenplay(source);
  assert.deepEqual(
    parsed.scenes.map((s) => s.label),
    ["scene-001", "scene-007"],
  );
  assert.equal(parsed.scenes[1].closingLine, "最后动作。");
  assert.ok(!parsed.scenes[1].body.includes("分镜表"));
  assert.match(
    source.slice(parsed.scenes[0].startOffset, parsed.scenes[0].endOffset),
    /原话 @char_Exact-A\r\n/,
  );
  assert.match(source.slice(parsed.scenes[1].endOffset), /## 分镜表/);
});
test("explicit reindex repairs legacy empty scene metadata without changing script bytes or production state", (t) => {
  const s = fixture(t);
  saveScript(s.root, { body: source });
  const stateFile = path.join(
    s.root,
    "deliverables/0_admin/workflow_state.json",
  );
  const old = JSON.parse(fs.readFileSync(stateFile));
  for (const ref of Object.values(old.artifacts))
    if (ref.kind === "script") ref.scene_map = [];
  old.working_script.scene_map = [];
  old.scene_labels = [];
  fs.writeFileSync(stateFile, JSON.stringify(old));
  const bytes = fs.readFileSync(path.join(s.root, old.working_script.path));
  chooseScript(s.root, {
    script: old.working_script.path,
    expected_sha256: old.working_script.sha256,
    reindex: true,
  });
  const current = scriptStatus(s.root);
  assert.equal(current.state.working_script.sha256, old.working_script.sha256);
  assert.deepEqual(
    current.state.working_script.scene_map.map((s) => s.label),
    ["scene-001", "scene-007"],
  );
  assert.deepEqual(
    fs.readFileSync(path.join(s.root, old.working_script.path)),
    bytes,
  );
  assert.equal(current.state.production_inputs, null);
});
test("planning uses exact working script and records draft scope without bypassing production or Prompt gates", async (t) => {
  const s = fixture(t);
  saveScript(s.root, { body: source });
  const ref = scriptStatus(s.root).state.working_script;
  const calls = [];
  const client = {
    request: async (method, params) => {
      calls.push({ method, params });
      return method === "thread/start"
        ? { thread: { id: "test-thread" } }
        : { turn: { id: "test-turn" } };
    },
  };
  await assert.rejects(
    startSkill(client, s, { stage: "assets", instruction: "production" }),
    /确认剧本/,
  );
  await assert.rejects(
    startSkill(client, s, {
      stage: "assets",
      mode: "planning",
      expected_sha256: ref.sha256,
      instruction: "draft",
    }),
    /审核/,
  );
  fs.writeFileSync(
    path.join(s.root, "deliverables/1_story/01_audit_report_v1.md"),
    "Synthetic audit: unresolved continuity question; no production approval.",
  );
  await assert.rejects(
    startSkill(client, s, {
      stage: "prompts",
      mode: "planning",
      instruction: "draft",
    }),
    /仅支持/,
  );
  await assert.rejects(
    startSkill(client, s, {
      stage: "assets",
      mode: "planning",
      expected_sha256: "stale",
      instruction: "draft",
    }),
    /已更新/,
  );
  const job = await startSkill(client, s, {
    stage: "assets",
    mode: "planning",
    expected_sha256: ref.sha256,
    instruction: "只做资产拆分",
    request_key: "test-draft",
  });
  assert.equal(job.mode, "planning");
  assert.equal(job.input_script.sha256, ref.sha256);
  assert.equal(calls.filter(c => c.method === "thread/start").length, 1);
  const turns = calls.filter(c => c.method === "turn/start");
  assert.equal(turns.length, 1);
  assert.match(turns[0].params.input.at(-1).text, /text_only_draft/);
  assert.equal(scriptStatus(s.root).state.production_inputs, null);
  assert.equal(s.list("batch").length, 0);
});
