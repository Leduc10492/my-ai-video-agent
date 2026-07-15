import type {
  Act, Asset, Beat, DependencyEdge, DraftImage, Episode, Project, PromptEnvelope,
  QaFinding, ReferenceState, Revision, Scene, ScriptBlock, Sequence, ShotEnvelopeLink,
  ShotRow, SkillBinding, Task,
} from "./schemas.js";

export interface DemoProjectGraph {
  project: Project;
  episodes: Episode[];
  acts: Act[];
  sequences: Sequence[];
  scenes: Scene[];
  beats: Beat[];
  scriptBlocks: ScriptBlock[];
  assets: Asset[];
  references: ReferenceState[];
  shotRows: ShotRow[];
  promptEnvelopes: PromptEnvelope[];
  links: ShotEnvelopeLink[];
  draftImages: DraftImage[];
  tasks: Task[];
  qaFindings: QaFinding[];
  revisions: Revision[];
  dependencies: DependencyEdge[];
  skillBindings: SkillBinding[];
}

export function createDemoProject(now = "2026-07-15T04:00:00.000Z"): DemoProjectGraph {
  const base = { projectId: "project_after_rain", createdAt: now, updatedAt: now };
  const project: Project = {
    ...base,
    id: base.projectId,
    name: "雨停之前",
    logline: "一位失去记忆的天气记录员，在台风登陆前从自己的旧录像中发现一场被抹去的告别。",
    synopsis: "城市进入台风倒计时，林遥必须在气象站关闭前拼回真相。",
    format: "short",
    language: "zh-CN",
    episodeMode: false,
    status: "preproduction",
  };
  const acts: Act[] = [{ ...base, id: "act_1", title: "第一幕：风暴前夜", number: 1, dramaticPurpose: "建立失忆与倒计时", ordinal: 0 }];
  const sequences: Sequence[] = [{ ...base, id: "seq_1", actId: "act_1", title: "录像里的陌生人", number: 1, dramaticQuestion: "录像是谁留下的？", synopsis: "林遥在气象站发现一盘旧磁带。", ordinal: 0 }];
  const scenes: Scene[] = [
    { ...base, id: "scene_21", sequenceId: "seq_1", sceneNumber: "021", heading: "内景·海边气象站·夜", location: "海边气象站", timeOfDay: "夜", interiorExterior: "INT", synopsis: "林遥独自在气象站发现旧录像。", dramaticValueBefore: "逃避", dramaticValueAfter: "被迫面对", estimatedSeconds: 42, ordinal: 0 },
    { ...base, id: "scene_22", sequenceId: "seq_1", sceneNumber: "022", heading: "外景·气象站天台·夜", location: "气象站天台", timeOfDay: "夜", interiorExterior: "EXT", synopsis: "她带着录像走入风暴。", dramaticValueBefore: "迟疑", dramaticValueAfter: "决定", estimatedSeconds: 28, ordinal: 1 },
  ];
  const beats: Beat[] = [
    { ...base, id: "beat_21_1", sceneId: "scene_21", title: "停电", action: "灯光熄灭，备用电源亮起。", intention: "继续逃避录像", turn: "机器自动播放", estimatedSeconds: 8, ordinal: 0 },
    { ...base, id: "beat_21_2", sceneId: "scene_21", title: "认出自己", action: "屏幕中的林遥看向镜头。", intention: "确认录像真伪", turn: "听见自己的告别", estimatedSeconds: 14, ordinal: 1 },
  ];
  const scriptBlocks: ScriptBlock[] = [
    { ...base, id: "block_1", sceneId: "scene_21", kind: "scene_heading", text: "内景·海边气象站·夜", ordinal: 0 },
    { ...base, id: "block_2", sceneId: "scene_21", beatId: "beat_21_1", kind: "action", text: "雨水拍打百叶窗。监控墙逐块熄灭，只剩一台老式放像机亮着。", ordinal: 1 },
    { ...base, id: "block_3", sceneId: "scene_21", beatId: "beat_21_2", kind: "character", text: "林遥", ordinal: 2 },
    { ...base, id: "block_4", sceneId: "scene_21", beatId: "beat_21_2", kind: "dialogue", text: "这不是我录的。", ordinal: 3 },
  ];
  const assets: Asset[] = [
    { ...base, id: "asset_lin", kind: "character", name: "林遥", description: "32 岁，短发，深蓝防水外套，克制而警觉。", scope: "shared", approval: "approved", tags: ["主角"], attributes: { wardrobe: "深蓝防水外套" } },
    { ...base, id: "asset_station", kind: "location", name: "海边气象站", description: "1990 年代混凝土建筑，潮湿、孤立，监控屏幕形成冷色光源。", scope: "shared", approval: "approved", tags: ["主场景"], attributes: { palette: "青灰" } },
    { ...base, id: "asset_tape", kind: "prop", name: "旧录像带", description: "贴有褪色手写标签的 VHS 磁带。", scope: "shared", approval: "draft", tags: ["关键道具"], attributes: {} },
    { ...base, id: "asset_style", kind: "style", name: "潮湿记忆", description: "青灰夜色，钠灯暖色点缀，35mm 颗粒，低饱和。", scope: "shared", approval: "approved", tags: ["全片风格"], attributes: { aspectRatio: "2.39:1" } },
  ];
  const references: ReferenceState[] = [];
  const shotRows: ShotRow[] = [
    { ...base, id: "shot_r01", sceneId: "scene_21", beatId: "beat_21_1", shotNumber: "R01", ordinal: 0, framing: "大全景", cameraPosition: "门口略低机位", lens: "24mm", cameraMovement: "缓慢推进", blocking: "林遥背对镜头站在监控墙前", performance: "肩背紧绷，不回头", action: "建立潮湿气象站空间，监控墙依次熄灭。", dialogue: "", sound: "暴雨、继电器断电声", durationSeconds: 5, cutReason: "空间信息建立完成，断电触发行动", axisNote: "以控制台与林遥形成主轴", sourceScriptBlockIds: ["block_2"] },
    { ...base, id: "shot_r02", sceneId: "scene_21", beatId: "beat_21_1", shotNumber: "R02", ordinal: 1, framing: "中景", cameraPosition: "控制台侧后方", lens: "50mm", cameraMovement: "轻微手持跟移", blocking: "林遥越过控制台走向放像机", performance: "动作迟疑，手停在播放键上方", action: "备用电源亮起，她发现放像机自动吐出磁带。", dialogue: "", sound: "电流嗡鸣", durationSeconds: 4, cutReason: "从环境异常收束到人物选择", axisNote: "维持控制台轴线", sourceScriptBlockIds: ["block_2"] },
    { ...base, id: "shot_r03", sceneId: "scene_21", beatId: "beat_21_2", shotNumber: "R03", ordinal: 2, framing: "特写", cameraPosition: "屏幕反打", lens: "85mm", cameraMovement: "静止", blocking: "屏幕反光叠在林遥眼睛上", performance: "瞳孔收紧，声音几乎失去力气", action: "她在录像里认出自己。", dialogue: "这不是我录的。", sound: "录像底噪吞没雨声", durationSeconds: 3.5, cutReason: "信息揭示与表演转折", axisNote: "反打保持视线方向", sourceScriptBlockIds: ["block_3", "block_4"] },
  ];
  const promptEnvelopes: PromptEnvelope[] = [
    { ...base, id: "env_p001", sceneId: "scene_21", envelopeNumber: "P001", ordinal: 0, title: "停电与发现", targetModel: "gpt-image-2", durationSeconds: 9, promptZh: "电影分镜草稿，2.39:1。潮湿的海边气象站夜景，青灰低饱和，林遥背对镜头，监控墙逐块熄灭，备用电源冷光亮起；从24mm大全景缓慢推进，连续到50mm侧后中景，她迟疑地走向自动吐出磁带的老式放像机。保持人物服装、空间轴线与雨夜光线连续。", negativePrompt: "多余人物，空间跳变，现代设备", assetIds: ["asset_lin", "asset_station", "asset_tape", "asset_style"], sourceScriptBlockIds: ["block_2"], generationReliability: "high" },
    { ...base, id: "env_p002", sceneId: "scene_21", envelopeNumber: "P002", ordinal: 1, title: "认出自己", targetModel: "gpt-image-2", durationSeconds: 3.5, promptZh: "85mm电影特写，录像屏幕冷光与雪花反射叠在林遥双眼，瞳孔收紧，她低声说‘这不是我录的’，背景雨声仿佛被录像底噪吞没；青灰低饱和、35mm颗粒、克制表演，维持前镜头方向。", negativePrompt: "夸张表情，正面棚拍，多余文字", assetIds: ["asset_lin", "asset_style"], sourceScriptBlockIds: ["block_3", "block_4"], generationReliability: "medium" },
  ];
  const links: ShotEnvelopeLink[] = [
    { id: "link_1", projectId: base.projectId, shotRowId: "shot_r01", promptEnvelopeId: "env_p001", orderInEnvelope: 0, createdAt: now },
    { id: "link_2", projectId: base.projectId, shotRowId: "shot_r02", promptEnvelopeId: "env_p001", orderInEnvelope: 1, createdAt: now },
    { id: "link_3", projectId: base.projectId, shotRowId: "shot_r03", promptEnvelopeId: "env_p002", orderInEnvelope: 0, createdAt: now },
  ];
  const tasks: Task[] = [
    { ...base, id: "task_1", title: "确认林遥角色参考图", description: "在下一次草稿生成前锁定正侧面。", status: "in_progress", priority: "high", assignee: "我", relatedEntityType: "asset", relatedEntityId: "asset_lin", ordinal: 0 },
    { ...base, id: "task_2", title: "复查 Scene 021 空间轴", description: "确认 R02 到 R03 的视线反打。", status: "todo", priority: "medium", assignee: "我", relatedEntityType: "scene", relatedEntityId: "scene_21", ordinal: 1 },
    { ...base, id: "task_3", title: "批准 P001 草稿", description: "选择一张作为方向图。", status: "done", priority: "medium", assignee: "我", relatedEntityType: "promptEnvelope", relatedEntityId: "env_p001", ordinal: 2 },
  ];
  const qaFindings: QaFinding[] = [
    { ...base, id: "qa_1", severity: "P2", title: "P002 角色参考不足", description: "特写依赖角色一致性，但目前没有批准的面部参考图。", status: "open", category: "generation", entityType: "promptEnvelope", entityId: "env_p002", suggestedFix: "先批准林遥角色参考图，再生成特写草稿。" },
  ];
  const revisions: Revision[] = [];
  const dependencies: DependencyEdge[] = [
    { id: "dep_1", projectId: base.projectId, upstreamEntityType: "scene", upstreamEntityId: "scene_21", downstreamEntityType: "shotRow", downstreamEntityId: "shot_r01", relation: "derived_from", createdAt: now },
    { id: "dep_2", projectId: base.projectId, upstreamEntityType: "shotRow", upstreamEntityId: "shot_r01", downstreamEntityType: "promptEnvelope", downstreamEntityId: "env_p001", relation: "mapped_into", createdAt: now },
  ];
  const skillBindings: SkillBinding[] = [
    { id: "binding_script", projectId: base.projectId, slot: "script.primary", skillId: "screenwriter-workflow", skillVersion: "1.0.0", skillPath: ".agents/skills/screenwriter-workflow", contentHash: "demo-screenwriter-hash", boundAt: now },
    { id: "binding_shotlist", projectId: base.projectId, slot: "shotlist.primary", skillId: "sketch-shotlist-workflow", skillVersion: "1.0.0", skillPath: ".agents/skills/sketch-shotlist-workflow", contentHash: "demo-shotlist-hash", boundAt: now },
  ];
  return { project, episodes: [], acts, sequences, scenes, beats, scriptBlocks, assets, references, shotRows, promptEnvelopes, links, draftImages: [], tasks, qaFindings, revisions, dependencies, skillBindings };
}
