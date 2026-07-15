import { z } from "zod";

export const StageSlotSchema = z.enum([
  "script.primary",
  "story.mckee_router",
  "guides.primary",
  "shotlist.breakdown",
  "shotlist.primary",
  "qa.primary",
  "artifact.formatter",
  "version.manager"
]);
export type StageSlot = z.infer<typeof StageSlotSchema>;

export const ProviderSchema = z.enum(["local-codex", "openai-key"]);
export type Provider = z.infer<typeof ProviderSchema>;

export const EffortSchema = z.enum(["low", "medium", "high", "xhigh"]);
export type Effort = z.infer<typeof EffortSchema>;

export const RuntimeModelSchema = z.enum(["gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna"]);
export type RuntimeModel = z.infer<typeof RuntimeModelSchema>;

export const CreateProjectInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  rootToken: z.string().uuid(),
  template: z.enum(["blank", "film", "series"]).default("film")
});
export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

export interface ProjectRootSelectionDto {
  token: string;
  displayPath: string;
}

export const ProjectIdInputSchema = z.object({ projectId: z.string().min(1) });

export const ImportTextInputSchema = z.object({
  projectId: z.string().min(1),
  sourceName: z.string().min(1).default("粘贴的剧本.txt"),
  text: z.string().min(1)
});

export const ApplyImportInputSchema = z.object({
  projectId: z.string().min(1),
  importToken: z.string().min(1),
  acceptedSceneProposalIds: z.array(z.string()),
  createRevision: z.boolean().default(true)
});

export const RunAgentInputSchema = z.object({
  projectId: z.string().min(1),
  stage: StageSlotSchema,
  scopeIds: z.array(z.string().min(1)).min(1),
  skillId: z.string().min(1),
  provider: ProviderSchema,
  model: RuntimeModelSchema.default("gpt-5.6-sol"),
  effort: EffortSchema.default("medium"),
  prompt: z.string().min(1),
  imageGenerationConfirmed: z.boolean().default(false)
});
export type RunAgentInput = z.infer<typeof RunAgentInputSchema>;

export const CancelAgentInputSchema = z.object({ runId: z.string().min(1) });

export const BindSkillInputSchema = z.object({
  projectId: z.string().min(1),
  slot: StageSlotSchema,
  skillId: z.string().min(1),
  version: z.string().min(1),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/)
});

export const AssignSkillSlotInputSchema = z.object({
  skillId: z.string().min(1),
  version: z.string().min(1),
  slot: StageSlotSchema,
  expectedContentHash: z.string().regex(/^[a-f0-9]{64}$/)
});

export const SetSkillEnabledInputSchema = z.object({
  projectId: z.string().min(1),
  skillId: z.string().min(1),
  version: z.string().min(1),
  enabled: z.boolean()
});

export const SkillIdentityInputSchema = z.object({
  skillId: z.string().min(1),
  version: z.string().min(1)
});

export const UpdateSkillContentInputSchema = SkillIdentityInputSchema.extend({
  expectedContentHash: z.string().regex(/^[a-f0-9]{64}$/),
  content: z.string().min(1).max(1_000_000)
});

export interface SkillContentDto {
  content: string;
  contentHash: string;
  readOnly: boolean;
}

export const RuntimePreferenceSchema = z.object({
  projectId: z.string().min(1),
  provider: ProviderSchema.default("local-codex"),
  model: RuntimeModelSchema.default("gpt-5.6-sol"),
  effort: EffortSchema.default("medium")
});
export type RuntimePreferenceDto = z.infer<typeof RuntimePreferenceSchema>;

export const SaveApiKeyInputSchema = z.object({
  apiKey: z.string().trim().min(20),
  testConnection: z.boolean().default(true),
  model: RuntimeModelSchema.default("gpt-5.6-sol")
});

export const ExportProjectInputSchema = z.object({
  projectId: z.string().min(1),
  kind: z.enum(["markdown", "html", "fountain", "docx", "shot-csv", "prompt-csv", "json", "pdf", "project-package"])
});

export const DraftDecisionInputSchema = z.object({
  projectId: z.string().min(1),
  proposalId: z.string().min(1),
  operationIds: z.array(z.string().min(1)).optional()
});

export const RestoreRevisionInputSchema = z.object({
  projectId: z.string().min(1),
  revisionId: z.string().min(1)
});

