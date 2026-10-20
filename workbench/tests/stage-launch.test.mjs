import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stageLaunch, stageSlots } from "../shared/stage-launch.ts";
import { startSkill, stageSlots as actualSlots } from "../server/codex.mjs";
import { Store } from "../server/store.mjs";
import { saveScript, scriptStatus } from "../server/workflow.mjs";
import { atomic } from "../server/files.mjs";

const working = {
  version: 2,
  sha256: "working",
  scene_map: [
    { label: "scene-001", header: "房间 · 日" },
    { label: "scene-002", header: "室外 · 夜" },
  ],
};
const script = {
  state: { working_script: working, production_inputs: null },
  audit: { path: "audit-v2" },
};
const skills = [...new Set(Object.values(stageSlots).flat())].map((slot) => ({
  slot,
  available: true,
}));
const evaluate = (overrides = {}) =>
  stageLaunch({
    stage: "assets",
    mode: "planning",
    instruction: "",
    dirty: false,
    sceneScope: "all",
    script,
    skills,
    ...overrides,
  });

test("asset and storyboard launches allow blank supplements only after an explicit purpose choice", () => {
  assert.deepEqual(stageSlots, actualSlots);
  for (const stage of ["assets", "storyboard"]) {
    const initial = evaluate({ stage, mode: "" });
    assert.equal(initial.ready, false);
    assert.equal(initial.issues[0].code, "choose-mode");
    const planning = evaluate({ stage });
    assert.equal(planning.ready, true);
    assert.ok(planning.requestInstruction.length > 20);
    assert.equal(planning.source.sha256, "working");
    const production = evaluate({ stage, mode: "production" });
    assert.equal(production.ready, false);
    assert.equal(production.issues[0].action, "review");
  }
});

test("blocked launches expose the real next step for audit, save, import and skill configuration", () => {
  assert.equal(
    evaluate({ script: { ...script, audit: null } }).issues[0].action,
    "audit",
  );
  assert.equal(evaluate({ dirty: true }).issues[0].action, "save");
  assert.equal(
    evaluate({ script: { state: null } }).issues[0].action,
    "editor",
  );
  assert.equal(evaluate({ skills: [] }).issues[0].action, "settings");
  assert.equal(
    evaluate({ stage: "script", mode: "production" }).issues[0].code,
    "brief",
  );
  assert.equal(
    evaluate({
      stage: "audit",
      mode: "production",
      script: { ...script, audit: null },
    }).ready,
    true,
  );
  assert.equal(evaluate({ stage: "prompts", mode: "production" }).ready, false);
});

test("storyboard scope follows the chosen version and production authorization, keeping extra requests verbatim", () => {
  const production = {
    script: { ...working, version: 1, sha256: "production" },
    authorization: { scope: ["scene-002"] },
  };
  const value = evaluate({
    stage: "storyboard",
    mode: "production",
    instruction: "保留 @char_Exact-A 和台词“规矩。”",
    script: {
      state: { working_script: working, production_inputs: production },
    },
  });
  assert.equal(value.ready, true);
  assert.equal(value.source.sha256, "production");
  assert.deepEqual(value.scenes, ["scene-002"]);
  assert.match(value.requestInstruction, /保留 @char_Exact-A 和台词“规矩。”/);
  const invalid = evaluate({
    stage: "storyboard",
    sceneScope: "scene-missing",
  });
  assert.equal(invalid.ready, false);
  assert.equal(invalid.issues[0].code, "scene-scope");
  assert.equal(invalid.issues[0].action, "scope");
});

test("every blocked state explains the next step, distinguishing missing scenes from authorization and selection", () => {
  for (const stage of ["assets", "storyboard"]) {
    for (const overrides of [
      { mode: "" },
      { dirty: true },
      { script: { state: null } },
      { script: { error: "Referenced script is missing", state: null } },
      { script: { ...script, audit: null } },
      { mode: "production" },
      { mode: "production", script: { ...script, audit: null } },
      { skills: [] },
    ]) {
      const value = evaluate({ stage, ...overrides });
      assert.equal(value.ready, false);
      for (const issue of value.issues) {
        assert.ok(issue.message.trim());
        assert.ok(issue.nextStep.trim());
      }
    }
  }
  const noScenes = evaluate({
    stage: "storyboard",
    script: { ...script, state: { working_script: { ...working, scene_map: [] } } },
  });
  assert.equal(noScenes.issues[0].action, "editor");
  const noScope = evaluate({
    stage: "storyboard",
    mode: "production",
    script: { ...script, state: { working_script: working, production_inputs: {
      script: working, authorization: { scope: [] },
    } } },
  });
  assert.equal(noScope.issues[0].action, "review");
  const invalid = evaluate({ stage: "storyboard", sceneScope: "scene-missing" });
  assert.equal(invalid.issues[0].action, "scope");
  assert.equal(evaluate({ stage: "storyboard", mode: "", sceneScope: "scene-missing" }).issues.length, 1);
  const readError = evaluate({ script: { error: "Referenced script is missing", state: null } });
  assert.deepEqual(readError.issues.map((issue) => issue.code), ["script-error"]);
});

test("ready asset request reaches the existing runner without inventing production approval", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "stage-launch-"));
  atomic(
    path.join(root, ".agents/skill_registry.md"),
    "| `guides.primary` | `guide` |\n",
  );
  atomic(path.join(root, ".agents/skills/guide/SKILL.md"), "# Asset guide");
  saveScript(root, { body: "### 第 1 场 · 室内 · 日\n阿甲看向门口。" });
  atomic(
    path.join(root, "deliverables/1_story/01_audit_report_v1.md"),
    "# Test audit\n空间尚待确认。",
  );
  const store = new Store(root),
    calls = [];
  t.after(() => {
    store.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const current = scriptStatus(root);
  const launch = evaluate({ script: current });
  assert.equal(launch.ready, true);
  const client = {
    request: async (method, params) => {
      calls.push({ method, params });
      return method === "thread/start"
        ? { thread: { id: "test-thread" } }
        : { turn: { id: "test-turn" } };
    },
  };
  const job = await startSkill(client, store, {
    stage: "assets",
    mode: "planning",
    expected_sha256: launch.source.sha256,
    instruction: launch.requestInstruction,
    request_key: "ui-default-request",
  });
  assert.equal(job.status, "running");
  assert.equal(calls.filter((c) => c.method === "turn/start").length, 1);
  assert.equal(scriptStatus(root).state.production_inputs, null);
});
