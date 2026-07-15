import type {
  AssetItem,
  BreakdownProposal,
  ProjectSummary,
  PromptEnvelope,
  QaFinding,
  ScriptBlock,
  ShotRow,
  SkillItem,
  TaskItem
} from "./types";

export const projects: ProjectSummary[] = [
  {
    id: "project-summer",
    title: "潮汐来信",
    subtitle: "悬疑短片 · 12 分钟",
    status: "制作中",
    progress: 68,
    updatedAt: "今天 14:32",
    sceneCount: 14
  },
  {
    id: "project-night",
    title: "夜班电台",
    subtitle: "都市剧情 · 8 分钟",
    status: "待审阅",
    progress: 42,
    updatedAt: "昨天 21:18",
    sceneCount: 9
  },
  {
    id: "project-courtyard",
    title: "院子里的雪",
    subtitle: "品牌叙事 · 90 秒",
    status: "制作中",
    progress: 24,
    updatedAt: "7 月 12 日",
    sceneCount: 6
  }
];

export const hierarchy = [
  {
    id: "act-1",
    label: "第一幕 · 失衡",
    meta: "6 场",
    children: [
      {
        id: "sequence-1",
        label: "戏 01 · 回到海边",
        meta: "3 场",
        children: [
          { id: "scene-001", label: "S001 渡口 / 黄昏", meta: "1'12\"" },
          { id: "scene-002", label: "S002 老宅门廊 / 夜", meta: "0'48\"" },
          { id: "scene-003", label: "S003 厨房 / 夜", meta: "1'05\"" }
        ]
      },
      {
        id: "sequence-2",
        label: "戏 02 · 未寄出的信",
        meta: "3 场",
        children: [
          { id: "scene-004", label: "S004 阁楼 / 清晨", meta: "0'55\"" },
          { id: "scene-005", label: "S005 防波堤 / 日", meta: "1'20\"" },
          { id: "scene-006", label: "S006 杂货铺 / 日", meta: "0'44\"" }
        ]
      }
    ]
  },
  {
    id: "act-2",
    label: "第二幕 · 追索",
    meta: "5 场",
    children: [
      {
        id: "sequence-3",
        label: "戏 03 · 潮汐表",
        meta: "5 场",
        children: [
          { id: "scene-007", label: "S007 港务站 / 日", meta: "1'10\"" },
          { id: "scene-008", label: "S008 旧船厂 / 夜", meta: "1'35\"" }
        ]
      }
    ]
  },
  {
    id: "act-3",
    label: "第三幕 · 回声",
    meta: "3 场",
    children: []
  }
];

export const initialScriptBlocks: ScriptBlock[] = [
  {
    id: "b1",
    type: "scene-heading",
    label: "场景标题",
    content: "外景 · 青屿渡口 · 黄昏"
  },
  {
    id: "b2",
    type: "action",
    label: "动作",
    content:
      "末班渡轮推开灰蓝色的海水。林夏站在空旷甲板上，手里攥着一封被潮气浸软的信。远处，废弃灯塔闪了一次，又熄灭。"
  },
  {
    id: "b3",
    type: "action",
    label: "动作",
    content:
      "汽笛声盖过手机震动。屏幕上只有一条陌生号码发来的信息：别回头。"
  },
  { id: "b4", type: "character", label: "角色", content: "船员" },
  {
    id: "b5",
    type: "dialogue",
    label: "对白",
    content: "青屿很久没人回去了。你确定有人等你？"
  },
  { id: "b6", type: "character", label: "角色", content: "林夏" },
  {
    id: "b7",
    type: "dialogue",
    label: "对白",
    content: "我不是回来找人的。"
  },
  {
    id: "b8",
    type: "action",
    label: "动作",
    content: "她把手机扣在掌心。渡轮靠岸的碰撞让所有灯同时晃了一下。"
  }
];

export const assets: AssetItem[] = [
  {
    id: "asset-linxia",
    type: "角色",
    name: "林夏",
    meta: "29 岁 · 海洋摄影师",
    status: "已批准",
    usage: "11 场 · 27 镜"
  },
  {
    id: "asset-uncle",
    type: "角色",
    name: "陈叔",
    meta: "57 岁 · 渡口管理员",
    status: "草稿",
    usage: "4 场 · 9 镜"
  },
  {
    id: "asset-ferry",
    type: "地点",
    name: "青屿渡口",
    meta: "海雾、锈蚀护栏、冷色暮光",
    status: "已批准",
    usage: "S001、S013"
  },
  {
    id: "asset-house",
    type: "地点",
    name: "林家老宅",
    meta: "南方海岛民居、木质回廊",
    status: "待补充",
    usage: "5 场"
  },
  {
    id: "asset-letter",
    type: "道具",
    name: "潮湿的信",
    meta: "旧牛皮纸、蓝黑墨水、盐渍",
    status: "已批准",
    usage: "7 场 · 12 镜"
  },
  {
    id: "asset-style",
    type: "风格",
    name: "冷雾悬疑",
    meta: "低饱和青灰、自然逆光、细颗粒",
    status: "已批准",
    usage: "全项目"
  }
];

