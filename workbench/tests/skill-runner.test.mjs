import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import { createApp } from "../server/app.mjs";
import { startSkill } from "../server/codex.mjs";
import { archiveSkillThread, skillThreadProject, skillThreadName } from "../server/skill-threads.mjs";
import {
  saveScript,
  scriptStatus,
  importStoryboard,
} from "../server/workflow.mjs";
import { atomic, sha } from "../server/files.mjs";
import {
  makePacket,
  materializePlan,
  sourceDialogue,
  sourceScenes,
} from "../server/skill-packets.mjs";

class Client extends EventEmitter {
  requests = new Map();
  projectThreads = new Map();
  calls = [];
  history = new Map();
  archived = new Set();
  sequence = 0;
  async request(method, params) {
    this.calls.push({ method, params });
    if (method === "project/list") return { data: this.projects || [] };
    if (method === "thread/start")
      return {
        model: "test-model",
        thread: { id: `thread-${++this.sequence}` },
      };
    if (method === "turn/start")
      return { turn: { id: `turn-${this.calls.length}` } };
    if (method === "thread/read")
      return { thread: { turns: this.history.get(params.threadId) || [] } };
    if (method === "thread/archive") this.archived.add(params.threadId);
    if (method === "thread/unarchive") this.archived.delete(params.threadId);
    if (method === "thread/resume" && this.archived.has(params.threadId))
      throw new Error(`session ${params.threadId} is archived. Run codex unarchive first.`);
    return {};
  }
  complete(job, value, status = "completed") {
    const text = JSON.stringify(value);
    this.history.set(job.thread_id, [
      { id: job.turn_id, status, items: [{ type: "agentMessage", text }] },
    ]);
    this.emit("notification", {
      method: "item/completed",
      params: {
        threadId: job.thread_id,
        turnId: job.turn_id,
        item: { type: "agentMessage", text },
      },
    });
    this.emit("notification", {
      method: "turn/completed",
      params: { threadId: job.thread_id, turn: { id: job.turn_id, status } },
    });
  }
  close() {}
}
const body =
  "# 人物\n阿甲。\n\n" +
  [1, 2, 3]
    .map(
      (n) =>
        `### 第 ${n} 场 · 房间${n} · 日\n阿甲望向门口。\n**阿甲**：\n> 第${n}句，一字不改！\n`,
    )
    .join("\n") +
  "\n## 分镜表\n" +
  [1, 2, 3].map((n) => `| ${n} | ${n} | 5s | 中 | 看门 | 对白 |`).join("\n");
