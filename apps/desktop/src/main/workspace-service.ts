import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { Project, ScriptBlockKind, StageSlot } from "@ai-director/domain";
import type { ScriptImportResult } from "@ai-director/import-export";
import { importPastedScript, importScriptBuffer } from "@ai-director/import-export";
import {
  copyCoreSkillForEditing,
  discoverSkills,
  importSkill,
  isPathInside,
  loadSkillDirectory,
  pinSkill,
  validateSkillPackage,
  type SkillDescriptor,
  type SkillSourceRoot
} from "@ai-director/skill-runtime";
import { openDirectorStore, type DirectorStore, type ProjectBundle } from "@ai-director/storage";
import type {
  ApplyImportInputSchema,
  BindSkillInputSchema,
  CreateProjectInput,
  ImportPreviewDto,
  ProjectSummaryDto,
  SkillSummaryDto
} from "../shared/ipc";
import type { z } from "zod";
import { ProjectCatalog, type CatalogProjectSummary } from "./project-catalog";
import { assetUrl } from "./asset-protocol";

interface StagedImport {
  projectId: string;
  createdAt: number;
  result: ScriptImportResult;
}

export interface WorkspaceServiceOptions {
  userDataPath: string;
  coreSkillRoot: string;
}

const BLOCK_KIND_MAP: Record<string, ScriptBlockKind> = {
  "scene-heading": "scene_heading",
  action: "action",
  character: "character",
  dialogue: "dialogue",
  parenthetical: "parenthetical",
  transition: "transition",
  title: "note",
  note: "note"
};

const SCENE_ENVIRONMENT_PREFIX = /^(?:INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|INT\.?(?=[\s·:：—-]|$)|EXT\.?(?=[\s·:：—-]|$)|内\/外景|外\/内景|内外景|内景|外景)\s*(?:[·:：-]\s*)?/i;

function inferInteriorExterior(heading: string): "INT" | "EXT" | "INT/EXT" | "OTHER" {
  if (/^(?:INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|内\/外景|外\/内景|内外景)/i.test(heading)) return "INT/EXT";
  if (/^(?:INT\.?(?=[\s·:：—-]|$)|内景)/i.test(heading)) return "INT";
  if (/^(?:EXT\.?(?=[\s·:：—-]|$)|外景)/i.test(heading)) return "EXT";
  return "OTHER";
}

function parseSceneHeadingDetails(heading: string): { location: string; timeOfDay: string } {
  const body = heading.replace(SCENE_ENVIRONMENT_PREFIX, "").trim();
  const parts = body.split(/(?:\s+[—-]\s+|[·—])/u).map((part) => part.trim()).filter(Boolean);
  return {
    location: parts[0] ?? "",
    timeOfDay: parts.length > 1 ? parts.at(-1) ?? "" : ""
  };
}

function skillVersionKey(skillId: string, version: string): string {
  return `${skillId}@${version}`;
}

function portableSkillLocator(skillId: string, version: string): string {
  return `installed:${skillVersionKey(skillId, version)}`;
}

export class WorkspaceService {
  readonly catalog: ProjectCatalog;
  readonly userSkillRoot: string;
  readonly #coreSkillRoot: string;
  readonly #stores = new Map<string, DirectorStore>();
  readonly #stagedImports = new Map<string, StagedImport>();
  readonly #skillMutationTails = new Map<string, Promise<void>>();

  constructor(options: WorkspaceServiceOptions) {
    this.catalog = new ProjectCatalog(options.userDataPath);
    this.userSkillRoot = join(options.userDataPath, "skills");
    this.#coreSkillRoot = options.coreSkillRoot;
  }

  async listProjects(): Promise<ProjectSummaryDto[]> {
    return (await this.catalog.list()).map(({ rootPath: _rootPath, ...summary }) => summary);
  }

  async createProject(input: CreateProjectInput, authorizedRootPath: string): Promise<ProjectSummaryDto> {
    const summary = await this.catalog.create(input, authorizedRootPath);
    const store = this.openStore(summary);
    const now = new Date().toISOString();
    const project: Project = {
      id: summary.id,
      projectId: summary.id,
      name: summary.name,
      logline: "",
      synopsis: "",
      format: input.template === "series" ? "series" : "film",
      language: "zh-CN",
      episodeMode: input.template === "series",
      status: "development",
      createdAt: now,
      updatedAt: now
    };
    store.projects.commit(project, {
      author: { type: "user", name: "用户" },
      expectedRevision: null,
      message: "新建项目"
    });
    await this.bindDefaultSkills(summary.id);
    const { rootPath: _rootPath, ...publicSummary } = summary;
    return publicSummary;
  }

