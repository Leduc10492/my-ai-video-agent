import { mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  discoverSkills,
  applyRegistrySlots,
  findDuplicateSkillIds,
  importSkill,
  loadSkillDirectory,
  migrateLegacyAgentToml,
  parseSkillRegistry,
  pinSkill,
  resolveSkillDependencies,
  resolvePinnedSkill,
  validateSkillDependencies,
  validateCapabilities,
  validateStructuredOutputSchema,
} from "./index.js";

async function tempDirectory(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "ai-director-skill-"));
}

async function writeSkill(
  root: string,
  id: string,
  options: { manifest?: Record<string, unknown>; outputSchema?: boolean } = {},
): Promise<string> {
  const directory = path.join(root, id);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "SKILL.md"), `---\nname: ${id}\ndescription: Test skill\n---\n\n# ${id}\n`);
  if (options.manifest) await writeFile(path.join(directory, "director-skill.json"), JSON.stringify(options.manifest));
  if (options.outputSchema) await writeFile(path.join(directory, "output.schema.json"), "{}");
  return directory;
}

function manifest(id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schemaVersion: 1,
    id,
    version: "1.0.0",
    entry: "SKILL.md",
    slots: ["script.primary"],
    outputSchema: "output.schema.json",
    capabilities: ["project.read", "draft.propose"],
    ...overrides,
  };
}