async function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-runner-")),
    client = new Client();
  for (const name of ["guide", "shot"])
    atomic(path.join(root, `.agents/skills/${name}/SKILL.md`), `# ${name}`);
  atomic(
    path.join(root, ".agents/skill_registry.md"),
    "| `guides.primary` | `guide` |\n| `shotlist.breakdown` | `shot` |\n",
  );
  saveScript(root, { body });
  const ref = scriptStatus(root).state.working_script;
  atomic(
    path.join(root, "deliverables/1_story/01_audit_report_v1.md"),
    "# Audit\n## P1\n空间未确认。\n",
  );
  const result = await createApp({
    dataDir: path.join(root, ".app"),
    initialRoot: root,
    codexClient: client,
    runWorker: false,
  });
  const store = result.stores.get(result.projects[0].project_id),
    base = `/api/projects/${result.projects[0].project_id}`;
  store.ensureAsset({
    asset_name: "@char_Exact-A",
    kind: "image",
    category: "character",
    tag: "@Real-Tag_X",
    scenes: ["scene-001", "scene-002", "scene-003"],
    description: "原始人物",
  });
  t.after(async () => {
    await result.app.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const post = (url, payload = {}) =>
    result.app.inject({
      method: "POST",
      url: base + url,
      headers: { "x-workbench": "1" },
      payload,
    });
  return { ...result, root, store, base, client, post, ref };
}
const input = (ref, scene = "scene-001", key = "one-scene-test") => ({
  stage: "storyboard",
  scene,
  mode: "planning",
  expected_sha256: ref.sha256,
  instruction: "保留原文，设计分镜。",
  request_key: key,
});
function plan(n = 1) {
  return {
    summary: `第${n}场`,
    synopsis: "望门",
    emotion: "等待",
    blocking: "人物在南侧，朝北门；摄影机位于西侧，保持视线轴。",
    continuity_notes: ["空间为待审阅候选"],
    shots: [
      {
        id: "new-1",
        title: "望门",
        description: "阿甲停步望向门口。",
        camera: "平视中景，机位在人物西侧。",
        sound: "室内底噪。",
        duration_seconds: 5,
        source_shot_numbers: [n],
        dialogue: [
          {
            speaker_cue: "阿甲：",
            text: `第${n}句，一字不改！`,
            mode: "lip_sync",
            addressee: "",
          },
        ],
        references: ["@char_Exact-A"],
        risks: ["门的位置待确认"],
      },
    ],
    envelopes: [
      {
        id: "new-1",
        source_rows: ["new-1"],
        grouping_reason: "同一动作和视线",
      },
    ],
  };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("typed worker receives one Scene and one schema, uses explicit effort, and deduplicates starting work", async (t) => {
  const { client, store, ref } = await fixture(t);
  const job = await startSkill(client, store, input(ref));
  const sent = client.calls.find((c) => c.method === "turn/start").params;
  const packet = JSON.parse(sent.input.at(-1).text);
  assert.equal(sent.effort, "medium");
  assert.ok(sent.outputSchema.properties.shots);
  assert.equal(sent.outputSchema.properties.artifacts, undefined);
  assert.ok(packet.source.includes("第1句"));
  assert.ok(!packet.source.includes("第2句"));
  assert.deepEqual(
    packet.source_rows.map((s) => s.number),
    [1],
  );
  assert.equal(packet.assets[0].tag, "@Real-Tag_X");
  assert.ok(!JSON.stringify(packet).includes("Scene 081"));
  assert.equal(
    (await startSkill(client, store, input(ref))).job_id,
    job.job_id,
  );
  assert.equal(client.calls.filter(c => c.method === "thread/start").length, 1);
  assert.equal(client.calls.filter(c => c.method === "turn/start").length, 1);
});

test("background tasks retain the exact cwd and bind to a saved ancestor with a readable title", async (t) => {
  const { client, store, root, ref } = await fixture(t);
  store.projectName = "不在剧本上 · 分镜试跑";
  client.projects = [{ id: "saved-parent", roots: [{ path: path.dirname(root) }] }];
  const job = await startSkill(client, store, input(ref));
  const start = client.calls.find(c => c.method === "thread/start").params;
  assert.equal(start.cwd, store.root);
  assert.equal(start.projectId, "saved-parent");
  assert.equal(start.ephemeral, false, "restart recovery requires durable history");
  assert.equal(job.thread_title, "工作台 · 不在剧本上 · 分镜试跑 · 分镜设计 · scene-001");
  assert.equal(client.calls.find(c => c.method === "thread/name/set").params.name, job.thread_title);
  assert.ok(client.calls.findIndex(c => c.method === "thread/name/set") < client.calls.findIndex(c => c.method === "turn/start"));
  assert.equal(client.archived.size, 0, "an active task must remain resumable");
});

test("project matching follows pagination, picks the closest ancestor and rejects sibling prefixes", async () => {
  const pages = [
    { data: [{ id: "parent", roots: [{ path: "/repo" }] }], nextCursor: "next" },
    { data: [
      { id: "sibling", roots: [{ path: "/repo/work" }] },
      { id: "closest", roots: [{ path: "/repo/workbench" }] },
    ] },
  ];
  const calls = [];
  assert.equal(await skillThreadProject({ request: async (_, p) => { calls.push(p); return pages.shift(); } }, "/repo/workbench/project"), "closest");
  assert.equal(calls[1].cursor, "next");
  assert.equal(await skillThreadProject({ request: async () => ({ data: [{ id: "sibling", roots: [{ path: "/repo/work" }] }] }) }, "/repo/workbench"), undefined);
  assert.equal(skillThreadName({ root: "/tmp/project" }, { stage: "audit" }), "工作台 · 测试项目 · 剧本审核");
});

test("a missing active rollout is accepted only when the exact owned thread is listed as archived", async () => {
  const client = { request: async (method, params) => {
    if (method === "thread/archive") throw new Error("no rollout found for thread id known");
    assert.ok(params.sourceKinds.includes("vscode"), "legacy desktop-origin workers must be found");
    return { data: [{ id: "known" }] };
  } };
  await archiveSkillThread(client, "/repo", "known");
  await assert.rejects(archiveSkillThread(client, "/repo", "missing"), /no rollout found/);
});

test("completed results survive archive and completed recovery does not reopen or rerun a model turn", async (t) => {
  const { client, store, ref, skillRunner } = await fixture(t);
  const job = await startSkill(client, store, input(ref));
  client.complete(job, plan());
  await settle();
  const done = store.get("job", job.job_id);
  assert.equal(done.status, "completed");
  assert.ok(done.thread_archived_at);
  assert.equal(client.archived.has(job.thread_id), true);
  const saved = done.raw_result;
  store.updateJob(job.job_id, { status: "interrupted", result: null });
  const before = client.calls.length;
  const recovered = await skillRunner.resume(store, job.job_id);
  assert.deepEqual(recovered.raw_result, saved);
  assert.ok(recovered.result_sha256);
  assert.equal(recovered.status, "completed");
  assert.ok(!client.calls.slice(before).some(c => ["thread/resume", "thread/unarchive", "turn/start"].includes(c.method)));
});

test("retry waits for archive and unarchives the same failed thread without creating a replacement", async (t) => {
  const { client, store, ref, skillRunner } = await fixture(t);
  const job = await startSkill(client, store, input(ref));
  const request = client.request.bind(client);
  let release;
  client.request = async (method, params) => {
    if (method === "thread/archive") await new Promise(resolve => { release = resolve; });
    return request(method, params);
  };
  client.complete(job, {}, "failed");
  await settle();
  const retry = skillRunner.resume(store, job.job_id);
  await settle();
  assert.equal(client.calls.filter(c => c.method === "turn/start").length, 1);
  release();
  await retry;
  assert.equal(client.calls.filter(c => c.method === "thread/start").length, 1);
  assert.equal(client.calls.filter(c => c.method === "turn/start").length, 2);
  assert.equal(client.archived.has(job.thread_id), false);
  assert.equal(store.get("job", job.job_id).thread_archived_at, null);
});

test("archive failure keeps a successful result and is retried on recovery without inference", async (t) => {
  const { client, store, ref, skillRunner } = await fixture(t);
  const job = await startSkill(client, store, input(ref));
  const request = client.request.bind(client);
  client.request = async (method, params) => {
    if (method === "thread/archive") throw new Error("archive offline");
    return request(method, params);
  };
  client.complete(job, plan());
  await settle();
  const done = store.get("job", job.job_id);
  assert.equal(done.status, "completed");
  assert.ok(done.result_sha256);
  assert.equal(done.thread_archive_error, "archive offline");
  client.request = request;
  skillRunner.recover(store);
  await settle();
  assert.ok(store.get("job", job.job_id).thread_archived_at);
  assert.equal(client.calls.filter(c => c.method === "turn/start").length, 1);
});

test("unknown submissions still running are not archived; rejected starts are cleaned up", async (t) => {
  const { client, store, ref, skillRunner } = await fixture(t);
  const job = await startSkill(client, store, input(ref));
  store.updateJob(job.job_id, { status: "needs_attention" });
  client.history.set(job.thread_id, [{ id: job.turn_id, status: "inProgress", items: [] }]);
  await skillRunner.archive(store, job.job_id);
  assert.equal(client.archived.has(job.thread_id), false);
  const request = client.request.bind(client);
  client.request = async (method, params) => {
    if (method === "thread/name/set") throw new Error("name rejected");
    return request(method, params);
  };
  const failed = await startSkill(client, store, input(ref, "scene-002", "failed-start-request"));
  await settle();
  assert.equal(failed.status, "needs_attention");
  assert.equal(client.archived.has(failed.thread_id), true);
  assert.equal(client.calls.filter(c => c.method === "turn/start").length, 1);
});

test("native design is rendered once, applied automatically, preserves other Scenes/takes and rejects stale edits", async (t) => {
  const { client, store, ref, post, root } = await fixture(t);
  const old = {
    shots: [
      {
        id: "other-R1",
        scene: "scene-002",
        title: "手改",
        description: "保留我",
      },
    ],
    envelopes: [
      {
        id: "P009",
        scene: "scene-002",
        asset_name: "scene-002_Custom-X",
        duration_seconds: 5,
        source_rows: ["other-R1"],
        prompt: "已确认 Prompt",
      },
    ],
    source_script: { path: ref.path, sha256: ref.sha256 },
    custom: "保留扩展",
  };
  importStoryboard(store, old);
  const asset = store.ensureAsset({
    asset_name: "scene-002_Custom-X",
    kind: "video",
    tag: "",
    selected_take_id: null,
  });
  store.put("asset", asset.asset_name, {
    ...asset,
    selected_take_id: "take-original",
  });
  const job = await startSkill(client, store, input(ref));
  client.complete(job, plan());
  const done = store.get("job", job.job_id);
  assert.equal(done.status, "completed");
  assert.equal(done.result.artifacts.length, 2);
  assert.match(done.result.artifacts[1].content, /Phase 3 - 范围与空间调度/);
  assert.equal(
    (await post(`/skills/${job.job_id}/apply`, { sha256: done.result_sha256 }))
      .statusCode,
    200,
  );
  const board = store.meta("storyboard");
  assert.deepEqual(
    board.envelopes.map((e) => e.scene),
    ["scene-001", "scene-002"],
  );
  assert.deepEqual(board.envelopes[1], old.envelopes[0]);
  assert.equal(board.custom, "保留扩展");
  assert.equal(
    store.get("asset", asset.asset_name).selected_take_id,
    "take-original",
  );
  assert.ok(fs.existsSync(path.join(root, done.result.artifacts[0].path)));
  assert.equal(
    (await post(`/skills/${job.job_id}/apply`, { sha256: done.result_sha256 }))
      .statusCode,
    200,
  );
  const second = await startSkill(
    client,
    store,
    input(ref, "scene-001", "edit-conflict-key"),
  );
  const revised = plan();
  revised.shots[0].id = board.shots[0].id;
  revised.envelopes[0].id = board.envelopes[0].id;
  revised.envelopes[0].source_rows = [board.shots[0].id];
  client.complete(second, revised);
  importStoryboard(store, {
    ...board,
    shots: board.shots.map((s, i) =>
      i ? s : { ...s, description: "用户新手改" },
    ),
    expected_sha256: board.sha256,
  });
  const response = await post(`/skills/${second.job_id}/apply`, {
    sha256: store.get("job", second.job_id).result_sha256,
  });
  assert.equal(response.statusCode, 409);
  assert.match(response.json().error, /手动编辑/);
  assert.equal(store.meta("storyboard").shots[0].description, "用户新手改");
});

test("dropped/rewritten dialogue, missing source coverage, unknown references and duplicate mapping cannot complete", async (t) => {
  const { client, store, ref } = await fixture(t);
  const mutations = [
    (p) => (p.shots[0].dialogue[0].text = "改写"),
    (p) => (p.shots[0].source_shot_numbers = []),
    (p) => (p.shots[0].references = ["@guessed"]),
    (p) => p.envelopes.push({ ...p.envelopes[0], id: "new-2" }),
  ];
  for (const [i, mutate] of mutations.entries()) {
    const job = await startSkill(
        client,
        store,
        input(ref, "scene-001", `invalid-${i}-request`),
      ),
      p = plan();
    mutate(p);
    client.complete(job, p);
    assert.equal(store.get("job", job.job_id).status, "needs_attention");
    assert.equal(store.get("job", job.job_id).result, undefined);
  }
});

test("batch respects concurrency, starts next Scene on completion, applies together in source order and deduplicates", async (t) => {
  const { client, store, ref, post, skillRunner } = await fixture(t);
  const payload = {
    ...input(ref),
    scenes: ["scene-001", "scene-002", "scene-003"],
    concurrency: 2,
    request_key: "three-scene-batch",
  };
  const started = (await post("/skill-batches", payload)).json();
  await settle();
  assert.equal(store.list("job").length, 2);
  assert.equal(
    (await post("/skill-batches", payload)).json().batch_id,
    started.batch_id,
  );
  let jobs = store.list("job");
  client.complete(jobs[1], plan(2));
  await settle();
  assert.equal(store.list("job").length, 3);
  client.complete(jobs[0], plan(1));
  jobs = store.list("job");
  client.complete(jobs[2], plan(3));
  await settle();
  const batch = store.get("skill_batch", started.batch_id);
  assert.equal(batch.status, "awaiting_review");
  const ids = jobs.map(
    (j) => store.get("job", j.job_id).result.structured.envelopes[0].id,
  );
  assert.equal(new Set(ids).size, 3);
  const hash = skillRunner.batchHash(store, batch.batch_id);
  assert.equal(
    (await post(`/skill-batches/${batch.batch_id}/apply`, { sha256: "stale" }))
      .statusCode,
    409,
  );
  assert.equal(
    (await post(`/skill-batches/${batch.batch_id}/apply`, { sha256: hash }))
      .statusCode,
    200,
  );
  assert.deepEqual(
    store.meta("storyboard").envelopes.map((e) => e.scene),
    ["scene-001", "scene-002", "scene-003"],
  );
  assert.equal(store.get("skill_batch", batch.batch_id).status, "applied");
});

test("restart recovery reads completed original turn, without issuing a second generation", async (t) => {
  const { client, store, ref, post, skillRunner } = await fixture(t);
  const job = await startSkill(client, store, input(ref));
  client.history.set(job.thread_id, [
    {
      id: job.turn_id,
      status: "completed",
      items: [{ type: "agentMessage", text: JSON.stringify(plan()) }],
    },
  ]);
  skillRunner.disconnected();
  const before = client.calls.filter((c) => c.method === "turn/start").length;
  const resumed = await post(`/skills/${job.job_id}/continue`, {
    instruction: "恢复",
  });
  assert.equal(resumed.statusCode, 200);
  assert.equal(resumed.json().status, "completed");
  assert.equal(
    client.calls.filter((c) => c.method === "turn/start").length,
    before,
  );
});

test("batch restart exposes recovery even with queued Scenes and does not repeat a completed model turn", async (t) => {
  const { client, store, ref, post, skillRunner } = await fixture(t);
  const batch = (
    await post("/skill-batches", {
      ...input(ref),
      scenes: ["scene-001", "scene-002", "scene-003"],
      concurrency: 1,
      request_key: "restart-queued-batch",
    })
  ).json();
  await settle();
  const first = store.list("job")[0];
  client.history.set(first.thread_id, [
    {
      id: first.turn_id,
      status: "completed",
      items: [{ type: "agentMessage", text: JSON.stringify(plan(1)) }],
    },
  ]);
  skillRunner.disconnected();
  skillRunner.recover(store);
  assert.equal(
    store.get("skill_batch", batch.batch_id).status,
    "needs_attention",
  );
  await skillRunner.pump(store, batch.batch_id);
  assert.equal(store.list("job").length, 1);
  await post(`/skill-batches/${batch.batch_id}/continue`);
  await settle();
  await settle();
  assert.equal(store.get("job", first.job_id).status, "completed");
  const second = store.list("job")[1];
  assert.equal(second.scene, "scene-002");
  assert.equal(client.calls.filter((c) => c.method === "turn/start").length, 2);
  client.complete(second, {}, "failed");
  await settle();
  const third = store.list("job")[2];
  assert.equal(third.scene, "scene-003");
  client.complete(third, plan(3));
  await settle();
  assert.equal(
    store.get("skill_batch", batch.batch_id).status,
    "needs_attention",
  );
  await post(`/skill-batches/${batch.batch_id}/continue`);
  await settle();
  const retry = store.get("job", second.job_id);
  assert.equal(retry.thread_id, second.thread_id);
  assert.equal(store.list("job").length, 3);
  client.complete(retry, plan(2));
  await settle();
  assert.equal(
    store.get("skill_batch", batch.batch_id).status,
    "awaiting_review",
  );
});

test("source dialogue excludes phone messages and prop cards, and keeps unbold broadcast cues", async (t) => {
  const { root } = await fixture(t);
  const screenplay = fs.readFileSync(
    new URL("./fixtures/screenplay.md", import.meta.url),
    "utf8",
  );
  saveScript(root, {
    body: screenplay,
    expected_sha256: scriptStatus(root).state.working_script.sha256,
  });
  const ref = scriptStatus(root).state.working_script;
  const parsed = sourceScenes(root, ref);
  const lines = parsed.scenes.map((s) =>
    sourceDialogue(parsed.body.slice(s.startOffset, s.endOffset)),
  );
  assert.deepEqual(
    lines.map((l) => l.length),
    [1, 5, 4, 3, 6, 6, 1],
  );
  assert.ok(
    !lines
      .flat()
      .some((l) => /房东：|星河银行 · 第|谢谢你没有倒下/.test(l.text)),
  );
  assert.equal(lines[3][0].text, "好！曜光进场！林默，三、二、一，倒！");
});

test("selected legacy style is included by exact path and hash, and a new script blocks applying old candidates", async (t) => {
  const { client, store, ref, root, post } = await fixture(t);
  const file = "deliverables/2_assets/02_style_guide_v2.md",
    content = "# 已选风格\n冷灰自然光，保留锁定风格。\n";
  atomic(path.join(root, file), content);
  store.put("job", "old-style", {
    kind: "skill",
    stage: "assets",
    job_id: "old-style",
    applied_at: new Date().toISOString(),
    result: { artifacts: [{ path: file, content }] },
  });
  const job = await startSkill(client, store, input(ref));
  assert.equal(job.packet.style.reference.path, file);
  assert.equal(job.packet.style.reference.sha256, sha(content));
  assert.ok(job.packet.style.markdown.includes("冷灰自然光"));
  client.complete(job, plan());
  const done = store.get("job", job.job_id);
  saveScript(root, {
    body: body.replace("阿甲望向门口。", "阿甲走向窗边。"),
    expected_sha256: ref.sha256,
  });
  const stale = await post(`/skills/${job.job_id}/apply`, {
    sha256: done.result_sha256,
  });
  assert.equal(stale.statusCode, 409);
  assert.match(stale.json().error, /剧本版本已改变/);
  assert.equal(store.meta("storyboard"), null);
});

test("stream writes are coalesced, timing and tokens persist, and stale turn events are ignored", async (t) => {
  const { client, store, ref } = await fixture(t);
  const job = await startSkill(client, store, input(ref));
  let writes = 0;
  const update = store.updateJob.bind(store);
  store.updateJob = (...args) => {
    writes++;
    return update(...args);
  };
  client.emit("notification", {
    method: "turn/started",
    params: { threadId: job.thread_id, turn: { id: job.turn_id } },
  });
  for (let i = 0; i < 100; i++)
    client.emit("notification", {
      method: "item/agentMessage/delta",
      params: { threadId: job.thread_id, turnId: job.turn_id, delta: "x" },
    });
  client.emit("notification", {
    method: "thread/tokenUsage/updated",
    params: {
      threadId: job.thread_id,
      turnId: job.turn_id,
      tokenUsage: { last: { inputTokens: 123 }, total: { outputTokens: 456 } },
    },
  });
  assert.equal(writes, 1);
  client.complete(job, plan());
  const done = store.get("job", job.job_id);
  assert.ok(done.metrics.first_output_at);
  assert.ok(done.metrics.completed_at);
  assert.equal(done.metrics.token_usage.total.outputTokens, 456);
  assert.ok(writes < 6);
  client.emit("notification", {
    method: "item/agentMessage/delta",
    params: { threadId: job.thread_id, turnId: "old-turn", delta: "stale" },
  });
  assert.equal(store.get("job", job.job_id).output, done.output);
});

test("asset apply preserves real tag, selected take and provenance and imports new names without tag inference", async (t) => {
  const { client, store, ref, post } = await fixture(t),
    old = store.get("asset", "@char_Exact-A");
  store.put("asset", old.asset_name, {
    ...old,
    selected_take_id: "take-1",
    reference_approval: "approved",
  });
  const job = await startSkill(client, store, {
    ...input(ref),
    stage: "assets",
    request_key: "asset-native-result",
  });
  const value = {
    summary: "资产",
    continuity_rules: [],
    open_gaps: [],
    style: {
      thesis: "真实",
      palette: "黑白",
      lighting: "日光",
      texture: "胶片",
      composition: "稳定",
      avoid: "无新增",
    },
    assets: [
      {
        asset_name: old.asset_name,
        display_name: "阿甲",
        kind: "image",
        category: "character",
        scenes: ["scene-001"],
        description: "原始人物",
        tag: old.tag,
        source_quote: "阿甲。",
        state_variants: [],
        continuity_notes: [],
      },
      {
        asset_name: "@prop_New-X",
        display_name: "门",
        kind: "image",
        category: "prop",
        scenes: ["scene-001"],
        description: "门",
        tag: "",
        source_quote: "门口",
        state_variants: [],
        continuity_notes: [],
      },
    ],
  };
  client.complete(job, value);
  const done = store.get("job", job.job_id);
  assert.equal(done.status, "completed");
  assert.equal(
    (await post(`/skills/${job.job_id}/apply`, { sha256: done.result_sha256 }))
      .statusCode,
    200,
  );
  assert.equal(store.get("asset", old.asset_name).selected_take_id, "take-1");
  assert.equal(store.get("asset", old.asset_name).tag, "@Real-Tag_X");
  assert.equal(
    store.get("asset", old.asset_name).reference_approval,
    "approved",
  );
  assert.equal(store.get("asset", "@prop_New-X").tag, "");
});
