/** The editor and the assistant share this model. Markdown stays the file contract. */
export const paragraphTypes = [
  { type: "scene", label: "场景", short: "SCENE" },
  { type: "action", label: "动作", short: "ACTION" },
  { type: "character", label: "角色", short: "CHAR" },
  { type: "dialogue", label: "对白", short: "DIAL" },
  { type: "parenthetical", label: "括注", short: "PAREN" },
  { type: "transition", label: "转场", short: "TRANS" },
  { type: "shot", label: "镜头", short: "SHOT" },
] as const;
export type ParagraphType = typeof paragraphTypes[number]["type"] | "section" | "raw";
export type ScriptBlock = {
  id: string;
  type: ParagraphType;
  text: string;
  level?: number;
  sceneId?: string | null;
  warning?: string | null;
};
export type ScriptDocument = { version: 1; blocks: ScriptBlock[] };
export type ScriptEdit = { id: string; replacement: { type: ParagraphType; text: string }[] };
export type EditProposal = { summary: string; edits: ScriptEdit[] };
export const allTypes: ParagraphType[] = [...paragraphTypes.map(p => p.type), "section", "raw"];
export const newBlockId = () => crypto.randomUUID();
export const isSceneHeading = (s: string) => /^(?:(?:\d+[A-Z]?[.)]?\s+)?(?:INT\.?\/?EXT\.?|EXT\.?\/?INT\.?|INT\.|EXT\.|I\/E\.)\s+|第\s*\d+[A-Z]?\s*场(?:\s|[·.、:：-])|场景[：:])/i.test(s);
const parenthetical = (s: string) => /^(?:（[^\n]*）|\([^\n]*\))$/.test(s);
const unescape = (s: string) => s.replace(/\\([\\*_`\[\]<>])/g, "$1");

export function stripArtifactHeader(source: string) {
  return source.replace(/^\uFEFF/, "").replace(/^# Artifact:[^\n]*\r?\n[\s\S]*?\r?\n---\r?\n(?:\r?\n)?/, "");
}

export function importMarkdown(source: string): ScriptDocument {
  const lines = stripArtifactHeader(source).replace(/\r\n?/g, "\n").split("\n");
  const blocks: ScriptBlock[] = [];
  let inScene = false;
  const add = (type: ParagraphType, text: string, extra: Partial<ScriptBlock> = {}) => {
    blocks.push({ id: newBlockId(), type, text, ...extra });
  };
  const labelTypes: Record<string, ParagraphType> = { 场景: "scene", 动作: "action", 角色: "character", 对白: "dialogue", 括注: "parenthetical", 转场: "transition", 镜头: "shot", 原文: "raw" };
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    // Keep code, front matter, tables, lists and non-script notes as editable text.
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence || (i === 0 && line === "---")) {
      const chunk = [line]; i++;
      const delimiter = fence?.[1] || "---";
      while (i < lines.length) {
        const next = lines[i++]; chunk.push(next);
        if (fence ? new RegExp(`^\\s*${delimiter[0]}{${delimiter.length},}\\s*$`).test(next) : next === delimiter) break;
      }
      add("raw", chunk.join("\n")); continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      let text = heading[2]; i++;
      while (i < lines.length && /^> ?/.test(lines[i])) text += "\n" + lines[i++].replace(/^> ?/, "");
      if (isSceneHeading(heading[2])) {
        inScene = true;
        add("scene", text.replace(/^场景[：:] ?/, ""), { level: heading[1].length });
      } else { inScene = false; add("section", text, { level: heading[1].length }); }
      continue;
    }
    if (isSceneHeading(line.trim())) { inScene = true; add("scene", line.trim()); i++; continue; }
    const explicit = line.match(/^\*\*(场景|动作|角色|对白|括注|转场|镜头|原文|章节（[1-6]级）)[：:]\*\* ?(.*)$/);
    if (explicit) {
      const sectionLevel = explicit[1].match(/^章节（([1-6])级）$/);
      const type = sectionLevel ? "section" : labelTypes[explicit[1]];
      let text = explicit[2]; i++;
      if (!text && /^> ?/.test(lines[i] || "")) {
        const continuation: string[] = [];
        while (i < lines.length && /^> ?/.test(lines[i])) continuation.push(lines[i++].replace(/^> ?/, ""));
        text = continuation.join("\n");
      }
      add(type, text, sectionLevel ? { level: Number(sectionLevel[1]) } : {});
      if (type === "scene") inScene = true;
      if (type === "section") inScene = false;
      continue;
    }
    const inlineCue = inScene && line.match(/^\*\*((?:\\.|[^*])+?)\*\*\s*([（(].*?[）)])?\s*[：:]\s*(.*)$/);
    if (inlineCue && !/^(字幕|片名|屏幕|短信|音效|音乐)$/.test(inlineCue[1])) {
      add("character", unescape(inlineCue[1]));
      if (inlineCue[2]) add("parenthetical", inlineCue[2]);
      if (inlineCue[3]) add("dialogue", inlineCue[3]);
      i++;
      // A source dialogue can contain an intervening parenthetical on the next line.
      while (i < lines.length && lines[i].trim() && !/^\*\*|^#{1,6}\s|^>/.test(lines[i])) {
        add(parenthetical(lines[i]) ? "parenthetical" : "dialogue", lines[i++]);
      }
      continue;
    }
    const cue = inScene && line.match(/^\*\*((?:\\.|[^*])+?)\*\*$/);
    if (cue && cue[1].length <= 40 && !/[。！？!?：:]$/.test(cue[1])) {
      add("character", unescape(cue[1])); i++; continue;
    }
    if (/^> ?/.test(line)) {
      const chunk: string[] = [];
      while (i < lines.length && /^> ?/.test(lines[i])) chunk.push(lines[i++].replace(/^> ?/, ""));
      const previous = blocks.at(-1)?.type;
      if (inScene && ["character", "parenthetical", "dialogue"].includes(previous || "")) {
        let dialogue: string[] = [];
        const flush = () => { if (dialogue.length) { add("dialogue", dialogue.join("\n")); dialogue = []; } };
        for (const value of chunk) {
          if (parenthetical(value)) { flush(); add("parenthetical", value); }
          else dialogue.push(value);
        }
        flush();
      } else add("raw", chunk.map(s => "> " + s).join("\n"), inScene ? { warning: "引用可能是屏幕文字或对白，保留原文；需要时用底部按钮指定类型。" } : {});
      continue;
    }
    if (inScene && parenthetical(line) && ["character", "dialogue"].includes(blocks.at(-1)?.type || "")) {
      add("parenthetical", line); i++; continue;
    }
    const chunk = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^#{1,6}\s|^>|^\*\*[^*]+\*\*(?:\s*[（(].*?[）)])?\s*[：:]|^\*\*[^*]+\*\*$/.test(lines[i]) && !isSceneHeading(lines[i])) chunk.push(lines[i++]);
    const raw = !inScene || /^\s*(?:\||[-*+]\s|\d+\.\s|---+$|<!--)/.test(line);
    add(raw ? "raw" : "action", chunk.join("\n"));
  }
  return { version: 1, blocks: blocks.length ? blocks : [{ id: newBlockId(), type: "action", text: "" }] };
}

export function exportMarkdown(document: ScriptDocument) {
  let inScene = false, previous: ParagraphType | undefined;
  const labeled = (label: string, text: string) => text.includes("\n") || !text.trim()
    ? `**${label}：**\n${text.split("\n").map(s => "> " + s).join("\n")}`
    : `**${label}：** ${text}`;
  return document.blocks.map(b => {
    const level = "#".repeat(Math.max(1, Math.min(6, b.level || 3)));
    const context = inScene ? `### 场景：_\n\n${["character", "dialogue", "parenthetical"].includes(previous || "") ? "**角色：** _\n\n" : ""}` : "";
    previous = b.type;
    switch (b.type) {
      case "scene": {
        inScene = true;
        const [first, ...rest] = b.text.split("\n");
        return `${level} ${isSceneHeading(first) && !/^场景[：:]/.test(first) ? first : "场景：" + first}${rest.map(s => "\n> " + s).join("")}`;
      }
      case "section": inScene = false; return !b.text.split("\n")[0].trim() || isSceneHeading(b.text)
        ? labeled(`章节（${level.length}级）`, b.text) : `${level} ${b.text.split("\n").join("\n> ")}`;
      case "character": return labeled("角色", b.text);
      case "dialogue": return labeled("对白", b.text);
      case "parenthetical": return labeled("括注", b.text);
      case "transition": return labeled("转场", b.text);
      case "shot": return labeled("镜头", b.text);
      case "raw":
      case "action": {
        // Explicit only when plain Markdown could change the paragraph's meaning.
        const skip = context ? importMarkdown(context).blocks.length : 0;
        const probe = importMarkdown(context + b.text).blocks.slice(skip);
        return b.text && probe.length === 1 && probe[0].type === b.type && probe[0].text === b.text ? b.text : labeled(b.type === "action" ? "动作" : "原文", b.text);
      }
    }
  }).join("\n\n") + "\n";
}

