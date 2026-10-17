import type { DataSource } from "@/lib/source";

export type StageStatus = "未开始" | "进行中" | "已完成" | "已通过" | "阻断";

export type SlotRecord = {
  slot: string;
  skill: string;
  owner: string;
  output: string;
  canonicalOutputs: string[];
};

export type AgentBrief = {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  slots: string[];
  skills: string[];
};

export type AgentDocument = AgentBrief & {
  file: string;
  instructions: string;
};

export type SkillSummary = {
  name: string;
  description: string;
  slots: string[];
  referenceCount: number;
};

export type SkillReference = {
  path: string;
  title: string;
};

export type SkillDocument = SkillSummary & {
  body: string;
  references: SkillReference[];
};

export type StageView = {
  id: string;
  label: string;
  summary: string;
  slot: string;
  pluginSlot?: string;
  skill: string;
  pluginSkill?: string;
  owner: string;
  output: string;
  status: StageStatus;
  detail: string;
  evidence: string[];
};

export type Inventory = {
  files: string[];
  scriptVersion: number | null;
  scriptPath: string | null;
  scriptText: string | null;
  auditVersion: number | null;
  auditPath: string | null;
  auditText: string | null;
  assetGuides: string[];
  styleGuides: string[];
  breakdowns: string[];
  htmls: string[];
  qaReports: string[];
  sceneLabels: string[];
};

export type RouteContext = {
  source: DataSource;
  sourceLabel: string;
  slots: SlotRecord[];
  skillOutputs: Record<string, string[]>;
  agents: AgentBrief[];
  stages: StageView[];
  ruleLines: string[];
  files: string[];
};

export type GateLevel = "block" | "warn" | "info";

export type RouteGate = {
  level: GateLevel;
  title: string;
  text: string;
};

export type RouteResult = {
  matched: boolean;
  ruleId: string;
  stageId: string;
  stageLabel: string;
  slot: string;
  pluginSlot?: string;
  skill: string;
  pluginSkill?: string;
  owner: string;
  subAgentNote: string;
  sceneLabel?: string;
  sceneMention?: string;
  why: string;
  inputs: string[];
  registryOutput: string;
  outputPath: string;
  stageStatus?: StageStatus;
  stageDetail?: string;
  gates: RouteGate[];
  prompt: string;
  delegation: boolean;
  generation: boolean;
};