export const PatchEntityInputSchema = z.object({
  projectId: z.string().min(1),
  entityType: z.enum(["project", "episode", "act", "sequence", "scene", "beat", "scriptBlock", "asset", "referenceState", "shotRow", "promptEnvelope", "task", "qaFinding"]),
  entityId: z.string().min(1),
  baseRevision: z.string().min(1).nullable().optional(),
  patch: z.record(z.string(), z.unknown())
});

export const UpsertTaskInputSchema = z.object({
  projectId: z.string().min(1),
  id: z.string().min(1).optional(),
  title: z.string().trim().min(1).max(500),
  description: z.string().max(10_000).default(""),
  status: z.enum(["todo", "in_progress", "blocked", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignee: z.string().max(240).default("我"),
  dueAt: z.string().datetime({ offset: true }).optional(),
  relatedEntityType: z.string().max(120).optional(),
  relatedEntityId: z.string().min(1).optional(),
  ordinal: z.number().nonnegative().default(0)
});

export const ReplaceMappingInputSchema = z.object({
  projectId: z.string().min(1),
  sceneId: z.string().min(1),
  links: z.array(z.object({
    shotRowId: z.string().min(1),
    promptEnvelopeId: z.string().min(1),
    orderInEnvelope: z.number().int().nonnegative()
  }))
});

export const CreateStructureInputSchema = z.object({
  projectId: z.string().min(1),
  kind: z.enum(["act", "sequence", "scene"]),
  parentId: z.string().min(1).optional(),
  title: z.string().trim().min(1).max(300)
});

export const CreatePromptEnvelopeInputSchema = z.object({
  projectId: z.string().min(1),
  sceneId: z.string().min(1),
  title: z.string().trim().min(1).max(300).default("新 Prompt Envelope")
});

export interface ProjectSummaryDto {
  id: string;
  name: string;
  updatedAt: string;
  archived: boolean;
  currentStage: string;
  progress: number;
  sceneCount: number;
  openTaskCount: number;
  staleCount: number;
}

export interface RuntimeHealthDto {
  codex: {
    installed: boolean;
    executablePath?: string;
    version?: string;
    loggedIn: boolean;
    accountLabel?: string;
    defaultModel: string;
    defaultEffort: Effort;
    message?: string;
  };
  apiKey: {
    configured: boolean;
    lastTestedAt?: string;
    status: "not-configured" | "ready" | "invalid" | "unchecked";
    message?: string;
  };
}

export interface SkillSummaryDto {
  id: string;
  name: string;
  version: string;
  source: "core" | "user" | "uncategorized";
  readOnly: boolean;
  enabled: boolean;
  slots: StageSlot[];
  contentHash: string;
  capabilities: Array<"project.read" | "draft.propose" | "asset.read" | "image.generate" | "network.request" | "shell.request">;
  warnings: string[];
}

export interface BootstrapDto {
  appVersion: string;
  platform: string;
  projects: ProjectSummaryDto[];
  runtime: RuntimeHealthDto;
  skills: SkillSummaryDto[];
  activeProjectId?: string;
}

export interface AgentEventDto {
  runId: string;
  kind: "queued" | "started" | "progress" | "draft" | "completed" | "failed" | "cancelled" | "interrupted";
  timestamp: string;
  message: string;
  progress?: number;
  payload?: unknown;
}

export interface ImportPreviewDto {
  importToken: string;
  sourceName: string;
  format: string;
  blocks: Array<{ id: string; kind: string; text: string }>;
  sceneProposals: Array<{ id: string; ordinal: number; heading: string; blockIds: string[]; confidence: number; warnings: string[] }>;
  warnings: Array<{ code: string; message: string; blocking: boolean }>;
}

export interface DesktopApi {
  app: {
    bootstrap(): Promise<BootstrapDto>;
    revealPath(path: string): Promise<boolean>;
  };
  projects: {
    list(): Promise<ProjectSummaryDto[]>;
    chooseRoot(): Promise<ProjectRootSelectionDto | null>;
    create(input: CreateProjectInput): Promise<ProjectSummaryDto>;
    importExisting(): Promise<ProjectSummaryDto | null>;
    open(projectId: string): Promise<unknown>;
    archive(projectId: string, archived: boolean): Promise<void>;
  };
  scripts: {
    chooseAndPreview(projectId: string): Promise<ImportPreviewDto | null>;
    previewText(input: z.infer<typeof ImportTextInputSchema>): Promise<ImportPreviewDto>;
    applyImport(input: z.infer<typeof ApplyImportInputSchema>): Promise<unknown>;
  };
  agent: {
    health(): Promise<RuntimeHealthDto>;
    run(input: RunAgentInput): Promise<{ runId: string }>;
    cancel(runId: string): Promise<void>;
    onEvent(listener: (event: AgentEventDto) => void): () => void;
  };
  draft: {
    accept(projectId: string, proposalId: string, operationIds?: string[]): Promise<unknown>;
    reject(projectId: string, proposalId: string): Promise<unknown>;
  };
  revisions: {
    restore(projectId: string, revisionId: string): Promise<unknown>;
  };
  entities: {
    patch(input: z.infer<typeof PatchEntityInputSchema>): Promise<unknown>;
  };
  tasks: {
    upsert(input: z.infer<typeof UpsertTaskInputSchema>): Promise<unknown>;
  };
  mapping: {
    replace(input: z.infer<typeof ReplaceMappingInputSchema>): Promise<unknown>;
  };
  structure: {
    create(input: z.infer<typeof CreateStructureInputSchema>): Promise<unknown>;
  };
  prompts: {
    createEnvelope(input: z.infer<typeof CreatePromptEnvelopeInputSchema>): Promise<unknown>;
  };
  skills: {
    list(projectId?: string): Promise<SkillSummaryDto[]>;
    importFromFolder(): Promise<SkillSummaryDto | null>;
    cloneForEditing(skillId: string): Promise<SkillSummaryDto>;
    assignSlot(input: z.infer<typeof AssignSkillSlotInputSchema>): Promise<SkillSummaryDto>;
    readContent(input: z.infer<typeof SkillIdentityInputSchema>): Promise<SkillContentDto>;
    updateContent(input: z.infer<typeof UpdateSkillContentInputSchema>): Promise<SkillSummaryDto>;
    setEnabled(input: z.infer<typeof SetSkillEnabledInputSchema>): Promise<SkillSummaryDto>;
    bind(input: z.infer<typeof BindSkillInputSchema>): Promise<void>;
  };
  settings: {
    getRuntimePreference(projectId: string): Promise<RuntimePreferenceDto>;
    setRuntimePreference(input: RuntimePreferenceDto): Promise<RuntimePreferenceDto>;
    saveApiKey(apiKey: string, model: RuntimeModel): Promise<RuntimeHealthDto["apiKey"]>;
    removeApiKey(): Promise<void>;
    testApiKey(model: RuntimeModel): Promise<RuntimeHealthDto["apiKey"]>;
  };
  exports: {
    save(input: z.infer<typeof ExportProjectInputSchema>): Promise<string | null>;
  };
}

export const IPC = {
  bootstrap: "app:bootstrap",
  revealPath: "app:reveal-path",
  projectList: "project:list",
  projectChooseRoot: "project:choose-root",
  projectCreate: "project:create",
  projectImportExisting: "project:import-existing",
  projectOpen: "project:open",
  projectArchive: "project:archive",
  scriptChooseAndPreview: "script:choose-and-preview",
  scriptPreviewText: "script:preview-text",
  scriptApplyImport: "script:apply-import",
  agentHealth: "agent:health",
  agentRun: "agent:run",
  agentCancel: "agent:cancel",
  agentEvent: "agent:event",
  draftAccept: "draft:accept",
  draftReject: "draft:reject",
  revisionRestore: "revision:restore",
  entityPatch: "entity:patch",
  taskUpsert: "task:upsert",
  mappingReplace: "mapping:replace",
  structureCreate: "structure:create",
  promptEnvelopeCreate: "prompt-envelope:create",
  skillList: "skill:list",
  skillImport: "skill:import",
  skillClone: "skill:clone",
  skillAssignSlot: "skill:assign-slot",
  skillReadContent: "skill:read-content",
  skillUpdateContent: "skill:update-content",
  skillSetEnabled: "skill:set-enabled",
  skillBind: "skill:bind",
  settingsGetRuntimePreference: "settings:get-runtime-preference",
  settingsSetRuntimePreference: "settings:set-runtime-preference",
  settingsSaveApiKey: "settings:save-api-key",
  settingsRemoveApiKey: "settings:remove-api-key",
  settingsTestApiKey: "settings:test-api-key",
  exportSave: "export:save"
} as const;
