import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Store } from "../server/store.mjs";
import { assetName, contained, sha } from "../server/files.mjs";
import { createBatch, approveBatch, JobRunner } from "../server/providers.mjs";
import { assemble, validateTimeline } from "../server/timeline.mjs";
import { saveScript, scriptStatus, chooseScript } from "../server/workflow.mjs";
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "film-workbench-"));
  const s = new Store(root);
  t.after(() => {
    s.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  return s;
}
const item = (name = "@char_AB-C", kind = "video") => ({
  asset_name: name,
  kind,
  prompt: "仅包含画面和声音。@char_Exact-Tag",
  params: { model: "test-only-model", duration: 2, use_unlim: true },
});
test("filename and manual tag remain byte-for-byte intact; collision and path escape rejected", (t) => {
  const s = fixture(t),
    a = s.ensureAsset({ ...item(), tag: "@Actual_Platform-TAG" });
  assert.equal(a.asset_name, "@char_AB-C");
  assert.equal(a.tag, "@Actual_Platform-TAG");
  assert.throws(() => s.ensureAsset(item()), /同名/);
  assert.throws(() => assetName("../escape"));
  assert.throws(() => contained(s.root, "../../escape"));
  fs.symlinkSync(os.tmpdir(), path.join(s.root, "outside"));
  assert.throws(() => contained(s.root, "outside/data"), /链接/);
});
test("duplicate batch approval and worker ticks submit once; partial failures preserve sibling jobs", async (t) => {
  const s = fixture(t);
  let submissions = 0;
  const batch = createBatch(s, {
    items: [item("one"), item("two")],
    destination: "none",
  });
  const first = approveBatch(s, batch.batch_id, batch.sha256),
    second = approveBatch(s, batch.batch_id, batch.sha256);
  assert.deepEqual(
    first.map((j) => j.job_id),
    second.map((j) => j.job_id),
  );
  const runner = new JobRunner({
    submit: async (root, request) => {
      submissions++;
      if (request.asset_name === "two")
        throw new Error("socket closed after send");
      return { results: [{ id: "remote-one", status: "queued" }] };
    },
    result: () => null,
    query: async () => ({ jobs: [] }),
  });
  await Promise.all([runner.tick(s), runner.tick(s)]);
  await runner.tick(s);
  assert.equal(submissions, 2);
  assert.equal(s.get("job", first[0].job_id).status, "submitted");
  assert.equal(s.get("job", first[1].job_id).status, "submission_unknown");
});
test("restart preserves remote IDs and never replays uncertain submissions", async (t) => {
  const s = fixture(t),
    b = createBatch(s, { items: [item()] });
  const [job] = approveBatch(s, b.batch_id, b.sha256);
  s.updateJob(job.job_id, { status: "submitting" });
  const runner = new JobRunner({
    submit: () => assert.fail("must not submit"),
    query: async () => ({ jobs: [] }),
  });
  runner.recover(s);
  await runner.tick(s);
  assert.equal(s.get("job", job.job_id).status, "submission_unknown");
  s.updateJob(job.job_id, { status: "submitting", remote_id: "known-id" });
  runner.recover(s);
  assert.equal(s.get("job", job.job_id).status, "submitted");
  assert.equal(s.get("job", job.job_id).remote_id, "known-id");
});
test("Unlim choice submits no duplicate or silent paid fallback", async (t) => {
  const s = fixture(t),
    b = createBatch(s, { items: [item()] });
  const [job] = approveBatch(s, b.batch_id, b.sha256);
  let called = 0;
  const runner = new JobRunner({
    submit: async () => {
      called++;
      return { unlim_choice: { description: "choose" } };
    },
    query: async () => ({ jobs: [] }),
  });
  await runner.tick(s);
  await runner.tick(s);
  assert.equal(called, 1);
  assert.equal(s.get("job", job.job_id).status, "awaiting_choice");
});
test("new takes and assemblies do not rewrite prior cuts; optimistic saves reject stale editing", (t) => {
  const s = fixture(t);
  s.ensureAsset(item("shot"));
  s.put("take", "old", {
    take_id: "old",
    asset_name: "shot",
    media: { duration: 3, kind: "video" },
  });
  s.put("asset", "shot", {
    ...s.get("asset", "shot"),
    selected_take_id: "old",
  });
  s.meta("storyboard", {
    sha256: "board",
    envelopes: [
      {
        id: "P01",
        scene: "scene-001",
        asset_name: "shot",
        source_rows: ["R1", "R2"],
        duration_seconds: 5,
      },
    ],
  });
  const assembly = assemble(s, "p");
  assert.equal(assembly.tracks[0].elements.length, 1);
  assert.equal(assembly.tracks[0].elements[0].e, 3);
  assert.match(assembly.metadata.warnings[0], /未补帧/);
  const v1 = s.saveTimeline(validateTimeline(s, assembly), 0, "assembly");
  const edit = structuredClone(v1.project);
  edit.tracks[0].elements[0].props.time = 1;
  edit.tracks[0].elements[0].e = 2;
  const v2 = s.saveTimeline(validateTimeline(s, edit), 1);
  s.put("take", "new", {
    take_id: "new",
    asset_name: "shot",
    media: { duration: 5, kind: "video" },
  });
  s.put("asset", "shot", {
    ...s.get("asset", "shot"),
    selected_take_id: "new",
  });
  s.saveTimeline(assemble(s, "p"), 2, "assembly");
  assert.equal(
    s.timeline(2).project.tracks[0].elements[0].metadata.take_id,
    "old",
  );
  assert.deepEqual(s.timeline(2).project, v2.project);
  assert.throws(() => s.saveTimeline(edit, 2), /已有更新/);
  assert.equal(
    s.timeline().project.tracks[0].elements[0].metadata.take_id,
    "new",
  );
});
test("missing media blocks formal export, split clips get unique clip IDs and stable take IDs", (t) => {
  const s = fixture(t);
  s.meta("storyboard", {
    envelopes: [
      {
        id: "P1",
        asset_name: "missing",
        source_rows: ["R1"],
        duration_seconds: 3,
      },
    ],
  });
  assert.throws(
    () => validateTimeline(s, assemble(s, "p"), { exporting: true }),
    /缺失/,
  );
  s.put("take", "old", {
    take_id: "old",
    asset_name: "shot",
    media: { duration: 4, kind: "video" },
  });
  const elements = [0, 1].map((i) => ({
    id: `e-${i}`,
    type: "video",
    s: i,
    e: i + 1,
    props: { src: "/api/projects/p/media/old", time: i },
    metadata: { take_id: "old", clip_id: "copied" },
  }));
  validateTimeline(s, { tracks: [{ elements }] });
  assert.deepEqual(
    elements.map((e) => e.metadata.clip_id),
    ["e-0", "e-1"],
  );
  assert.equal(elements[1].metadata.source_in, 1);
});
test("screenplay save delegates to current version contract and preserves exact strings", (t) => {
  const s = fixture(t);
  saveScript(s.root, { body: "INT. ROOM - DAY\n\n@char_A-B says: {Hello.}\n" });
  let status = scriptStatus(s.root);
  const first = status.state.working_script;
  saveScript(s.root, {
    body: status.body.replace("Hello.", "Hello again."),
    expected_sha256: first.sha256,
  });
  status = scriptStatus(s.root);
  assert.equal(status.state.working_script.version, 2);
  assert.equal(status.state.production_inputs, null);
  assert.throws(
    () => saveScript(s.root, { body: "wrong", expected_sha256: first.sha256 }),
    /变化/,
  );
  assert.ok(fs.existsSync(path.join(s.root, first.path)));
  assert.match(status.body, /@char_A-B/);
});
