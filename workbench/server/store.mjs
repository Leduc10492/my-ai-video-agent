import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { id, now, check, atomic, sha, contained, assetName } from "./files.mjs";

export class Store {
  constructor(root) {
    this.root = fs.realpathSync(root);
    const file = contained(this.root, "deliverables/0_admin/workbench.sqlite");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.db = new DatabaseSync(file);
    this.db
      .exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(kind,id));
      CREATE TABLE IF NOT EXISTS dedupe (key TEXT PRIMARY KEY, job_id TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS revisions (revision INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  }
  get(kind, key) {
    const row = this.db
      .prepare("SELECT data FROM records WHERE kind=? AND id=?")
      .get(kind, key);
    return row ? JSON.parse(row.data) : null;
  }
  list(kind) {
    return this.db
      .prepare("SELECT data FROM records WHERE kind=? ORDER BY rowid")
      .all(kind)
      .map((r) => JSON.parse(r.data));
  }
  put(kind, key, data) {
    this.db
      .prepare(
        "INSERT INTO records VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data",
      )
      .run(kind, key, JSON.stringify(data));
    return data;
  }
  transaction(fn) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      this.db.exec("COMMIT");
      return result;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  meta(key, value) {
    if (value !== undefined)
      this.db
        .prepare(
          "INSERT INTO meta VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
        .run(key, JSON.stringify(value));
    const row = this.db.prepare("SELECT value FROM meta WHERE key=?").get(key);
    return row ? JSON.parse(row.value) : null;
  }
  settings() {
    return this.meta("settings") ?? { width: 1920, height: 1080, fps: 24 };
  }
  ensureAsset(input, { existing = false } = {}) {
    const name = assetName(input.asset_name),
      previous = this.get("asset", name);
    if (previous) {
      check(
        existing,
        `同名资产已存在：${name}。请选择为该资产添加 take。`,
        409,
      );
      check(previous.kind === input.kind, "同名资产的媒体类型不一致", 409);
      return previous;
    }
    check(["image", "video", "audio"].includes(input.kind), "不支持的素材类型");
    const asset = {
      ...input,
      asset_name: name,
      tag: input.tag ?? "",
      selected_take_id: null,
      locked: false,
      created_at: now(),
    };
    this.put("asset", name, asset);
    return asset;
  }
  createJob(input, dedupeKey) {
    check(
      typeof dedupeKey === "string" && dedupeKey.length > 5,
      "需要稳定的请求键",
    );
    return this.transaction(() => {
      const previous = this.db
        .prepare("SELECT job_id FROM dedupe WHERE key=?")
        .get(dedupeKey);
      if (previous) return this.get("job", previous.job_id);
      const job = {
        ...input,
        job_id: id(),
        status: "queued",
        created_at: now(),
        updated_at: now(),
        remote_id: null,
      };
      this.put("job", job.job_id, job);
      this.db
        .prepare("INSERT INTO dedupe VALUES(?,?)")
        .run(dedupeKey, job.job_id);
      return job;
    });
  }
  updateJob(jobId, patch) {
    const job = this.get("job", jobId);
    check(job, "任务不存在", 404);
    return this.put("job", jobId, { ...job, ...patch, updated_at: now() });
  }
  timeline(revision) {
    const row = revision
      ? this.db
          .prepare("SELECT revision,data FROM revisions WHERE revision=?")
          .get(Number(revision))
      : this.db
          .prepare(
            "SELECT revision,data FROM revisions ORDER BY revision DESC LIMIT 1",
          )
          .get();
    return row ? { ...JSON.parse(row.data), revision: row.revision } : null;
  }
  saveTimeline(project, expectedRevision, source = "manual") {
    return this.transaction(() => {
      const latest = this.timeline();
      check(
        (latest?.revision ?? 0) === expectedRevision,
        "时间轴已有更新，请先载入最新版本；当前编辑未被覆盖",
        409,
      );
      const record = {
        project,
        source,
        created_at: now(),
        sha256: sha(project),
        settings: this.settings(),
      };
      // Preserve orphan files from a crash between the file write and SQLite COMMIT.
      let revision = (latest?.revision ?? 0) + 1;
      while (
        fs.existsSync(
          contained(
            this.root,
            `deliverables/4_edit/timeline_v${revision}.json`,
          ),
        )
      )
        revision++;
      this.db
        .prepare("INSERT INTO revisions(revision,data) VALUES(?,?)")
        .run(revision, JSON.stringify(record));
      const relative = `deliverables/4_edit/timeline_v${revision}.json`;
      atomic(contained(this.root, relative), { ...record, revision });
      this.db
        .prepare("UPDATE revisions SET data=? WHERE revision=?")
        .run(JSON.stringify({ ...record, path: relative }), revision);
      return this.timeline(revision);
    });
  }
  history() {
    return this.db
      .prepare("SELECT revision,data FROM revisions ORDER BY revision DESC")
      .all()
      .map((r) => {
        const { project, ...rest } = JSON.parse(r.data);
        return { ...rest, revision: r.revision };
      });
  }
  close() {
    this.db.close();
  }
}
