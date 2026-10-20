import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { Workspace, platformRoot, projectContext } from "../server/workspace.mjs";
import { atomic, contained, sha } from "../server/files.mjs";
import { Store } from "../server/store.mjs";
import { saveScript, scriptStatus, existingOutputs } from "../server/workflow.mjs";
import { registerFile } from "../server/media.mjs";
import { copyVideoProject } from "../server/portable-project.mjs";
import { createFilmLayout, projectRelative, canonicalScriptPath, portableInstructions } from "../../.agents/project-layout.mjs";
import { archiveArtifact, resolveArtifact } from "../../.agents/skills/version-management/scripts/script-store.mjs";

function area(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "portable-film-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function source(t) {
  const root = area(t), workspace = new Workspace({ root });
  const project = workspace.add({ mode: "create", name: "作品 A" });
  saveScript(project.root, { body: "INT. 房间 - 日\n\n林墨\n你好。\n" });
  return { root, project };
}

test("clean layout routes scripts, audits, media and exports without creating deliverables", t => {
  const root = area(t); createFilmLayout(root);
  assert.equal(projectRelative(root, "deliverables/1_story/01_script_v1.md"), "01_剧本/剧本/01_script_v1.md");
  assert.equal(projectRelative(root, "deliverables/1_story/01_audit_report_v1.md"), "01_剧本/审核/01_audit_report_v1.md");
  assert.equal(projectRelative(root, "deliverables/3_shotlist/scene-001_v2/a.json"), "03_分镜/scene-001/v2/a.json");
  assert.equal(projectRelative(root, "deliverables/4_edit/exports/a/a.mp4"), "06_导出/审片/a/a.mp4");
  assert.equal(canonicalScriptPath("01_剧本/剧本/01_script_v1.md"), true);
  assert.equal(portableInstructions("deliverables/1_story/01_script_v1.md"), "01_剧本/剧本/01_script_v1.md");
  assert.equal(portableInstructions("deliverables/1_story/01_audit_report_v1.md"), "01_剧本/审核/01_audit_report_v1.md");
  assert.throws(() => contained(root, "../../outside"), /超出/);
  const saved = saveScript(root, { body: "INT. 房间 - 日\n\n林墨\n你好。\n" });
  assert.equal(saved.state.working_script.path, "01_剧本/剧本/01_script_v1.md");
  saveScript(root, { body: "INT. 房间 - 日\n\n林墨\n再见。\n", expected_sha256: saved.state.working_script.sha256 });
  assert.equal(scriptStatus(root).candidates.length, 2);
  const original = saved.state.working_script;
  archiveArtifact(root, { key: `${original.artifact_id}@v1` });
  assert.equal(resolveArtifact(root, { key: `${original.artifact_id}@v1` }).resolved_path, ".project/历史/1_story/01_script_v1.md");
  assert.equal(fs.existsSync(path.join(root, "deliverables")), false);
  assert.ok(existingOutputs(root).some(f => f.path === "01_剧本/剧本/01_script_v2.md"));
});

test("migration preserves screenplay bytes, IDs, frozen Skills and resolves legacy references", t => {
  const { root, project } = source(t), destination = path.join(root, "正式作品");
  const before = scriptStatus(project.root), db = new Store(project.root);
  db.ensureAsset({ asset_name: "@char_Exact-Name", kind: "image", tag: "@manual-Tag" });
  db.meta("execution", { skill: path.join(project.root, ".agents/skills/cinedance/SKILL.md") });
  const resultPacket = { artifacts:[{ path:"deliverables/2_assets/guide_v1.md", content:"draft" }] };
  db.put("job","completed-plan",{job_id:"completed-plan",status:"completed",result:resultPacket,result_sha256:sha(resultPacket)});
  db.saveTimeline({ tracks: [] }, 0); db.close();
  const result = copyVideoProject(project.root, destination, { runtimeRoot: platformRoot });
  assert.equal(result.project.project_id, project.project_id);
  assert.equal(result.database.timeline_versions, 1);
  assert.equal(scriptStatus(destination).body, before.body);
  assert.equal(scriptStatus(destination).state.working_script.sha256, before.state.working_script.sha256);
  assert.equal(sha(fs.readFileSync(contained(destination, before.state.working_script.path))), before.state.working_script.sha256);
  const migrated = new Store(destination);
  assert.equal(migrated.get("asset", "@char_Exact-Name").tag, "@manual-Tag");
  assert.equal(migrated.meta("execution").skill, path.join(destination, ".agents/skills/cinedance/SKILL.md"));
  const job=migrated.get("job","completed-plan"); assert.equal(job.result_sha256,sha(job.result));
  migrated.close();
  assert.equal(fs.existsSync(path.join(destination, "deliverables")), false);
  assert.equal(projectContext({ ...project, root: destination }).skills.filter(s => s.error).length, 0);
  assert.throws(() => copyVideoProject(project.root, destination), /已存在/);
});

