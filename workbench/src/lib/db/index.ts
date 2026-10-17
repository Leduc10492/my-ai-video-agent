import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";

import * as schema from "@/lib/db/schema";
import { approvals, fileIndex, jobLogs, jobs, media } from "@/lib/db/schema";
import { repoRoot } from "@/lib/paths";

const DDL = `
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  episode_id TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  est_cost REAL NOT NULL DEFAULT 0,
  actual_cost REAL NOT NULL DEFAULT 0,
  retries INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 2,
  error TEXT,
  result TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS job_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  estimate REAL NOT NULL,
  decision TEXT NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS cost_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  estimate REAL NOT NULL,
  actual REAL NOT NULL DEFAULT 0,
  note TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  sha TEXT NOT NULL,
  shot TEXT,
  version INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS file_index (
  path TEXT PRIMARY KEY,
  hash TEXT NOT NULL,
  mtime INTEGER NOT NULL
);
`;

type Db = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as { workbenchDb?: Db };

function databaseFile() {
  return process.env.WORKBENCH_DB || path.join(process.cwd(), ".data", "workbench.db");
}

function walkFiles(dir: string, out: string[]) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
}

function seed(db: Db) {
  const now = Date.parse("2026-10-17T00:00:00Z");
  const samples = [
    {
      id: "example-anchor-side",
      projectId: "moban",
      episodeId: "ep-01",
      type: "generate",
      status: "awaiting_approval",
      title: "示例数据：林夏锚点侧面",
      estCost: 2.4,
      actualCost: 0,
      retries: 0,
      maxRetries: 2,
      error: null,
      result: null,
      createdAt: now,
    },
    {
      id: "example-station-wide",
      projectId: "moban",
      episodeId: "ep-01",
      type: "generate",
      status: "awaiting_approval",
      title: "示例数据：站台全景，估价超过 10 美元",
      estCost: 12,
      actualCost: 0,
      retries: 0,
      maxRetries: 2,
      error: null,
      result: null,
      createdAt: now + 1,
    },
  ];
  for (const sample of samples) {
    const existing = db.select().from(jobs).where(eq(jobs.id, sample.id)).get();
    if (existing) continue;
    db.insert(jobs).values(sample).run();
    db.insert(approvals)
      .values({
        id: `ap-${sample.id}`,
        jobId: sample.id,
        estimate: sample.estCost,
        decision: "pending",
        note: "示例数据。批准后实际花费仍是 0。",
        createdAt: sample.createdAt,
      })
      .run();
    db.insert(jobLogs)
      .values({
        jobId: sample.id,
        message: "已建立示例任务。等批准。工作台不会扣费。",
        createdAt: sample.createdAt,
      })
      .run();
  }
}

function reindex(db: Db) {
  db.delete(fileIndex).run();
  db.delete(media).run();
  const root = repoRoot();
  const roots = [path.join(root, "workbench", "example"), path.join(root, "deliverables")];
  for (const base of roots) {
    const files: string[] = [];
    walkFiles(base, files);
    for (const file of files) {
      const relative = path.relative(root, file).split(path.sep).join("/");
      const body = readFileSync(file);
      const hash = createHash("sha256").update(body).digest("hex");
      const mtime = Math.round(statSync(file).mtimeMs);
      db.insert(fileIndex).values({ path: relative, hash, mtime }).run();
      if (file.endsWith(`${path.sep}anchor.png`)) {
        db.insert(media)
          .values({ id: relative, path: relative, sha: hash, shot: null, version: 1, isActive: 1 })
          .run();
      }
    }
  }
}

export function getDb() {
  if (globalForDb.workbenchDb) return globalForDb.workbenchDb;
  const file = databaseFile();
  mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.exec(DDL);
  const db = drizzle(sqlite, { schema });
  globalForDb.workbenchDb = db;
  seed(db);
  reindex(db);
  return db;
}