describe("skill discovery and contracts", () => {
  it("discovers core manifests and synthesizes unclassified ordinary Codex skills", async () => {
    const root = await tempDirectory();
    await writeSkill(root, "manifested", { manifest: manifest("manifested"), outputSchema: true });
    await writeSkill(root, "ordinary");
    const skills = await discoverSkills([{ path: root, classification: "core" }]);
    expect(skills).toHaveLength(2);
    expect(skills.find((skill) => skill.id === "manifested")?.classification).toBe("core");
    const ordinary = skills.find((skill) => skill.id === "ordinary");
    expect(ordinary?.classification).toBe("core");
    expect(ordinary?.manifest.capabilities).toEqual(["project.read", "draft.propose"]);
    expect(ordinary?.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(applyRegistrySlots(skills, [{ slot: "script.primary", skillId: "ordinary", owner: "writer", output: "file" }])
      .find((skill) => skill.id === "ordinary")?.manifest.slots).toEqual(["script.primary"]);
  });

  it("rejects manifest paths that escape the skill root", async () => {
    const root = await tempDirectory();
    const directory = await writeSkill(root, "escape", {
      manifest: manifest("escape", { outputSchema: "../secret.json" }),
    });
    await expect(loadSkillDirectory(directory)).rejects.toThrow(/escapes package root/);
  });

  it("rejects symbolic links that escape an imported skill", async () => {
    const root = await tempDirectory();
    const source = await writeSkill(root, "linked");
    await writeFile(path.join(root, "outside.txt"), "secret");
    await symlink(path.join(root, "outside.txt"), path.join(source, "outside-link"));
    await expect(importSkill({ sourceDirectory: source, targetRoot: path.join(root, "target") })).rejects.toThrow(/escapes/);
  });

  it("imports an ordinary skill as a selected user skill with a pinned version", async () => {
    const root = await tempDirectory();
    const source = await writeSkill(root, "ordinary");
    const result = await importSkill({
      sourceDirectory: source,
      targetRoot: path.join(root, "installed"),
      selectedSlots: ["script.primary"],
      version: "1.2.0",
    });
    expect(result.skill.classification).toBe("user");
    expect(result.skill.manifest.slots).toEqual(["script.primary"]);
    const raw = JSON.parse(await readFile(path.join(result.skill.path, "director-skill.json"), "utf8")) as { version: string };
    expect(raw.version).toBe("1.2.0");
    const pin = pinSkill(result.skill, "script.primary");
    expect(resolvePinnedSkill(pin, [result.skill])).toBe(result.skill);
    expect(resolvePinnedSkill({ ...pin, path: path.join(root, "moved") }, [result.skill])).toBe(result.skill);
    expect(() => resolvePinnedSkill({ ...pin, contentHash: "0".repeat(64) }, [result.skill])).toThrow(/changed on disk/);
  });

  it("keeps an imported ordinary skill unclassified until the user selects a slot", async () => {
    const root = await tempDirectory();
    const source = await writeSkill(root, "unclassified");
    const result = await importSkill({ sourceDirectory: source, targetRoot: path.join(root, "installed") });
    expect(result.skill.classification).toBe("uncategorized");
    expect(result.skill.manifest.slots).toEqual([]);
  });

  it("rejects an imported Skill whose structured output schema is not strict", async () => {
    const root = await tempDirectory();
    const source = await writeSkill(root, "invalid-output", { manifest: manifest("invalid-output"), outputSchema: true });
    const target = path.join(root, "installed");
    await expect(importSkill({ sourceDirectory: source, targetRoot: target })).rejects.toThrow(/must declare a type/);
    expect(await readdir(target)).toEqual([]);
  });
});

describe("registry, dependencies, and legacy agents", () => {
  it("parses the stable markdown registry", () => {
    const rows = parseSkillRegistry("| Slot | Skill | Owner | Output |\n| --- | --- | --- | --- |\n| `script.primary` | `writer` | `agent` | `file.md` |");
    expect(rows).toEqual([{ slot: "script.primary", skillId: "writer", owner: "agent", output: "`file.md`" }]);
  });

  it("reports missing and incompatible dependencies", async () => {
    const root = await tempDirectory();
    const directory = await writeSkill(root, "dependency", { manifest: manifest("dependency"), outputSchema: true });
    const installed = await loadSkillDirectory(directory);
    const issues = validateSkillDependencies(
      { ...installed.manifest, dependencies: [{ id: "dependency", versionRange: "^2.0.0" }, { id: "missing", versionRange: "*" }] },
      [installed],
    );
    expect(issues.map((issue) => issue.code)).toEqual(["dependency.version", "dependency.missing"]);
  });

  it("resolves each dependency to the highest compatible installed version", async () => {
    const root = await tempDirectory();
    const writerOne = await writeSkill(root, "writer-one", {
      manifest: manifest("writer", { version: "1.2.0" }),
      outputSchema: true,
    });
    const writerTwo = await writeSkill(root, "writer-two", {
      manifest: manifest("writer", { version: "1.9.0" }),
      outputSchema: true,
    });
    const writerThree = await writeSkill(root, "writer-three", {
      manifest: manifest("writer", { version: "2.0.0" }),
      outputSchema: true,
    });
    const formatter = await writeSkill(root, "formatter", {
      manifest: manifest("formatter", { version: "3.1.0" }),
      outputSchema: true,
    });
    const installed = await Promise.all(
      [writerOne, writerTwo, writerThree, formatter].map((directory) => loadSkillDirectory(directory)),
    );
    const resolved = resolveSkillDependencies({
      ...installed[0]!.manifest,
      dependencies: [
        { id: "writer", versionRange: "^1.0.0" },
        { id: "formatter", versionRange: ">=3.0.0 <4.0.0" },
      ],
    }, installed);

    expect(resolved.map((skill) => `${skill.id}@${skill.manifest.version}`)).toEqual([
      "writer@1.9.0",
      "formatter@3.1.0",
    ]);
  });

  it("throws clear errors for invalid, missing, and incompatible dependencies", async () => {
    const root = await tempDirectory();
    const directory = await writeSkill(root, "writer", {
      manifest: manifest("writer", { version: "1.4.0" }),
      outputSchema: true,
    });
    const installed = await loadSkillDirectory(directory);

    expect(() => resolveSkillDependencies({
      ...installed.manifest,
      dependencies: [{ id: "writer", versionRange: "not-a-range" }],
    }, [installed])).toThrow(/writer.*invalid semver range.*not-a-range/i);
    expect(() => resolveSkillDependencies({
      ...installed.manifest,
      dependencies: [{ id: "missing", versionRange: "^1.0.0" }],
    }, [installed])).toThrow(/Missing dependency missing \^1\.0\.0/);
    expect(() => resolveSkillDependencies({
      ...installed.manifest,
      dependencies: [{ id: "writer", versionRange: "^2.0.0" }],
    }, [installed])).toThrow(/writer requires \^2\.0\.0.*1\.4\.0/);
  });

  it("flags duplicate IDs and capabilities that were not granted", async () => {
    const root = await tempDirectory();
    const one = await writeSkill(root, "one", { manifest: manifest("same"), outputSchema: true });
    const twoRoot = await tempDirectory();
    const two = await writeSkill(twoRoot, "two", { manifest: manifest("same", { version: "2.0.0" }), outputSchema: true });
    const skills = await Promise.all([loadSkillDirectory(one), loadSkillDirectory(two)]);
    expect([...findDuplicateSkillIds(skills).keys()]).toEqual(["same"]);
    expect(validateCapabilities(
      { ...skills[0]!.manifest, capabilities: ["project.read", "image.generate"] },
      ["project.read"],
    ).map((issue) => issue.code)).toEqual(["capability.not_granted"]);
  });

  it("detects schemas that the Responses structured-output validator rejects", () => {
    const issues = validateStructuredOutputSchema({
      type: "object",
      additionalProperties: false,
      required: ["operations"],
      properties: {
        summary: { type: "string" },
        operations: { type: "array", items: { type: "object", additionalProperties: false, required: ["payload"], properties: { payload: {} } } },
      },
    });
    expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["output_schema.required", "output_schema.type"]));
  });

  it("migrates old instructions without changing the instruction body", () => {
    const source = 'name = "director"\n\ninstructions = """\nKeep this text.\n"""\n';
    const result = migrateLegacyAgentToml(source);
    expect(result.migrated).toBe(true);
    expect(result.content).toContain('developer_instructions = """');
    expect(result.content).toContain("Keep this text.");
    expect(result.warnings[0]).toMatch(/migrated/);
  });
});
