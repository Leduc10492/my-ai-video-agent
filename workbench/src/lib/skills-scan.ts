/**
 * Adapted from xuanyustudio/LocalMiniDrama (MIT)
 * backend-node/src/mastra/skills.mjs — acceptSkill + listSkillDirectories.
 * Logging side effects removed. Validation is the SKILL.md frontmatter name.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { parseFrontmatter } from "@/lib/parse";

function acceptSkill(dir: string) {
  const skillFile = path.join(dir, "SKILL.md");
  if (!existsSync(skillFile) || !statSync(skillFile).isFile()) return null;
  try {
    const markdown = readFileSync(skillFile, "utf8");
    const { data } = parseFrontmatter(markdown);
    if (!data.name) return null;
    return { dir: path.resolve(dir), name: data.name, description: data.description ?? "" };
  } catch {
    return null;
  }
}

export function listSkillDirectories(skillsDir: string) {
  if (!existsSync(skillsDir)) return [];
  const found = [];
  for (const name of readdirSync(skillsDir)) {
    const dir = path.join(skillsDir, name);
    if (!statSync(dir).isDirectory()) continue;
    const accepted = acceptSkill(dir);
    if (accepted) found.push(accepted);
  }
  return found.sort((a, b) => a.name.localeCompare(b.name));
}
