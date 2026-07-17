import { createHash } from "node:crypto";
import { extname } from "node:path";
import { XMLParser } from "fast-xml-parser";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import type {
  ImportedSceneProposal,
  ImportedScriptBlock,
  ImportWarning,
  ScriptBlockKind,
  ScriptImportResult,
  ScriptSourceFormat
} from "./types";

const SCENE_HEADING = /^(?:\.?\s*)?(?:INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|INT\.?(?=[\s·:：—-]|$)|EXT\.?(?=[\s·:：—-]|$)|内\/外景|外\/内景|内外景|内景|外景|INTERCUT\b|场景\s*[:：])/i;
const SCENE_NUMBER_PREFIX = /^(?:(?:(?:SCENE|场景)\s*)?(?:第\s*)?\d+[A-Z]?(?:\s*[-.]\s*\d+[A-Z]?)*(?:\s*场)?\s*(?:[.)、:：-]\s*)?)/i;
const TRANSITION = /^(?:CUT TO:|FADE (?:IN|OUT):|DISSOLVE TO:|MATCH CUT TO:|切至[:：]?|淡入[:：]?|淡出[:：]?)$/i;
const PARENTHETICAL = /^(?:\(.+\)|（.+）)$/;

export function normalizeSceneHeading(value: string): string {
  const text = value.trim();
  if (SCENE_HEADING.test(text)) return text;
  const withoutSceneNumber = text.replace(SCENE_NUMBER_PREFIX, "").trim();
  return SCENE_HEADING.test(withoutSceneNumber) ? withoutSceneNumber : text;
}

function looksLikeSceneHeading(value: string): boolean {
  return SCENE_HEADING.test(normalizeSceneHeading(value));
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function blockId(kind: ScriptBlockKind, text: string, index: number): string {
  return `blk_${sha256(`${kind}:${index}:${text}`).slice(0, 12)}`;
}

function normalizeText(text: string): string {
  return text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").normalize("NFC");
}

function looksLikeCharacterCue(value: string, next: string | undefined): boolean {
  const text = value.trim();
  if (!next?.trim() || text.length < 1 || text.length > 24 || looksLikeSceneHeading(text)) return false;
  if (/[。！？!?，,：:；;]/.test(text)) return false;
  if (/^[A-Z][A-Z0-9 ._'\-()]{1,23}$/.test(text)) return true;
  return /^[\p{Script=Han}A-Za-z·・ ]{1,12}(?:\s*[（(][^）)]{1,8}[）)])?$/u.test(text);
}

function classifyLines(text: string, format: ScriptSourceFormat): ImportedScriptBlock[] {
  const lines = normalizeText(text).split("\n");
  const blocks: ImportedScriptBlock[] = [];
  let pendingDialogue = false;

  for (let index = 0; index < lines.length; index += 1) {
    const source = lines[index] ?? "";
    let value = source.trim();
    if (!value) {
      pendingDialogue = false;
      continue;
    }

    if (format === "markdown") value = value.replace(/^#{1,6}\s+/, "");
    if (format === "fountain" && value.startsWith(".") && !value.startsWith("..")) {
      value = value.slice(1).trim();
    }

    let kind: ScriptBlockKind = "action";
    if (looksLikeSceneHeading(value)) kind = "scene-heading";
    else if (TRANSITION.test(value) || (format === "fountain" && value.startsWith(">") && value.endsWith("<"))) {
      kind = "transition";
      value = value.replace(/^>|<$/g, "").trim();
    } else if (PARENTHETICAL.test(value) && pendingDialogue) kind = "parenthetical";
    else if (looksLikeCharacterCue(value, lines[index + 1])) kind = "character";
    else if (pendingDialogue) kind = "dialogue";
    else if (format === "fountain" && /^[A-Za-z][A-Za-z -]+:\s*.+$/.test(value) && blocks.length < 8) kind = "title";

    blocks.push({
      id: blockId(kind, value, index),
      kind,
      text: value,
      sourceLineStart: index + 1,
      sourceLineEnd: index + 1
    });
    pendingDialogue = kind === "character" || kind === "parenthetical" || kind === "dialogue";
  }
  return blocks;
}

function textFromFdxNode(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(textFromFdxNode).join("");
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("#text" in record) return textFromFdxNode(record["#text"]);
    if ("Text" in record) return textFromFdxNode(record.Text);
  }
  return "";
}

function parseFdx(xml: string): ImportedScriptBlock[] {
  const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: false });
  const parsed = parser.parse(xml) as Record<string, any>;
  const content = parsed?.FinalDraft?.Content?.Paragraph ?? parsed?.FinalDraft?.Content ?? [];
  const paragraphs = Array.isArray(content) ? content : [content];
  const typeMap: Record<string, ScriptBlockKind> = {
    "Scene Heading": "scene-heading",
    Action: "action",
    Character: "character",
    Parenthetical: "parenthetical",
    Dialogue: "dialogue",
    Transition: "transition",
    General: "action",
    Shot: "action"
  };
  return paragraphs.flatMap((paragraph: any, index: number) => {
    const text = textFromFdxNode(paragraph?.Text ?? paragraph).trim();
    if (!text) return [];
    const sourceType = String(paragraph?.["@_Type"] ?? "General");
    const kind = typeMap[sourceType] ?? "note";
    return [{
      id: blockId(kind, text, index),
      kind,
      text,
      sourceLineStart: index + 1,
      sourceLineEnd: index + 1
    } satisfies ImportedScriptBlock];
  });
}

