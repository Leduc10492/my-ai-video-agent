import { cp, lstat, mkdir, readFile, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DirectorSkillManifest, SkillCapability, SkillDescriptor, StageSlot } from "./contracts.js";
import { DEFAULT_SKILL_CAPABILITIES, DirectorSkillManifestSchema } from "./contracts.js";
import { loadSkillDirectory } from "./discovery.js";
import { isPathInside, resolveSkillRelativePath, safeSkillFolderName } from "./paths.js";
import { validateCapabilities, validateSkillDependencies, validateSkillOutputSchema, type SkillValidationIssue } from "./validation.js";

async function inspectTree(root: string, current = root): Promise<void> {
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    if (entry.isSymbolicLink()) {
      const resolved = await realpath(absolute);
      if (!isPathInside(root, resolved)) throw new Error(`Symbolic link escapes the skill package: ${path.relative(root, absolute)}`);
      throw new Error(`Symbolic links are not supported in imported skills: ${path.relative(root, absolute)}`);
    }
    if (entry.isDirectory()) await inspectTree(root, absolute);
  }
}

export interface ImportSkillOptions {
  sourceDirectory: string;
  targetRoot: string;
  installed?: readonly SkillDescriptor[];
  grantedCapabilities?: readonly SkillCapability[];
  selectedSlots?: readonly StageSlot[];
  id?: string;
  version?: string;
}

export interface ImportSkillResult {
  skill: SkillDescriptor;
  warnings: SkillValidationIssue[];
}

export async function importSkill(options: ImportSkillOptions): Promise<ImportSkillResult> {
  const source = await realpath(options.sourceDirectory);
  if (!(await lstat(source)).isDirectory()) throw new Error("Skill source must be a directory.");
  await inspectTree(source);
  if (isPathInside(source, path.resolve(options.targetRoot))) {
    throw new Error("The skill library cannot be created inside the skill being imported.");
  }

  const sourceSkill = await loadSkillDirectory(source);
  const installed = options.installed ?? [];
  const id = options.id ?? sourceSkill.manifest.id;
  const version = options.version ?? sourceSkill.manifest.version;
  if (installed.some((skill) => skill.id === id && skill.manifest.version === version)) {
    throw new Error(`Skill ${id}@${version} is already installed.`);
  }

  const selectedSlots = options.selectedSlots ? [...options.selectedSlots] : sourceSkill.manifest.slots;
  const manifest: DirectorSkillManifest = DirectorSkillManifestSchema.parse({
    ...sourceSkill.manifest,
    id,
    version,
    slots: selectedSlots,
    capabilities: sourceSkill.manifest.capabilities.length > 0
      ? sourceSkill.manifest.capabilities
      : [...DEFAULT_SKILL_CAPABILITIES],
  });
  resolveSkillRelativePath(source, manifest.entry);
  if (sourceSkill.manifestStatus === "valid") resolveSkillRelativePath(source, manifest.outputSchema);

  const dependencyIssues = validateSkillDependencies(manifest, installed);
  const capabilityIssues = validateCapabilities(manifest, options.grantedCapabilities ?? [...DEFAULT_SKILL_CAPABILITIES]);
  const errors = [...dependencyIssues, ...capabilityIssues].filter((issue) => issue.severity === "error");
  if (errors.length) throw new Error(errors.map((issue) => issue.message).join(" "));

  await mkdir(options.targetRoot, { recursive: true });
  const destination = path.join(options.targetRoot, safeSkillFolderName(id, version));
  const temporary = `${destination}.importing-${process.pid}-${Date.now()}`;
  if (!isPathInside(options.targetRoot, destination)) throw new Error("Unsafe skill destination.");
  let committed = false;
  try {
    await cp(source, temporary, { recursive: true, dereference: false, errorOnExist: true, force: false });
    if (sourceSkill.manifestStatus === "synthesized") {
      await writeFile(path.join(temporary, manifest.outputSchema), `${JSON.stringify({
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
                payload: { type: "string" },
              },
            },
          },
        },
      }, null, 2)}\n`, { flag: "w" });
    }
    await writeFile(path.join(temporary, "director-skill.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "w" });
    await rename(temporary, destination);
    committed = true;
    const installedSkill = await loadSkillDirectory(destination, { sourceRoot: options.targetRoot, classification: "user" });
    const outputIssues = await validateSkillOutputSchema(installedSkill);
    const outputErrors = outputIssues.filter((issue) => issue.severity === "error");
    if (outputErrors.length) throw new Error(outputErrors.map((issue) => issue.message).join(" "));
    return {
      skill: installedSkill,
      warnings: [...dependencyIssues, ...capabilityIssues, ...outputIssues].filter((issue) => issue.severity === "warning"),
    };
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    if (committed) await rm(destination, { recursive: true, force: true });
    throw error;
  }
}

export async function copyCoreSkillForEditing(
  sourceSkill: SkillDescriptor,
  targetRoot: string,
  nextVersion: string,
): Promise<SkillDescriptor> {
  if (sourceSkill.classification !== "core") throw new Error("Only core skills need an editable user copy.");
  return (await importSkill({
    sourceDirectory: sourceSkill.path,
    targetRoot,
    version: nextVersion,
    id: sourceSkill.id,
    selectedSlots: sourceSkill.manifest.slots,
    grantedCapabilities: sourceSkill.manifest.capabilities,
  })).skill;
}

export async function readRawManifest(directory: string): Promise<unknown> {
  return JSON.parse(await readFile(path.join(directory, "director-skill.json"), "utf8"));
}
