export type FindingLevel = "P0" | "P1" | "P2" | "P3";

export type Finding = {
  level: FindingLevel;
  text: string;
  open: boolean;
};

const LEVELS: FindingLevel[] = ["P0", "P1", "P2", "P3"];

function clearedLine(text: string, level: FindingLevel) {
  return new RegExp(`未解决(?:的)?\\s*${level}\\s*[：:]\\s*(?:无|没有|零|0)(?!\\S)`).test(text);
}

function sectionBlocks(text: string) {
  const parts = text.split(/^###\s+(P[0-3])\s*$/m);
  if (parts.length < 3) return null;
  const blocks = new Map<FindingLevel, string>();
  for (let index = 1; index < parts.length; index += 2) {
    const level = parts[index] as FindingLevel;
    if (LEVELS.includes(level)) blocks.set(level, parts[index + 1] ?? "");
  }
  return blocks;
}

function bulletFindings(level: FindingLevel, body: string): Finding[] {
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "));
  if (lines.length === 0) {
    const head = body.trim().slice(0, 80);
    if (!head || /^(无|没有|零|0)(?:\s|。|$)/.test(head)) return [];
    return [{ level, text: body.trim().slice(0, 400), open: level === "P0" || level === "P1" }];
  }
  return lines.map((line) => {
    const text = line.replace(/^- /, "").trim();
    const closed = /已关闭|已修复|已解决/.test(text);
    const markedOpen = /未解决|未关闭|未修复|\[open\]/.test(text);
    const open = !closed && (markedOpen || level === "P0" || level === "P1");
    return { level, text, open };
  });
}

export function parseFindings(text: string): Finding[] {
  const blocks = sectionBlocks(text);
  if (blocks) {
    return LEVELS.flatMap((level) => bulletFindings(level, blocks.get(level) ?? ""));
  }

  const findings: Finding[] = [];
  for (const level of LEVELS) {
    if (clearedLine(text, level)) continue;
    const match = text.match(new RegExp(`${level}[^\\n]{0,180}`));
    if (match && /未解决|未关闭|未修复/.test(match[0])) {
      findings.push({ level, text: match[0].trim(), open: true });
    }
  }
  return findings;
}

export function auditDecision(input: {
  hasScript: boolean;
  hasAudit: boolean;
  scriptVersion: number | null;
  auditVersion: number | null;
  auditText: string;
}) {
  if (!input.hasScript) {
    return { status: "未开始" as const, gateOpen: false, detail: "还没有剧本。" };
  }
  if (!input.hasAudit) {
    return {
      status: "可开始" as const,
      gateOpen: false,
      detail: "已有剧本，还没有同版本审核报告。资产和分镜保持锁定。",
    };
  }
  if (input.scriptVersion !== input.auditVersion) {
    return {
      status: "阻断" as const,
      gateOpen: false,
      detail: `审核是 v${input.auditVersion}，剧本是 v${input.scriptVersion}，版本没有对齐。`,
    };
  }
  const findings = parseFindings(input.auditText);
  const openP0 = findings.some((item) => item.level === "P0" && item.open);
  const openP1 = findings.some((item) => item.level === "P1" && item.open);
  if (openP0 || openP1) {
    const levels = [openP0 ? "P0" : null, openP1 ? "P1" : null].filter(Boolean).join(" / ");
    return {
      status: "阻断" as const,
      gateOpen: false,
      detail: `未解决的 ${levels} 还在。资产、分镜、提示词和生成保持锁定。`,
    };
  }
  const blocks = sectionBlocks(input.auditText);
  const p0Known = blocks?.has("P0") || clearedLine(input.auditText, "P0");
  const p1Known = blocks?.has("P1") || clearedLine(input.auditText, "P1");
  if (!p0Known || !p1Known) {
    return {
      status: "待审核" as const,
      gateOpen: false,
      detail: "有审核报告，但没有写明未解决的 P0 / P1 是否已清空。",
    };
  }
  return {
    status: "已通过" as const,
    gateOpen: true,
    detail: `v${input.auditVersion} 与剧本对齐，未解决的 P0 / P1 都是无。`,
  };
}
