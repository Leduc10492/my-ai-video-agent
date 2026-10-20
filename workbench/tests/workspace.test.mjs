import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { Workspace, platformRoot, projectContext } from "../server/workspace.mjs";
import { migrateWorkspace } from "../server/workspace-migration.mjs";
import { createApp } from "../server/app.mjs";
import { Store } from "../server/store.mjs";
import { atomic, sha } from "../server/files.mjs";

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "film-workspace-"))),
    dataDir = path.join(root, ".workbench");
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { root, dataDir };
}
class Client extends EventEmitter {
  requests = new Map();
  projectThreads = new Map();
  calls = [];
  async request(method, params) {
    this.calls.push({ method, params });
    if (method === "project/list") return { data: [] };
    if (method === "thread/start") return { thread: { id: `thread-${this.calls.length}` } };
    if (method === "turn/start") return { turn: { id: "turn-one" } };
    return {};
  }
  close() {}
}

test("a fresh workspace starts empty; named projects own independent rules and portable identities", t => {
  const { root, dataDir } = fixture(t), workspace = new Workspace({ root, dataDir });
  assert.equal(workspace.projects.length, 0);
  const a = workspace.add({ name: "不在剧本上", mode: "create" });
  const b = workspace.add({ name: "另一个项目", mode: "create" });
  assert.equal(a.root, path.join(root, "projects/不在剧本上"));
  assert.notEqual(a.project_id, b.project_id);
  const manifest = JSON.parse(fs.readFileSync(path.join(a.root, "project.json")));
  assert.equal(manifest.project_id, a.project_id);
  assert.equal(manifest.root, undefined);
  assert.match(fs.readFileSync(path.join(a.root, "AGENTS.md"), "utf8"), /每个创作阶段开始前重新读取/);
  assert.doesNotMatch(fs.readFileSync(path.join(a.root, "AGENTS.md"), "utf8"), /平台根目录的历史/);
  const aRegistry = path.join(a.root, ".agents/skill_registry.md");
  fs.appendFileSync(aRegistry, "\n项目 A 的独立决定\n");
  assert.doesNotMatch(fs.readFileSync(path.join(b.root, ".agents/skill_registry.md"), "utf8"), /独立决定/);
  assert.throws(() => workspace.add({ name: "不在剧本上" }), /已存在/);
  assert.throws(() => workspace.add({ name: "../escape" }), /路径/);
  assert.throws(() => workspace.add({ mode: "open", root }), /平台工作区/);
  assert.throws(() => workspace.add({ mode: "create", name: "nested", root: path.join(a.root, "nested") }), /另一个视频项目/);
  assert.equal(workspace.add({ mode: "open", root: a.root }).project_id, a.project_id);
});

test("external project folders retain identity, duplicates are rejected, and selection survives restart", t => {
  const { root, dataDir } = fixture(t), workspace = new Workspace({ root, dataDir });
  const a = workspace.add({ mode: "create", name: "外部项目", root: path.join(root, "another-disk/作品") });
  workspace.select(a.project_id);
  const reopened = new Workspace({ root, dataDir });
  assert.equal(reopened.snapshot().active_project_id, a.project_id);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dataDir, "active-project.json"))).root, a.root);
  const clone = path.join(root, "clone");
  fs.cpSync(a.root, clone, { recursive: true });
  assert.throws(() => reopened.add({ mode: "open", root: clone }), /同一个项目/);
  assert.equal(reopened.projects.length, 1);
  assert.equal(fs.readFileSync(path.join(clone, "project.json"), "utf8"), fs.readFileSync(path.join(a.root, "project.json"), "utf8"));
});

test("context resolves saved Skill changes on every read and an explicit project overrides the UI selection", t => {
  const { root, dataDir } = fixture(t), workspace = new Workspace({ root, dataDir });
  const a = workspace.add({ name: "项目 A" }), b = workspace.add({ name: "项目 B" });
  const before = projectContext(a);
  atomic(path.join(a.root, ".agents/skills/custom-writer/SKILL.md"),
    "---\nname: custom-writer\ndescription: Write stories.\n---\n本项目的新创作方法\n");
  const registry = path.join(a.root, ".agents/skill_registry.md");
  atomic(registry, fs.readFileSync(registry, "utf8").replace(
    "| `script.primary` | `screenwriter-workflow`", "| `script.primary` | `custom-writer`"), true);
  const after = projectContext(a);
  assert.notEqual(before.registry_sha256, after.registry_sha256);
  assert.equal(after.skills.find(s => s.slot === "script.primary").name, "custom-writer");
  assert.equal(projectContext(b).skills.find(s => s.slot === "script.primary").name, "screenwriter-workflow");
  workspace.select(b.project_id);
  const command = spawnSync(process.execPath, [
    path.join(platformRoot, "workbench/scripts/project-context.mjs"),
    "--workspace", root, "--project", a.project_id,
  ], { cwd: root, encoding: "utf8" });
  assert.equal(command.status, 0, command.stderr);
  const selected = JSON.parse(command.stdout);
  assert.equal(selected.root, a.root);
  assert.equal(selected.skills.find(s => s.slot === "script.primary").name, "custom-writer");
});

