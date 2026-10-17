export type SlotDef = {
  slot: string;
  label: string;
  stageId: string;
  optional?: boolean;
  lockedSkill?: string;
  box: string[];
  output: string;
  prohibitions: string[];
};

export const BOX_SKILLS = [
  "story-idea-lab",
  "screenwriter",
  "short-drama-review",
  "cinematic-character-sheet",
  "ai-director-storyboard-engine",
  "shotlist-builder",
  "cinedance-clean",
  "higgsfield-generate",
  "video-use",
] as const;

const NO_SPEND = "不要调用付费图像或视频接口，也不要在工作台里扣费。";
const NO_FINAL_PROMPT = "不要写最终提示词。最终提示词只由 cinedance-clean 写入 prompts.md。";

export const SLOT_DEFS: SlotDef[] = [
  {
    slot: "idea.primary",
    label: "想法",
    stageId: "idea",
    optional: true,
    box: ["story-idea-lab"],
    output: "不落生产目录。需要时再交给剧本。",
    prohibitions: [NO_FINAL_PROMPT, NO_SPEND, "不要把想法直接写成审核通过。"],
  },
  {
    slot: "script.primary",
    label: "剧本",
    stageId: "script",
    box: ["screenwriter"],
    output: "deliverables/1_story/01_script_v{N}.md",
    prohibitions: [NO_FINAL_PROMPT, NO_SPEND],
  },
  {
    slot: "story.mckee_router",
    label: "审核",
    stageId: "audit",
    box: ["short-drama-review"],
    output: "deliverables/1_story/01_audit_report_v{N}.md",
    prohibitions: [NO_FINAL_PROMPT, NO_SPEND, "P0 / P1 未清空时不要宣布可以进入资产或分镜。"],
  },
  {
    slot: "guides.primary",
    label: "资产",
    stageId: "assets",
    box: ["cinematic-character-sheet"],
    output: "deliverables/2_assets/",
    prohibitions: [NO_FINAL_PROMPT, NO_SPEND, "角色锚点图必须等人确认后才算锁定。"],
  },
  {
    slot: "shotlist.breakdown",
    label: "分镜",
    stageId: "storyboard",
    box: ["ai-director-storyboard-engine"],
    output: "deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md",
    prohibitions: [NO_FINAL_PROMPT, NO_SPEND, "一次只拆一个 Scene。"],
  },
  {
    slot: "shotlist.primary",
    label: "分镜表",
    stageId: "storyboard",
    box: ["shotlist-builder"],
    output: "同一 Scene 文件夹内的中文 HTML 与 manifest",
    prohibitions: [NO_FINAL_PROMPT, NO_SPEND],
  },
  {
    slot: "prompt.final",
    label: "最终提示词",
    stageId: "prompt",
    lockedSkill: "cinedance-clean",
    box: ["cinedance-clean"],
    output: "deliverables/3_shotlist/<scene-label>_v{N}/prompts.md",
    prohibitions: ["工作台只显示和复制 prompts.md，不改写最终提示词。", NO_SPEND],
  },
  {
    slot: "generate.media",
    label: "生成",
    stageId: "generate",
    box: ["higgsfield-generate"],
    output: "交接单。工作台不把成片写进付费接口。",
    prohibitions: ["先给出估价并等人批准。", "不要在工作台里花钱或调用 Higgsfield。"],
  },
  {
    slot: "qa.primary",
    label: "QA",
    stageId: "qa",
    box: ["video-use", "short-drama-review"],
    output: "对话 QA；按需保存报告",
    prohibitions: [NO_FINAL_PROMPT, NO_SPEND],
  },
];
