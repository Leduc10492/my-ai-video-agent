import type { AgentBrief, RouteContext, RouteGate, RouteResult, SlotRecord } from "@/lib/types";

type Rule = {
  id: string;
  stageId: string;
  slot: string;
  pluginSlot?: string;
  skillOverride?: string;
  why: string;
  test: (text: string) => boolean;
};

const RULES: Rule[] = [
  {
    id: "mckee-source",
    stageId: "audit",
    slot: "story.mckee_router",
    skillOverride: "mckee-source",
    why: "请求在索取麦基原文或出处，走结构插件，不写最终剧本。",
    test: (text) => /引用麦基|麦基怎么说|麦基原文|书中原文|mckee.{0,24}(quote|say)|quote from/.test(text),
  },
  {
    id: "mckee-variations",
    stageId: "audit",
    slot: "story.mckee_router",
    skillOverride: "mckee-variations",
    why: "请求在比较另一种冲突、高潮或结局，走变体插件。",
    test: (text) => /另一种结局|故事变体|备选高潮|另一条故事|alternative climax/.test(text),
  },
  {
    id: "mckee-pacing",
    stageId: "audit",
    slot: "story.mckee_router",
    skillOverride: "mckee-expand-pace",
    why: "请求在处理节奏、密度或铺垫，走节奏插件。",
    test: (text) => /节奏|注水|铺垫太长|密度不够/.test(text) && !/分镜|镜头|提示词/.test(text),
  },
  {
    id: "mckee-rewrite",
    stageId: "audit",
    slot: "story.mckee_router",
    skillOverride: "mckee-rewrite-plan",
    why: "请求要的是改写计划，不是直接改成片剧本。",
    test: (text) => /改写计划|重写方案|结构修复/.test(text),
  },
  {
    id: "mckee-scene",
    stageId: "audit",
    slot: "story.mckee_router",
    skillOverride: "mckee-scene-doctor",
    why: "请求在诊断单场的欲望、阻力或价值变化。",
    test: (text) => /这场戏不成立|场次诊断|价值变化|scene doctor/.test(text) && !/分镜|镜头/.test(text),
  },
  {
    id: "version",
    stageId: "support",
    slot: "version.manager",
    why: "请求在处理归档或版本号，由当前写入者使用版本技能。",
    test: (text) => /归档|升版本|版本号/.test(text),
  },
  {
    id: "formatter",
    stageId: "support",
    slot: "artifact.formatter",
    why: "请求在整理产物头、编号或路径，不新开一条生产阶段。",
    test: (text) => /产物头|元数据头|artifact header|锁定继承/.test(text),
  },
  {
    id: "checklist",
    stageId: "qa",
    slot: "qa.checklists",
    why: "请求点名检查清单，使用 qa.checklists，而不是直接改写产物。",
    test: (text) => /检查清单|checklist/.test(text),
  },
  {
    id: "qa-production",
    stageId: "qa",
    slot: "qa.primary",
    why: "请求是在检查已有分镜、镜头行或提示词包，归到 QA。",
    test: (text) => /审核|检查|验收/.test(text) && /分镜|镜头|提示词|html/.test(text),
  },
  {
    id: "audit",
    stageId: "audit",
    slot: "script.primary",
    pluginSlot: "story.mckee_router",
    why: "请求是剧本审核。script.primary 负责落盘，并调用 story.mckee_router。",
    test: (text) => /审核|审计|过审|结构问题|\bp0\b|\bp1\b/.test(text),
  },
  {
    id: "qa",
    stageId: "qa",
    slot: "qa.primary",
    why: "请求是质量检查。默认把结论写在对话里。",
    test: (text) => /检查|验收|\bqa\b|回归|审一下/.test(text),
  },
  {
    id: "html",
    stageId: "html",
    slot: "shotlist.primary",
    why: "请求要的是提示词包或中文分镜表，使用 shotlist.primary。",
    test: (text) => /提示词包|提示词|分镜表|中文生产|\bhtml\b|seedance|higgsfield|\bprompt\b/.test(text) && !/拆成/.test(text),
  },
  {
    id: "breakdown",
    stageId: "breakdown",
    slot: "shotlist.breakdown",
    why: "请求是把场景拆成镜头，使用 shotlist.breakdown。",
    test: (text) => /拆成分镜|分镜拆解|拆成镜头|拆镜|按场拆|镜头行|shot row|breakdown|分镜/.test(text),
  },
  {
    id: "guides",
    stageId: "guides",
    slot: "guides.primary",
    why: "请求在建立人物、场景、道具或风格资料。",
    test: (text) => /资产|风格|人物设定|造型|参考图|场景设定/.test(text),
  },
  {
    id: "script",
    stageId: "script",
    slot: "script.primary",
    why: "请求落在剧本写作或修改。",
    test: (text) => /剧本|写戏|对白|故事/.test(text),
  },
];

