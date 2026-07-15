import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from "docx";
import type {
  ExportScriptBlock,
  ProductionExportInput,
  ScriptBlockKind
} from "./types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function exportScriptMarkdown(blocks: ExportScriptBlock[]): string {
  return blocks.map((block) => {
    if (block.kind === "scene-heading") return `## ${block.text}`;
    if (block.kind === "character") return `**${block.text}**`;
    if (block.kind === "parenthetical") return `_${block.text}_`;
    if (block.kind === "transition") return `> ${block.text}`;
    return block.text;
  }).join("\n\n");
}

export function exportScriptFountain(blocks: ExportScriptBlock[]): string {
  return blocks.map((block) => {
    if (block.kind === "scene-heading") return `.${block.text}`;
    if (block.kind === "character") return block.text.toUpperCase();
    if (block.kind === "transition") return `> ${block.text}`;
    return block.text;
  }).join("\n\n");
}

function scriptParagraph(block: ExportScriptBlock): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: block.text, bold: block.kind === "scene-heading" || block.kind === "character" })],
    spacing: { after: block.kind === "dialogue" ? 80 : 180 },
    ...(block.kind === "scene-heading" ? { heading: HeadingLevel.HEADING_2 } : {}),
    ...(block.kind === "character" ? { alignment: AlignmentType.CENTER } : {}),
    ...(block.kind === "dialogue" || block.kind === "parenthetical"
      ? { indent: { left: 1700, right: 1700 } }
      : {})
  });
}

export async function exportScriptDocx(blocks: ExportScriptBlock[], title: string): Promise<Buffer> {
  const document = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
        ...blocks.map(scriptParagraph)
      ]
    }]
  });
  return Buffer.from(await Packer.toBuffer(document));
}

