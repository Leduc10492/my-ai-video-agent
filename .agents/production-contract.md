# 影视生产契约

进入 Scene 生产、生产 Prompt 编译、生产 HTML 装配或修改这些契约时读取。局部文字修改、用户明确限定的文本草案不需要加载整套生产链。执行模式与授权以项目 AGENTS.md 为准。

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


## Prompt 载荷边界

生产状态留在 HTML／manifest；不得进入复制按钮载荷或模型 Prompt。参考用途限制可以保留，例如“仅参考服装，不参考背景”。保留真实附件 tag、已批准 Style Prefix 与技术控制串。

## 结构验证

涉及路径、模板、装配或验证器时运行适用检查，现有仓库命令为 `pnpm validate`。结构通过不证明真实参考、视觉质量或用户接受。既有失败应说明来源，不顺带重建无关产物。