const GENERATION = /生成视频|出视频|做成视频|生成图片|出图|预演图|预演|e-conte|econte/;
const DELEGATION = /委派|子代理|sub\s*agent|subagent|并行/;

const DIGITS: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

export function chineseSceneNumber(raw: string) {
  if (raw === "十") return 10;
  if (raw.startsWith("十")) return 10 + (DIGITS[raw.slice(1)] ?? 0);
  if (raw.includes("十")) {
    const [tens, ones] = raw.split("十");
    return (DIGITS[tens] ?? 0) * 10 + (ones ? DIGITS[ones] ?? 0 : 0);
  }
  return raw.length === 1 ? DIGITS[raw] ?? null : null;
}

export function extractScene(text: string) {
  const slug = text.match(/scene[-_\s]?(\d{1,3})/i);
  if (slug) {
    return { label: `scene-${slug[1].padStart(3, "0")}`, mention: slug[0] };
  }
  const arabic = text.match(/第\s*(\d{1,3})\s*场/);
  if (arabic) {
    return { label: `scene-${arabic[1].padStart(3, "0")}`, mention: arabic[0] };
  }
  const chinese = text.match(/第([一二三四五六七八九十百零两]+)\s*场/);
  const number = chinese ? chineseSceneNumber(chinese[1]) : null;
  if (chinese && number) {
    return { label: `scene-${String(number).padStart(3, "0")}`, mention: chinese[0] };
  }
  return {};
}

function findSlot(context: RouteContext, slotId: string) {
  return context.slots.find((slot) => slot.slot === slotId);
}

function findAgent(context: RouteContext, owner: string) {
  return context.agents.find((agent) => agent.name === owner);
}

function ruleLine(context: RouteContext, key: string) {
  return context.ruleLines.find((line) => line.includes(key));
}

function fillPath(pattern: string, sceneLabel?: string, version = "v1") {
  return pattern
    .replaceAll("<scene-label>", sceneLabel ?? "<scene-label>")
    .replaceAll("{N}", version.replace(/^v/, ""));
}

function versionFor(files: string[], sceneLabel?: string) {
  const versions = files
    .filter((file) => (sceneLabel ? file.includes(sceneLabel) : true))
    .map((file) => Number(file.match(/_v(\d+)/)?.[1]))
    .filter((value) => Number.isFinite(value));
  if (!versions.length) return "v1";
  return `v${Math.max(...versions)}`;
}

function choosePattern(patterns: string[], stageId: string, ruleId: string) {
  const usable = patterns.filter(Boolean);
  const prefer = (needle: string) => usable.find((item) => item.includes(needle));
  if (stageId === "audit" || ruleId.startsWith("mckee")) {
    return prefer("audit") ?? prefer("01_audit") ?? usable[0];
  }
  if (stageId === "script") return prefer("01_script") ?? usable[0];
  if (stageId === "html" || ruleId === "generation") return prefer("Shotlist_") ?? prefer(".html") ?? usable[0];
  if (stageId === "breakdown") return prefer("shotlist_breakdown") ?? usable[0];
  if (stageId === "guides") {
    const guides = usable.filter((item) => item.includes("02_"));
    return guides.length ? guides.join("\n") : usable[0];
  }
  if (stageId === "qa") return prefer("qa_report") ?? usable[0];
  return usable[0];
}

