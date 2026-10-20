import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createApp } from "../server/app.mjs";
import { Store } from "../server/store.mjs";
import { sha, atomic } from "../server/files.mjs";
import { JobRunner, validateModelRequest } from "../server/providers.mjs";
import { CodexClient } from "../server/codex.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "workbench-recovery-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test("artifact apply resumes only matching owned files, is idempotent, and preflights conflicts", async (t) => {
  const root = fixture(t),
    { app, stores, projects } = await createApp({
      dataDir: path.join(root, ".app"),
      initialRoot: root,
      runWorker: false,
    });
  t.after(() => app.close());
  const store = stores.get(projects[0].project_id),
    base = `/api/projects/${projects[0].project_id}`;
  const artifacts = [
    {
      path: "deliverables/2_assets/asset_inventory_v1.json",
      content: '{"assets":[]}',
    },
    { path: "deliverables/2_assets/notes.md", content: "@char_Exact-TAG" },
  ];
  const job = store.createJob({ kind: "skill" }, "recover-owned-output"),
    result = { summary: "reviewed", artifacts },
    hash = sha(result);
  store.updateJob(job.job_id, {
    status: "completed",
    result,
    apply_started: { sha256: hash },
  });
  atomic(path.join(root, artifacts[0].path), artifacts[0].content);
  const request = {
    method: "POST",
    url: `${base}/skills/${job.job_id}/apply`,
    headers: { "x-workbench": "1" },
    payload: { sha256: hash },
  };
  assert.equal((await app.inject(request)).statusCode, 200);
  assert.equal((await app.inject(request)).statusCode, 200);
  assert.equal(
    fs.readFileSync(path.join(root, artifacts[1].path), "utf8"),
    "@char_Exact-TAG",
  );
  const second = store.createJob({ kind: "skill" }, "different-job-collision"),
    collision = {
      summary: "conflict",
      artifacts: [
        { path: "deliverables/2_assets/new.md", content: "new" },
        artifacts[0],
      ],
    };
  store.updateJob(second.job_id, { status: "completed", result: collision });
  const response = await app.inject({
    ...request,
    url: `${base}/skills/${second.job_id}/apply`,
    payload: { sha256: sha(collision) },
  });
  assert.equal(response.statusCode, 409);
  assert.equal(
    fs.existsSync(path.join(root, "deliverables/2_assets/new.md")),
    false,
  );
  assert.equal(
    (
      await app.inject({
        ...request,
        headers: { "x-workbench": "1", origin: "https://unrelated.example" },
      })
    ).statusCode,
    403,
  );
  assert.equal((await app.inject({ ...request, headers: {} })).statusCode, 403);
});

test("orphan timeline JSON survives recovery without blocking the next revision", (t) => {
  const root = fixture(t),
    store = new Store(root);
  t.after(() => store.close());
  atomic(
    path.join(root, "deliverables/4_edit/timeline_v1.json"),
    "orphan from interrupted commit",
  );
  const saved = store.saveTimeline({ tracks: [] }, 0);
  assert.equal(saved.revision, 2);
  assert.equal(
    fs.readFileSync(
      path.join(root, "deliverables/4_edit/timeline_v1.json"),
      "utf8",
    ),
    "orphan from interrupted commit",
  );
});

test("query rotation reaches jobs beyond the provider limit of eight", async (t) => {
  const store = new Store(fixture(t));
  t.after(() => store.close());
  for (let i = 0; i < 11; i++) {
    const j = store.createJob({ kind: "generation" }, `poll-${i}-request`);
    store.updateJob(j.job_id, {
      status: "submitted",
      remote_id: `remote-${i}`,
    });
  }
  const polls = [];
  const runner = new JobRunner({
    query: async (_, jobs) => {
      polls.push(jobs.map((j) => j.remote_id));
      return { jobs: [], poll_after_seconds: 5 };
    },
  });
  await runner.tick(store);
  store.meta("next_poll_at", 0);
  await runner.tick(store);
  assert.equal(polls[0].length, 8);
  assert.equal(new Set(polls.flat()).size, 11);
});

test("invalid model duration and reference mode are rejected before a generation batch", () => {
  const model = {
    id: "seedance_2_5",
    output_type: "video",
    aspect_ratios: ["16:9"],
    parameters: [
      { name: "duration", type: "number", min: 4, max: 30 },
      { name: "mode", type: "string", options: ["t2v", "omni_reference"] },
    ],
  };
  const item = {
    asset_name: "@char_Exact-TAG",
    kind: "video",
    params: { model: model.id, duration: 5, aspect_ratio: "16:9" },
  };
  assert.doesNotThrow(() => validateModelRequest(item, model));
  assert.throws(
    () =>
      validateModelRequest(
        { ...item, params: { ...item.params, duration: 2 } },
        model,
      ),
    /最小/,
  );
  assert.throws(
    () =>
      validateModelRequest(
        { ...item, params: { ...item.params, duration: 5.5 } },
        model,
      ),
    /整数/,
  );
  assert.throws(
    () =>
      validateModelRequest(
        {
          ...item,
          params: {
            ...item.params,
            medias: [{ role: "image", value: "media-id" }],
          },
        },
        model,
      ),
    /t2v/,
  );
});

test("approval wire format cannot fabricate native user verification", () => {
  const client = new CodexClient(),
    wire = [];
  client.child = { stdin: { write: (line) => wire.push(JSON.parse(line)) } };
  client.requests.set("p", {
    rpc_id: 1,
    method: "item/permissions/requestApproval",
    params: { permissions: { network: { enabled: true } } },
  });
  client.answer("p", { decision: "decline" });
  assert.deepEqual(wire[0].result, { permissions: {}, scope: "turn" });
  client.requests.set("a", {
    rpc_id: 2,
    method: "applyPatchApproval",
    params: {},
  });
  client.answer("a", { decision: "decline" });
  assert.deepEqual(wire[1].result, {
    decision: { denied: { rejection: "用户拒绝本次操作" } },
  });
  client.requests.set("v", {
    rpc_id: 3,
    method: "mcpServer/elicitation/request",
    params: { mode: "openai/userVerification" },
  });
  assert.throws(() => client.answer("v", { action: "accept" }), /身份验证/);
  assert.equal(wire.length, 2);
  client.answer("v", { action: "decline", content: null, _meta: null });
  assert.equal(wire.length, 3);
});