export function validateDocument(value: unknown): asserts value is ScriptDocument {
  const d = value as ScriptDocument;
  if (d?.version !== 1 || !Array.isArray(d.blocks) || !d.blocks.length || d.blocks.length > 15000) throw new Error("剧本段落数据无效");
  const ids = new Set(); let size = 0;
  for (const b of d.blocks) {
    if (!b || typeof b.id !== "string" || !b.id || ids.has(b.id) || !allTypes.includes(b.type) || typeof b.text !== "string") throw new Error("段落类型、文字或标识无效");
    if (b.level !== undefined && (!Number.isInteger(b.level) || b.level < 1 || b.level > 6)) throw new Error("标题级别无效");
    size += b.text.length; ids.add(b.id);
  }
  if (size > 500000) throw new Error("请分集编辑，单份剧本最多 50 万字符");
}

export function applyProposal(current: ScriptDocument, baseline: ScriptDocument, proposal: EditProposal): ScriptDocument {
  validateDocument(current); validateDocument(baseline);
  if (!proposal || typeof proposal.summary !== "string" || !Array.isArray(proposal.edits)) throw new Error("AI 未返回有效修改");
  const changes = new Map<string, ScriptEdit>();
  for (const edit of proposal.edits) {
    const before = baseline.blocks.find(b => b.id === edit.id), now = current.blocks.find(b => b.id === edit.id);
    if (!before || !now || changes.has(edit.id)) throw new Error("修改对应的段落不存在或重复，请重新发起修改");
    if (JSON.stringify([before.text, before.type, before.level]) !== JSON.stringify([now.text, now.type, now.level])) throw new Error("这段文字在发送后已被手动修改，请重新发送要求；你的手改已保留。");
    if (!Array.isArray(edit.replacement) || edit.replacement.some(b => !allTypes.includes(b.type) || typeof b.text !== "string")) throw new Error("AI 返回的段落类型无效");
    changes.set(edit.id, edit);
  }
  const blocks = current.blocks.flatMap(b => {
    const edit = changes.get(b.id);
    if (!edit) return [b];
    return edit.replacement.map((r, i) => ({ ...b, ...r, id: i === 0 ? b.id : newBlockId(), sceneId: i === 0 && r.type === "scene" ? b.sceneId : null, warning: null }));
  });
  const result: ScriptDocument = { version: 1, blocks: blocks.length ? blocks : [{ id: newBlockId(), type: "action", text: "" }] };
  validateDocument(result); return result;
}
