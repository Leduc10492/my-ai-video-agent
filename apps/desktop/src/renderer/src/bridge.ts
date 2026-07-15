import type {
  AgentEventDto,
  DesktopApi,
  ImportPreviewDto,
  ProjectSummaryDto,
  RuntimePreferenceDto,
  RuntimeHealthDto,
  RunAgentInput,
  SkillSummaryDto,
  StageSlot
} from "../../shared/ipc";
import {
  assets as demoAssets,
  draftImages as demoDraftImages,
  hierarchy as demoHierarchy,
  initialEnvelopes as demoEnvelopes,
  initialScriptBlocks as demoScriptBlocks,
  initialSkills as demoSkills,
  initialTasks as demoTasks,
  projects as demoProjects,
  qaFindings as demoQaFindings,
  shots as demoShots
} from "./data";
import type {
  AgentEvent,
  AgentRuntimePreference,
  AssetItem,
  HierarchyNode,
  ImportPreview,
  ProjectSummary,
  PromptEnvelope,
  QaFinding,
  RuntimeHealth,
  ScriptBlock,
  ShotRow,
  SkillItem,
  TaskItem,
  WorkspaceSnapshot
} from "./types";

type BridgeRecord = Record<string, unknown>;

function nativeApi(): DesktopApi | undefined {
  const api = (window as unknown as { aiDirector?: DesktopApi }).aiDirector;
  if (!api && window.location.protocol === "file:") {
    throw new Error("桌面安全桥接没有加载。请重启应用；若问题持续，请重新安装当前版本。");
  }
  return api;
}

export function hasNativeBridge(): boolean {
  return typeof (window as unknown as { aiDirector?: DesktopApi }).aiDirector?.projects?.list === "function";
}

function record(value: unknown): BridgeRecord {
  return value && typeof value === "object" ? value as BridgeRecord : {};
}

function list(value: unknown): BridgeRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function localImageSource(path: unknown): string | undefined {
  if (typeof path !== "string" || !path.trim()) return undefined;
  if (/^(?:data:|blob:|aidirector-asset:)/.test(path)) return path;
  return undefined;
}

function toProjectSummary(value: ProjectSummaryDto | ProjectSummary | BridgeRecord): ProjectSummary {
  const source = record(value);
  if (typeof source.title === "string") return value as ProjectSummary;
  const name = text(source.name, "未命名项目");
  const sceneCount = number(source.sceneCount);
  const openTaskCount = number(source.openTaskCount);
  const archived = Boolean(source.archived);
  const updated = text(source.updatedAt);
  return {
    id: text(source.id, `project-${Date.now()}`),
    title: name,
    subtitle: `${sceneCount} 场 · ${openTaskCount} 项待处理`,
    status: archived ? "已归档" : openTaskCount > 0 ? "待审阅" : "制作中",
    progress: number(source.progress),
    updatedAt: updated
      ? new Date(updated).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "刚刚",
    sceneCount
  };
}

function toSkillItem(value: SkillSummaryDto | BridgeRecord): SkillItem {
  const source = record(value);
  const sourceType = text(source.source);
  const slots = Array.isArray(source.slots) ? source.slots.filter((item): item is string => typeof item === "string") : [];
  const warnings = Array.isArray(source.warnings) ? source.warnings.filter((item): item is string => typeof item === "string") : [];
  return {
    id: text(source.id, `skill-${Date.now()}`),
    name: text(source.name, text(source.id, "未命名 Skill")),
    version: text(source.version, "0.0.0"),
    slot: slots[0] ?? "未分类",
    slots,
    source: sourceType === "core" ? "核心" : sourceType === "user" ? "用户副本" : "本地导入",
    enabled: source.enabled !== false,
    contentHash: text(source.contentHash) || undefined,
    capabilities: Array.isArray(source.capabilities)
      ? source.capabilities.filter((item): item is string => typeof item === "string")
      : ["project.read", "draft.propose"],
    description: warnings[0] ?? (sourceType === "core" ? "随应用提供的只读核心 Skill。" : "安装在本机的用户 Skill。")
  };
}

