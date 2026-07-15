export type ScriptSourceFormat =
  | "text"
  | "markdown"
  | "fountain"
  | "fdx"
  | "docx"
  | "pdf";

export type ScriptBlockKind =
  | "title"
  | "scene-heading"
  | "action"
  | "character"
  | "parenthetical"
  | "dialogue"
  | "transition"
  | "note";

export interface ImportedScriptBlock {
  id: string;
  kind: ScriptBlockKind;
  text: string;
  sourceLineStart: number;
  sourceLineEnd: number;
}

export interface ImportedSceneProposal {
  id: string;
  ordinal: number;
  heading: string;
  blockIds: string[];
  confidence: number;
  warnings: string[];
}

export interface ImportWarning {
  code:
    | "OCR_REQUIRED"
    | "NO_SCENE_HEADINGS"
    | "UNSUPPORTED_STYLE"
    | "LOSSY_IMPORT"
    | "EMPTY_SOURCE";
  message: string;
  blocking: boolean;
}

export interface ScriptImportResult {
  format: ScriptSourceFormat;
  sourceName: string;
  sourceHash: string;
  rawText: string;
  blocks: ImportedScriptBlock[];
  sceneProposals: ImportedSceneProposal[];
  warnings: ImportWarning[];
  metadata: Record<string, string | number | boolean>;
}

export interface ExportScriptBlock {
  kind: ScriptBlockKind;
  text: string;
}

export interface ExportShotRow {
  id: string;
  sceneId: string;
  ordinal: number;
  size: string;
  camera: string;
  lens?: string;
  action: string;
  performance?: string;
  durationSeconds?: number;
  cutReason: string;
  sourceText?: string;
}

export interface ExportPromptEnvelope {
  id: string;
  sceneId: string;
  ordinal: number;
  targetModel: string;
  durationSeconds?: number;
  promptZh: string;
  shotRowIds: string[];
  assetPaths?: string[];
}

export interface ProductionExportInput {
  projectName: string;
  version: string;
  exportedAt: string;
  sceneTitles: Record<string, string>;
  shots: ExportShotRow[];
  envelopes: ExportPromptEnvelope[];
}