test("a relocated workspace reads relative index and new writes stay in the copied project", t => {
  const { root, project } = source(t), home = path.join(root, "我的AI视频");
  fs.mkdirSync(home);
  copyVideoProject(project.root, path.join(home, "作品 A"), { runtimeRoot: platformRoot });
  atomic(path.join(home, ".workbench/projects.json"), [{ ...project, root: "作品 A" }]);
  atomic(path.join(home, ".workbench/workspace.json"), { format: 1, portable: true, projects_directory: ".", revision: 1, active_project_id: project.project_id });
  const workspace = new Workspace({ root: home }); workspace.select(project.project_id);
  const moved = path.join(root, "另一个位置", "我的AI视频");
  fs.cpSync(home, moved, { recursive: true });
  const relocated = new Workspace({ root: moved });
  assert.equal(relocated.get(project.project_id).root, path.join(moved, "作品 A"));
  const cli = spawnSync(process.execPath, [path.join(platformRoot, "workbench/scripts/project-context.mjs"), "--workspace", moved], { encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  assert.equal(JSON.parse(cli.stdout).root, path.join(moved, "作品 A"));
  const fresh = relocated.add({ name: "作品 B" });
  assert.equal(fresh.root, path.join(moved, "作品 B"));
  assert.ok(fs.existsSync(path.join(fresh.root, ".project/project.json")));
  assert.ok(fs.existsSync(path.join(fresh.root, "04_镜头")));
  const original = scriptStatus(path.join(home, "作品 A"));
  saveScript(path.join(moved, "作品 A"), { body: original.body + "\n新一稿。\n", expected_sha256: original.state.working_script.sha256 });
  assert.equal(scriptStatus(path.join(home, "作品 A")).state.working_script.version, 1);
  assert.equal(scriptStatus(path.join(moved, "作品 A")).state.working_script.version, 2);
  const index = JSON.parse(fs.readFileSync(path.join(moved, ".workbench/projects.json")));
  assert.ok(index.every(p => !path.isAbsolute(p.root)));
});

test("readable take folders retain filenames and old timeline take bindings", async t => {
  const root = area(t); createFilmLayout(root);
  const source = path.join(root, "sound.wav");
  const wav = Buffer.alloc(44 + 8000 * 2);
  wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write("data", 36); wav.writeUInt32LE(wav.length - 44, 40); fs.writeFileSync(source, wav);
  const store = new Store(root); t.after(() => store.close());
  const first = await registerFile(store, source, { asset_name: "@Audio_Exact-Name", filename: "sound.wav" });
  const second = await registerFile(store, source, { asset_name: "@Audio_Exact-Name", filename: "sound.wav", add_take: true });
  assert.equal(first.path, "02_资产/声音/@Audio_Exact-Name/take_001/@Audio_Exact-Name.wav");
  assert.equal(second.path, "02_资产/声音/@Audio_Exact-Name/take_002/@Audio_Exact-Name.wav");
  assert.notEqual(first.take_id, second.take_id);
  store.saveTimeline({ tracks: [{ elements: [{ id: "clip-keep", metadata: { take_id: first.take_id } }] }] }, 0);
  store.put("asset", first.asset_name, { ...store.get("asset", first.asset_name), selected_take_id: second.take_id });
  assert.equal(store.timeline().project.tracks[0].elements[0].metadata.take_id, first.take_id);
  assert.equal(sha(fs.readFileSync(contained(root, first.path))), first.sha256);
});

test("a running job blocks copying before any destination is created", t => {
  const { root, project } = source(t), store = new Store(project.root);
  store.put("job", "in-flight", { job_id: "in-flight", status: "running" }); store.close();
  const destination = path.join(root, "blocked");
  assert.throws(() => copyVideoProject(project.root, destination), /执行中的任务/);
  assert.equal(fs.existsSync(destination), false);
});

test("a template linked to shared Skills creates independent project files", t => {
  const root = area(t), template = path.join(root, "template"), shared = path.join(root, "shared");
  fs.cpSync(path.join(platformRoot, ".agents"), path.join(template, ".agents"), { recursive:true });
  fs.renameSync(path.join(template, ".agents/skills"), shared);
  fs.symlinkSync("../../shared", path.join(template, ".agents/skills"));
  fs.copyFileSync(path.join(platformRoot, "workbench/templates/video-project/AGENTS.md"), path.join(template, "AGENTS.md"));
  atomic(path.join(template, "project-template.json"), {format:1});
  atomic(path.join(root, ".workbench/workspace.json"), {format:1,portable:true,projects_directory:".",revision:1});
  const workspace = new Workspace({root,template});
  const project = workspace.add({name:"独立副本"});
  assert.equal(fs.lstatSync(path.join(project.root, ".agents/skills")).isSymbolicLink(),false);
  assert.ok(projectContext(project).skills.every(skill=>!skill.error));
  const file=".agents/skills/cinedance/SKILL.md", before=fs.readFileSync(path.join(project.root,file),"utf8");
  fs.appendFileSync(path.join(shared,"cinedance/SKILL.md"),"\nshared update");
  assert.equal(fs.readFileSync(path.join(project.root,file),"utf8"),before);
});
