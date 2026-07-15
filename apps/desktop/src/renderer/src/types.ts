import type { RuntimeModel } from "../../shared/ipc";

export type Stage =
  | "script"
  | "assets"
  | "breakdown"
  | "storyboard"
  | "qa"
  | "tasks"
  | "skills";

export type ProjectStatus = "制作中" | "待审阅" | "已归档";

export interface ProjectSummary {
  id: string;
  title: string;
  subtitle: string;
  status: ProjectStatus;
  progress: number;
  updatedAt: string;
  sceneCount: number;
  cover?: string;
}

export interface ScriptBlock {
  id: string;
  type: "scene-heading" | "action" | "character" | "dialogue";
  label: string;
  content: string;
}

export interface AssetItem {
  id: string;
  type: "角色" | "地点" | "道具" | "风格";
  name: string;
  meta: string;
  status: "已批准" | "草稿" | "待补充";
  image?: string;
  usage: string;
}

export interface BreakdownProposal {
  id: string;
  selected: boolean;
  type: "幕" | "戏" | "场";
  title: string;
  range: string;
  confidence: number;
  note: string;
}

export interface ShotRow {
  id: string;
  entityId?: string;
  sceneId: string;
  size: string;
  camera: string;
  action: string;
  performance: string;
  duration: number;
  cutReason: string;
}

export interface PromptEnvelope {
  id: string;
  entityId?: string;
  sceneId?: string;
  name: string;
  shotIds: string[];
  model: string;
  duration: number;
  prompt: string;
  status: "就绪" | "需检查" | "草稿";
}

export interface TaskItem {
  id: string;
  title: string;
  owner: string;
  priority: "P0" | "P1" | "P2" | "P3";
  due: string;
  scene: string;
  relatedType?: string;
  status: "待处理" | "进行中" | "待审阅" | "已完成";
}

export interface QaFinding {
  id: string;
  priority: "P0" | "P1" | "P2" | "P3";
  title: string;
  detail: string;
  scope: string;
  status: "未处理" | "已修复" | "已忽略";
}

export interface SkillItem {
  id: string;
  name: string;
  version: string;
  slot: string;
  slots: string[];
  source: "核心" | "用户副本" | "本地导入";
  enabled: boolean;
  contentHash?: string;
  capabilities: string[];
  description: string;
}

export interface AgentCandidate {
  title: string;
  summary: string;
  operationCount: number;
}

export interface HierarchyNode {
  id: string;
  label: string;
  meta: string;
  kind?: "episode" | "act" | "sequence" | "scene";
  children?: HierarchyNode[];
}

export interface DraftImageItem {
  id: string;
  url?: string;
  label: string;
  promptEnvelopeId?: string;
}

export interface WorkspaceSnapshot {
  scriptBlocks: ScriptBlock[];
  assets: AssetItem[];
  shots: ShotRow[];
  envelopes: PromptEnvelope[];
  tasks: TaskItem[];
  qaFindings: QaFinding[];
  hierarchy: HierarchyNode[];
  draftImages: DraftImageItem[];
  staleItems: Array<{
    entityType: string;
    entityId: string;
    sourceEntityType?: string;
    sourceEntityId?: string;
    reason: string;
  }>;
  skillBindings: Array<{ slot: string; skillId: string; version: string; contentHash?: string }>;
}

export interface ImportPreview {
  importToken: string;
  sourceName: string;
  format: string;
  blocks: Array<{ id: string; kind: string; text: string }>;
  sceneProposals: Array<{
    id: string;
    ordinal: number;
    heading: string;
    blockIds: string[];
    confidence: number;
    warnings: string[];
  }>;
  warnings: Array<{ code: string; message: string; blocking: boolean }>;
}

export interface RuntimeHealth {
  codex: {
    installed: boolean;
    version?: string;
    loggedIn: boolean;
    accountLabel?: string;
    defaultModel: string;
    defaultEffort: "low" | "medium" | "high" | "xhigh";
    message?: string;
  };
  apiKey: {
    configured: boolean;
    lastTestedAt?: string;
    status: "not-configured" | "ready" | "invalid" | "unchecked";
    message?: string;
  };
}

export interface AgentRuntimePreference {
  provider: "local-codex" | "openai-key";
  model: RuntimeModel;
  effort: "low" | "medium" | "high" | "xhigh";
}

export interface AgentEvent {
  runId: string;
  kind: "queued" | "started" | "progress" | "draft" | "completed" | "failed" | "cancelled" | "interrupted";
  timestamp: string;
  message: string;
  progress?: number;
  payload?: unknown;
}
