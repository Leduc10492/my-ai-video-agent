import { z } from "zod";

export const EntityIdSchema = z.string().min(1).max(160);
export const IsoDateSchema = z.string().datetime({ offset: true });

export const BaseEntitySchema = z.object({
  id: EntityIdSchema,
  projectId: EntityIdSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  currentRevisionId: EntityIdSchema.optional(),
  archivedAt: IsoDateSchema.optional(),
});

export const ProjectSchema = BaseEntitySchema.extend({
  name: z.string().trim().min(1).max(200),
  logline: z.string().max(2_000).default(""),
  synopsis: z.string().max(20_000).default(""),
  format: z.enum(["film", "series", "short", "commercial", "other"]).default("film"),
  language: z.string().min(2).default("zh-CN"),
  episodeMode: z.boolean().default(false),
  status: z.enum(["development", "preproduction", "archived"]).default("development"),
});

export const EpisodeSchema = BaseEntitySchema.extend({
  title: z.string().min(1).max(240),
  number: z.number().int().positive(),
  synopsis: z.string().max(10_000).default(""),
  ordinal: z.number().nonnegative(),
});

export const ActSchema = BaseEntitySchema.extend({
  episodeId: EntityIdSchema.optional(),
  title: z.string().min(1).max(240),
  number: z.number().int().positive(),
  dramaticPurpose: z.string().max(5_000).default(""),
  ordinal: z.number().nonnegative(),
});

export const SequenceSchema = BaseEntitySchema.extend({
  actId: EntityIdSchema,
  title: z.string().min(1).max(240),
  number: z.number().int().positive(),
  dramaticQuestion: z.string().max(5_000).default(""),
  synopsis: z.string().max(10_000).default(""),
  ordinal: z.number().nonnegative(),
});

export const SceneSchema = BaseEntitySchema.extend({
  sequenceId: EntityIdSchema,
  sceneNumber: z.string().min(1).max(40),
  heading: z.string().min(1).max(500),
  location: z.string().max(240).default(""),
  timeOfDay: z.string().max(120).default(""),
  interiorExterior: z.enum(["INT", "EXT", "INT/EXT", "OTHER"]).default("OTHER"),
  synopsis: z.string().max(10_000).default(""),
  dramaticValueBefore: z.string().max(1_000).default(""),
  dramaticValueAfter: z.string().max(1_000).default(""),
  estimatedSeconds: z.number().nonnegative().default(0),
  ordinal: z.number().nonnegative(),
});

export const BeatSchema = BaseEntitySchema.extend({
  sceneId: EntityIdSchema,
  title: z.string().min(1).max(300),
  action: z.string().max(10_000),
  intention: z.string().max(5_000).default(""),
  turn: z.string().max(5_000).default(""),
  estimatedSeconds: z.number().nonnegative().default(0),
  ordinal: z.number().nonnegative(),
});

export const ScriptBlockKindSchema = z.enum([
  "scene_heading",
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
  "note",
]);

