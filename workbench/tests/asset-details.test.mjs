import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createApp } from "../server/app.mjs";

async function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "asset-details-"));
  fs.mkdirSync(path.join(root, ".agents"));
  fs.writeFileSync(path.join(root, ".agents/skill_registry.md"), "# Isolated asset details test\n");
  const { app, stores, projects } = await createApp({ dataDir: path.join(root, ".app"), initialRoot: root, runWorker: false });
  t.after(async () => { await app.close(); fs.rmSync(root, { recursive: true, force: true }); });
  const store = stores.get(projects[0].project_id), base = `/api/projects/${projects[0].project_id}`;
  const asset = store.ensureAsset({ asset_name: "@char_test", kind: "image", prompt: "" });
  const take = (id, name = asset.asset_name) => store.put("take", id, { take_id: id, asset_name: name, media: { kind: "image", width: 100, height: 100 }, technical_status: "checked", visual_status: "unreviewed", prompt: "原始生成提示词", source: { type: "test" } });
  const patch = (payload) => app.inject({ method: "PATCH", url: `${base}/assets/${encodeURIComponent(asset.asset_name)}`, headers: { "x-workbench": "1" }, payload });
  const current = async () => {
    const response = await app.inject(`${base}`);
    assert.equal(response.statusCode, 200, response.body);
    return response.json().assets.find((a) => a.asset_name === asset.asset_name);
  };
  return { app, store, base, asset, take, patch, current };
}

test("existing inventory gets pending/draft states without accepting imports or inventing platform tags", async (t) => {
  const f = await fixture(t);
  assert.equal(f.asset.tag, "");
  assert.equal((await f.current()).review_status, "pending");
  f.take("v1");
  assert.equal((await f.current()).review_status, "draft");
  assert.equal((await f.current()).selected_take_id, null);
  assert.equal(f.store.get("take", "v1").visual_status, "unreviewed");
  assert.equal(f.store.get("asset", f.asset.asset_name).review_status, undefined);
});

test("prompt and real Tag edits round-trip exactly and do not rewrite source prompts or select media", async (t) => {
  const f = await fixture(t);
  f.take("v1");
  const prompt = "  提示词\n@REAL-Tag 保留原样\n", tag = "@REAL-Tag";
  const response = await f.patch({ prompt, tag, expected_revision: 0 });
  assert.equal(response.statusCode, 200, response.body);
  const current = await f.current();
  assert.equal(current.prompt, prompt);
  assert.equal(current.tag, tag);
  assert.equal(current.tag_source, "manual");
  assert.equal(current.metadata_revision, 1);
  assert.equal(current.selected_take_id, null);
  assert.equal(f.store.get("take", "v1").prompt, "原始生成提示词");
  const noClobber = await f.patch({ tag: "@NEW", expected_revision: 1 });
  assert.equal(noClobber.json().prompt, prompt);
  assert.equal((await f.patch({ prompt: "", expected_revision: 2 })).json().prompt, "");
});

test("acceptance selects only a checked take from this asset; new versions preserve the accepted default", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.patch({ review_status: "accepted" })).statusCode, 400);
  f.take("wrong", "@char_someone_else");
  assert.equal((await f.patch({ review_status: "accepted", selected_take_id: "wrong" })).statusCode, 400);
  assert.equal(f.store.get("take", "wrong").visual_status, "unreviewed");
  f.take("v1");
  const accepted = await f.patch({ review_status: "accepted", selected_take_id: "v1", expected_revision: 0 });
  assert.equal(accepted.statusCode, 200, accepted.body);
  assert.equal(accepted.json().review_status, "accepted");
  assert.equal(accepted.json().selected_take_id, "v1");
  assert.equal(accepted.json().locked, true);
  assert.equal(f.store.get("take", "v1").visual_status, "passed");
  f.store.ensureAsset({ asset_name: f.asset.asset_name, kind: "image", prompt: "新版本 Prompt" }, { existing: true });
  f.take("v2");
  assert.equal((await f.current()).selected_take_id, "v1");
  assert.equal((await f.current()).review_status, "accepted");
  const draft = await f.patch({ review_status: "draft", expected_revision: 1 });
  assert.equal(draft.json().selected_take_id, null);
  assert.equal(draft.json().locked, false);
  assert.equal(f.store.list("take").length, 3);
  assert.equal((await f.patch({ review_status: "pending", expected_revision: 2 })).json().review_status, "pending");
});

test("stale edits and invalid payloads fail atomically; the existing adopt endpoint updates the same review state", async (t) => {
  const f = await fixture(t);
  f.take("v1");
  const adopted = await f.app.inject({ method: "POST", url: `${f.base}/takes/v1/adopt`, headers: { "x-workbench": "1" }, payload: { visual_status: "passed", expected_revision: 0 } });
  assert.equal(adopted.statusCode, 200, adopted.body);
  assert.equal(adopted.json().metadata_revision, 1);
  assert.equal(adopted.json().review_status, "accepted");
  assert.equal((await f.patch({ prompt: "过时修改", review_status: "pending", expected_revision: 0 })).statusCode, 409);
  assert.equal((await f.current()).selected_take_id, "v1");
  assert.equal((await f.current()).prompt, "");
  assert.equal((await f.patch({ tag: "cannot write", review_status: "unknown", expected_revision: 1 })).statusCode, 400);
  assert.equal((await f.current()).tag, "");
  assert.equal((await f.current()).metadata_revision, 1);
  assert.equal((await f.patch({ prompt: 123 })).statusCode, 400);
});
