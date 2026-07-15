import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { WorkspaceService } from "./workspace-service";

const temporaryPaths: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryPaths.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("script import confirmation boundary", () => {
  it("keeps preview read-only and creates only the confirmed scene", async () => {
    const root = await mkdtemp(join(tmpdir(), "ai-director-workspace-"));
    temporaryPaths.push(root);
    const projectRoot = join(root, "project");
    const coreSkillRoot = join(root, "core-skills");
    await Promise.all([mkdir(projectRoot), mkdir(coreSkillRoot)]);
    const workspace = new WorkspaceService({ userDataPath: join(root, "user-data"), coreSkillRoot });
    try {
      const project = await workspace.createProject({ name: "导入测试", rootToken: "test-token", template: "film" }, projectRoot);
      const preview = await workspace.stagePastedScript(project.id, "test.fountain", [
        "INT. KITCHEN - NIGHT",
        "A kettle whistles.",
        "",
        "EXT. STREET - DAWN",
        "Rain stops."
      ].join("\n"));

      expect((await workspace.openProject(project.id)).scenes).toHaveLength(0);
      expect(preview.sceneProposals).toHaveLength(2);

      const accepted = preview.sceneProposals[1]!;
      const applied = await workspace.applyScriptImport({
        projectId: project.id,
        importToken: preview.importToken,
        acceptedSceneProposalIds: [accepted.id],
        createRevision: true
      });
      expect(applied.scenes).toHaveLength(1);
      expect(applied.scenes[0]?.heading).toBe(accepted.heading);
      expect(applied.scriptBlocks.every((block) => block.source?.file === "test.fountain")).toBe(true);
    } finally {
      workspace.close();
    }
  });

  it("keeps an ordinary imported Skill unclassified until a Slot is selected", async () => {
    const root = await mkdtemp(join(tmpdir(), "ai-director-workspace-"));
    temporaryPaths.push(root);
    const coreSkillRoot = join(root, "core-skills");
    const sourceSkill = join(root, "source-skill");
    const projectRoot = join(root, "project");
    await Promise.all([mkdir(coreSkillRoot), mkdir(sourceSkill), mkdir(projectRoot)]);
    await writeFile(join(sourceSkill, "SKILL.md"), "---\nname: custom-writer\ndescription: Local test Skill\n---\n\n# Custom Writer\n", "utf8");
    const workspace = new WorkspaceService({ userDataPath: join(root, "user-data"), coreSkillRoot });
    try {
      const imported = await workspace.importSkillFolder(sourceSkill);
      expect(imported.classification).toBe("uncategorized");
      expect(imported.manifest.slots).toEqual([]);
      const assigned = await workspace.assignSkillSlot(imported.id, imported.manifest.version, "script.primary", imported.contentHash);
      expect(assigned.classification).toBe("user");
      expect(assigned.manifest.slots).toEqual(["script.primary"]);

      const project = await workspace.createProject({ name: "Skill 测试", rootToken: "test-token", template: "film" }, projectRoot);
      await workspace.bindSkill({ projectId: project.id, slot: "script.primary", skillId: assigned.id, version: assigned.manifest.version, contentHash: assigned.contentHash });
      const binding = (await workspace.openProject(project.id)).skillBindings[0];
      expect(binding?.skillPath).toBe(`installed:${assigned.id}@${assigned.manifest.version}`);
      await workspace.setSkillEnabled(project.id, assigned.id, assigned.manifest.version, false);
      expect(await workspace.skillEnabled(project.id, assigned.id, assigned.manifest.version)).toBe(false);
      await expect(workspace.bindSkill({ projectId: project.id, slot: "script.primary", skillId: assigned.id, version: assigned.manifest.version, contentHash: assigned.contentHash })).rejects.toThrow("启用");
      await workspace.setSkillEnabled(project.id, assigned.id, assigned.manifest.version, true);

      const before = await workspace.readSkillContent(assigned.id, assigned.manifest.version);
      const concurrent = await Promise.allSettled([
        workspace.updateSkillContent(assigned.id, assigned.manifest.version, before.contentHash, `${before.content}\n## Project guidance\nKeep revisions reviewable.\n`),
        workspace.updateSkillContent(assigned.id, assigned.manifest.version, before.contentHash, `${before.content}\n## Conflicting guidance\nThis write must lose.\n`)
      ]);
      expect(concurrent.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      const updated = concurrent.find((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof workspace.updateSkillContent>>> => result.status === "fulfilled")!.value;
      expect(updated.contentHash).not.toBe(before.contentHash);
      expect((await workspace.readSkillContent(updated.id, updated.manifest.version)).content).toContain("Project guidance");
      await expect(workspace.updateSkillContent(updated.id, updated.manifest.version, before.contentHash, before.content)).rejects.toThrow("其他位置改变");
    } finally {
      workspace.close();
    }
  });
});