export function exportShotListCsv(input: ProductionExportInput): string {
  const header = ["scene_id", "scene_title", "shot_id", "order", "size", "camera", "lens", "action", "performance", "duration_seconds", "cut_reason", "source_text", "prompt_envelopes"];
  const envelopeIdsByShot = new Map<string, string[]>();
  for (const envelope of input.envelopes) {
    for (const shotId of envelope.shotRowIds) {
      const ids = envelopeIdsByShot.get(shotId) ?? [];
      ids.push(envelope.id);
      envelopeIdsByShot.set(shotId, ids);
    }
  }
  const rows = input.shots.map((shot) => [
    shot.sceneId,
    input.sceneTitles[shot.sceneId] ?? shot.sceneId,
    shot.id,
    shot.ordinal,
    shot.size,
    shot.camera,
    shot.lens,
    shot.action,
    shot.performance,
    shot.durationSeconds,
    shot.cutReason,
    shot.sourceText,
    (envelopeIdsByShot.get(shot.id) ?? []).join("|")
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function exportPromptEnvelopeCsv(input: ProductionExportInput): string {
  const header = ["scene_id", "scene_title", "envelope_id", "order", "target_model", "duration_seconds", "shot_row_ids", "asset_paths", "prompt_zh"];
  const rows = input.envelopes.map((envelope) => [
    envelope.sceneId,
    input.sceneTitles[envelope.sceneId] ?? envelope.sceneId,
    envelope.id,
    envelope.ordinal,
    envelope.targetModel,
    envelope.durationSeconds,
    envelope.shotRowIds.join("|"),
    (envelope.assetPaths ?? []).join("|"),
    envelope.promptZh
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function exportProductionJson(input: ProductionExportInput): string {
  return JSON.stringify({ schemaVersion: 1, ...input }, null, 2);
}

function renderShotRows(input: ProductionExportInput, sceneId: string): string {
  const envelopes = input.envelopes.filter((item) => item.sceneId === sceneId);
  const envelopeIdsByShot = new Map<string, string[]>();
  for (const envelope of envelopes) {
    for (const shotId of envelope.shotRowIds) {
      envelopeIdsByShot.set(shotId, [...(envelopeIdsByShot.get(shotId) ?? []), envelope.id]);
    }
  }
  return input.shots.filter((shot) => shot.sceneId === sceneId).map((shot) => `
    <tr id="${escapeHtml(shot.id)}">
      <td><strong>${escapeHtml(shot.id)}</strong><small>${shot.ordinal}</small></td>
      <td>${escapeHtml(shot.size)}<small>${escapeHtml([shot.camera, shot.lens].filter(Boolean).join(" · "))}</small></td>
      <td>${escapeHtml(shot.action)}${shot.performance ? `<small>表演：${escapeHtml(shot.performance)}</small>` : ""}</td>
      <td>${shot.durationSeconds ?? "—"}s<small>${escapeHtml(shot.cutReason)}</small></td>
      <td>${(envelopeIdsByShot.get(shot.id) ?? []).map((id) => `<a href="#${escapeHtml(id)}">${escapeHtml(id)}</a>`).join(" ")}</td>
      <td>${escapeHtml(shot.sourceText ?? "")}</td>
    </tr>`).join("");
}

function renderEnvelopes(input: ProductionExportInput, sceneId: string): string {
  return input.envelopes.filter((item) => item.sceneId === sceneId).map((envelope) => `
    <article class="envelope" id="${escapeHtml(envelope.id)}">
      <header><strong>${escapeHtml(envelope.id)}</strong><span>${escapeHtml(envelope.targetModel)} · ${envelope.durationSeconds ?? "—"}s</span></header>
      <p class="mapping">Shot Row：${envelope.shotRowIds.map((id) => `<a href="#${escapeHtml(id)}">${escapeHtml(id)}</a>`).join(" → ")}</p>
      <pre>${escapeHtml(envelope.promptZh)}</pre>
      ${(envelope.assetPaths ?? []).length ? `<p class="assets">资产：${envelope.assetPaths?.map(escapeHtml).join(" · ")}</p>` : ""}
    </article>`).join("");
}

export function exportProductionHtml(input: ProductionExportInput): string {
  const sceneIds = [...new Set([...input.shots.map((item) => item.sceneId), ...input.envelopes.map((item) => item.sceneId)])];
  const scenes = sceneIds.map((sceneId) => `
    <section class="scene" id="${escapeHtml(sceneId)}">
      <h2>${escapeHtml(sceneId)} · ${escapeHtml(input.sceneTitles[sceneId] ?? "未命名场景")}</h2>
      <h3>Shot Rows</h3>
      <div class="table-wrap"><table><thead><tr><th>ID</th><th>镜头</th><th>动作与表演</th><th>节奏</th><th>Prompt</th><th>原文</th></tr></thead><tbody>${renderShotRows(input, sceneId)}</tbody></table></div>
      <h3>Prompt Envelopes</h3>
      <div class="envelopes">${renderEnvelopes(input, sceneId)}</div>
    </section>`).join("");

  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(input.projectName)} · 分镜生产表</title>
<style>
:root{color-scheme:light;--ink:#1e2525;--muted:#697170;--line:#d8dcd8;--paper:#f4f2eb;--card:#fff;--accent:#b64d34}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Noto Sans CJK SC",sans-serif;line-height:1.55}main{max-width:1440px;margin:auto;padding:40px}h1{font-size:32px;margin:0 0 4px}h2{margin-top:48px;padding-top:24px;border-top:1px solid var(--line)}h3{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}.meta{color:var(--muted)}.table-wrap{overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:10px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}th{background:#ecebe5;color:var(--muted);position:sticky;top:0}td small{display:block;color:var(--muted);margin-top:5px}a{color:var(--accent);text-decoration:none}.envelopes{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:14px}.envelope{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px}.envelope header{display:flex;justify-content:space-between;gap:16px}.envelope header span,.mapping,.assets{color:var(--muted);font-size:12px}.envelope pre{white-space:pre-wrap;font:13px/1.65 inherit;background:#f4f3ef;padding:14px;border-radius:7px}@media print{body{background:white}main{max-width:none;padding:0}.scene{break-before:page}.scene:first-of-type{break-before:auto}.envelope,.table-wrap{break-inside:avoid}}
</style></head><body><main><header><h1>${escapeHtml(input.projectName)}</h1><p class="meta">版本 ${escapeHtml(input.version)} · 导出于 ${escapeHtml(input.exportedAt)}</p></header>${scenes}</main></body></html>`;
}

export const MIME_BY_EXPORT = {
  markdown: "text/markdown;charset=utf-8",
  fountain: "text/plain;charset=utf-8",
  html: "text/html;charset=utf-8",
  csv: "text/csv;charset=utf-8",
  json: "application/json;charset=utf-8",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
} as const;

export function acceptsScriptBlockKind(value: string): value is ScriptBlockKind {
  return ["title", "scene-heading", "action", "character", "parenthetical", "dialogue", "transition", "note"].includes(value);
}
