import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { runMigrations } from "./migrations.js";
import { backupDatabase, withTransaction } from "./sqlite.js";

export interface OpenDatabaseOptions {
  readonly?: boolean;
  fileMustExist?: boolean;
  timeoutMs?: number;
}

export class ProjectDatabase {
  readonly projectRoot: string;
  readonly directorRoot: string;
  readonly databasePath: string;
  readonly readOnly: boolean;
  readonly db: DatabaseSync;
  #closed = false;

  constructor(projectRoot: string, options: OpenDatabaseOptions = {}) {
    this.projectRoot = resolve(projectRoot);
    this.directorRoot = join(this.projectRoot, ".ai-director");
    this.databasePath = join(this.directorRoot, "project.db");
    this.readOnly = options.readonly ?? false;
    if (!this.readOnly) {
      mkdirSync(this.directorRoot, { recursive: true });
      mkdirSync(join(this.directorRoot, "runs"), { recursive: true });
      mkdirSync(join(this.directorRoot, "snapshots"), { recursive: true });
    }
    if (options.fileMustExist && !existsSync(this.databasePath)) {
      throw new Error(`SQLite database does not exist: ${this.databasePath}`);
    }
    this.db = new DatabaseSync(this.databasePath, {
      readOnly: this.readOnly,
      enableForeignKeyConstraints: true,
    });
    this.db.exec(`PRAGMA busy_timeout = ${Math.max(0, Math.floor(options.timeoutMs ?? 5_000))}`);
    if (!this.readOnly) {
      this.db.exec("PRAGMA journal_mode = WAL");
      this.db.exec("PRAGMA synchronous = NORMAL");
      this.db.exec("PRAGMA wal_autocheckpoint = 1000");
      runMigrations(this.db);
    }
  }

  transaction<T>(work: () => T): T {
    return withTransaction(this.db, work);
  }

  checkpoint(mode: "PASSIVE" | "FULL" | "RESTART" | "TRUNCATE" = "PASSIVE"): void {
    this.db.prepare(`PRAGMA wal_checkpoint(${mode})`).all();
  }

  async createSnapshot(label = new Date().toISOString().replaceAll(":", "-")): Promise<string> {
    const safeLabel = label.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "snapshot";
    const destination = join(this.directorRoot, "snapshots", `${safeLabel}.db`);
    mkdirSync(dirname(destination), { recursive: true });
    await backupDatabase(this.db, destination);
    return destination;
  }

  close(): void {
    if (!this.#closed) {
      if (!this.readOnly) this.checkpoint("TRUNCATE");
      this.db.close();
      this.#closed = true;
    }
  }
}

export function openProjectDatabase(projectRoot: string, options?: OpenDatabaseOptions): ProjectDatabase {
  return new ProjectDatabase(projectRoot, options);
}
