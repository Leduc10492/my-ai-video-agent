import type { ProjectBundle } from "@ai-director/storage";
import {
  exportProductionHtml,
  exportProductionJson,
  exportPromptEnvelopeCsv,
  exportScriptDocx,
  exportScriptFountain,
  exportScriptMarkdown,
  exportShotListCsv,
  type ExportScriptBlock,
  type ProductionExportInput
} from "@ai-director/import-export";

export interface ExportPayload {
  data: string | Buffer;
  defaultName: string;
  filters: Array<{ name: string; extensions: string[] }>;
}

function safeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "AI-Director-Project";
}

export function toProductionExport(bundle: ProjectBundle): ProductionExportInput {
  const scriptText = new Map(bundle.scriptBlocks.map((block) => [block.id, block.text]));
  const referencePathsByAsset = new Map<string, string[]>();
  for (const reference of bundle.references) {
    referencePathsByAsset.set(reference.assetId, [...(referencePathsByAsset.get(reference.assetId) ?? []), reference.filePath]);
  }
  return {
    projectName: bundle.project.name,
    version: bundle.project.currentRevisionId ?? "working",
    exportedAt: new Date().toISOString(),
    sceneTitles: Object.fromEntries(bundle.scenes.map((scene) => [scene.id, `${scene.sceneNumber} ${scene.heading}`])),
    shots: bundle.shotRows.map((shot) => ({
      id: shot.shotNumber || shot.id,
      sceneId: shot.sceneId,
      ordinal: shot.ordinal,
      size: shot.framing,
      camera: [shot.cameraPosition, shot.cameraMovement].filter(Boolean).join(" · "),
      lens: shot.lens,
      action: [shot.action, shot.blocking].filter(Boolean).join("；"),
      performance: shot.performance,
      durationSeconds: shot.durationSeconds,
      cutReason: shot.cutReason,
      sourceText: shot.sourceScriptBlockIds.map((id) => scriptText.get(id)).filter(Boolean).join("\n")
    })),
    envelopes: bundle.promptEnvelopes.map((envelope) => ({
      id: envelope.envelopeNumber || envelope.id,
      sceneId: envelope.sceneId,
      ordinal: envelope.ordinal,
      targetModel: envelope.targetModel,
      durationSeconds: envelope.durationSeconds,
      promptZh: envelope.promptZh,
      shotRowIds: bundle.links
        .filter((link) => link.promptEnvelopeId === envelope.id)
        .sort((a, b) => a.orderInEnvelope - b.orderInEnvelope)
        .map((link) => bundle.shotRows.find((shot) => shot.id === link.shotRowId)?.shotNumber ?? link.shotRowId),
      assetPaths: envelope.assetIds.flatMap((assetId) => referencePathsByAsset.get(assetId) ?? [])
    }))
  };
}

export function toScriptBlocks(bundle: ProjectBundle): ExportScriptBlock[] {
  const kindMap: Record<string, ExportScriptBlock["kind"]> = {
    scene_heading: "scene-heading",
    action: "action",
    character: "character",
    dialogue: "dialogue",
    parenthetical: "parenthetical",
    transition: "transition",
    note: "note"
  };
  return [...bundle.scriptBlocks]
    .sort((a, b) => {
      const sceneA = bundle.scenes.find((scene) => scene.id === a.sceneId)?.ordinal ?? Number.MAX_SAFE_INTEGER;
      const sceneB = bundle.scenes.find((scene) => scene.id === b.sceneId)?.ordinal ?? Number.MAX_SAFE_INTEGER;
      return sceneA - sceneB || a.ordinal - b.ordinal;
    })
    .map((block) => ({ kind: kindMap[block.kind] ?? "note", text: block.text }));
}

export async function createExportPayload(
  kind: "markdown" | "html" | "fountain" | "docx" | "shot-csv" | "prompt-csv" | "json",
  bundle: ProjectBundle
): Promise<ExportPayload> {
  const base = safeFileName(bundle.project.name);
  const production = toProductionExport(bundle);
  const script = toScriptBlocks(bundle);
  switch (kind) {
    case "markdown":
      return { data: exportScriptMarkdown(script), defaultName: `${base}-剧本.md`, filters: [{ name: "Markdown", extensions: ["md"] }] };
    case "fountain":
      return { data: exportScriptFountain(script), defaultName: `${base}.fountain`, filters: [{ name: "Fountain", extensions: ["fountain"] }] };
    case "docx":
      return { data: await exportScriptDocx(script, bundle.project.name), defaultName: `${base}-剧本.docx`, filters: [{ name: "Word", extensions: ["docx"] }] };
    case "html":
      return { data: exportProductionHtml(production), defaultName: `${base}-分镜生产表.html`, filters: [{ name: "HTML", extensions: ["html"] }] };
    case "shot-csv":
      return { data: exportShotListCsv(production), defaultName: `${base}-Shot-List.csv`, filters: [{ name: "CSV", extensions: ["csv"] }] };
    case "prompt-csv":
      return { data: exportPromptEnvelopeCsv(production), defaultName: `${base}-Prompt-Envelopes.csv`, filters: [{ name: "CSV", extensions: ["csv"] }] };
    case "json":
      return { data: exportProductionJson(production), defaultName: `${base}-Production.json`, filters: [{ name: "JSON", extensions: ["json"] }] };
  }
}

export function defaultPdfName(projectName: string): string {
  return `${safeFileName(projectName)}-分镜生产表.pdf`;
}

export function defaultProjectPackageName(projectName: string): string {
  return `${safeFileName(projectName)}-完整项目包.zip`;
}
