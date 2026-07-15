import { z } from "zod";

export const STAGE_SLOTS = [
  "script.primary",
  "story.mckee_router",
  "guides.primary",
  "shotlist.breakdown",
  "shotlist.primary",
  "qa.primary",
  "artifact.formatter",
  "version.manager",
] as const;

export const StageSlotSchema = z.enum(STAGE_SLOTS);
export type StageSlot = z.infer<typeof StageSlotSchema>;

export const SKILL_CAPABILITIES = [
  "project.read",
  "draft.propose",
  "asset.read",
  "image.generate",
  "network.request",
  "shell.request",
] as const;

export const SkillCapabilitySchema = z.enum(SKILL_CAPABILITIES);
export type SkillCapability = z.infer<typeof SkillCapabilitySchema>;

export const SkillDependencySchema = z.object({
  id: z.string().trim().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/i),
  versionRange: z.string().trim().min(1),
});

export const DirectorSkillManifestSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().trim().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/i),
  version: z.string().trim().refine((value) => /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value), {
    message: "version must be valid semver",
  }),
  entry: z.literal("SKILL.md"),
  slots: z.array(StageSlotSchema).default([]),
  outputSchema: z.string().trim().min(1),
  capabilities: z.array(SkillCapabilitySchema).default(["project.read", "draft.propose"]),
  dependencies: z.array(SkillDependencySchema).optional(),
});

export type DirectorSkillManifest = z.infer<typeof DirectorSkillManifestSchema>;
export type SkillDependency = z.infer<typeof SkillDependencySchema>;

export const DEFAULT_SKILL_CAPABILITIES: readonly SkillCapability[] = [
  "project.read",
  "draft.propose",
] as const;

export type SkillClassification = "core" | "user" | "uncategorized";

export interface SkillDescriptor {
  id: string;
  name: string;
  description?: string;
  path: string;
  entryPath: string;
  sourceRoot: string;
  classification: SkillClassification;
  manifest: DirectorSkillManifest;
  manifestPath?: string;
  manifestStatus: "valid" | "synthesized";
  contentHash: string;
  warnings: string[];
}

export interface SkillPin {
  id: string;
  version: string;
  path: string;
  contentHash: string;
  slot: StageSlot;
}

export interface SkillRegistryEntry {
  slot: string;
  skillId: string;
  owner: string;
  output: string;
}
