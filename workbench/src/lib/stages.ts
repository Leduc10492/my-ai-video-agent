export type StageDef = {
  id: string;
  label: string;
  summary: string;
  slot: string;
  pluginSlot?: string;
};

export const STAGE_DEFS: StageDef[] = [
  {
    id: "script",
    label: "剧本",
    summary: "写成当前版本剧本，并保留可见动作与对白。",
    slot: "script.primary",
  },
  {
    id: "audit",
    label: "剧本审核",
    summary: "同版本审核通过，且没有未解决的 P0/P1，才能进入下游。",
    slot: "script.primary",
    pluginSlot: "story.mckee_router",
  },
  {
    id: "guides",
    label: "资产与风格",
    summary: "需要人物、场景、道具或风格连续性时再写，不是每条片子的必经文件。",
    slot: "guides.primary",
  },
  {
    id: "breakdown",
    label: "Scene 分镜拆解",
    summary: "一次一个场景。镜头行保留景别、机位、动作和切镜理由。",
    slot: "shotlist.breakdown",
  },
  {
    id: "html",
    label: "中文分镜表",
    summary: "在同一 Scene 文件夹里把镜头行收成提示词包，并写成中文 HTML。",
    slot: "shotlist.primary",
  },
  {
    id: "qa",
    label: "QA",
    summary: "默认在对话里报告。只有明确要求保存时才写入 qa_reports。",
    slot: "qa.primary",
  },
];

export const SKILL_BLURBS: Record<string, string> = {
  "screenwriter-workflow": "剧本阶段主控。写作、改稿、审核落盘都从这里进入。",
  "mckee-coordinator": "结构插件路由器。由剧本主 Skill 调用，不单独拥有最终剧本。",
  "mckee-audit": "结构诊断插件。给出 P0–P3，不直接写审核报告文件。",
  "mckee-create": "只在需要结构包时使用。新剧本仍从 screenwriter-workflow 进入。",
  "mckee-expand-pace": "节奏与密度插件。处理注水、铺垫和信息释放。",
  "mckee-rewrite-plan": "改写计划插件。排结构修复的顺序，不直接改成片剧本。",
  "mckee-scene-doctor": "单场修复插件。核对欲望、阻力、转折和价值变化。",
  "mckee-variations": "备选故事引擎。用来比较另一种冲突或结局。",
  "mckee-source": "只有明确索取原文时才打开。返回引文，不写生产产物。",
  "mckee-shared": "McKee 技能共用的原则、清单和模板索引。",
  "guide-workflow": "资产与风格资料。身份事实和视觉语言分开写。",
  "shotlist-breakdown-workflow": "把一个 Scene 拆成镜头行，并规划提示词包与批次。",
  "sketch-shotlist-workflow": "把已通过的拆解写成中文提示词和分镜表 HTML。",
  "qa-workflow": "按真实产物做覆盖、导演和提示词包检查。",
  "qa-checklists": "各阶段检查清单，供 QA 主 Skill 取用。",
  "artifact-formatter": "统一产物头、版本号和上下游路径。",
  "version-management": "归档旧版并推进当前版本号。",
};

export const AGENT_BLURBS: Record<string, string> = {
  "script-writer": "剧本和审核报告的写入者。",
  "guide-director": "共享人物、场景、道具和风格资料的写入者。",
  "storyboard-director": "分镜拆解和中文分镜表的写入者。",
  "qa-check": "质量检查。发现先说，创作判断留给导演。",
  "project-director": "主控协调。通常就是当前线程，不另开子代理。",
};