export const ScriptBlockSchema = BaseEntitySchema.extend({
  sceneId: EntityIdSchema.optional(),
  beatId: EntityIdSchema.optional(),
  kind: ScriptBlockKindSchema,
  text: z.string().max(100_000),
  characterId: EntityIdSchema.optional(),
  ordinal: z.number().nonnegative(),
  source: z
    .object({
      file: z.string().max(2_000).optional(),
      start: z.number().int().nonnegative().optional(),
      end: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export const AssetKindSchema = z.enum(["character", "location", "prop", "style"]);
export const AssetSchema = BaseEntitySchema.extend({
  kind: AssetKindSchema,
  name: z.string().min(1).max(240),
  description: z.string().max(20_000).default(""),
  scope: z.enum(["shared", "scene"]).default("shared"),
  sceneId: EntityIdSchema.optional(),
  approval: z.enum(["draft", "approved", "rejected"]).default("draft"),
  tags: z.array(z.string().max(120)).default([]),
  attributes: z.record(z.string(), z.unknown()).default({}),
});

export const AssetUsageSchema = BaseEntitySchema.extend({
  assetId: EntityIdSchema,
  entityType: z.string().min(1).max(120),
  entityId: EntityIdSchema,
  role: z.string().max(240).default("reference"),
});

export const ReferenceStateSchema = BaseEntitySchema.extend({
  assetId: EntityIdSchema,
  filePath: z.string().min(1).max(4_000),
  label: z.string().max(240).default(""),
  source: z.enum(["imported", "generated", "linked"]).default("imported"),
  approval: z.enum(["candidate", "approved", "rejected"]).default("candidate"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  contentHash: z.string().max(256).optional(),
});

export const DraftImageSchema = BaseEntitySchema.extend({
  promptEnvelopeId: EntityIdSchema,
  assetIds: z.array(EntityIdSchema).default([]),
  filePath: z.string().min(1).max(4_000),
  provider: z.enum(["local-codex", "openai-key"]),
  model: z.string().min(1).max(240),
  prompt: z.string().max(100_000),
  status: z.enum(["candidate", "accepted", "rejected", "failed"]),
  generationRunId: EntityIdSchema.optional(),
  seed: z.string().max(240).optional(),
});

export const ShotRowSchema = BaseEntitySchema.extend({
  sceneId: EntityIdSchema,
  beatId: EntityIdSchema.optional(),
  shotNumber: z.string().min(1).max(80),
  ordinal: z.number().nonnegative(),
  framing: z.string().max(240).default(""),
  cameraPosition: z.string().max(500).default(""),
  lens: z.string().max(240).default(""),
  cameraMovement: z.string().max(500).default(""),
  blocking: z.string().max(5_000).default(""),
  performance: z.string().max(5_000).default(""),
  action: z.string().max(10_000),
  dialogue: z.string().max(10_000).default(""),
  sound: z.string().max(5_000).default(""),
  durationSeconds: z.number().positive(),
  cutReason: z.string().min(1).max(5_000),
  axisNote: z.string().max(2_000).default(""),
  sourceScriptBlockIds: z.array(EntityIdSchema).default([]),
});

export const PromptEnvelopeSchema = BaseEntitySchema.extend({
  sceneId: EntityIdSchema,
  envelopeNumber: z.string().min(1).max(80),
  ordinal: z.number().nonnegative(),
  title: z.string().max(300).default(""),
  targetModel: z.string().max(240).default(""),
  durationSeconds: z.number().positive(),
  promptZh: z.string().min(1).max(100_000),
  negativePrompt: z.string().max(20_000).default(""),
  assetIds: z.array(EntityIdSchema).default([]),
  sourceScriptBlockIds: z.array(EntityIdSchema).default([]),
  generationReliability: z.enum(["high", "medium", "low"]).default("medium"),
});

export const ShotEnvelopeLinkSchema = z.object({
  id: EntityIdSchema,
  projectId: EntityIdSchema,
  shotRowId: EntityIdSchema,
  promptEnvelopeId: EntityIdSchema,
  orderInEnvelope: z.number().int().nonnegative(),
  createdAt: IsoDateSchema,
});

export const TaskSchema = BaseEntitySchema.extend({
  title: z.string().min(1).max(500),
  description: z.string().max(10_000).default(""),
  status: z.enum(["todo", "in_progress", "blocked", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignee: z.string().max(240).default(""),
  dueAt: IsoDateSchema.optional(),
  relatedEntityType: z.string().max(120).optional(),
  relatedEntityId: EntityIdSchema.optional(),
  ordinal: z.number().nonnegative().default(0),
});

export const QaSeveritySchema = z.enum(["P0", "P1", "P2", "P3"]);
export const QaFindingSchema = BaseEntitySchema.extend({
  severity: QaSeveritySchema,
  title: z.string().min(1).max(500),
  description: z.string().max(20_000),
  status: z.enum(["open", "resolved", "dismissed"]).default("open"),
  category: z.enum(["coverage", "directing", "prompt", "mapping", "path", "generation", "other"]),
  entityType: z.string().max(120).optional(),
  entityId: EntityIdSchema.optional(),
  suggestedFix: z.string().max(10_000).default(""),
});

export const RevisionAuthorSchema = z.object({
  type: z.enum(["user", "agent", "import", "system"]),
  name: z.string().min(1).max(240),
});

export const RevisionSkillSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  contentHash: z.string().min(1),
}).optional();

export const RevisionSchema = z.object({
  id: EntityIdSchema,
  projectId: EntityIdSchema,
  entityType: z.string().min(1).max(120),
  entityId: EntityIdSchema,
  parentRevisionId: EntityIdSchema.optional(),
  author: RevisionAuthorSchema,
  createdAt: IsoDateSchema,
  contentHash: z.string().min(1).max(256),
  upstreamRevisionIds: z.array(EntityIdSchema).default([]),
  upstreamHashes: z.record(z.string(), z.string()).default({}),
  skill: RevisionSkillSchema,
  provider: z.enum(["local-codex", "openai-key"]).optional(),
  model: z.string().max(240).optional(),
  snapshot: z.unknown(),
  message: z.string().max(2_000).default(""),
});

export const DependencyEdgeSchema = z.object({
  id: EntityIdSchema,
  projectId: EntityIdSchema,
  upstreamEntityType: z.string().min(1).max(120),
  upstreamEntityId: EntityIdSchema,
  downstreamEntityType: z.string().min(1).max(120),
  downstreamEntityId: EntityIdSchema,
  relation: z.string().min(1).max(120),
  createdAt: IsoDateSchema,
});

export const StaleMarkerSchema = z.object({
  projectId: EntityIdSchema,
  entityType: z.string().min(1).max(120),
  entityId: EntityIdSchema,
  sourceEntityType: z.string().min(1).max(120),
  sourceEntityId: EntityIdSchema,
  reason: z.string().min(1).max(2_000),
  markedAt: IsoDateSchema,
});

export const StageSlotSchema = z.enum([
  "script.primary",
  "story.mckee_router",
  "guides.primary",
  "shotlist.breakdown",
  "shotlist.primary",
  "qa.primary",
  "artifact.formatter",
  "version.manager",
]);

export const SkillCapabilitySchema = z.enum([
  "project.read",
  "draft.propose",
  "asset.read",
  "image.generate",
  "network.request",
  "shell.request",
]);

export const DirectorSkillManifestSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/),
  version: z.string().min(1).max(80),
  entry: z.literal("SKILL.md"),
  slots: z.array(StageSlotSchema).min(1),
  outputSchema: z.string().min(1).max(4_000),
  capabilities: z.array(SkillCapabilitySchema).default(["project.read", "draft.propose"]),
  dependencies: z
    .array(z.object({ id: z.string().min(1), versionRange: z.string().min(1) }))
    .optional(),
});

export const SkillBindingSchema = z.object({
  id: EntityIdSchema,
  projectId: EntityIdSchema,
  slot: StageSlotSchema,
  skillId: z.string().min(1),
  skillVersion: z.string().min(1),
  skillPath: z.string().min(1),
  contentHash: z.string().min(1),
  boundAt: IsoDateSchema,
});

export const AgentRunSchema = z.object({
  id: EntityIdSchema,
  projectId: EntityIdSchema,
  stage: StageSlotSchema,
  scopeIds: z.array(EntityIdSchema),
  status: z.enum(["queued", "running", "awaiting_approval", "completed", "failed", "cancelled", "interrupted"]),
  skill: z.object({
    id: z.string().min(1),
    version: z.string().min(1),
    path: z.string().min(1),
    contentHash: z.string().min(1),
  }),
  provider: z.enum(["local-codex", "openai-key"]),
  model: z.string().min(1),
  effort: z.enum(["low", "medium", "high", "xhigh"]),
  upstreamRevisions: z.array(EntityIdSchema),
  createdAt: IsoDateSchema,
  startedAt: IsoDateSchema.optional(),
  finishedAt: IsoDateSchema.optional(),
  error: z.string().max(20_000).optional(),
  outputProposalId: EntityIdSchema.optional(),
});

export const AgentRunRequestSchema = z.object({
  projectId: EntityIdSchema,
  stage: StageSlotSchema,
  scopeIds: z.array(EntityIdSchema).min(1),
  skill: z.object({
    id: z.string().min(1),
    version: z.string().min(1),
    path: z.string().min(1),
    contentHash: z.string().min(1),
  }),
  provider: z.enum(["local-codex", "openai-key"]),
  model: z.string().min(1),
  effort: z.enum(["low", "medium", "high", "xhigh"]),
  upstreamRevisions: z.array(EntityIdSchema),
});

export const EntityTypeSchema = z.enum([
  "project", "episode", "act", "sequence", "scene", "beat", "scriptBlock",
  "asset", "assetUsage", "referenceState", "draftImage", "shotRow",
  "promptEnvelope", "task", "qaFinding",
]);

export const DraftOperationSchema = z.object({
  id: EntityIdSchema,
  op: z.enum(["create", "patch", "reorder", "link", "unlink", "archive"]),
  entityType: z.string().min(1).max(120),
  entityId: EntityIdSchema.optional(),
  baseRevision: EntityIdSchema.optional(),
  payload: z.unknown(),
});

export const DraftProposalSchema = z.object({
  id: EntityIdSchema,
  projectId: EntityIdSchema,
  runId: EntityIdSchema.optional(),
  stage: StageSlotSchema,
  scopeIds: z.array(EntityIdSchema),
  status: z.enum(["candidate", "accepted", "partially_accepted", "rejected", "superseded"]),
  operations: z.array(DraftOperationSchema),
  acceptedOperationIds: z.array(EntityIdSchema).default([]),
  createdAt: IsoDateSchema,
  decidedAt: IsoDateSchema.optional(),
  summary: z.string().max(5_000).default(""),
});

export const EntitySchemas = {
  project: ProjectSchema,
  episode: EpisodeSchema,
  act: ActSchema,
  sequence: SequenceSchema,
  scene: SceneSchema,
  beat: BeatSchema,
  scriptBlock: ScriptBlockSchema,
  asset: AssetSchema,
  assetUsage: AssetUsageSchema,
  referenceState: ReferenceStateSchema,
  draftImage: DraftImageSchema,
  shotRow: ShotRowSchema,
  promptEnvelope: PromptEnvelopeSchema,
  task: TaskSchema,
  qaFinding: QaFindingSchema,
} as const;

export type Project = z.infer<typeof ProjectSchema>;
export type Episode = z.infer<typeof EpisodeSchema>;
export type Act = z.infer<typeof ActSchema>;
export type Sequence = z.infer<typeof SequenceSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Beat = z.infer<typeof BeatSchema>;
export type ScriptBlock = z.infer<typeof ScriptBlockSchema>;
export type ScriptBlockKind = z.infer<typeof ScriptBlockKindSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type AssetUsage = z.infer<typeof AssetUsageSchema>;
export type ReferenceState = z.infer<typeof ReferenceStateSchema>;
export type DraftImage = z.infer<typeof DraftImageSchema>;
export type ShotRow = z.infer<typeof ShotRowSchema>;
export type PromptEnvelope = z.infer<typeof PromptEnvelopeSchema>;
export type ShotEnvelopeLink = z.infer<typeof ShotEnvelopeLinkSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type QaSeverity = z.infer<typeof QaSeveritySchema>;
export type QaFinding = z.infer<typeof QaFindingSchema>;
export type RevisionAuthor = z.infer<typeof RevisionAuthorSchema>;
export type Revision = z.infer<typeof RevisionSchema>;
export type DependencyEdge = z.infer<typeof DependencyEdgeSchema>;
export type StaleMarker = z.infer<typeof StaleMarkerSchema>;
export type StageSlot = z.infer<typeof StageSlotSchema>;
export type SkillCapability = z.infer<typeof SkillCapabilitySchema>;
export type DirectorSkillManifest = z.infer<typeof DirectorSkillManifestSchema>;
export type SkillBinding = z.infer<typeof SkillBindingSchema>;
export type AgentRun = z.infer<typeof AgentRunSchema>;
export type AgentRunRequest = z.infer<typeof AgentRunRequestSchema>;
export type EntityType = z.infer<typeof EntityTypeSchema>;
export type DraftOperation = z.infer<typeof DraftOperationSchema>;
export type DraftProposal = z.infer<typeof DraftProposalSchema>;
export type DomainEntity = z.infer<(typeof EntitySchemas)[keyof typeof EntitySchemas]>;

export function parseEntity<T extends keyof typeof EntitySchemas>(type: T, value: unknown): z.infer<(typeof EntitySchemas)[T]> {
  return EntitySchemas[type].parse(value) as z.infer<(typeof EntitySchemas)[T]>;
}
