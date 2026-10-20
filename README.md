# My AI Video Agent

一个管理多部视频的本地影视工作台。平台负责项目、任务与预览，每部视频在独立文件夹内保存剧本、资产、分镜、剪辑和 Skill 配置。

## 正式创作目录与更新

开发 checkout 与正式作品可以分开。构建后运行：

```bash
node workbench/scripts/publish-workspace.mjs --destination "/你的路径/我的AI视频"
```

它建立 `00_工作流/工作台`、`00_工作流/Skills`、`00_工作流/项目模板`，并复制当前选择的视频项目到总目录；原开发、测试及备份不动。项目使用 `01_剧本` 至 `06_导出` 六类目录，技术状态在 `.project/`，工作区索引使用相对路径。新项目在总目录直接建立；既有旧路径通过项目映射读取。

双击正式目录的 `启动工作台.command` 使用。打包包含当前 OS/CPU 的运行组件；本机整体复制后可以从新位置启动。跨系统或不同芯片需重装相应依赖，Codex/Higgsfield 需在目标电脑安装和登录。复制前先停止服务，完整带走隐藏目录。

更新时先在开发仓库取得所需 GitHub 版本，完成验证与构建，关闭正式服务，再运行同一命令并加 `--update`。只替换公共工作流，旧版保存在 `.workbench/更新备份/`；作品数据及项目固定 Skill 不变。未提交的修改不会由 `git pull` 获取，实际打包来源记录在 `00_工作流/release.json`。

以下安装与旧阶段目录说明适用于开发 checkout 和原有项目；正式目录依据 `.agents/project-layout.mjs` 与项目自身的目录契约。

## 新项目安装

GitHub 仓库是平台工作区。`workbench/` 保存程序，`projects/<作品名>/` 保存独立视频项目；也可以打开其他硬盘上的项目。根目录的 `.agents/` 是默认模板，实际创作读取各视频项目自己的 Registry。

环境要求：Node.js 24 或更高版本（工作台使用内置 SQLite）、pnpm 9 或更高版本。仓库用 `pnpm-lock.yaml` 锁定依赖，并在 `package.json` 中记录当前验证使用的 pnpm 版本。

```bash
git clone https://github.com/Leduc10492/my-ai-video-agent.git my-film-workspace
cd my-film-workspace
pnpm install --frozen-lockfile
pnpm --dir workbench install --frozen-lockfile
pnpm validate
pnpm workbench:build
pnpm workbench:start
```

打开 `http://127.0.0.1:4310`，新建或打开视频项目。每个项目包含 `project.json`、`AGENTS.md`、`.agents/` 和 `deliverables/`。平台索引及当前选择保存在 `.workbench/`，私人项目默认不提交到平台 Git。

点击「在 Codex 中创作」复制该项目的创作指令或启动命令。直接从平台聊天时，先用 `pnpm workspace:context` 取得当前项目，然后在后续阶段通过 `--project <项目ID或绝对路径>` 保持绑定。界面切换项目不会改变已有任务的目录。

旧版用户先停止服务，运行 `pnpm workspace:migrate` 查看计划，再运行 `pnpm workspace:migrate --apply` 迁移。迁移逐文件校验、保留原 ID、备份和旧路径兼容链接。详见 [工作台文档](workbench/README.md)。

`pnpm validate` 检查平台提供的默认 Registry、Skills、Agents、脚本、模板、文档引用、依赖锁文件和快捷软链接。根目录历史 `deliverables/` 继续作为回归材料保留，以下生产路径均相对于具体视频项目。

## 阶段目录命名

| 目录 | 用途 |
| --- | --- |
| `deliverables/0_admin/` | 锁定条件、变更记录与 QA 报告 |
| `deliverables/1_story/` | 剧本与剧本审计 |
| `deliverables/2_assets/` | 共享人物、场景、道具与风格资产 |
| `deliverables/3_shotlist/` | 按 Scene 保存 Breakdown、HTML 与 manifest |
| `deliverables/4_edit/` | 剪辑工程、时间轴版本与成片导出 |

目录阶段号始终使用单个数字。文件名仍使用 `01_script`、`02_asset_guide`、`03_shotlist_breakdown` 等既有前缀，用于阶段内部排序。

