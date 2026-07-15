import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_SKILL_CAPABILITIES,
  DirectorSkillManifestSchema,
  StageSlotSchema,
  type DirectorSkillManifest,
  type SkillClassification,
  type SkillDescriptor,
  type SkillRegistryEntry,
} from "./contracts.js";
import { parseSkillFrontmatter } from "./frontmatter.js";
import { hashSkillDirectory } from "./hash.js";
import { resolveSkillRelativePath } from "./paths.js";

export interface SkillSourceRoot {
  path: string;
  classification: Exclude<SkillClassification, "uncategorized">;
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function synthesizedManifest(id: string, outputSchema = "draft-operations.schema.json"): DirectorSkillManifest {
  return {
    schemaVersion: 1,
    id,
    version: "0.0.0",
    entry: "SKILL.md",
    slots: [],
    outputSchema,
    capabilities: [...DEFAULT_SKILL_CAPABILITIES],
  };
}

export async function loadSkillDirectory(
  directory: string,
  options: { sourceRoot?: string; classification?: Exclude<SkillClassification, "uncategorized"> } = {},
): Promise<SkillDescriptor> {
  const entryPath = path.join(directory, "SKILL.md");
  if (!(await exists(entryPath))) throw new Error(`Missing SKILL.md in ${directory}`);

  const markdown = await readFile(entryPath, "utf8");
  const frontmatter = parseSkillFrontmatter(markdown);
  const manifestPath = path.join(directory, "director-skill.json");
  const warnings: string[] = [];
  let manifest: DirectorSkillManifest;
  let manifestStatus: SkillDescriptor["manifestStatus"];
  if (await exists(manifestPath)) {
    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch (error) {
      throw new Error(`Invalid director-skill.json in ${directory}: ${String(error)}`);
    }
    manifest = DirectorSkillManifestSchema.parse(raw);
    manifestStatus = "valid";
    const entry = resolveSkillRelativePath(directory, manifest.entry);
    const outputSchema = resolveSkillRelativePath(directory, manifest.outputSchema);
    if (!(await exists(entry))) throw new Error(`Skill entry does not exist: ${manifest.entry}`);
    if (!(await exists(outputSchema))) throw new Error(`Skill output schema does not exist: ${manifest.outputSchema}`);
  } else {
    const id = frontmatter.name || path.basename(directory);
    manifest = synthesizedManifest(id);
    manifestStatus = "synthesized";
    warnings.push(options.classification === "core"
      ? "Core skill has no director-skill.json; a compatibility manifest was synthesized."
      : "No director-skill.json found; skill is unclassified until a workflow slot is selected.");
  }

  return {
    id: manifest.id,
    name: frontmatter.name || manifest.id,
    description: frontmatter.description,
    path: directory,
    entryPath,
    sourceRoot: options.sourceRoot ?? path.dirname(directory),
    classification: options.classification === "core"
      ? "core"
      : (manifestStatus === "synthesized" || manifest.slots.length === 0 ? "uncategorized" : "user"),
    manifest,
    manifestPath: manifestStatus === "valid" ? manifestPath : undefined,
    manifestStatus,
    contentHash: await hashSkillDirectory(directory),
    warnings,
  };
}

export function applyRegistrySlots(
  skills: readonly SkillDescriptor[],
  registry: readonly SkillRegistryEntry[],
): SkillDescriptor[] {
  return skills.map((skill) => {
    if (skill.manifestStatus !== "synthesized" || skill.classification !== "core") return skill;
    const slots = registry
      .filter((entry) => entry.skillId === skill.id)
      .map((entry) => StageSlotSchema.safeParse(entry.slot))
      .filter((result) => result.success)
      .map((result) => result.data);
    return slots.length === 0 ? skill : { ...skill, manifest: { ...skill.manifest, slots } };
  });
}

export async function discoverSkills(sources: readonly SkillSourceRoot[]): Promise<SkillDescriptor[]> {
  const skills: SkillDescriptor[] = [];
  for (const source of sources) {
    let entries;
    try {
      entries = await readdir(source.path, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) continue;
      const directory = path.join(source.path, entry.name);
      if (!(await exists(path.join(directory, "SKILL.md")))) continue;
      skills.push(await loadSkillDirectory(directory, { sourceRoot: source.path, classification: source.classification }));
    }
  }
  return skills;
}

export function findDuplicateSkillIds(skills: readonly SkillDescriptor[]): Map<string, SkillDescriptor[]> {
  const byId = new Map<string, SkillDescriptor[]>();
  for (const skill of skills) byId.set(skill.id, [...(byId.get(skill.id) ?? []), skill]);
  return new Map([...byId].filter(([, matches]) => matches.length > 1));
}
