import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface LegacyAgentMigrationResult {
  content: string;
  migrated: boolean;
  warnings: string[];
}

export function migrateLegacyAgentToml(content: string): LegacyAgentMigrationResult {
  const hasLegacy = /^\s*instructions\s*=/m.test(content);
  const hasModern = /^\s*developer_instructions\s*=/m.test(content);
  if (!hasLegacy) return { content, migrated: false, warnings: [] };
  if (hasModern) {
    return {
      content,
      migrated: false,
      warnings: ["Legacy instructions was not migrated because developer_instructions already exists."],
    };
  }
  return {
    content: content.replace(/^(\s*)instructions(\s*=)/m, "$1developer_instructions$2"),
    migrated: true,
    warnings: ["Legacy agent field instructions was migrated to developer_instructions."],
  };
}

export async function migrateLegacyAgentFile(sourceFile: string, targetFile = sourceFile): Promise<LegacyAgentMigrationResult> {
  const result = migrateLegacyAgentToml(await readFile(sourceFile, "utf8"));
  if (!result.migrated && sourceFile === targetFile) return result;
  await mkdir(path.dirname(targetFile), { recursive: true });
  const temporary = `${targetFile}.migrating-${process.pid}`;
  await writeFile(temporary, result.content, "utf8");
  await rename(temporary, targetFile);
  return result;
}
