import { backup, type DatabaseSync, type SQLInputValue } from "node:sqlite";

const transactionDepth = new WeakMap<DatabaseSync, number>();

export type SqliteDatabase = DatabaseSync;
export type SqlValue = SQLInputValue;

export function withTransaction<T>(db: DatabaseSync, work: () => T): T {
  const depth = transactionDepth.get(db) ?? 0;
  if (depth > 0) {
    transactionDepth.set(db, depth + 1);
    try {
      return work();
    } finally {
      transactionDepth.set(db, depth);
    }
  }

  db.exec("BEGIN IMMEDIATE");
  transactionDepth.set(db, 1);
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // SQLite may already have rolled back a failed transaction.
    }
    throw error;
  } finally {
    transactionDepth.delete(db);
  }
}

export function backupDatabase(db: DatabaseSync, destination: string): Promise<number> {
  return backup(db, destination);
}
