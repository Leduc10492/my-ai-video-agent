export interface SkillFrontmatter {
  name?: string;
  description?: string;
  [key: string]: string | undefined;
}

export function parseSkillFrontmatter(markdown: string): SkillFrontmatter {
  if (!markdown.startsWith("---")) return {};
  const end = markdown.indexOf("\n---", 3);
  if (end < 0) return {};
  const result: SkillFrontmatter = {};
  for (const line of markdown.slice(3, end).split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match?.[1]) continue;
    const raw = (match[2] ?? "").trim();
    result[match[1]] = raw.replace(/^(?:"(.*)"|'(.*)')$/, "$1$2");
  }
  return result;
}
