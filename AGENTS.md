# AI Video Agent

这个仓库是一个由主控 Agent 调用 Skills 完成影视前期生产的文件型工作流，不是软件应用，也不以 fixture、validator 或测试框架作为主流程。

## 最小生产链路

```text
剧本
  -> 剧本审核通过
  -> 资产 / 风格资料（需要时）
  -> 按 Scene 分镜拆解
  -> Shot Row + Prompt Envelope
  -> 中文生产 HTML
  -> QA
```

| 阶段 | Skill slot | 主要产物 |
| --- | --- | --- |
| 剧本 | `script.primary` | `deliverables/1_story/01_script_v{N}.md` |
| 剧本审核门 | `script.primary` 调用 `story.mckee_router` | `deliverables/1_story/01_audit_report_v{N}.md` |
| 资产 / 风格 | `guides.primary` | `deliverables/2_assets/` |
| Scene 分镜拆解 | `shotlist.breakdown` | `deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md` |
| Prompt 编译 | `shotlist.prompt_compiler` | 每个已批准 Prompt Envelope 对应一段中文 Prompt |
| HTML 汇总 | `shotlist.html_assembler` | 汇集 Breakdown、资产、Shot Rows 与已编译 Prompt，写入同一 Scene 文件夹 |
| 检查 | `qa.primary` | 默认在对话中报告；仅按用户要求保存报告 |

所有实现只通过 `.agents/skill_registry.md` 解析。主控 Agent 先调用 `shotlist.prompt_compiler` 取得 Prompt，再把完整中间产物交给 `shotlist.html_assembler` 汇总为 HTML。替换 Prompt 写法只改 compiler 映射，不改 Scene、Shot Row、Prompt Envelope、资产路由或 HTML 契约。

阶段目录前缀固定使用单个数字：`0_admin`、`1_story`、`2_assets`、`3_shotlist`。不要扩展成两位数。文件名继续使用既有的 `01_`、`02_`、`03_` 前缀，以保持同一阶段内部的产物排序。

## 主控 Agent 规则

1. 先确认用户要执行的阶段、场景范围和最新上游文件，只读取该阶段需要的 Skill 与素材。
2. 默认在当前主线程执行。只有用户明确要求 Sub Agent、并行或委派时，才读取对应 `.codex/agents/*.toml` 并启动有边界的 Sub Agent。
3. 一个阶段只有一个写入者。Sub Agent 不得同时修改同一产物。
4. 不允许用硬编码脚本代替 Skill 的创作判断，不允许预写 `QA passed`。
5. 每个任务先确定 `interaction_mode`；未得到明确自主指令时一律使用 `interactive`，不得因为用户说“执行工作流”就推断为自主模式。
6. 图片或视频生成必须符合下方模式与范围授权；完成 HTML 本身不自动触发最终视频生成。

## 执行模式

### `interactive`（默认）

除非用户明确说“自主执行”“自动完成”“不用逐阶段确认”“你自行决定并修复”，否则使用本模式。主控 Agent 必须在下列门点停止，先用中文报告问题、证据、建议和下一步选项，再等待用户决定：

1. Story Bone 由推断补齐且存在高影响假设时；
2. 剧本与同版本 McKee 审核完成后，即使结论为 `hold_current` 或没有 P0/P1，也要展示 P0—P3 和未解决假设；
3. 资产 / 风格指南发现任何 `missing`、`draft`、`research_only` 或 `highest_priority` 生产参考时；
4. 第一个 Scene 的 Breakdown 完成后、Prompt 编译前；
5. 每个 Scene 或 4—8 个 Prompt Envelope 批次完成 QA 后、进入下一 Scene 前；
6. 任何图片 / 视频生成、外部发布、付费、不可逆覆盖或范围扩张之前。

交互式模式不得替用户默选 `text_only`、忽略 P2/P3、批量跑完剩余 Scene，或把阶段问题推迟到最终 QA。用户可以选择修复、接受风险、上传素材、授权生成参考、限定为文本规划或终止当前阶段。

### `autonomous`（仅显式触发）

只有用户明确授予自主权时启用。主控 Agent 不做常规阶段停顿，而是在每个阶段执行闭环：

```text
诊断 -> 修复 -> 阶段 QA -> 复跑 -> 达到门禁 -> 下一阶段
```

