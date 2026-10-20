import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { atomic, check, sha } from "./files.mjs";
import { createFilmLayout, filmPath, assetCategory, portableInstructions } from "../../.agents/project-layout.mjs";

export function inventory(root, prefix = "") {
  return fs.readdirSync(path.join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    if (entry.name === ".DS_Store" || entry.name.endsWith("-wal") || entry.name.endsWith("-shm")) return [];
    const relative = path.posix.join(prefix, entry.name), absolute = path.join(root, relative);
    check(!entry.isSymbolicLink(), `打包前需要检查软链接：${relative}`);
    return entry.isDirectory() ? inventory(root, relative) : [relative];
  });
}

// Canonical production text and media are copied byte-for-byte. Old references
// remain resolvable through the recorded project-relative aliases.
export function copyVideoProject(source, destination, { runtimeRoot } = {}) {
  check(!fs.existsSync(destination), "目标作品目录已存在，不覆盖");
  const database = path.join(source, "deliverables/0_admin/workbench.sqlite");
  const db = fs.existsSync(database) ? new DatabaseSync(database, { readOnly: true }) : null;
  let copied = false;
  try {
    if (db) {
      const active = db.prepare("SELECT data FROM records WHERE kind='job'").all()
        .map(r => JSON.parse(r.data)).filter(j => ["queued", "starting", "running", "submitted", "downloading", "rendering", "submitting"].includes(j.status));
      check(!active.length, "项目还有执行中的任务，先让任务完成再建立正式副本");
    }
    const files = inventory(source), aliases = {}, takes = new Map();
    const counters = new Map(), records = [];
    createFilmLayout(destination); copied = true;
    for (const relative of files) {
      if (relative === "project.json") { aliases[relative] = ".project/project.json"; continue; }
      const match = relative.match(/^(deliverables\/2_assets|deliverables\/3_shotlist\/([^/]+)\/generated)\/([^/]+)\/([a-f0-9-]{36})\/(.+)$/i);
      if (match) {
        const [, , scene, asset, takeId, filename] = match;
        const parent = scene
          ? `04_镜头/${scene.replace(/_v\d+$/, "")}/${asset}`
          : `02_资产/${assetCategory(asset, /\.(mp3|wav|m4a|aac|flac|ogg)$/i.test(filename) ? "audio" : "")}/${asset}`;
        if (!takes.has(takeId)) {
          const next = (counters.get(parent) || 0) + 1; counters.set(parent, next);
          takes.set(takeId, `${parent}/take_${String(next).padStart(3, "0")}`);
        }
        aliases[relative] = `${takes.get(takeId)}/${filename}`;
      } else aliases[relative] = filmPath(relative);
    }
    const used = new Set();
    for (const relative of files) {
      const target = aliases[relative];
      check(!used.has(target), `目录整理存在同名冲突：${target}`); used.add(target);
      const from = path.join(source, relative), to = path.join(destination, target);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      if (from === database && db) {
        db.exec(`VACUUM INTO '${to.replaceAll("'", "''")}'`);
        records.push({ from: relative, to: target, database: true });
      } else {
        fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
        const hash = sha(fs.readFileSync(from));
        check(sha(fs.readFileSync(to)) === hash, `复制核对失败：${relative}`);
        records.push({ from: relative, to: target, sha256: hash });
      }
    }
    atomic(path.join(destination, ".project/layout.json"), { format: 1, kind: "film-project-layout", aliases }, true);
    const manifestFile = path.join(destination, ".project/project.json");
    const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    manifest.layout = "film-v1"; atomic(manifestFile, manifest, true);

    const migrate = value => {
      if (typeof value === "string") {
        if (value === source) return "project:/";
        if (value.startsWith(source + path.sep)) {
          const relative = path.relative(source, value);
          return `project:/${aliases[relative] || filmPath(relative)}`;
        }
        return aliases[value] || (/^(deliverables|archives)\//.test(value) && !value.includes("\n") ? filmPath(value) : value);
      }
      if (Array.isArray(value)) return value.map(migrate);
      if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,migrate(v)]));
      return value;
    };
    // Rewrite live machine state only; historical packets keep their original
    // hashes/bytes, and aliases resolve their old paths.
    for (const name of ["workflow_state.json", "workflow_state.previous.json"]) {
      const file = path.join(destination, ".project", name);
      if (fs.existsSync(file)) atomic(file, migrate(JSON.parse(fs.readFileSync(file, "utf8"))), true);
    }
    let databaseCheck = null;
    if (db) {
      const next = new DatabaseSync(path.join(destination, ".project/workbench.sqlite"));
      try {
        next.exec("BEGIN IMMEDIATE");
        for (const row of next.prepare("SELECT kind,id,data FROM records").all()) {
          const before = JSON.parse(row.data), after = migrate(before);
          if (row.kind === "job" && after.result) {
            after.result_sha256 = sha(after.result);
            if (after.apply_started?.sha256 === before.result_sha256)
              after.apply_started.sha256 = after.result_sha256;
          }
          next.prepare("UPDATE records SET data=? WHERE kind=? AND id=?").run(JSON.stringify(after), row.kind, row.id);
        }
        for (const row of next.prepare("SELECT key,value FROM meta").all())
          next.prepare("UPDATE meta SET value=? WHERE key=?").run(JSON.stringify(migrate(JSON.parse(row.value))), row.key);
        for (const row of next.prepare("SELECT revision,data FROM revisions").all())
          next.prepare("UPDATE revisions SET data=? WHERE revision=?").run(JSON.stringify(migrate(JSON.parse(row.data))), row.revision);
        next.exec("COMMIT");
        check(next.prepare("PRAGMA integrity_check").get().integrity_check === "ok", "复制后的数据库检查失败");
        const keys = connection => connection.prepare("SELECT kind,id FROM records ORDER BY kind,id").all();
        check(JSON.stringify(keys(db)) === JSON.stringify(keys(next)), "数据库记录身份不一致");
        const revisions = connection => connection.prepare("SELECT revision FROM revisions ORDER BY revision").all();
        check(JSON.stringify(revisions(db)) === JSON.stringify(revisions(next)), "时间轴版本不一致");
        databaseCheck = { records: keys(next).length, timeline_versions: revisions(next).length, integrity: "ok" };
      } finally { next.close(); }
    }
    adaptProjectRules(destination, runtimeRoot);
    atomic(path.join(destination, ".project/目录迁移记录.json"), { format: 1, created_at: new Date().toISOString(), source, files: records, database: databaseCheck });
    return { project: manifest, files: records.length, database: databaseCheck };
  } catch (error) {
    if (copied) fs.rmSync(destination, { recursive: true, force: true });
    throw error;
  } finally { db?.close(); }
}

