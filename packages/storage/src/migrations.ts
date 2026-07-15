import type { SqliteDatabase } from "./sqlite.js";
import { withTransaction } from "./sqlite.js";

interface Migration {
  version: number;
  name: string;
  sql: string;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: "initial_local_first_schema",
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE entities (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        parent_id TEXT,
        ordinal REAL,
        current_revision_id TEXT,
        archived_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        data_json TEXT NOT NULL
      );
      CREATE INDEX entities_project_type_idx ON entities(project_id, entity_type, archived_at, ordinal);
      CREATE INDEX entities_parent_idx ON entities(parent_id, entity_type, ordinal);

      CREATE TABLE revisions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        parent_revision_id TEXT,
        author_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        upstream_revision_ids_json TEXT NOT NULL,
        upstream_hashes_json TEXT NOT NULL,
        skill_json TEXT,
        provider TEXT,
        model TEXT,
        snapshot_json TEXT NOT NULL,
        message TEXT NOT NULL
      );
      CREATE INDEX revisions_entity_idx ON revisions(project_id, entity_type, entity_id, created_at DESC);
      CREATE UNIQUE INDEX revisions_entity_hash_idx ON revisions(project_id, entity_type, entity_id, content_hash, id);

      CREATE TABLE dependency_edges (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        upstream_entity_type TEXT NOT NULL,
        upstream_entity_id TEXT NOT NULL,
        downstream_entity_type TEXT NOT NULL,
        downstream_entity_id TEXT NOT NULL,
        relation TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(project_id, upstream_entity_type, upstream_entity_id, downstream_entity_type, downstream_entity_id, relation)
      );
      CREATE INDEX dependency_upstream_idx ON dependency_edges(project_id, upstream_entity_type, upstream_entity_id);
      CREATE INDEX dependency_downstream_idx ON dependency_edges(project_id, downstream_entity_type, downstream_entity_id);

      CREATE TABLE stale_markers (
        project_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        source_entity_type TEXT NOT NULL,
        source_entity_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        marked_at TEXT NOT NULL,
        PRIMARY KEY(project_id, entity_type, entity_id)
      );

      CREATE TABLE shot_envelope_links (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        shot_row_id TEXT NOT NULL,
        prompt_envelope_id TEXT NOT NULL,
        order_in_envelope INTEGER NOT NULL CHECK(order_in_envelope >= 0),
        created_at TEXT NOT NULL,
        UNIQUE(project_id, shot_row_id, prompt_envelope_id)
      );
      CREATE INDEX shot_links_shot_idx ON shot_envelope_links(project_id, shot_row_id);
      CREATE INDEX shot_links_envelope_idx ON shot_envelope_links(project_id, prompt_envelope_id, order_in_envelope);

      CREATE TABLE agent_runs (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        stage TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        started_at TEXT,
        finished_at TEXT,
        data_json TEXT NOT NULL
      );
      CREATE INDEX agent_runs_project_idx ON agent_runs(project_id, created_at DESC);
      CREATE INDEX agent_runs_status_idx ON agent_runs(status);

      CREATE TABLE draft_proposals (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        run_id TEXT,
        stage TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        decided_at TEXT,
        data_json TEXT NOT NULL
      );
      CREATE INDEX draft_proposals_project_idx ON draft_proposals(project_id, created_at DESC);

      CREATE TABLE skill_bindings (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        slot TEXT NOT NULL,
        skill_id TEXT NOT NULL,
        skill_version TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        data_json TEXT NOT NULL,
        UNIQUE(project_id, slot)
      );

      CREATE TABLE project_settings (
        project_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY(project_id, key)
      );
    `,
  },
];

export function runMigrations(db: SqliteDatabase, now = new Date().toISOString()): number {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )
  `);
  const applied = new Set(
    db.prepare("SELECT version FROM schema_migrations").all().map((row) => (row as { version: number }).version),
  );
  const apply = (migration: Migration): void => withTransaction(db, () => {
    db.exec(migration.sql);
    db.prepare("INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)")
      .run(migration.version, migration.name, now);
  });
  for (const migration of migrations) {
    if (!applied.has(migration.version)) apply(migration);
  }
  return migrations.at(-1)?.version ?? 0;
}

export const CURRENT_SCHEMA_VERSION = migrations.at(-1)?.version ?? 0;