- P0/P1 必须修复并复审；不得带入下游。
- 会削弱下一阶段完整性、连续性或可生成性的 P2 必须在当前阶段修复。明确、低风险且不改变 canon 的 P3 应顺手完善；纯口味选择可记录为剩余建议。
- `hold_current` 只表示剧本不需要无目的改写，不得用来跳过可修的资产、导演、连续性或执行问题。
- 缺少生产参考时，优先调用当前可用的图片生成能力创建候选参考，保存到版本化资产目录，进行角色 / 道具 / 地点 / 连续性 QA，选择并锁定可用版本；不得仅登记 `missing` 后继续生产模式。
- 用户明确要求“自主执行项目工作流”时，视为已授权在该项目范围内进行可逆的本地设计补全与参考图片生成。最终视频生成只有在用户请求的范围包含“视频生成 / 成片 / 生成测试”时才自动执行。
- 不得把自主权扩大到外部发布、付费购买、账户权限变化、真实人物身份推断、破坏性删除或与项目无关的写入。
- 只有遇到无法从现有资料安全推断的 canon 冲突、所需工具 / 登录 / 付费权限不可用、或继续会越过上述范围时才停止并请求用户输入。
- 完成报告必须列出各阶段发现的问题、实际修复、复审结果、仍保留的 P3 / 外部阻断，不得只报告最终文件数量。

模式一旦确定，在当前请求中保持不变，除非用户明确切换。所有阶段交接都要记录当前 `interaction_mode`。

## 长剧本与 Scene 生产规则

- 进入资产与分镜阶段前，当前剧本必须有对应版本的审计报告，且没有未解决的 P0/P1；否则返回 `script.primary` 修订或复审。
- `interactive` 模式还必须有用户对当前剧本 / 审核的明确接受；`autonomous` 模式必须完成审计—修复—复审闭环，并清除会影响下游的可修 P2。
- 长剧本先只扫描 Scene 标题、编号和行范围，确认轻量 Scene 顺序；进入导演拆解时只加载选中 Scene 及前后边界，不把全剧本正文带入同一次 Shot Row / Prompt 上下文。
- 一次只完成一个 Scene：先保存该 Scene 的 Breakdown，通过 QA 后，再在同一 Scene 文件夹内生成 Prompt 和 HTML。`interactive` 在门点等待用户；`autonomous` 修复本 Scene 的可修问题并复审后自动进入下一个 Scene。
- 稳定生产单元是 `Scene -> Shot Row -> Prompt Envelope`。文件夹只建到 Scene；Shot Row 与 Prompt Envelope 保存在 Breakdown、HTML 和 manifest 中，不再各建一层目录。
- 推荐一次质量审查处理 4-8 个 Prompt Envelope。单个 Scene 超过 10 个 Envelope 时，必须按动作阶段、机位族或参考资产变化分批处理并逐批 QA；最终仍合并回同一个 Scene 文件夹，不发明新的批次文件夹体系。

## 导演与 Prompt 原则

- Shot Row 是导演语言，描述景别、机位、焦段、动作、表演和切镜理由。
- Prompt Envelope 是一次 AI 生成的打包范围；它与 Shot Row 不是一一对应关系。
- 一个 Envelope 可以包含多个连续 Shot Row。不得为了减少 Prompt 数量而删除镜头设计。
- 时长来自场景节奏和动作需要。生成器的 15 秒能力是上限，不是必须填满的目标。
- 同地点、同角色、同空间轴且构成一个紧密因果转折的短动作可以合并为一个多镜头 Envelope，即使内部包含多个 action beat。
- 只有地点、角色集合、空间关系、连续动作或生成可靠性发生实质变化时才拆 Envelope。
- HTML 必须保留 `Scene -> Shot Row -> Prompt Envelope` 映射、原始台词和完整中文 Prompt。

## 文件边界

- `deliverables/1_story/`：剧本与剧本审计
- `deliverables/2_assets/`：共享人物、场景、道具和风格资料
- `deliverables/3_shotlist/<scene-label>_v{N}/`：该 Scene 的 Breakdown、HTML、manifest 和另行授权的视频测试记录
- `deliverables/0_admin/`：锁定条件、变更记录和用户明确要求保存的 QA 报告
- `archives/`：历史产物，只在比较或恢复时读取

共享资产只放在 `2_assets`；Scene 目录只保存该场景的生产文件和场景独有补充资产。不要在 `3_shotlist` 与 Scene 目录之间再增加 `scenes/` 中间层。

## QA

QA 默认是一次简洁的人工可读检查：

- 原剧本动作和台词是否完整覆盖
- 每个切镜是否有观众信息、表演或空间上的理由
- Shot Row 是否完整保留导演设计
- Prompt Envelope 是否紧凑、可生成且没有为了填时长而拖慢动作
- HTML 中的 ID、映射、Prompt 和相对路径是否一致

结构检查不能证明创作质量。最终分镜质量以真实 HTML 和用户审阅为准。

QA 不得成为第一次暴露阶段问题的地方：每个问题必须在首次可检测的阶段报告或修复。最终 QA 只验证问题是否已解决、用户是否明确接受延期项，以及结构证明、浏览器证明和生成证明的边界。
