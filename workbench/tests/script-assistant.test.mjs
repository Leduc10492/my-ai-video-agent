import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ScriptAssistant } from "../server/script-assistant.mjs";
import { Store } from "../server/store.mjs";
import { createApp } from "../server/app.mjs";

class Client extends EventEmitter {
  calls = [];
  async request(method, params) {
    this.calls.push({ method, params });
    if (method === "thread/start") return { thread: { id: "thread" } };
    if (method === "turn/start") return { turn: { id: "turn" } };
    return {};
  }
  complete(result) {
    this.emit("notification", { method: "item/completed", params: { threadId: "thread", turnId: "turn", item: { type: "agentMessage", text: JSON.stringify(result) } } });
    this.emit("notification", { method: "turn/completed", params: { threadId: "thread", turn: { id: "turn", status: "completed" } } });
  }
  close() {}
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "screenplay-chat-"));
  const store = new Store(root), client = new Client(), assistant = new ScriptAssistant(client);
  t.after(() => { store.close(); fs.rmSync(root, { recursive: true, force: true }); });
  return { root, store, client, assistant };
}
const input = () => ({ request_key: "unique-request", instruction: "只改这一句", scope: ["d"], document: { version: 1, blocks: [{ id: "c", type: "character", text: "老周" }, { id: "d", type: "dialogue", text: "尚未保存的手改" }] } });
const result = { summary: "修改对白", edits: [{ id: "d", replacement: [{ type: "dialogue", text: "先说规矩。" }] }] };

test("Codex receives the unsaved snapshot; results stay proposals and repeated request keys are idempotent", async t => {
  const { store, client, assistant, root } = fixture(t), payload = input();
  const started = await assistant.start(store, payload);
  assert.equal(started.status, "running");
  assert.equal(client.calls[0].params.sandbox, "read-only");
  const sent = JSON.parse(client.calls[1].params.input[0].text);
  assert.deepEqual(sent.screenplay, payload.document);
  assert.deepEqual(sent.scope.allowed_block_ids, ["d"]);
  assert.equal((await assistant.start(store, payload)).id, started.id);
  assert.equal(client.calls.length, 2);
  await assert.rejects(() => assistant.start(store, { ...payload, request_key: "new-request" }), /仍在进行/);
  client.complete(result);
  assert.equal(store.get("script_edit", started.id).status, "completed");
  assert.equal(assistant.list(store)[0].before.d, "尚未保存的手改");
  assert.equal(fs.existsSync(path.join(root, "deliverables/1_story")), false);
});

test("out of scope output is rejected; cancellation and disconnect preserve the draft", async t => {
  const { store, client, assistant } = fixture(t);
  let started = await assistant.start(store, input());
  client.complete({ summary: "越界", edits: [{ id: "c", replacement: [{ type: "character", text: "别人" }] }] });
  assert.equal(store.get("script_edit", started.id).status, "failed");
  assert.match(store.get("script_edit", started.id).error, /超出/);
  started = await assistant.start(store, { ...input(), request_key: "cancel-request" });
  await assistant.cancel(store, started.id);
  client.complete(result);
  assert.equal(store.get("script_edit", started.id).status, "cancelled");
  started = await assistant.start(store, { ...input(), request_key: "lost-request" });
  client.emit("disconnected");
  assert.equal(store.get("script_edit", started.id).status, "failed");
  assert.deepEqual(store.get("script_edit", started.id).baseline, input().document);
});

test("script editing API is local, validates document structure and handles service restart", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "screenplay-api-")), client = new Client();
  const { app, projects, stores } = await createApp({ dataDir: path.join(root, ".app"), initialRoot: root, runWorker: false, codexClient: client });
  t.after(async () => { await app.close(); fs.rmSync(root, { recursive: true, force: true }); });
  const base = `/api/projects/${projects[0].project_id}/script/edits`;
  const request = { method: "POST", url: base, payload: input() };
  assert.equal((await app.inject(request)).statusCode, 403);
  assert.equal((await app.inject({ ...request, headers: { "x-workbench": "1", origin: "https://unrelated.example" } })).statusCode, 403);
  const invalid = await app.inject({ ...request, headers: { "x-workbench": "1" }, payload: { ...input(), document: {} } });
  assert.equal(invalid.statusCode, 400);
  const started = (await app.inject({ ...request, headers: { "x-workbench": "1" } })).json();
  assert.equal(started.status, "running");
  const store = stores.get(projects[0].project_id);
  new ScriptAssistant(client).recover(store);
  assert.equal(store.get("script_edit", started.id).status, "failed");
  assert.match(store.get("script_edit", started.id).error, /重启/);
});

test("cancelling while the thread or turn is starting cannot restart a cancelled edit", async t => {
  const { store, client, assistant } = fixture(t);
  let release;
  const request = client.request.bind(client);
  client.request = (method, params) => method === "thread/start" ? new Promise(resolve => { release = resolve; }) : request(method, params);
  let pending = assistant.start(store, input());
  await assistant.cancel(store, store.list("script_edit")[0].id);
  release({ thread: { id: "thread" } });
  assert.equal((await pending).status, "cancelled");
  assert.equal(client.calls.length, 0);
  client.request = (method, params) => method === "turn/start" ? new Promise(resolve => { release = resolve; }) : request(method, params);
  pending = assistant.start(store, { ...input(), request_key: "delayed-turn" });
  await Promise.resolve();
  const entry = store.list("script_edit").find(e => e.request_key === "delayed-turn");
  await assistant.cancel(store, entry.id);
  release({ turn: { id: "turn" } });
  assert.equal((await pending).status, "cancelled");
  assert.equal(client.calls.at(-1).method, "turn/interrupt");
});