test("API switches the UI project without redirecting running jobs or their Skill inputs", async t => {
  const { root, dataDir } = fixture(t), client = new Client();
  const app = await createApp({ dataDir, workspaceRoot: root, codexClient: client, runWorker: false });
  t.after(() => app.app.close());
  const call = (method, url, payload) => app.app.inject({ method, url: "/api" + url, payload, headers: { "x-workbench": "1" } });
  assert.deepEqual((await call("GET", "/projects")).json(), []);
  const a = (await call("POST", "/projects", { name: "A" })).json();
  const b = (await call("POST", "/projects", { name: "B" })).json();
  const result = await call("POST", `/projects/${a.project_id}/skills/run`,
    { stage: "script", instruction: "只返回用于测试的草案", request_key: "workspace-binding-test" });
  assert.equal(result.statusCode, 200, result.body);
  await call("PUT", "/workspace/active-project", { project_id: b.project_id });
  const started = client.calls.find(c => c.method === "thread/start");
  assert.equal(started.params.cwd, a.root);
  const turn = client.calls.find(c => c.method === "turn/start");
  assert.ok(turn.params.input.filter(item => item.type === "skill").every(item => item.path.startsWith(a.root + path.sep)));
  const jobs = (await call("GET", `/projects/${a.project_id}`)).json().jobs;
  assert.equal(jobs.length, 1);
  assert.equal((await call("GET", `/projects/${b.project_id}`)).json().jobs.length, 0);
  assert.equal((await call("GET", `/projects/${a.project_id}/context`)).json().root, a.root);
  assert.equal((await call("GET", "/workspace")).json().active_project_id, b.project_id);
});

function legacyProject(root, name, number) {
  const source = path.join(root, "legacy", String(number));
  atomic(path.join(source, ".agents/skill_registry.md"), "| `script.primary` | `writer` |\n");
  atomic(path.join(source, ".agents/skills/writer/SKILL.md"), "---\nname: writer\ndescription: Write.\n---\n");
  atomic(path.join(source, "AGENTS.md"), "# 我的原项目规则\n原台词不可改写。\n");
  atomic(path.join(source, "deliverables/2_assets/take-01/@char_Exact-Name.PNG"), Buffer.from([1, 2, 3, 255]));
  atomic(path.join(source, "deliverables/0_admin/workflow_state.json"), { exact_source: "unchanged", production_inputs: null });
  const store = new Store(source);
  store.put("take", "take-01", { take_id: "take-01", path: "deliverables/2_assets/take-01/@char_Exact-Name.PNG" });
  store.put("job", "job-01", { job_id: "job-01", status: "completed", thread_id: "old-thread", external_id: "keep" });
  store.saveTimeline({ clips: [{ clip_id: "clip-01", take_id: "take-01" }] }, 0);
  store.close();
  return { project_id: `project-${number}`, name, root: source, created_at: "2026-10-17T00:00:00Z" };
}

test("migration verifies files and database, preserves IDs and fixed Skill bytes, and leaves old paths usable", t => {
  const { root, dataDir } = fixture(t);
  const a = legacyProject(root, "不在剧本上", 1), b = legacyProject(root, "短镜头", 2);
  const legacyIndex = path.join(root, "legacy/projects.json");
  atomic(legacyIndex, [a, b]);
  const stateBefore = fs.readFileSync(path.join(a.root, "deliverables/0_admin/workflow_state.json"));
  atomic(path.join(dataDir, "workspace.json"), { format: 1, active_project_id: a.project_id, revision: 2 });
  const options = { workspaceRoot: root, legacyIndex, dataDir };
  const result = migrateWorkspace(options);
  const moved = result.projects.find(p => p.project_id === a.project_id);
  assert.equal(moved.root, path.join(root, "projects/不在剧本上"));
  assert.equal(fs.realpathSync(a.root), moved.root);
  assert.ok(fs.lstatSync(a.root).isSymbolicLink());
  assert.deepEqual(fs.readFileSync(path.join(moved.root, "deliverables/0_admin/workflow_state.json")), stateBefore);
  assert.equal(sha(fs.readFileSync(path.join(moved.root, ".agents/skills/writer/SKILL.md"))),
    sha(fs.readFileSync(path.join(result.backup, "sources", a.project_id, ".agents/skills/writer/SKILL.md"))));
  const store = new Store(moved.root);
  assert.equal(store.get("job", "job-01").thread_id, "old-thread");
  assert.equal(store.timeline().project.clips[0].clip_id, "clip-01");
  assert.equal(store.timeline().project.clips[0].take_id, "take-01");
  assert.equal(store.history().length, 1);
  store.close();
  assert.match(fs.readFileSync(path.join(moved.root, "AGENTS.md"), "utf8"), /原台词不可改写/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dataDir, "active-project.json"))).root, moved.root);
  assert.equal(migrateWorkspace(options).migrated, false);
});

test("migration failure keeps the original index and projects and removes only incomplete copies", t => {
  const { root, dataDir } = fixture(t);
  const a = legacyProject(root, "完整项目", 1), b = legacyProject(root, "损坏数据库", 2);
  const legacyIndex = path.join(root, "legacy/projects.json");
  atomic(legacyIndex, [a, b]);
  const before = fs.readFileSync(legacyIndex);
  fs.writeFileSync(path.join(b.root, "deliverables/0_admin/workbench.sqlite"), "not a database");
  assert.throws(() => migrateWorkspace({ workspaceRoot: root, dataDir, legacyIndex }));
  assert.deepEqual(fs.readFileSync(legacyIndex), before);
  assert.equal(fs.lstatSync(a.root).isSymbolicLink(), false);
  assert.ok(fs.existsSync(path.join(a.root, "deliverables/2_assets/take-01/@char_Exact-Name.PNG")));
  assert.equal(fs.existsSync(path.join(root, "projects/完整项目")), false);
  assert.equal(fs.existsSync(path.join(root, "projects/损坏数据库")), false);
});
