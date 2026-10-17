import type { AgentDocument, SkillReference } from "@/lib/types";

export function parseFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const data: Record<string, string> = {};
  if (!match) return { data, body: source };

  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) continue;
    data[field[1]] = field[2].trim().replace(/^["']|["']$/g, "");
  }

  return { data, body: source.slice(match[0].length) };
}

export function parseRegistry(source: string) {
  return source
    .split(/\r?\n/)
    .filter((line) => /^\|\s*`[^`]+`\s*\|/.test(line))
    .map((line) => {
      const [slot = "", skill = "", owner = "", output = ""] = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim().replace(/^`|`$/g, ""));
      return { slot, skill, owner, output };
    })
    .filter((row) => row.slot && row.skill);
}

export function canonicalOutputs(body: string) {
  const section = body.match(/canonical_outputs:([\s\S]*?)(?:\n- qa_handoff:|\n## )/)?.[1] ?? "";
  return [...section.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim());
}

export function referenceTitle(source: string, fallback: string) {
  const heading = source.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || fallback;
}

export function skillReferences(files: { path: string; source: string }[]): SkillReference[] {
  return files
    .filter((file) => file.path !== "SKILL.md" && file.path.endsWith(".md"))
    .map((file) => ({
      path: file.path,
      title: referenceTitle(file.source, file.path),
    }));
}

function sectionBody(instructions: string, heading: string) {
  const match = instructions.match(new RegExp(`# ${heading}\\n([\\s\\S]*?)(?=\\n# |$)`));
  return match?.[1]?.trim() ?? "";
}

function bulletList(section: string) {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, "").replace(/^`|`$/g, ""));
}

export function parseAgent(source: string, file: string): AgentDocument {
  const name = source.match(/^name\s*=\s*"([^"]+)"/m)?.[1] ?? file.replace(/\.toml$/, "");
  const description = source.match(/^description\s*=\s*"([^"]*)"/m)?.[1] ?? "";
  const instructions = source.match(/instructions\s*=\s*"""([\s\S]*?)"""/)?.[1]?.trim() ?? "";
  return {
    name,
    description,
    file,
    instructions,
    inputs: bulletList(sectionBody(instructions, "Inputs")),
    outputs: bulletList(sectionBody(instructions, "Outputs")),
    slots: bulletList(sectionBody(instructions, "Relevant Skill Slots")),
    skills: bulletList(sectionBody(instructions, "Current Default Skills")),
  };
}

const RULE_KEYS = [
  "进入资产与分镜阶段前",
  "图片或视频生成必须由用户单独授权",
  "默认一次只完成一个 Scene",
  "只有用户明确要求 Sub Agent",
  "一个阶段只有一个写入者",
  "不允许用硬编码脚本代替 Skill",
  "长剧本先只扫描 Scene",
  "单个 Scene 超过 10 个 Envelope",
];

export function extractRuleLines(markdown: string) {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\d.>\s]+/, "").trim())
    .filter(Boolean);
  return RULE_KEYS.flatMap((key) => {
    const line = lines.find((item) => item.includes(key));
    return line ? [line] : [];
  });
}

export function highestVersion(files: string[], pattern: RegExp) {
  let best: { version: number; file: string } | null = null;
  for (const file of files) {
    const name = file.split("/").pop() ?? file;
    const match = name.match(pattern);
    if (!match) continue;
    const version = Number(match[1]);
    if (!best || version > best.version) best = { version, file };
  }
  return best;
}

export function sceneLabelsFromScript(source: string | null) {
  if (!source) return [];
  const labels: string[] = [];
  for (const line of source.split(/\r?\n/)) {
    const heading = line.match(/^##\s*场\s*(\d{1,3})\b/);
    const slug = line.match(/\bscene-(\d{1,3})\b/i);
    const number = heading?.[1] ?? slug?.[1];
    if (!number) continue;
    const label = `scene-${number.padStart(3, "0")}`;
    if (!labels.includes(label)) labels.push(label);
  }
  return labels;
}