```text
剧本 -> 同版本审核通过 -> 按 Scene 分镜拆解 -> Shot Row -> Prompt Envelope -> 中文 HTML
```

需要人物、地点或风格参考时，在分镜前补充 `deliverables/2_assets/`。

## 执行模式

- 默认 `interactive`：剧本审核、资产缺口、第一个 Scene、每个 Scene / Prompt 批次 QA 都是用户确认门。主控 Agent 先报告 P0—P3、缺少素材和选项，不能自动默选 `text_only` 或直接跑完整个项目。
- 显式 `autonomous`：只有用户说“自主执行”“自动完成”“不用逐阶段确认”等明确指令才启用。主控 Agent 在每个阶段自行执行“诊断 → 修复 → QA → 复跑”，补齐可修 P0—P2 和明确低风险 P3，再进入下游。
- 自主项目工作流包含项目范围内可逆的本地设计补全与参考图片生成；最终视频生成仅在用户请求范围明确包含视频 / 成片 / 生成测试时执行。外部发布、付费、权限变化和破坏性操作不因自主模式自动获批。

没有显式自主指令时，图片和视频生成仍需要在对应阶段由用户选择或授权。

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
- “没有 P0/P1”只表示结构上可继续，不等于用户已接受审核意见；交互式模式必须完成用户确认，自主模式必须完成问题修复与复审。
- Shot Row 与 Prompt Envelope 分离。
- 15 秒是生成上限，不是填充目标。
- 不使用硬编码 fixture 代替 Skill 运行。
- QA 检查真实产物，不用结构通过冒充创作质量。

Prompt 写法通过 Registry 的 `shotlist.prompt_compiler` 独立替换。当前默认实现是 `cinedance`。主控 Agent 先取得每个 Prompt Envelope 的编译结果，再由 `shotlist.html_assembler` 将 Breakdown、Shot Rows、资产信息和 Prompt 原样汇集到最终 HTML。HTML Skill 不参与 Prompt 创作。

## Shotlist 目录

```text
deliverables/3_shotlist/
└── scene-021_v1/
    ├── 03_shotlist_breakdown_scene-021_v1.md
    ├── Shotlist_scene-021_ZH_v1.html
    ├── manifest.md
    ├── spatial_blocking.md        # 需要时
    ├── assets/                    # 仅 Scene 专用资产
    └── generated/                 # 另行授权的视频测试记录
```

当前工作流不生成线稿分镜图、e-conte 或 preview manifest；最终可视化交付物是包含完整分镜与 Seedance Prompt 的 HTML。

生产层级是 `Scene -> Shot Row -> Prompt Envelope`。文件夹按 Scene 建；Shot Row 和 Prompt Envelope 是 Scene 文件内部的导演与生成映射，不再建立额外目录。

长剧本只扫描 Scene 标题/编号和行范围来确认顺序，正式拆解时只加载选中 Scene 及边界，然后一次处理一个 Scene。单个 Scene 建议每批审查 4-8 个 Prompt Envelope，超过 10 个必须在该 Scene 内分批并逐批 QA。

## 本地剧本与显式来源更新

先首次导入 Notion 剧本，之后持续使用本地版本；只有明确来源更新请求才读取 Notion。台词／剧情修改只写本地，局部更新只改目标，全量更新保留旧版，不自动回写。`workflow_state.json` 明确区分工作稿与已选生产输入，最高版本号仅用于分配新文件名。

操作见 [本地剧本协议](.agents/skills/version-management/references/local-script-workflow.md)。在平台目录运行 `pnpm workflow status --root <视频项目绝对路径>` 检查指定项目状态；`pnpm test:workflow` 验证范围更新、失败恢复、版本选择和归档引用。

## 本地影视工作台

新增 [workbench](workbench/README.md)：React / shadcn neutral 三模块界面、本地 SQLite、Codex App Server、Higgsfield 生成适配及 Twick 剪辑 / 渲染。沿用本仓库工作稿与生产版本契约，标准文件名作为资产标识。

首次运行 `pnpm --dir workbench install`、`pnpm workbench:build`，然后 `pnpm workbench:start`。打开 `http://127.0.0.1:4310`。独立验收运行 `pnpm workbench:test` 和 `pnpm --dir workbench test:media`。完整说明与真实生成验收范围见工作台 README。
