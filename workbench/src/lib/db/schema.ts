import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  episodeId: text("episode_id"),
  type: text("type").notNull(),
  status: text("status").notNull(),
  title: text("title").notNull(),
  estCost: real("est_cost").notNull().default(0),
  actualCost: real("actual_cost").notNull().default(0),
  retries: integer("retries").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(2),
  error: text("error"),
  result: text("result"),
  createdAt: integer("created_at").notNull(),
});

export const jobLogs = sqliteTable("job_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: text("job_id").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const approvals = sqliteTable("approvals", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull(),
  estimate: real("estimate").notNull(),
  decision: text("decision").notNull(),
  note: text("note"),
  createdAt: integer("created_at").notNull(),
});

export const costLedger = sqliteTable("cost_ledger", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: text("job_id").notNull(),
  estimate: real("estimate").notNull(),
  actual: real("actual").notNull().default(0),
  note: text("note").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  path: text("path").notNull(),
  sha: text("sha").notNull(),
  shot: text("shot"),
  version: integer("version").notNull(),
  isActive: integer("is_active").notNull().default(1),
});

export const fileIndex = sqliteTable("file_index", {
  path: text("path").primaryKey(),
  hash: text("hash").notNull(),
  mtime: integer("mtime").notNull(),
});
