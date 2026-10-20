import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { atomic, check, now, sha } from "./files.mjs";
import { ensureProjectFiles, platformRoot, projectFolder } from "./workspace.mjs";

function inventory(root) {
  const files = {};
  const visit = relative => {
    for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
      const name = path.join(relative, entry.name), file = path.join(root, name);
      if (entry.isSymbolicLink()) files[name] = { link: fs.readlinkSync(file) };
      else if (entry.isDirectory()) visit(name);
      else if (entry.isFile()) files[name] = { sha256: sha(fs.readFileSync(file)), size: fs.statSync(file).size };
      else throw new Error(`无法迁移特殊文件：${file}`);
    }
  };
  visit("");
  return files;
}

function databaseSummary(root) {
  const file = path.join(root, "deliverables/0_admin/workbench.sqlite");
  if (!fs.existsSync(file)) return null;
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    check(db.prepare("PRAGMA integrity_check").get().integrity_check === "ok", "项目数据库完整性检查失败");
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row => row.name);
    return {
      records: tables.includes("records") ? db.prepare("SELECT kind,COUNT(*) AS count FROM records GROUP BY kind ORDER BY kind").all() : [],
      revisions: tables.includes("revisions") ? db.prepare("SELECT COUNT(*) AS count FROM revisions").get().count : 0,
    };
  } finally { db.close(); }
}

export function migrationPlan({
  workspaceRoot = platformRoot,
  legacyIndex = path.join(workspaceRoot, "workbench/.local/projects.json"),
  dataDir = path.join(workspaceRoot, ".workbench"),
  projectsRoot = path.join(workspaceRoot, "projects"),
} = {}) {
  check(fs.existsSync(legacyIndex), "没有旧版项目索引");
  const projects = JSON.parse(fs.readFileSync(legacyIndex, "utf8"));
  const destinations = new Set();
  const items = projects.map(project => {
    check(fs.existsSync(project.root), `项目目录不存在：${project.root}`);
    const source = fs.realpathSync(project.root);
    const destination = path.join(projectsRoot, projectFolder(project.name));
    check(!destinations.has(destination), "存在同名项目，请先指定不同的项目名称");
    destinations.add(destination);
    const alreadyMoved = source === destination;
    check(alreadyMoved || !fs.existsSync(destination), `目标已存在，未覆盖：${destination}`, 409);
    return { project, source, destination, alreadyMoved, splitPlatform: source === workspaceRoot };
  });
  return { workspaceRoot, legacyIndex, dataDir, projectsRoot, items };
}