function toWorkspaceSnapshot(input: unknown): WorkspaceSnapshot {
  const outer = record(input);
  const bundle = record(outer.bundle ?? input);
  const scenes = list(bundle.scenes).sort((a, b) => number(a.ordinal) - number(b.ordinal));
  const sequences = list(bundle.sequences).sort((a, b) => number(a.ordinal) - number(b.ordinal));
  const acts = list(bundle.acts).sort((a, b) => number(a.ordinal) - number(b.ordinal));
  const episodes = list(bundle.episodes).sort((a, b) => number(a.ordinal) - number(b.ordinal));
  const references = list(bundle.references);
  const links = list(bundle.links);
  const nativeShots = list(bundle.shotRows).sort((a, b) => number(a.ordinal) - number(b.ordinal));
  const shotNumberById = new Map(nativeShots.map((shot) => [text(shot.id), text(shot.shotNumber, text(shot.id))]));
  const sceneById = new Map(scenes.map((scene) => [text(scene.id), scene]));

  const scriptBlocks: ScriptBlock[] = list(bundle.scriptBlocks)
    .sort((a, b) => number(a.ordinal) - number(b.ordinal))
    .map((block) => ({
      id: text(block.id),
      type: block.kind === "scene_heading" ? "scene-heading" : block.kind === "character" ? "character" : block.kind === "dialogue" ? "dialogue" : "action",
      label: block.kind === "scene_heading" ? "场景标题" : block.kind === "character" ? "角色" : block.kind === "dialogue" ? "对白" : "动作",
      content: text(block.text)
    }));

  const mappedAssets: AssetItem[] = list(bundle.assets).map((asset) => {
    const reference = references.find((item) => text(item.assetId) === text(asset.id) && item.approval === "approved")
      ?? references.find((item) => text(item.assetId) === text(asset.id));
    return {
      id: text(asset.id),
      type: asset.kind === "character" ? "角色" : asset.kind === "location" ? "地点" : asset.kind === "style" ? "风格" : "道具",
      name: text(asset.name, "未命名资产"),
      meta: text(asset.description, "尚未补充描述"),
      status: asset.approval === "approved" ? "已批准" : asset.approval === "rejected" ? "待补充" : "草稿",
      image: localImageSource(reference?.filePath),
      usage: asset.scope === "scene" ? "场景专属" : "共享资产"
    };
  });

  const mappedShots: ShotRow[] = nativeShots.map((shot) => ({
    id: text(shot.shotNumber, text(shot.id)),
    entityId: text(shot.id),
    sceneId: text(shot.sceneId),
    size: text(shot.framing),
    camera: [text(shot.lens), text(shot.cameraPosition), text(shot.cameraMovement)].filter(Boolean).join(" · "),
    action: text(shot.action),
    performance: text(shot.performance),
    duration: number(shot.durationSeconds, 1),
    cutReason: text(shot.cutReason)
  }));

  const mappedEnvelopes: PromptEnvelope[] = list(bundle.promptEnvelopes)
    .sort((a, b) => number(a.ordinal) - number(b.ordinal))
    .map((envelope) => ({
      id: text(envelope.envelopeNumber, text(envelope.id)),
      entityId: text(envelope.id),
      sceneId: text(envelope.sceneId),
      name: text(envelope.title, "未命名 Envelope"),
      shotIds: links
        .filter((link) => text(link.promptEnvelopeId) === text(envelope.id))
        .sort((a, b) => number(a.orderInEnvelope) - number(b.orderInEnvelope))
        .map((link) => shotNumberById.get(text(link.shotRowId)) ?? text(link.shotRowId)),
      model: text(envelope.targetModel, "gpt-image-2"),
      duration: number(envelope.durationSeconds, 1),
      prompt: text(envelope.promptZh),
      status: envelope.generationReliability === "low" ? "需检查" : envelope.generationReliability === "high" ? "就绪" : "草稿"
    }));

  const mappedTasks: TaskItem[] = list(bundle.tasks).map((task) => ({
    id: text(task.id),
    title: text(task.title),
    owner: text(task.assignee, "未分配"),
    priority: task.priority === "urgent" ? "P0" : task.priority === "high" ? "P1" : task.priority === "medium" ? "P2" : "P3",
    due: text(task.dueAt) ? new Date(text(task.dueAt)).toLocaleDateString("zh-CN") : "未设置",
    scene: text(task.relatedEntityId, "全项目"),
    relatedType: text(task.relatedEntityType) || undefined,
    status: task.status === "done" ? "已完成" : task.status === "blocked" ? "待审阅" : task.status === "in_progress" ? "进行中" : "待处理"
  }));

  const mappedQa: QaFinding[] = list(bundle.qaFindings).map((finding) => ({
    id: text(finding.id),
    priority: (["P0", "P1", "P2", "P3"].includes(text(finding.severity)) ? text(finding.severity) : "P2") as QaFinding["priority"],
    title: text(finding.title),
    detail: text(finding.description),
    scope: [text(finding.entityType), text(finding.entityId)].filter(Boolean).join(" · ") || "全项目",
    status: finding.status === "resolved" ? "已修复" : finding.status === "dismissed" ? "已忽略" : "未处理"
  }));

  function sceneNodes(sequenceId: string): HierarchyNode[] {
    return scenes.filter((scene) => text(scene.sequenceId) === sequenceId).map((scene) => ({
      id: text(scene.id),
      label: `S${text(scene.sceneNumber)} ${text(scene.heading)}`,
      meta: `${Math.round(number(scene.estimatedSeconds))}s`,
      kind: "scene" as const
    }));
  }
  function sequenceNodes(actId: string): HierarchyNode[] {
    return sequences.filter((sequence) => text(sequence.actId) === actId).map((sequence) => {
      const children = sceneNodes(text(sequence.id));
      return { id: text(sequence.id), label: `戏 ${String(number(sequence.number)).padStart(2, "0")} · ${text(sequence.title)}`, meta: `${children.length} 场`, kind: "sequence" as const, children };
    });
  }
  function actNodes(episodeId?: string): HierarchyNode[] {
    return acts.filter((act) => episodeId ? text(act.episodeId) === episodeId : !text(act.episodeId)).map((act) => {
      const children = sequenceNodes(text(act.id));
      const count = children.reduce((sum, child) => sum + (child.children?.length ?? 0), 0);
      return { id: text(act.id), label: text(act.title, `第 ${number(act.number)} 幕`), meta: `${count} 场`, kind: "act" as const, children };
    });
  }
  const hierarchy: HierarchyNode[] = episodes.length
    ? [
        ...episodes.map((episode) => ({ id: text(episode.id), label: `第 ${number(episode.number)} 集 · ${text(episode.title)}`, meta: "集", kind: "episode" as const, children: actNodes(text(episode.id)) })),
        ...actNodes()
      ]
    : actNodes();

  return {
    scriptBlocks,
    assets: mappedAssets,
    shots: mappedShots,
    envelopes: mappedEnvelopes,
    tasks: mappedTasks,
    qaFindings: mappedQa,
    hierarchy,
    draftImages: list(bundle.draftImages).map((image) => ({
      id: text(image.id),
      url: localImageSource(image.filePath),
      label: image.status === "accepted" ? "已接受" : image.status === "rejected" ? "已淘汰" : "候选",
      promptEnvelopeId: text(image.promptEnvelopeId)
    })),
    staleItems: list(bundle.stale).map((item) => ({
      entityType: text(item.entityType),
      entityId: text(item.entityId),
      sourceEntityType: text(item.sourceEntityType) || undefined,
      sourceEntityId: text(item.sourceEntityId) || undefined,
      reason: text(item.reason, "上游内容发生变化")
    })),
    skillBindings: list(bundle.skillBindings).map((binding) => ({
      slot: text(binding.slot),
      skillId: text(binding.skillId),
      version: text(binding.skillVersion),
      contentHash: text(binding.contentHash) || undefined
    }))
  };
}