function resolvedOutput(
  slot: SlotRecord | undefined,
  skill: string,
  context: RouteContext,
  sceneLabel: string | undefined,
  stageId: string,
  ruleId: string,
) {
  const version = versionFor(context.files, sceneLabel);
  const patterns = [...(context.skillOutputs[skill] ?? []), ...(slot?.canonicalOutputs ?? [])];
  const pattern = choosePattern(patterns, stageId, ruleId) ?? slot?.output ?? "见注册表 Output 列";
  return pattern
    .split("\n")
    .map((item) => fillPath(item, sceneLabel, version))
    .join("\n");
}

function gateForDownstream(context: RouteContext): RouteGate | null {
  const audit = context.stages.find((stage) => stage.id === "audit");
  const sentence = ruleLine(context, "进入资产与分镜阶段前");
  if (!audit || audit.status === "已通过") {
    return {
      level: "info",
      title: "审核门已通过",
      text: audit?.detail || "当前数据源的审核状态允许进入下游。",
    };
  }
  return {
    level: "block",
    title: "还不能进入资产或分镜",
    text: [sentence, audit.detail].filter(Boolean).join(" "),
  };
}

function buildPrompt(input: {
  request: string;
  result: Omit<RouteResult, "prompt">;
}) {
  const { request, result } = input;
  const skillPath = `.agents/skills/${result.skill}/SKILL.md`;
  const pluginLine = result.pluginSkill
    ? `- 插件 Skill：.agents/skills/${result.pluginSkill}/SKILL.md`
    : null;
  const gates = result.gates.map((gate) => `- ${gate.title}：${gate.text}`).join("\n");
  return [
    "请在当前仓库的主线程里处理下面的请求，并按 Skill 文件执行。",
    "",
    "用户请求：",
    request.trim(),
    "",
    "本地工作台按 .agents/skill_registry.md 和 AGENTS.md 做了确定性路由，供你复核：",
    `- 阶段：${result.stageLabel}`,
    `- Slot：${result.slot}`,
    result.pluginSlot ? `- 调用 Slot：${result.pluginSlot}` : null,
    `- 主 Skill：${skillPath}`,
    pluginLine,
    `- 子代理归属：${result.owner}`,
    `- 执行方式：${result.subAgentNote}`,
    result.sceneLabel ? `- 建议场次：${result.sceneLabel}（由「${result.sceneMention}」换算，仍以剧本 slugline 为准）` : null,
    "",
    "开始前请读取：",
    ...result.inputs.map((item) => `- ${item}`),
    "",
    "预期产物：",
    result.outputPath,
    "",
    "门禁：",
    gates || "- 无额外门禁",
    "",
    "一次只处理请求里的范围。保留镜头行，不要为了减少提示词包删掉镜头。15 秒是生成上限，不是要填满的目标。没有单独授权时，不要生成图片或视频。",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function routeRequest(request: string, context: RouteContext): RouteResult {
  const text = request.trim().toLowerCase();
  const generation = GENERATION.test(text);
  const delegation = DELEGATION.test(text);
  const scene = extractScene(request);
  const matched = text ? RULES.find((rule) => rule.test(text)) : undefined;
  const rule: Rule = matched ?? {
    id: generation ? "generation" : "fallback",
    stageId: generation ? "html" : "support",
    slot: generation ? "shotlist.primary" : "script.primary",
    why: generation
      ? "请求只指向画面或视频生成。它挂在分镜表阶段后面，但不能自动开做。"
      : "没有命中阶段关键词。先停在主控扫描，不猜测要改哪一类产物。",
    test: () => true,
  };

  const slot = findSlot(context, rule.slot);
  const plugin = rule.pluginSlot ? findSlot(context, rule.pluginSlot) : undefined;
  const skill = rule.skillOverride ?? slot?.skill ?? "（注册表缺少）";
  const pluginSkill = rule.pluginSlot ? plugin?.skill : undefined;
  const owner = slot?.owner ?? "project-director";
  const agent: AgentBrief | undefined = findAgent(context, owner);
  const stage = context.stages.find((item) => item.id === rule.stageId);
  const stageLabel =
    stage?.label ??
    (rule.id === "fallback" ? "未判定" : rule.id === "generation" ? "画面生成" : rule.slot === "version.manager" ? "版本" : "产物格式");

  const downstream = ["guides.primary", "shotlist.breakdown", "shotlist.primary"].includes(rule.slot);
  const gates: RouteGate[] = [];
  if (!matched && !generation) {
    gates.push({
      level: "warn",
      title: "没有唯一阶段",
      text: "换一种说法，点明剧本、审核、资产、分镜拆解、分镜表或 QA。工作台不会调用模型猜测。",
    });
  }
  if (downstream) {
    const downstreamGate = gateForDownstream(context);
    if (downstreamGate) gates.push(downstreamGate);
  }
  if (rule.slot === "shotlist.primary") {
    const breakdown = context.stages.find((item) => item.id === "breakdown");
    const sentence = ruleLine(context, "默认一次只完成一个 Scene");
    if (breakdown && breakdown.status === "未开始") {
      gates.push({
        level: "block",
        title: "还没有分镜拆解",
        text: "先保存该 Scene 的 Breakdown，通过 QA 后，再在同一文件夹生成提示词和 HTML。",
      });
    }
    if (sentence) {
      gates.push({ level: "info", title: "一次一场", text: sentence });
    }
  }
  if (rule.slot === "shotlist.breakdown") {
    const sentence = ruleLine(context, "默认一次只完成一个 Scene");
    if (sentence) gates.push({ level: "info", title: "一次一场", text: sentence });
    const longScript = ruleLine(context, "长剧本先只扫描 Scene");
    if (longScript) gates.push({ level: "info", title: "长剧本只加载选中场", text: longScript });
  }
  if (scene.label && ["shotlist.breakdown", "shotlist.primary"].includes(rule.slot)) {
    const exists = context.files.some((file) => file.includes(`${scene.label}_v`) && file.includes(rule.slot === "shotlist.breakdown" ? "03_shotlist_breakdown" : "Shotlist_"));
    if (exists) {
      gates.push({
        level: "info",
        title: "这一场已有产物",
        text: `${scene.label} 已经有对应文件。若要修订，先用 version.manager 归档，再升版本。`,
      });
    }
  }
  if (generation) {
    gates.push({
      level: "warn",
      title: "生成需要单独授权",
      text:
        ruleLine(context, "图片或视频生成必须由用户单独授权") ??
        "图片或视频生成必须由用户单独授权；完成 HTML 不自动触发生成。",
    });
  }
  gates.push(
    delegation
      ? {
          level: "info",
          title: "可以启动子代理",
          text: "请求写明了委派、并行或子代理。读取 .codex/agents 里对应的边界后再启动，一个产物只留一个写入者。",
        }
      : {
          level: "info",
          title: "默认主线程",
          text:
            ruleLine(context, "只有用户明确要求 Sub Agent") ??
            "默认在当前主线程执行。只有明确要求时才启动 Sub Agent。",
        },
  );

  const inputs = [
    "AGENTS.md",
    ".agents/skill_registry.md",
    "deliverables/0_admin/locks.md",
    `.agents/skills/${skill}/SKILL.md`,
    ...(pluginSkill ? [`.agents/skills/${pluginSkill}/SKILL.md`] : []),
    ...(agent?.inputs ?? []),
  ];
  const uniqueInputs = [...new Set(inputs)];
  const concrete = resolvedOutput(slot, skill, context, scene.label, rule.stageId, rule.id);
  const subAgentNote = delegation
    ? `按请求委派给 ${owner}。`
    : owner === "当前写入者"
      ? "归属当前正在写这个产物的人，不另开子代理。"
      : `归属 ${owner}。这次不启动子代理，除非另外说明委派。`;

  const partial = {
    matched: Boolean(matched) || generation,
    ruleId: rule.id,
    stageId: rule.stageId,
    stageLabel,
    slot: rule.slot,
    pluginSlot: rule.pluginSlot,
    skill,
    pluginSkill,
    owner,
    subAgentNote,
    sceneLabel: scene.label,
    sceneMention: scene.mention,
    why: rule.why,
    inputs: uniqueInputs,
    registryOutput: slot?.output ?? "",
    outputPath: concrete,
    stageStatus: stage?.status,
    stageDetail: stage?.detail,
    gates,
    delegation,
    generation,
  };

  return {
    ...partial,
    prompt: request.trim()
      ? buildPrompt({ request, result: partial })
      : "先写一句请求。例如：把第二场拆成分镜。",
  };
}