// Run only with the local service stopped. Copy and verify everything before switching the index.
export function migrateWorkspace(options = {}) {
  const plan = migrationPlan(options);
  if (plan.items.every(item => item.alreadyMoved))
    return { migrated: false, projects: plan.items.map(item => item.project), message: "项目已迁移" };
  const stamp = now().replace(/[:.]/g, "-");
  const backup = path.join(plan.dataDir, "migrations", stamp);
  fs.mkdirSync(backup, { recursive: true });
  atomic(path.join(backup, "projects.before.json"), JSON.parse(fs.readFileSync(plan.legacyIndex, "utf8")));
  const index = path.join(plan.dataDir, "projects.json");
  if (fs.existsSync(index)) fs.copyFileSync(index, path.join(backup, "workspace-index.before.json"));
  const stateFile = path.join(plan.dataDir, "workspace.json");
  const oldState = fs.existsSync(stateFile) ? fs.readFileSync(stateFile) : null;
  const activeFile = path.join(plan.dataDir, "active-project.json");
  const oldActive = fs.existsSync(activeFile) ? fs.readFileSync(activeFile) : null;
  const prepared = [], aliases = [];
  let indexCommitted = false;
  try {
    for (const item of plan.items) {
      if (item.alreadyMoved) { prepared.push({ ...item, verified_files: 0 }); continue; }
      const { source, destination, project } = item;
      fs.mkdirSync(destination, { recursive: true });
      prepared.push(item);
      if (item.splitPlatform) {
        for (const name of [".agents", ".codex", "deliverables", "archives"]) {
          if (fs.existsSync(path.join(source, name)))
            fs.cpSync(path.join(source, name), path.join(destination, name), { recursive: true, verbatimSymlinks: true });
        }
        fs.copyFileSync(
          path.join(platformRoot, "workbench/templates/video-project/AGENTS.md"),
          path.join(destination, "AGENTS.md"),
        );
      } else {
        fs.cpSync(source, destination, { recursive: true, verbatimSymlinks: true });
      }
      const expected = item.splitPlatform
        ? Object.fromEntries([".agents", ".codex", "deliverables", "archives"].flatMap(prefix =>
          fs.existsSync(path.join(source, prefix))
            ? Object.entries(inventory(path.join(source, prefix))).map(([name, value]) => [path.join(prefix, name), value])
            : []))
        : inventory(source);
      const actual = inventory(destination);
      for (const [name, expectedFile] of Object.entries(expected))
        check(JSON.stringify(actual[name]) === JSON.stringify(expectedFile), `迁移校验不一致：${name}`);
      item.verified_files = Object.keys(expected).length;
      item.database = databaseSummary(destination);
      check(JSON.stringify(item.database) === JSON.stringify(databaseSummary(source)), "数据库记录数量或时间轴版本不一致");
      ensureProjectFiles({ ...project, root: destination });
    }
    // Leave old task/Skill paths usable without creating two writable copies of a project.
    for (const item of prepared.filter(item => !item.splitPlatform && !item.alreadyMoved)) {
      const sourceBackup = path.join(backup, "sources", item.project.project_id);
      fs.mkdirSync(path.dirname(sourceBackup), { recursive: true });
      fs.renameSync(item.source, sourceBackup);
      aliases.push({ ...item, sourceBackup });
      fs.symlinkSync(item.destination, item.source, "dir");
    }
    const projects = prepared.map(item => ({
      ...item.project, root: item.destination,
      ...(item.alreadyMoved ? {} : { previous_root: item.source, migrated_at: now() }),
    }));
    atomic(index, projects, true);
    indexCommitted = true;
    const state = oldState ? JSON.parse(oldState.toString()) : { format: 1, active_project_id: null, revision: 0 };
    state.projects_directory = path.relative(plan.workspaceRoot, plan.projectsRoot);
    atomic(stateFile, state, true);
    const active = projects.find(project => project.project_id === state.active_project_id);
    if (active) atomic(activeFile, {
      format: 1, project_id: active.project_id, name: active.name, root: active.root,
      registry: path.join(active.root, ".agents/skill_registry.md"), selected_at: now(),
    }, true);
    // Keep old readers on the migrated paths as well, including repeated migration calls.
    atomic(plan.legacyIndex, projects, true);
    const report = {
      migrated: true, created_at: now(), backup, projects,
      checks: prepared.map(item => ({
        project_id: item.project.project_id, name: item.project.name,
        before: item.source, after: item.destination,
        verified_files: item.verified_files, database: item.database,
        compatibility_link: !item.splitPlatform && !item.alreadyMoved,
      })),
    };
    atomic(path.join(backup, "report.json"), report);
    return report;
  } catch (error) {
    for (const item of aliases.reverse()) {
      if (fs.existsSync(item.source) || fs.lstatSync(item.source, { throwIfNoEntry: false }))
        fs.unlinkSync(item.source);
      fs.renameSync(item.sourceBackup, item.source);
    }
    if (indexCommitted) {
      const previous = path.join(backup, "workspace-index.before.json");
      if (fs.existsSync(previous)) fs.copyFileSync(previous, index);
      else fs.rmSync(index, { force: true });
    }
    if (oldState) atomic(stateFile, oldState, true);
    else fs.rmSync(stateFile, { force: true });
    if (oldActive) atomic(activeFile, oldActive, true);
    else fs.rmSync(activeFile, { force: true });
    fs.copyFileSync(path.join(backup, "projects.before.json"), plan.legacyIndex);
    // Only remove newly created, uncommitted destinations; original data remains untouched.
    for (const item of prepared.filter(item => !item.alreadyMoved))
      fs.rmSync(item.destination, { recursive: true, force: true });
    atomic(path.join(backup, "failure.json"), { error: error.message, at: now() });
    throw error;
  }
}
