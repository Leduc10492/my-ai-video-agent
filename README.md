# My AI Video Agent

一个以主控 Agent、Skills 和少量可选 Sub Agents 组成的 AI 影片前期生产工作流。

## 新项目安装

GitHub 仓库根目录就是项目根目录。克隆后直接在同一个目录的 `deliverables/` 内创作，不需要再建立 `main/` 与 `test/` 两层：

环境要求：Node.js 18 或更高版本、pnpm 9 或更高版本。仓库用 `pnpm-lock.yaml` 锁定依赖，并在 `package.json` 中记录当前验证使用的 pnpm 版本。

```bash
git clone https://github.com/Leduc10492/my-ai-video-agent.git my-film-project
cd my-film-project
pnpm install --frozen-lockfile
pnpm validate
```

`pnpm install` 安装剧本 DOCX 导出所需的 `docx`；`pnpm validate` 会检查 Registry、Skills、Agents、脚本、模板、文档引用、依赖锁文件和快捷软链接。校验通过后即可把剧本放进 `deliverables/10_story/` 开始工作。

```text
剧本 -> 同版本审核通过 -> 按 Scene 分镜拆解 -> Shot Row -> Prompt Envelope -> 中文 HTML
```

需要人物、地点或风格参考时，在分镜前补充 `deliverables/20_assets/`。图片和视频生成不属于默认最小闭环，必须由用户单独授权。

## 核心入口

- `AGENTS.md`：主控 Agent 的生产规则
- `.agents/skill_registry.md`：Skill slot 映射
- `.agents/skills/`：实际生产能力
- `.codex/agents/`：用户明确委派时使用的 Sub Agent 边界
- `deliverables/`：当前项目产物
- `archives/`：当前项目的历史版本，需要归档时再写入

## 核心原则

- 分镜先服务观众体验，再考虑 AI 打包。
- 当前剧本没有同版本审核，或审核仍有 P0/P1 时，不进入资产与分镜阶段。
- Shot Row 与 Prompt Envelope 分离。
- 15 秒是生成上限，不是填充目标。
- 不使用硬编码 fixture 代替 Skill 运行。
- QA 检查真实产物，不用结构通过冒充创作质量。

## Shotlist 目录

```text
deliverables/30_shotlist/
└── scene-021_v1/
    ├── 03_shotlist_breakdown_scene-021_v1.md
    ├── Shotlist_scene-021_ZH_v1.html
    ├── manifest.md
    ├── spatial_blocking.md        # 需要时
    ├── assets/                    # 仅 Scene 专用资产
    ├── previews/                  # 用户单独授权后
    └── generated/                 # 用户单独授权后
```

生产层级是 `Scene -> Shot Row -> Prompt Envelope`。文件夹按 Scene 建；Shot Row 和 Prompt Envelope 是 Scene 文件内部的导演与生成映射，不再建立额外目录。

长剧本只扫描 Scene 标题/编号和行范围来确认顺序，正式拆解时只加载选中 Scene 及边界，然后一次处理一个 Scene。单个 Scene 建议每批审查 4-8 个 Prompt Envelope，超过 10 个必须在该 Scene 内分批并逐批 QA。