export const initialBreakdown: BreakdownProposal[] = [
  {
    id: "p1",
    selected: true,
    type: "幕",
    title: "第一幕 · 失衡",
    range: "第 1–6 场",
    confidence: 96,
    note: "林夏回岛，收到警告，并发现父亲失踪并非意外。"
  },
  {
    id: "p2",
    selected: true,
    type: "戏",
    title: "戏 01 · 回到海边",
    range: "第 1–3 场",
    confidence: 92,
    note: "连续戏剧动作：抵达、进入旧宅、发现异常。"
  },
  {
    id: "p3",
    selected: true,
    type: "场",
    title: "S001 · 青屿渡口 / 黄昏",
    range: "第 1–8 段",
    confidence: 98,
    note: "地点与时间连续，角色状态未发生跳跃。"
  },
  {
    id: "p4",
    selected: true,
    type: "场",
    title: "S002 · 老宅门廊 / 夜",
    range: "第 9–15 段",
    confidence: 88,
    note: "时间切换明确；“门内”空间归属需要用户确认。"
  },
  {
    id: "p5",
    selected: false,
    type: "戏",
    title: "戏 02 · 未寄出的信",
    range: "第 4–6 场",
    confidence: 74,
    note: "第 6 场可能属于下一戏，存在节奏歧义。"
  }
];

export const shots: ShotRow[] = [
  {
    id: "R01",
    sceneId: "scene-001",
    size: "大全景",
    camera: "24mm · 岸侧固定",
    action: "渡轮从画左切入，林夏是甲板上唯一静止的人。",
    performance: "身体紧绷，目光锁住远处灯塔。",
    duration: 4,
    cutReason: "建立孤岛与人物尺度"
  },
  {
    id: "R02",
    sceneId: "scene-001",
    size: "中近景",
    camera: "50mm · 缓慢侧移",
    action: "风掀起信封边缘，她用拇指压住署名。",
    performance: "压住情绪，不让自己打开信。",
    duration: 3,
    cutReason: "从环境转向核心道具"
  },
  {
    id: "R03",
    sceneId: "scene-001",
    size: "特写",
    camera: "85mm · 手持微动",
    action: "灯塔闪烁倒映在她的瞳孔里，手机在画外震动。",
    performance: "一瞬警觉，随后假装无事。",
    duration: 2,
    cutReason: "把视觉异象转成主观威胁"
  },
  {
    id: "R04",
    sceneId: "scene-001",
    size: "插入特写",
    camera: "70mm · 俯拍",
    action: "手机屏幕亮起：别回头。",
    performance: "手指收紧，遮住屏幕下沿。",
    duration: 2,
    cutReason: "交付关键信息"
  },
  {
    id: "R05",
    sceneId: "scene-001",
    size: "双人中景",
    camera: "40mm · 轻微跟移",
    action: "船员从画后进入，林夏先把手机扣进掌心。",
    performance: "两人都避免直视对方。",
    duration: 5,
    cutReason: "进入对白并重建空间关系"
  }
];

export const initialEnvelopes: PromptEnvelope[] = [
  {
    id: "P001",
    sceneId: "scene-001",
    name: "渡轮抵岸 · 异象",
    shotIds: ["R01", "R02", "R03"],
    model: "gpt-image-2",
    duration: 9,
    status: "就绪",
    prompt:
      "黄昏的青屿渡口，灰蓝海雾与锈蚀护栏。先以 24mm 岸侧大全景建立末班渡轮与孤独人物尺度，连续过渡到 50mm 中近景：林夏压住被潮气浸软的信封；最后切入 85mm 眼部特写，废弃灯塔的闪光映在瞳孔。低饱和青灰，自然逆光，细颗粒胶片质感。保持林夏服装、发型与信封连续一致。"
  },
  {
    id: "P002",
    sceneId: "scene-001",
    name: "陌生短信",
    shotIds: ["R03", "R04"],
    model: "gpt-image-2",
    duration: 4,
    status: "需检查",
    prompt:
      "延续同一渡轮甲板与黄昏光线。从林夏警觉的眼神切到俯拍手机插入特写，屏幕显示中文短信“别回头”。手指收紧但不遮挡文字；背景保持虚化海雾与移动中的甲板。避免增加新人物或改变手机外观。"
  },
  {
    id: "P003",
    sceneId: "scene-001",
    name: "船员搭话",
    shotIds: ["R05"],
    model: "gpt-image-2",
    duration: 5,
    status: "草稿",
    prompt:
      "40mm 双人中景，船员从林夏身后进入画面，林夏在对方开口前将手机扣进掌心。两人保持克制的距离，视线避开彼此。甲板轻微晃动，岸灯开始亮起。"
  }
];

