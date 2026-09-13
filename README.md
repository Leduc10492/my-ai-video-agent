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

`pnpm install` 安装剧本 DOCX 导出所需的 `docx`；`pnpm validate` 会检查 Registry、Skills、Agents、脚本、模板、文档引用、依赖锁文件和快捷软链接。校验通过后即可把剧本放进 `deliverables/1_story/` 开始工作。

## 阶段目录命名

| 目录 | 用途 |
| --- | --- |
| `deliverables/0_admin/` | 锁定条件、变更记录与 QA 报告 |
| `deliverables/1_story/` | 剧本与剧本审计 |
| `deliverables/2_assets/` | 共享人物、场景、道具与风格资产 |
| `deliverables/3_shotlist/` | 按 Scene 保存 Breakdown、HTML 与 manifest |

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

Prompt 写法通过 Registry 的 `shotlist.prompt_compiler` 独立替换。当前默认实现是 `seedance-clean-zh`。主控 Agent 先取得每个 Prompt Envelope 的编译结果，再由 `shotlist.html_assembler` 将 Breakdown、Shot Rows、资产信息和 Prompt 原样汇集到最终 HTML。HTML Skill 不参与 Prompt 创作。

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