export function adaptProjectRules(root, runtimeRoot) {
  const files = inventory(root).filter(f =>
    (f === "AGENTS.md" || f.startsWith(".agents/") || f.startsWith(".codex/"))
      && /\.(md|toml)$/.test(f) && !f.includes("/source/"));
  for (const relative of files) {
    const file = path.join(root, relative), before = fs.readFileSync(file, "utf8");
    let after = portableInstructions(before)
      .replaceAll("`project.json`", "`.project/project.json`")
      .replaceAll("<scene-label>_v{N}/", "<scene-label>/v{N}/");
    if (relative === ".agents/production-contract.md") {
      after = after.replace(/^阶段目录前缀固定.*$/m,
        "项目内容固定使用 01_剧本、02_资产、03_分镜、04_镜头、05_剪辑、06_导出。运行状态在 .project；历史在 .project/历史。Scene 设计保存在 03_分镜/<scene>/vN/，视频保存在 04_镜头/<scene>/<标准文件名主干>/take_NNN/。");
      after = after.replace("共享资产只放在 `2_assets`", "共享资产只放在 `02_资产`");
    }
    if (after !== before) atomic(file, after, true);
  }
  if (runtimeRoot) {
    for (const relative of [".agents/project-layout.mjs", ".agents/skills/version-management/scripts/script-store.mjs"]) {
      const target = path.join(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(runtimeRoot, relative), target);
    }
  }
  const agents = path.join(root, "AGENTS.md");
  const text = fs.readFileSync(agents, "utf8");
  if (!text.includes("<!-- film-folder-contract -->")) atomic(agents, text + `

<!-- film-folder-contract -->
## 正式作品目录

- 项目身份：\`.project/project.json\`；目录映射：\`.project/layout.json\`；当前工作状态：\`.project/workflow_state.json\`。
- 剧本写入 \`01_剧本/剧本/\`，同版本审核写入 \`01_剧本/审核/\`，创意与大纲写入 \`01_剧本/创意与大纲/\`。
- 共用素材在 \`02_资产/角色、场景、道具、风格参考、声音/\`；分镜与 Prompt 在 \`03_分镜/<scene>/vN/\`；生成视频在 \`04_镜头/<scene>/<标准文件名主干>/take_NNN/\`。
- 剪辑工程在 \`05_剪辑/工程/\`，代理和缓存各自分开；审片及成片在 \`06_导出/审片/\`、\`06_导出/成片/\`。
- 保留标准文件名和真实 tag；新增 take 不覆盖旧素材。技术 ID 保存在元数据中。
- 旧 Skill 中出现 deliverables 或旧 Scene 路径时，以本目录契约为准；不要再建立 deliverables 文件夹。原始记录中的旧引用由目录映射读取。
- Skills 来自本项目保存的副本。公共工作流升级不改变本项目的选择；每阶段读取当前 Registry。
<!-- /film-folder-contract -->
`, true);
}