export const initialTasks: TaskItem[] = [
  {
    id: "t1",
    title: "确认老宅门廊空间归属",
    owner: "我",
    priority: "P1",
    due: "今天",
    scene: "S002",
    status: "待处理"
  },
  {
    id: "t2",
    title: "补全林夏角色侧面参考",
    owner: "我",
    priority: "P2",
    due: "7 月 17 日",
    scene: "共享资产",
    status: "进行中"
  },
  {
    id: "t3",
    title: "审阅 S001 分镜节奏",
    owner: "导演",
    priority: "P1",
    due: "明天",
    scene: "S001",
    status: "待审阅"
  },
  {
    id: "t4",
    title: "锁定第一幕剧本 v4",
    owner: "我",
    priority: "P2",
    due: "已完成",
    scene: "第一幕",
    status: "已完成"
  },
  {
    id: "t5",
    title: "修复 P002 对白覆盖",
    owner: "我",
    priority: "P0",
    due: "今天",
    scene: "S001",
    status: "待处理"
  }
];

export const qaFindings: QaFinding[] = [
  {
    id: "qa1",
    priority: "P0",
    title: "P002 未保留原始短信文本映射",
    detail: "Prompt 中包含文本，但没有链接到剧本块 b3，导出时不可追溯。",
    scope: "S001 · P002",
    status: "未处理"
  },
  {
    id: "qa2",
    priority: "P1",
    title: "R03 同时属于两个 Envelope",
    detail: "映射合法，但连续性描述存在冲突，需要明确以哪次生成为主。",
    scope: "S001 · R03",
    status: "未处理"
  },
  {
    id: "qa3",
    priority: "P2",
    title: "S002 地点资产尚未批准",
    detail: "老宅外观参考处于待补充状态，可能影响后续分镜一致性。",
    scope: "S002 · 资产",
    status: "未处理"
  },
  {
    id: "qa4",
    priority: "P3",
    title: "R05 时长可略微收紧",
    detail: "当前 5 秒不影响生成可靠性，建议成片阶段再评估。",
    scope: "S001 · R05",
    status: "已忽略"
  }
];

export const initialSkills: SkillItem[] = [
  {
    id: "screenwriter-workflow",
    name: "Screenwriter Workflow",
    version: "1.1.0",
    slot: "script.primary",
    slots: ["script.primary"],
    source: "核心",
    enabled: true,
    capabilities: ["project.read", "draft.propose"],
    description: "创建、审阅和迭代剧本，并保持版本与上游追溯。"
  },
  {
    id: "guide-workflow",
    name: "Guide Workflow",
    version: "1.1.0",
    slot: "guides.primary",
    slots: ["guides.primary"],
    source: "核心",
    enabled: true,
    capabilities: ["project.read", "draft.propose", "asset.read"],
    description: "维护共享角色、地点、道具与视觉风格资料。"
  },
  {
    id: "shotlist-breakdown-workflow",
    name: "Shotlist Breakdown",
    version: "1.1.0",
    slot: "shotlist.breakdown",
    slots: ["shotlist.breakdown"],
    source: "核心",
    enabled: true,
    capabilities: ["project.read", "draft.propose", "asset.read"],
    description: "把已确认剧本拆成面向导演决策的场景分镜结构。"
  },
  {
    id: "sketch-shotlist-workflow",
    name: "Sketch Shotlist",
    version: "1.1.0",
    slot: "shotlist.primary",
    slots: ["shotlist.primary"],
    source: "核心",
    enabled: true,
    capabilities: ["project.read", "draft.propose", "asset.read"],
    description: "生成 Shot Row、Prompt Envelope 与中文生产提示词。"
  },
  {
    id: "qa-workflow",
    name: "QA Workflow",
    version: "1.1.0",
    slot: "qa.primary",
    slots: ["qa.primary"],
    source: "核心",
    enabled: true,
    capabilities: ["project.read", "draft.propose"],
    description: "检查原文覆盖、镜头理由、映射完整性与生成可靠性。"
  },
  {
    id: "noir-prompt-pack",
    name: "Noir Prompt Pack",
    version: "0.3.1",
    slot: "未分类",
    slots: [],
    source: "本地导入",
    enabled: false,
    capabilities: ["project.read"],
    description: "用户导入的黑色电影风格提示词增强 Skill，等待选择 Slot。"
  }
];

export const draftImages = [];
