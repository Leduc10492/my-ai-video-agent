export type ShotRow = {
  id: string;
  scene: string;
  scale: string;
  action: string;
  line: string;
  reason: string;
  envelope: string;
};

export type Envelope = {
  id: string;
  shots: string[];
  seconds: number;
  checklist: string[];
  prompt: string;
};

export function parseBreakdown(text: string, scene: string): ShotRow[] {
  const rows: ShotRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("|") || line.includes("---")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 6 || cells[0] === "镜头行") continue;
    const [id, scale, action, dialogue, reason, envelope] = cells;
    if (!/^SR\d+/.test(id)) continue;
    rows.push({ id, scene, scale, action, line: dialogue, reason, envelope });
  }
  return rows;
}

export function parsePrompts(text: string): Envelope[] {
  return text
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [title, ...rest] = chunk.split(/\r?\n/);
      const body = rest.join("\n");
      const shots = (body.match(/镜头行:\s*(.+)/)?.[1] ?? "")
        .split(/[,、]\s*/)
        .map((item) => item.trim())
        .filter(Boolean);
      const seconds = Number(body.match(/秒数:\s*(\d+)/)?.[1] ?? 0);
      const checklist = (body.match(/核对:\s*(.+)/)?.[1] ?? "")
        .split(/[；;]/)
        .map((item) => item.trim())
        .filter(Boolean);
      const prompt = body.split(/提示词:\s*/)[1]?.trim() ?? "";
      return { id: title.trim(), shots, seconds, checklist, prompt };
    })
    .filter((item) => item.id.startsWith("ENV-"));
}

export function shotColumn(shot: ShotRow, envelopes: Envelope[]) {
  const envelope = envelopes.find((item) => item.id === shot.envelope);
  if (envelope?.prompt) return "提示词包" as const;
  return "事实" as const;
}