export const appBridge = {
  isNative: hasNativeBridge,
  listProjects: async (): Promise<ProjectSummary[]> => {
    const api = nativeApi();
    if (!api) return demoProjects;
    return (await api.projects.list()).map(toProjectSummary);
  },
  createProject: async (input: { title: string; format: string }): Promise<ProjectSummary | null> => {
    const api = nativeApi();
    if (!api) return { id: `preview-${Date.now()}`, title: input.title, subtitle: `${input.format} · 网页预览`, status: "制作中", progress: 0, updatedAt: "刚刚", sceneCount: 0 };
    const root = await api.projects.chooseRoot();
    if (!root) return null;
    const created = await api.projects.create({ name: input.title, rootToken: root.token, template: input.format === "剧集" ? "series" : input.format === "短片" ? "blank" : "film" });
    return toProjectSummary(created);
  },
  importProject: async (): Promise<ProjectSummary | null> => {
    const api = nativeApi();
    if (!api) return null;
    const imported = await api.projects.importExisting();
    return imported ? toProjectSummary(imported) : null;
  },
  openProject: async (projectId: string): Promise<WorkspaceSnapshot | null> => {
    const api = nativeApi();
    if (!api) return { scriptBlocks: demoScriptBlocks, assets: demoAssets, shots: demoShots, envelopes: demoEnvelopes, tasks: demoTasks, qaFindings: demoQaFindings, hierarchy: demoHierarchy, draftImages: demoDraftImages, staleItems: [], skillBindings: demoSkills.filter((skill) => skill.slot !== "未分类").map((skill) => ({ slot: skill.slot, skillId: skill.id, version: skill.version })) };
    return toWorkspaceSnapshot(await api.projects.open(projectId));
  },
  chooseScriptImport: async (projectId: string): Promise<ImportPreview | null> => {
    const api = nativeApi();
    return api ? await api.scripts.chooseAndPreview(projectId) as ImportPreviewDto : null;
  },
  previewScriptText: async (projectId: string, sourceName: string, content: string): Promise<ImportPreview> => {
    const api = nativeApi();
    if (!api) throw new Error("网页预览不读取本机文件。");
    return await api.scripts.previewText({ projectId, sourceName, text: content }) as ImportPreviewDto;
  },
  applyScriptImport: async (projectId: string, preview: ImportPreview, acceptedSceneProposalIds: string[]): Promise<WorkspaceSnapshot> => {
    const api = nativeApi();
    if (!api) throw new Error("网页预览不会写入项目。");
    const result = await api.scripts.applyImport({ projectId, importToken: preview.importToken, acceptedSceneProposalIds, createRevision: true });
    return toWorkspaceSnapshot(result);
  },
  patchScriptBlock: async (projectId: string, blockId: string, content: string): Promise<WorkspaceSnapshot | null> => {
    const api = nativeApi();
    if (!api) return null;
    return toWorkspaceSnapshot(await api.entities.patch({ projectId, entityType: "scriptBlock", entityId: blockId, patch: { text: content } }));
  },
  patchQaFinding: async (projectId: string, findingId: string, status: "resolved" | "dismissed"): Promise<WorkspaceSnapshot | null> => {
    const api = nativeApi();
    if (!api) return null;
    return toWorkspaceSnapshot(await api.entities.patch({ projectId, entityType: "qaFinding", entityId: findingId, patch: { status } }));
  },
  patchPromptEnvelope: async (projectId: string, envelope: PromptEnvelope, patch: Partial<Pick<PromptEnvelope, "name" | "model" | "duration" | "prompt">>): Promise<WorkspaceSnapshot | null> => {
    const api = nativeApi();
    if (!api || !envelope.entityId) return null;
    const nativePatch: Record<string, unknown> = {};
    if (patch.name !== undefined) nativePatch.title = patch.name;
    if (patch.model !== undefined) nativePatch.targetModel = patch.model;
    if (patch.duration !== undefined) nativePatch.durationSeconds = patch.duration;
    if (patch.prompt !== undefined) nativePatch.promptZh = patch.prompt;
    return toWorkspaceSnapshot(await api.entities.patch({ projectId, entityType: "promptEnvelope", entityId: envelope.entityId, patch: nativePatch }));
  },
  upsertTask: async (projectId: string, task: TaskItem, isNew = false): Promise<WorkspaceSnapshot | null> => {
    const api = nativeApi();
    if (!api) return null;
    const status = task.status === "已完成" ? "done" : task.status === "待审阅" ? "blocked" : task.status === "进行中" ? "in_progress" : "todo";
    const priority = task.priority === "P0" ? "urgent" : task.priority === "P1" ? "high" : task.priority === "P2" ? "medium" : "low";
    const result = await api.tasks.upsert({
      projectId,
      ...(isNew ? {} : { id: task.id }),
      title: task.title,
      description: "",
      status,
      priority,
      assignee: task.owner,
      ...(task.scene === "全项目" ? {} : { relatedEntityType: task.relatedType ?? "scene", relatedEntityId: task.scene }),
      ordinal: 0
    });
    return toWorkspaceSnapshot(result);
  },
  replaceMapping: async (projectId: string, sceneId: string, shots: ShotRow[], envelopes: PromptEnvelope[]): Promise<WorkspaceSnapshot | null> => {
    const api = nativeApi();
    if (!api) return null;
    const sceneShots = shots.filter((shot) => shot.sceneId === sceneId && shot.entityId);
    const sceneShotIds = new Set(sceneShots.map((shot) => shot.id));
    const sceneEnvelopes = envelopes.filter((envelope) => envelope.sceneId === sceneId && envelope.entityId);
    const links = sceneEnvelopes.flatMap((envelope) => envelope.shotIds
      .filter((shotId) => sceneShotIds.has(shotId))
      .map((shotId, orderInEnvelope) => {
        const shot = sceneShots.find((item) => item.id === shotId)!;
        return { shotRowId: shot.entityId!, promptEnvelopeId: envelope.entityId!, orderInEnvelope };
      }));
    return toWorkspaceSnapshot(await api.mapping.replace({ projectId, sceneId, links }));
  },
  createStructure: async (projectId: string, kind: "act" | "sequence" | "scene", parentId: string | undefined, title: string): Promise<WorkspaceSnapshot> => {
    const api = nativeApi();
    if (!api) throw new Error("网页预览不会写入项目结构。");
    return toWorkspaceSnapshot(await api.structure.create({ projectId, kind, parentId, title }));
  },
  createPromptEnvelope: async (projectId: string, sceneId: string, title: string): Promise<WorkspaceSnapshot> => {
    const api = nativeApi();
    if (!api) throw new Error("网页预览不会写入 Prompt Envelope。");
    return toWorkspaceSnapshot(await api.prompts.createEnvelope({ projectId, sceneId, title }));
  },
  runAgent: async (input: Record<string, unknown>): Promise<{ runId: string }> => {
    const api = nativeApi();
    return api ? api.agent.run(input as RunAgentInput) : { runId: `demo-run-${Date.now()}` };
  },
  cancelAgent: async (runId: string): Promise<void> => {
    await nativeApi()?.agent.cancel(runId);
  },
  onAgentEvent: (listener: (event: AgentEvent) => void): (() => void) => {
    const api = nativeApi();
    return api ? api.agent.onEvent((event: AgentEventDto) => listener(event as AgentEvent)) : () => undefined;
  },
  acceptDraft: async (projectId: string, proposalId: string): Promise<WorkspaceSnapshot | null> => {
    const api = nativeApi();
    if (!api) return null;
    return toWorkspaceSnapshot(await api.draft.accept(projectId, proposalId));
  },
  rejectDraft: async (projectId: string, proposalId: string): Promise<void> => {
    await nativeApi()?.draft.reject(projectId, proposalId);
  },
  getSkills: async (projectId?: string): Promise<SkillItem[]> => {
    const api = nativeApi();
    return api ? (await api.skills.list(projectId)).map(toSkillItem) : demoSkills;
  },
  importSkill: async (): Promise<SkillItem | null> => {
    const api = nativeApi();
    if (!api) return null;
    const imported = await api.skills.importFromFolder();
    return imported ? toSkillItem(imported) : null;
  },
  cloneSkill: async (skillId: string): Promise<SkillItem | null> => {
    const api = nativeApi();
    if (!api) return null;
    return toSkillItem(await api.skills.cloneForEditing(skillId));
  },
  assignSkillSlot: async (skill: SkillItem, slot: StageSlot): Promise<SkillItem> => {
    const api = nativeApi();
    if (!api) return { ...skill, slot, slots: [slot], source: "用户副本" };
    return toSkillItem(await api.skills.assignSlot({ skillId: skill.id, version: skill.version, slot, expectedContentHash: skill.contentHash ?? "0".repeat(64) }));
  },
  readSkillContent: async (skill: SkillItem): Promise<{ content: string; contentHash: string; readOnly: boolean }> => {
    const api = nativeApi();
    if (!api) return { content: `# ${skill.name}\n\n${skill.description}\n`, contentHash: skill.contentHash ?? "0".repeat(64), readOnly: skill.source === "核心" };
    return api.skills.readContent({ skillId: skill.id, version: skill.version });
  },
  updateSkillContent: async (skill: SkillItem, expectedContentHash: string, content: string): Promise<SkillItem> => {
    const api = nativeApi();
    if (!api) return { ...skill, description: "网页预览已保留编辑状态；没有写入本机文件。" };
    return toSkillItem(await api.skills.updateContent({ skillId: skill.id, version: skill.version, expectedContentHash, content }));
  },
  setSkillEnabled: async (projectId: string, skill: SkillItem, enabled: boolean): Promise<SkillItem> => {
    const api = nativeApi();
    if (!api) return { ...skill, enabled };
    return toSkillItem(await api.skills.setEnabled({ projectId, skillId: skill.id, version: skill.version, enabled }));
  },
  bindSkill: async (projectId: string, slot: string, skill: SkillItem): Promise<void> => {
    const api = nativeApi();
    if (!api || slot === "未分类") return;
    await api.skills.bind({ projectId, slot: slot as StageSlot, skillId: skill.id, version: skill.version, contentHash: skill.contentHash ?? "0".repeat(64) });
  },
  getRuntimePreference: async (projectId: string): Promise<AgentRuntimePreference> => {
    const api = nativeApi();
    if (!api) return { provider: "local-codex", model: "gpt-5.6-sol", effort: "medium" };
    const preference = await api.settings.getRuntimePreference(projectId) as RuntimePreferenceDto;
    return { provider: preference.provider, model: preference.model, effort: preference.effort };
  },
  setRuntimePreference: async (projectId: string, preference: AgentRuntimePreference): Promise<AgentRuntimePreference> => {
    const api = nativeApi();
    if (!api) return preference;
    const saved = await api.settings.setRuntimePreference({ projectId, ...preference });
    return { provider: saved.provider, model: saved.model, effort: saved.effort };
  },
  getRuntimeHealth: async (): Promise<RuntimeHealth> => {
    const api = nativeApi();
    if (api) return await api.agent.health() as RuntimeHealthDto;
    return { codex: { installed: true, loggedIn: true, defaultModel: "gpt-5.6-sol", defaultEffort: "medium", version: "网页预览" }, apiKey: { configured: false, status: "not-configured" } };
  },
  saveApiKey: async (apiKey: string, model: AgentRuntimePreference["model"]): Promise<RuntimeHealth["apiKey"]> => {
    const api = nativeApi();
    if (!api) return { configured: true, status: "ready", message: "网页预览未保存密钥。" };
    return await api.settings.saveApiKey(apiKey, model);
  },
  testApiKey: async (model: AgentRuntimePreference["model"]): Promise<RuntimeHealth["apiKey"]> => {
    const api = nativeApi();
    if (!api) return { configured: false, status: "not-configured" };
    const result = await api.settings.testApiKey(model);
    return result;
  },
  removeApiKey: async (): Promise<void> => {
    await nativeApi()?.settings.removeApiKey();
  },
  exportProject: async (projectId: string, kind: "markdown" | "html" | "fountain" | "docx" | "shot-csv" | "prompt-csv" | "json" | "pdf" | "project-package"): Promise<string | null> => {
    const api = nativeApi();
    return api ? api.exports.save({ projectId, kind }) : null;
  }
};
