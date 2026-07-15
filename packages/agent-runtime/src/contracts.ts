import { z } from "zod";
import { SkillCapabilitySchema, StageSlotSchema, type SkillCapability, type SkillPin, type StageSlot } from "@ai-director/skill-runtime";

export const DEFAULT_TEXT_MODEL = "gpt-5.6-sol";
export const DEFAULT_REASONING_EFFORT = "medium" as const;

export const ReasoningEffortSchema = z.enum(["low", "medium", "high", "xhigh"]);
export type ReasoningEffort = z.infer<typeof ReasoningEffortSchema>;
export const AgentProviderSchema = z.enum(["local-codex", "openai-key"]);
export type AgentProvider = z.infer<typeof AgentProviderSchema>;

export const DraftOperationSchema = z.object({
  op: z.enum(["create", "patch", "reorder", "link", "unlink", "archive"]),
  entityType: z.string().trim().min(1),
  entityId: z.string().trim().min(1).nullable().optional().transform((value) => value ?? undefined),
  baseRevision: z.string().trim().min(1).nullable().optional().transform((value) => value ?? undefined),
  payload: z.unknown(),
});
export type DraftOperation = z.infer<typeof DraftOperationSchema>;

export const DraftResultSchema = z.object({
  summary: z.string().default(""),
  operations: z.array(DraftOperationSchema),
}).passthrough();

export const DraftOperationListSchema = z.union([z.array(DraftOperationSchema), DraftResultSchema]);
export type DraftResult = z.infer<typeof DraftResultSchema>;

export const DRAFT_OPERATIONS_OUTPUT_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "operations"],
  properties: {
    summary: { type: "string" },
    operations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["op", "entityType", "entityId", "baseRevision", "payload"],
        properties: {
          op: { enum: ["create", "patch", "reorder", "link", "unlink", "archive"] },
          entityType: { type: "string" },
          entityId: { type: ["string", "null"] },
          baseRevision: { type: ["string", "null"] },
          // Stage-specific runs should replace this generic schema with their
          // entity schema. A JSON string keeps the generic fallback strict.
          payload: { type: "string" },
        },
      },
    },
  },
};

export const AgentRunRequestSchema = z.object({
  projectId: z.string().trim().min(1),
  stage: StageSlotSchema,
  scopeIds: z.array(z.string().trim().min(1)).min(1),
  skill: z.object({
    id: z.string().trim().min(1),
    version: z.string().trim().min(1),
    path: z.string().trim().min(1),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/i),
  }),
  provider: AgentProviderSchema,
  model: z.string().trim().min(1).default(DEFAULT_TEXT_MODEL),
  effort: ReasoningEffortSchema.default(DEFAULT_REASONING_EFFORT),
  upstreamRevisions: z.array(z.string().trim().min(1)),
});

export const AgentJobRequestSchema = AgentRunRequestSchema.extend({
  prompt: z.string().trim().min(1),
  outputSchema: z.record(z.unknown()),
  workingDirectory: z.string().trim().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
  grantedCapabilities: z.array(SkillCapabilitySchema).optional(),
});

export interface AgentRunRequest {
  projectId: string;
  stage: StageSlot;
  scopeIds: string[];
  skill: Omit<SkillPin, "slot">;
  provider: AgentProvider;
  model: string;
  effort: ReasoningEffort;
  upstreamRevisions: string[];
}

export interface AgentJobRequest extends AgentRunRequest {
  prompt: string;
  outputSchema: Record<string, unknown>;
  workingDirectory?: string;
  metadata?: Record<string, unknown>;
  grantedCapabilities?: SkillCapability[];
}

export type AgentJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "interrupted";

export interface AgentJobRecord {
  id: string;
  request: AgentJobRequest;
  status: AgentJobStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  threadId?: string;
  turnId?: string;
  error?: string;
  result?: unknown;
  summary?: string;
}

export type DraftValidationHook = (operation: DraftOperation, index: number) => void | Promise<void>;

export async function validateDraftResult(input: unknown, hook?: DraftValidationHook): Promise<DraftResult> {
  const parsed = DraftOperationListSchema.parse(input);
  const result: DraftResult = Array.isArray(parsed) ? { summary: "", operations: parsed } : parsed;
  if (hook) {
    for (const [index, operation] of result.operations.entries()) await hook(operation, index);
  }
  return result;
}

export async function validateDraftOperations(input: unknown, hook?: DraftValidationHook): Promise<DraftOperation[]> {
  return (await validateDraftResult(input, hook)).operations;
}