  async importExisting(rootPath: string): Promise<ProjectSummaryDto> {
    const summary = await this.catalog.importExisting(rootPath);
    const store = this.openStore(summary);
    const existing = store.listProjects()[0];
    if (existing && existing.id !== summary.id) {
      store.close();
      this.#stores.delete(summary.id);
      const replaced = await this.catalog.replaceIdentity(summary.id, existing.id, existing.name);
      const { rootPath: _rootPath, ...publicSummary } = replaced;
      return publicSummary;
    }
    if (!existing) {
      const now = new Date().toISOString();
      store.projects.commit({
        id: summary.id,
        projectId: summary.id,
        name: summary.name,
        logline: "",
        synopsis: "",
        format: "other",
        language: "zh-CN",
        episodeMode: false,
        status: "development",
        createdAt: now,
        updatedAt: now
      }, { author: { type: "import", name: "项目迁移" }, expectedRevision: null, message: "导入现有项目" });
    }
    const { rootPath: _rootPath, ...publicSummary } = summary;
    return publicSummary;
  }

  async openProject(projectId: string): Promise<ProjectBundle> {
    const summary = await this.catalog.get(projectId);
    const store = this.openStore(summary);
    store.runs.recoverInterrupted(projectId);
    this.normalizePortableSkillReferences(projectId, store);
    await this.catalog.setActive(projectId);
    return this.sanitizeBundleForRenderer(store.getBundle(projectId));
  }

  async stageScriptFile(projectId: string, path: string): Promise<ImportPreviewDto> {
    await this.catalog.get(projectId);
    const result = await importScriptBuffer(basename(path), await readFile(path));
    return this.stageImport(projectId, result);
  }

  async stagePastedScript(projectId: string, sourceName: string, text: string): Promise<ImportPreviewDto> {
    await this.catalog.get(projectId);
    return this.stageImport(projectId, await importPastedScript(text, sourceName));
  }

  async applyScriptImport(input: z.infer<typeof ApplyImportInputSchema>): Promise<ProjectBundle> {
    const staged = this.#stagedImports.get(input.importToken);
    if (!staged || staged.projectId !== input.projectId) throw new Error("导入预览已过期，请重新选择剧本。");
    if (staged.result.warnings.some((warning) => warning.blocking)) {
      throw new Error("导入预览仍有阻断问题；请先完成 OCR 或修复源文件。");
    }
    const accepted = new Set(input.acceptedSceneProposalIds);
    const selectedScenes = staged.result.sceneProposals.filter((scene) => accepted.has(scene.id));
    if (!selectedScenes.length) throw new Error("至少确认一个场景后才能导入。");
    const summary = await this.catalog.get(input.projectId);
    const store = this.openStore(summary);
    const now = new Date().toISOString();
    const existingSceneCount = store.scenes.list({ projectId: input.projectId }).length;
    store.database.transaction(() => {
      let act = store.acts.list({ projectId: input.projectId })[0];
      if (!act) {
        act = {
          id: `act_${randomUUID()}`,
          projectId: input.projectId,
          title: "第一幕",
          number: 1,
          dramaticPurpose: "待完善",
          ordinal: 0,
          createdAt: now,
          updatedAt: now
        };
        store.acts.commit(act, { author: { type: "import", name: "剧本导入" }, expectedRevision: null, message: "创建默认幕" });
      }
      let sequence = store.sequences.list({ projectId: input.projectId })[0];
      if (!sequence) {
        sequence = {
          id: `sequence_${randomUUID()}`,
          projectId: input.projectId,
          actId: act.id,
          title: "开场戏",
          number: 1,
          dramaticQuestion: "待完善",
          synopsis: "由导入剧本创建",
          ordinal: 0,
          createdAt: now,
          updatedAt: now
        };
        store.sequences.commit(sequence, { author: { type: "import", name: "剧本导入" }, expectedRevision: null, message: "创建默认戏" });
      }
      for (const [sceneIndex, proposal] of selectedScenes.entries()) {
        const sceneId = `scene_${randomUUID()}`;
        const headingDetails = parseSceneHeadingDetails(proposal.heading);
        store.scenes.commit({
          id: sceneId,
          projectId: input.projectId,
          sequenceId: sequence.id,
          sceneNumber: String(existingSceneCount + sceneIndex + 1).padStart(3, "0"),
          heading: proposal.heading,
          location: headingDetails.location,
          timeOfDay: headingDetails.timeOfDay,
          interiorExterior: inferInteriorExterior(proposal.heading),
          synopsis: "",
          dramaticValueBefore: "",
          dramaticValueAfter: "",
          estimatedSeconds: 0,
          ordinal: existingSceneCount + sceneIndex,
          createdAt: now,
          updatedAt: now
        }, { author: { type: "import", name: "剧本导入" }, expectedRevision: null, message: `确认导入场景 ${proposal.heading}` });

        const sourceBlocks = proposal.blockIds
          .map((id) => staged.result.blocks.find((block) => block.id === id))
          .filter((block): block is NonNullable<typeof block> => Boolean(block));
        for (const [blockIndex, block] of sourceBlocks.entries()) {
          store.scriptBlocks.commit({
            id: `block_${randomUUID()}`,
            projectId: input.projectId,
            sceneId,
            kind: BLOCK_KIND_MAP[block.kind] ?? "note",
            text: block.text,
            ordinal: blockIndex,
            source: { file: staged.result.sourceName, start: block.sourceLineStart, end: block.sourceLineEnd },
            createdAt: now,
            updatedAt: now
          }, { author: { type: "import", name: "剧本导入" }, expectedRevision: null, message: "导入剧本语义块" });
        }
      }
      store.settings.set(input.projectId, "lastScriptImport", {
        sourceName: staged.result.sourceName,
        sourceHash: staged.result.sourceHash,
        importedAt: now
      });
    });
    this.#stagedImports.delete(input.importToken);
    await this.catalog.update(input.projectId, {
      currentStage: "剧本",
      progress: 12,
      sceneCount: existingSceneCount + selectedScenes.length
    });
    return this.sanitizeBundleForRenderer(store.getBundle(input.projectId));
  }

