export const stageSlots: Record<string, string[]> = {
  script: ["script.primary"],
  audit: ["script.primary", "story.mckee_router"],
  assets: ["guides.primary"],
  storyboard: ["shotlist.breakdown"],
  prompts: ["shotlist.prompt_compiler"],
  html: ["shotlist.html_assembler"],
};

const skillStageLabels: Record<string, string> = {
  "script.primary": "剧本创作",
  "story.mckee_router": "剧本审核",
  "guides.primary": "资产拆分",
  "shotlist.breakdown": "分镜设计",
  "shotlist.prompt_compiler": "视频 Prompt",
  "shotlist.html_assembler": "生产 HTML",
};

type Issue = {
  code: string;
  message: string;
  nextStep: string;
  detail?: string;
  action?: "save" | "editor" | "audit" | "review" | "settings" | "mode" | "scope";
};

// Mirrors the existing execution gates, with an actionable explanation for each one.
export function stageLaunch({
  stage,
  mode,
  script,
  dirty,
  instruction,
  sceneScope,
  skills,
}: {
  stage: string;
  mode: string;
  script: any;
  dirty: boolean;
  instruction: string;
  sceneScope: string;
  skills: { slot: string; available: boolean }[];
}) {
  const planningChoice = ["assets", "storyboard"].includes(stage);
  const downstream = ["assets", "storyboard", "prompts", "html"].includes(
    stage,
  );
  const working = script.state?.working_script;
  const production = script.state?.production_inputs;
  const usesProduction = downstream && mode === "production";
  const source = usesProduction ? production?.script : working;
  const issues: Issue[] = [];
  if (script.error)
    issues.push({
      code: "script-error",
      message: "当前剧本读取失败。",
      nextStep: "前往「剧本正文」查看错误，修复对应文件后重新载入项目。",
      detail: script.error,
      action: "editor",
    });
  if (dirty)
    issues.push({
      code: "unsaved",
      message: "当前工作稿有未保存的修改。",
      nextStep: "点击「保存工作稿」，保存成功后会重新检查启动条件。",
      action: "save",
    });
  if (!script.error && !working && stage !== "script")
    issues.push({
      code: "no-script",
      message: "还没有已保存的工作剧本。",
      nextStep: script.candidates?.length
        ? "前往「剧本正文」，从已发现的本地剧本中选择一个工作版本。"
        : "前往「剧本正文」，导入或填写剧本，然后点击「保存新版本」。",
      action: "editor",
    });
  if (planningChoice && !["planning", "production"].includes(mode)) {
    issues.push({
      code: "choose-mode",
      message: "尚未选择本次用途。",
      nextStep: "在「本次用途」中选择「规划草案」或「正式生产」。只做资产拆分或分镜设计时，可选择「规划草案」。",
      action: "mode",
    });
  }
  if (mode === "planning" && working && !script.audit) {
    issues.push({
      code: "planning-audit",
      message: `工作稿 v${working.version} 尚无已保存的同版本审核报告。`,
      nextStep: "点击「去审核当前剧本」。若已运行审核，请在「查看任务」中审阅并保存报告，再回来继续。",
      action: "audit",
    });
  }
  if (usesProduction && !production && working) {
    issues.push({
      code: "production-approval",
      message: script.audit
        ? `工作稿 v${working.version} 已有审核，但尚未确认为生产版本。`
        : `工作稿 v${working.version} 尚未完成同版本审核和生产确认。`,
      nextStep:
        (script.audit
          ? "点击「审阅并确认版本」，阅读审核报告、填写审阅结论并确认。"
          : "先点击「去审核当前剧本」，在任务面板保存报告，再通过「审核与确认」确认生产版本。") +
        (planningChoice ? "只做设计时，也可改选「规划草案」。" : ""),
      action: script.audit ? "review" : "audit",
    });
  }
  const sourceScenes: { label: string; header: string }[] =
    source?.scene_map || [];
  const scope: string[] = production?.authorization?.scope || [];
  const availableScenes = usesProduction
    ? sourceScenes.filter((s) => scope.includes("*") || scope.includes(s.label))
    : sourceScenes;
  const scenes =
    sceneScope === "all" ? availableScenes.map((s) => s.label) : [sceneScope];
  if (
    stage === "storyboard" &&
    ["planning", "production"].includes(mode) &&
    source &&
    (!scenes.length ||
      scenes.some((s) => !availableScenes.some((a) => a.label === s)))
  ) {
    if (!sourceScenes.length)
      issues.push({
        code: "scene-scope",
        message: `输入版本 v${source.version} 未识别到场景标题。`,
        nextStep:
          "前往「剧本正文」，补充每场的场景标题并保存新版本，然后审核该版本。" +
          (usesProduction ? "正式生产还需重新确认该版本。" : ""),
        action: "editor",
      });
    else if (!availableScenes.length)
      issues.push({
        code: "scene-scope",
        message: `生产版本 v${source.version} 没有已授权的可处理场景。`,
        nextStep: script.audit
          ? "点击「审阅并确认版本」确认生产范围，或改选「规划草案」使用当前工作稿。"
          : "先审核并确认当前工作稿的生产范围，或改选「规划草案」继续设计。",
        action: script.audit ? "review" : "audit",
      });
    else
      issues.push({
        code: "scene-scope",
        message: `所选场景 ${sceneScope} 不在本次可处理范围内。`,
        nextStep: "在「场景范围」中选择一个可用场景，或选择「全部可处理场景」。正式生产只能使用已确认范围内的场景。",
        action: "scope",
      });
  }
  const missing = (stageSlots[stage] || []).filter(
    (slot) => !skills.some((s) => s.slot === slot && s.available),
  );
  if (missing.length)
    issues.push({
      code: "missing-skill",
      message: "本阶段的 Skill 未配置或文件不可用。",
      nextStep: `打开「项目设置 → Skills」，检查「${missing.map((slot) => skillStageLabels[slot]).join("」「")}」阶段。选择可用的 Skill，通过兼容性检查后保存到当前项目，再回来重试。`,
      detail: `不可用的阶段接口：${missing.join("、")}`,
      action: "settings",
    });
  if (stage === "script" && !instruction.trim())
    issues.push({
      code: "brief",
      message: "尚未填写创作 / 改写要求。",
      nextStep: "在「创作 / 改写要求」中填写故事 idea 或希望修改的内容。",
    });
  const defaults: Record<string, string> = {
    audit:
      "审核当前工作稿，返回同版本审阅报告，列出问题、风险与修订建议。保留原剧本，不自动确认生产版本。",
    assets:
      "基于所选剧本提取角色、场景、道具及风格资料，保留标准文件名和已提供的真实 tag，明确素材缺口。仅完成资产设计，不生成媒体。",
    storyboard: `为所选场景（${scenes.join("、")}）制作可审阅的分镜设计。保留原文、台词与已确认约束，列出空间和连续性问题。只完成本阶段设计，不编译 Prompt 或生成媒体。`,
    prompts:
      "按已确认的分镜和 Prompt Envelope 编译中文视频 Prompt，保留镜头设计、台词、真实 tag 及首尾状态。只完成 Prompt 编译，不生成媒体。",
    html: "把已有分镜、编译后的 Prompt 和素材引用装配为生产 HTML，保留 Scene、Shot Row 与 Prompt Envelope 映射，逐字保留已编译 Prompt。",
  };
  const requestInstruction =
    stage === "script"
      ? instruction.trim()
      : [
          defaults[stage],
          instruction.trim() && `补充要求：${instruction.trim()}`,
        ]
          .filter(Boolean)
          .join("\n\n");
  return {
    ready: issues.length === 0,
    issues,
    source,
    scenes,
    availableScenes,
    requestInstruction,
    usesProduction,
    planningChoice,
  };
}