function proposeScenes(blocks: ImportedScriptBlock[]): ImportedSceneProposal[] {
  const scenes: ImportedSceneProposal[] = [];
  let current: ImportedSceneProposal | undefined;
  for (const block of blocks) {
    if (block.kind === "scene-heading") {
      current = {
        id: `scene_proposal_${String(scenes.length + 1).padStart(3, "0")}`,
        ordinal: scenes.length,
        heading: normalizeSceneHeading(block.text),
        blockIds: [block.id],
        confidence: looksLikeSceneHeading(block.text) ? 0.96 : 0.72,
        warnings: []
      };
      scenes.push(current);
    } else if (current) {
      current.blockIds.push(block.id);
    }
  }
  return scenes;
}

function inferFormat(sourceName: string, requested?: ScriptSourceFormat): ScriptSourceFormat {
  if (requested) return requested;
  const extension = extname(sourceName).toLowerCase();
  const mapping: Record<string, ScriptSourceFormat> = {
    ".txt": "text",
    ".md": "markdown",
    ".markdown": "markdown",
    ".fountain": "fountain",
    ".fdx": "fdx",
    ".docx": "docx",
    ".pdf": "pdf"
  };
  return mapping[extension] ?? "text";
}

export async function importScriptBuffer(
  sourceName: string,
  buffer: Buffer,
  requestedFormat?: ScriptSourceFormat
): Promise<ScriptImportResult> {
  const format = inferFormat(sourceName, requestedFormat);
  const warnings: ImportWarning[] = [];
  let rawText = "";
  let blocks: ImportedScriptBlock[] = [];
  const metadata: Record<string, string | number | boolean> = {};

  if (format === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    rawText = normalizeText(result.value);
    metadata.converterMessages = result.messages.length;
    if (result.messages.length) {
      warnings.push({ code: "LOSSY_IMPORT", message: "DOCX 中的部分排版无法映射为剧本语义块，请检查导入预览。", blocking: false });
    }
    blocks = classifyLines(rawText, format);
  } else if (format === "pdf") {
    const result = await pdf(buffer);
    rawText = normalizeText(result.text);
    metadata.pageCount = result.numpages;
    const visibleCharacters = rawText.replace(/\s/g, "").length;
    if (visibleCharacters < Math.max(80, result.numpages * 35)) {
      warnings.push({
        code: "OCR_REQUIRED",
        message: "PDF 文本层过少，可能是扫描件。请先进行 OCR，再确认结构。",
        blocking: true
      });
    }
    blocks = classifyLines(rawText, format);
  } else {
    rawText = normalizeText(buffer.toString("utf8"));
    blocks = format === "fdx" ? parseFdx(rawText) : classifyLines(rawText, format);
  }

  if (!rawText.trim()) warnings.push({ code: "EMPTY_SOURCE", message: "文件中没有可导入的文本。", blocking: true });
  const sceneProposals = proposeScenes(blocks);
  if (!sceneProposals.length && rawText.trim()) {
    warnings.push({
      code: "NO_SCENE_HEADINGS",
      message: "未识别到明确的场景标题。原文已保留，请将场景标题调整为 INT./EXT./内景/外景等格式后重新导入。",
      blocking: false
    });
  }

  return {
    format,
    sourceName,
    sourceHash: sha256(buffer),
    rawText,
    blocks,
    sceneProposals,
    warnings,
    metadata
  };
}

export function importPastedScript(text: string, sourceName = "粘贴的剧本.txt"): Promise<ScriptImportResult> {
  return importScriptBuffer(sourceName, Buffer.from(text, "utf8"), "text");
}