  async listSkills(): Promise<SkillDescriptor[]> {
    await mkdir(this.userSkillRoot, { recursive: true });
    const roots: SkillSourceRoot[] = [
      { path: this.#coreSkillRoot, classification: "core" },
      { path: this.userSkillRoot, classification: "user" }
    ];
    return discoverSkills(roots);
  }

  async importSkillFolder(sourceDirectory: string): Promise<SkillDescriptor> {
    const installed = await this.listSkills();
    const result = await importSkill({
      sourceDirectory,
      targetRoot: this.userSkillRoot,
      installed,
      grantedCapabilities: ["project.read", "draft.propose"]
    });
    result.skill.warnings.push(...result.warnings.map((warning) => warning.message));
    return result.skill;
  }

  async cloneSkill(skillId: string): Promise<SkillDescriptor> {
    const installed = await this.listSkills();
    const skill = installed.find((candidate) => candidate.id === skillId && candidate.classification === "core");
    if (!skill) throw new Error("没有找到可复制的核心 Skill。");
    const [major, minor, patch] = skill.manifest.version.split(".").map(Number);
    const prefix = `${major || 1}.${minor || 0}.${(patch || 0) + 1}-user.`;
    const existingVersions = new Set(installed.filter((candidate) => candidate.id === skill.id).map((candidate) => candidate.manifest.version));
    let revision = 1;
    while (existingVersions.has(`${prefix}${revision}`)) revision += 1;
    return copyCoreSkillForEditing(skill, this.userSkillRoot, `${prefix}${revision}`);
  }

  async assignSkillSlot(skillId: string, version: string, slot: StageSlot, expectedContentHash: string): Promise<SkillDescriptor> {
    return this.withSkillMutation(skillVersionKey(skillId, version), async () => {
      const skill = (await this.listSkills()).find((candidate) => candidate.id === skillId && candidate.manifest.version === version);
      if (!skill || skill.classification !== "uncategorized" || !isPathInside(this.userSkillRoot, skill.path)) {
        throw new Error("只有尚未分类的用户 Skill 可以选择工作流 Slot。");
      }
      if (skill.contentHash !== expectedContentHash) throw new Error("Skill 内容已在其他位置改变，请重新选择后再分类。");
      const manifestPath = join(skill.path, "director-skill.json");
      const original = await readFile(manifestPath, "utf8");
      const temporaryPath = `${manifestPath}.tmp-${process.pid}-${Date.now()}-${randomUUID()}`;
      const manifest = { ...skill.manifest, slots: [slot] };
      await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
      await rename(temporaryPath, manifestPath);
      try {
        return await loadSkillDirectory(skill.path, { sourceRoot: this.userSkillRoot, classification: "user" });
      } catch (error) {
        const rollbackPath = `${manifestPath}.rollback-${process.pid}-${Date.now()}-${randomUUID()}`;
        await writeFile(rollbackPath, original, { encoding: "utf8", mode: 0o600, flag: "wx" });
        await rename(rollbackPath, manifestPath);
        throw error;
      }
    });
  }

  async readSkillContent(skillId: string, version: string): Promise<{ content: string; contentHash: string; readOnly: boolean }> {
    const skill = (await this.listSkills()).find((candidate) => candidate.id === skillId && candidate.manifest.version === version);
    if (!skill) throw new Error("没有找到所选 Skill 版本。");
    return {
      content: await readFile(skill.entryPath, "utf8"),
      contentHash: skill.contentHash,
      readOnly: skill.classification === "core"
    };
  }

  async updateSkillContent(skillId: string, version: string, expectedContentHash: string, content: string): Promise<SkillDescriptor> {
    return this.withSkillMutation(skillVersionKey(skillId, version), async () => {
      const installed = await this.listSkills();
      const skill = installed.find((candidate) => candidate.id === skillId && candidate.manifest.version === version);
      if (!skill || skill.classification === "core" || !isPathInside(this.userSkillRoot, skill.path)) {
        throw new Error("核心 Skill 为只读；请先创建用户副本。");
      }
      if (skill.contentHash !== expectedContentHash) throw new Error("Skill 内容已在其他位置改变，请重新打开后再保存。");
      const original = await readFile(skill.entryPath, "utf8");
      const writeAtomically = async (value: string): Promise<void> => {
        const temporaryPath = `${skill.entryPath}.tmp-${process.pid}-${Date.now()}-${randomUUID()}`;
        await writeFile(temporaryPath, value, { encoding: "utf8", mode: 0o600, flag: "wx" });
        await rename(temporaryPath, skill.entryPath);
      };
      await writeAtomically(content);
      try {
        const updated = await loadSkillDirectory(skill.path, { sourceRoot: this.userSkillRoot, classification: "user" });
        const validation = await validateSkillPackage(updated, installed.map((candidate) => candidate === skill ? updated : candidate), updated.manifest.capabilities);
        if (!validation.valid) throw new Error(validation.issues.filter((issue) => issue.severity === "error").map((issue) => issue.message).join(" "));
        updated.warnings.push(...validation.issues.filter((issue) => issue.severity === "warning").map((issue) => issue.message));
        return updated;
      } catch (error) {
        await writeAtomically(original);
        throw error;
      }
    });
  }

  async bindSkill(input: z.infer<typeof BindSkillInputSchema>): Promise<void> {
    await this.withSkillMutation(skillVersionKey(input.skillId, input.version), async () => {
      const summary = await this.catalog.get(input.projectId);
      const store = this.openStore(summary);
      const installed = await this.listSkills();
      const skill = installed.find((candidate) => candidate.id === input.skillId && candidate.manifest.version === input.version);
      if (!skill) throw new Error("所选 Skill 版本未安装。");
      if (skill.contentHash !== input.contentHash) throw new Error("Skill 内容已改变，请刷新后重新绑定。");
      if (!this.isSkillEnabled(store, input.projectId, skill.id, skill.manifest.version)) throw new Error("请先启用所选 Skill 再绑定。");
      const pin = pinSkill(skill, input.slot);
      store.skills.bind({
        id: `binding_${randomUUID()}`,
        projectId: input.projectId,
        slot: input.slot,
        skillId: pin.id,
        skillVersion: pin.version,
        skillPath: portableSkillLocator(pin.id, pin.version),
        contentHash: pin.contentHash,
        boundAt: new Date().toISOString()
      });
    });
  }

  async setSkillEnabled(projectId: string, skillId: string, version: string, enabled: boolean): Promise<SkillDescriptor> {
    const summary = await this.catalog.get(projectId);
    const store = this.openStore(summary);
    const skill = (await this.listSkills()).find((candidate) => candidate.id === skillId && candidate.manifest.version === version);
    if (!skill) throw new Error("所选 Skill 版本未安装。");
    const disabled = new Set(store.settings.get<string[]>(projectId, "disabledSkills") ?? []);
    const key = skillVersionKey(skillId, version);
    if (enabled) disabled.delete(key); else disabled.add(key);
    store.settings.set(projectId, "disabledSkills", [...disabled].sort());
    return skill;
  }

  skillEnabled(projectId: string, skillId: string, version: string): Promise<boolean> {
    return this.getStore(projectId).then((store) => this.isSkillEnabled(store, projectId, skillId, version));
  }

  toSkillSummary(skill: SkillDescriptor, enabled = true): SkillSummaryDto {
    return {
      id: skill.id,
      name: skill.name,
      version: skill.manifest.version,
      source: skill.classification,
      readOnly: skill.classification === "core",
      enabled,
      slots: skill.manifest.slots,
      contentHash: skill.contentHash,
      capabilities: skill.manifest.capabilities,
      warnings: skill.warnings
    };
  }

  getStore(projectId: string): Promise<DirectorStore> {
    return this.catalog.get(projectId).then((summary) => this.openStore(summary));
  }

  close(): void {
    for (const store of this.#stores.values()) store.close();
    this.#stores.clear();
  }

  sanitizeBundleForRenderer(bundle: ProjectBundle): ProjectBundle {
    return {
      ...bundle,
      references: bundle.references.map((reference) => ({ ...reference, filePath: assetUrl("reference", bundle.project.id, reference.id) })),
      draftImages: bundle.draftImages.map((image) => ({ ...image, filePath: assetUrl("draft", bundle.project.id, image.id) }))
    };
  }

  private openStore(summary: CatalogProjectSummary): DirectorStore {
    const cached = this.#stores.get(summary.id);
    if (cached) return cached;
    const store = openDirectorStore(summary.rootPath);
    store.runs.recoverInterrupted(summary.id);
    this.#stores.set(summary.id, store);
    return store;
  }

  private stageImport(projectId: string, result: ScriptImportResult): ImportPreviewDto {
    const importToken = randomUUID();
    this.#stagedImports.set(importToken, { projectId, result, createdAt: Date.now() });
    for (const [token, staged] of this.#stagedImports) {
      if (Date.now() - staged.createdAt > 30 * 60_000) this.#stagedImports.delete(token);
    }
    return {
      importToken,
      sourceName: result.sourceName,
      format: result.format,
      blocks: result.blocks.map(({ id, kind, text }) => ({ id, kind, text })),
      sceneProposals: result.sceneProposals,
      warnings: result.warnings
    };
  }

  private async bindDefaultSkills(projectId: string): Promise<void> {
    const store = await this.getStore(projectId);
    const skills = await this.listSkills();
    const defaults: Array<[StageSlot, string]> = [
      ["script.primary", "screenwriter-workflow"],
      ["guides.primary", "guide-workflow"],
      ["shotlist.breakdown", "shotlist-breakdown-workflow"],
      ["shotlist.primary", "sketch-shotlist-workflow"],
      ["qa.primary", "qa-workflow"],
      ["artifact.formatter", "artifact-formatter"],
      ["version.manager", "version-management"]
    ];
    for (const [slot, skillId] of defaults) {
      const skill = skills.find((candidate) => candidate.id === skillId && candidate.manifest.slots.includes(slot));
      if (!skill) continue;
      const pin = pinSkill(skill, slot);
      store.skills.bind({
        id: `binding_${randomUUID()}`,
        projectId,
        slot,
        skillId: pin.id,
        skillVersion: pin.version,
        skillPath: portableSkillLocator(pin.id, pin.version),
        contentHash: pin.contentHash,
        boundAt: new Date().toISOString()
      });
    }
  }

  private isSkillEnabled(store: DirectorStore, projectId: string, skillId: string, version: string): boolean {
    const disabled = store.settings.get<string[]>(projectId, "disabledSkills") ?? [];
    return !disabled.includes(skillVersionKey(skillId, version));
  }

  private normalizePortableSkillReferences(projectId: string, store: DirectorStore): void {
    for (const binding of store.skills.list(projectId)) {
      const locator = portableSkillLocator(binding.skillId, binding.skillVersion);
      if (binding.skillPath !== locator) store.skills.bind({ ...binding, skillPath: locator });
    }
    for (const run of store.runs.list(projectId)) {
      const locator = `run:${skillVersionKey(run.skill.id, run.skill.version)}`;
      if (run.skill.path !== locator) store.runs.save({ ...run, skill: { ...run.skill, path: locator } });
    }
  }

  private async withSkillMutation<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.#skillMutationTails.get(key) ?? Promise.resolve();
    let release = (): void => undefined;
    const gate = new Promise<void>((resolveGate) => { release = resolveGate; });
    const tail = previous.catch(() => undefined).then(() => gate);
    this.#skillMutationTails.set(key, tail);
    await previous.catch(() => undefined);
    try {
      return await operation();
    } finally {
      release();
      if (this.#skillMutationTails.get(key) === tail) this.#skillMutationTails.delete(key);
    }
  }
}
