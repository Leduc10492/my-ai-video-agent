import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Store } from "../server/store.mjs";
import { importStoryboard, existingOutputs } from "../server/workflow.mjs";
import { assemble } from "../server/timeline.mjs";
import { createApp } from "../server/app.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "film-board-"));
  const store = new Store(root);
  t.after(() => {
    store.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  return store;
}
const board = () => ({
  envelopes: [
    {
      id: "P001",
      scene: "scene-001",
      asset_name: "@prop_Cup-A",
      duration_seconds: 5,
      source_rows: ["S01", "S02"],
      prompt: "原文 @Real_Platform-TAG {对白}",
      markers: [{ id: "m1", title: "计划", time: 2 }],
      extra: { preserve: true },
    },
  ],
  shots: [
    {
      id: "S01",
      scene: "scene-001",
      title: "首镜",
      description: "测试描述",
      references: ["@char_A-B"],
    },
    { id: "S02", scene: "scene-001", sound: "原台词", references: [] },
  ],
  source: {
    path: "deliverables/3_shotlist/existing.md",
    sha256: "source-hash",
  },
});
test("visual shot edits preserve exact names, grouped envelopes, provenance and old cuts", (t) => {
  const s = fixture(t),
    first = importStoryboard(s, { ...board(), expected_sha256: null });
  const cut = s.saveTimeline(assemble(s, "project"), 0, "assembly");
  const edit = structuredClone(first);
  edit.shots[1].sound = "保留 {新台词}";
  edit.envelopes[0].prompt += "\n追加运镜";
  const saved = importStoryboard(s, { ...edit, expected_sha256: first.sha256 });
  assert.equal(saved.envelopes[0].asset_name, "@prop_Cup-A");
  assert.equal(saved.shots[0].references[0], "@char_A-B");
  assert.deepEqual(saved.source, first.source);
  assert.deepEqual(saved.envelopes[0].extra, { preserve: true });
  assert.equal(saved.envelopes[0].source_rows.length, 2);
  assert.match(saved.envelopes[0].prompt, /@Real_Platform-TAG/);
  assert.equal(s.timeline().project.tracks[0].elements.length, 1);
  assert.deepEqual(s.timeline(), cut);
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(s.root, first.path))).shots[1].sound,
    "原台词",
  );
  assert.notEqual(saved.path, first.path);
  assert.ok(!Object.hasOwn(saved, "expected_sha256"));
});
test("stale shot saves fail without changing current data and retry does not erase another editor", (t) => {
  const s = fixture(t),
    first = importStoryboard(s, board());
  const newer = importStoryboard(s, {
    ...board(),
    expected_sha256: first.sha256,
    shots: board().shots.map((s) => ({ ...s, title: "new" })),
  });
  assert.throws(
    () => importStoryboard(s, { ...first, expected_sha256: first.sha256 }),
    /分镜已有更新/,
  );
  assert.equal(s.meta("storyboard").sha256, newer.sha256);
  assert.throws(
    () => importStoryboard(s, { ...board(), expected_sha256: null }),
    /分镜已有更新/,
  );
});
test("legacy boards remain readable; invalid row mappings, fixed names and markers cannot be saved", (t) => {
  const s = fixture(t),
    legacy = board();
  delete legacy.shots;
  const first = importStoryboard(s, legacy);
  assert.equal(first.envelopes[0].source_rows.length, 2);
  const renamed = board();
  renamed.envelopes[0].asset_name = "renamed";
  assert.throws(() => importStoryboard(s, renamed), /文件名已固定/);
  const duplicate = board();
  duplicate.envelopes[0].source_rows.push("S01");
  assert.throws(() => importStoryboard(s, duplicate), /Shot Row 必须唯一/);
  const orphan = board();
  orphan.shots[0].id = "missing";
  assert.throws(() => importStoryboard(s, orphan), /镜头详情必须对应/);
  const short = board();
  short.envelopes[0].duration_seconds = 1;
  assert.throws(() => importStoryboard(s, short), /标记越界/);
  assert.equal(s.meta("storyboard").sha256, first.sha256);
});
test("storyboard API exposes saved details and rejects stale browser writes with 409", async (t) => {
  const s = fixture(t);
  fs.mkdirSync(path.join(s.root, ".agents"));
  fs.writeFileSync(
    path.join(s.root, ".agents/skill_registry.md"),
    "# Test registry\n",
  );
  const { app, projects } = await createApp({
    dataDir: path.join(s.root, ".app"),
    initialRoot: s.root,
    runWorker: false,
  });
  t.after(() => app.close());
  const base = `/api/projects/${projects[0].project_id}`;
  const request = {
    method: "POST",
    url: `${base}/storyboard`,
    headers: { "x-workbench": "1" },
    payload: { ...board(), expected_sha256: null },
  };
  const first = await app.inject(request);
  assert.equal(first.statusCode, 200);
  const saved = first.json();
  assert.equal(saved.shots[0].title, "首镜");
  assert.equal((await app.inject(request)).statusCode, 409);
  const response = await app.inject({ method: "GET", url: base });
  assert.equal(response.statusCode, 200);
  assert.equal(
    response.json().storyboard.envelopes[0].asset_name,
    "@prop_Cup-A",
  );
  assert.equal(response.json().storyboard.path, saved.path);
});

test("Skill outputs remain discoverable for projects nested inside workbench", (t) => {
  const s = fixture(t),
    root = path.join(s.root, "workbench", "project");
  const files = [
    "deliverables/3_shotlist/storyboard_v1.json",
    "deliverables/0_admin/workbench/private.json",
    "deliverables/4_edit/private.json",
  ];
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), "{}");
  }
  assert.deepEqual(
    existingOutputs(root).map((o) => o.path),
    [files[0]],
  );
});
