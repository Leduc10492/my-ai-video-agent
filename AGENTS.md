# AI Video Agent

这个仓库是一个由主控 Agent 调用 Skills 完成影视前期生产的文件型工作流，不是软件应用，也不以 fixture、validator 或测试框架作为主流程。

## 最小生产链路

```text
剧本
  -> 资产 / 风格资料（需要时）
  -> 分镜拆解
  -> Shot Row + Prompt Envelope
  -> 中文生产 HTML
  -> QA
```

| 阶段 | Skill slot | 主要产物 |
| --- | --- | --- |
| 剧本 | `script.primary` | `deliverables/10_story/01_script_v{N}.md` |
| 资产 / 风格 | `guides.primary` | `deliverables/20_assets/` |
| 分镜拆解 | `shotlist.breakdown` | `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md` |
| Prompt + HTML | `shotlist.primary` | `deliverables/30_shotlist/scenes/<scope>_v{N}/` |
| 检查 | `qa.primary` | 默认在对话中报告；仅按用户要求保存报告 |

所有实现只通过 `.agents/skill_registry.md` 解析。不要为 Beat、Shot、Prompt、Preview 或 Manifest 再创建新的平行工作流层，除非真实生产结果证明现有 Skill 无法承担该职责且用户明确批准重构。

## 主控 Agent 规则

1. 先确认用户要执行的阶段、场景范围和最新上游文件，只读取该阶段需要的 Skill 与素材。
2. 默认在当前主线程执行。只有用户明确要求 Sub Agent、并行或委派时，才读取对应 `.codex/agents/*.toml` 并启动有边界的 Sub Agent。
3. 一个阶段只有一个写入者。Sub Agent 不得同时修改同一产物。
4. 不允许用硬编码脚本代替 Skill 的创作判断，不允许预写 `QA passed`。
5. 图片或视频生成必须由用户单独授权；完成 HTML 不自动触发生成。

## 导演与 Prompt 原则

- Shot Row 是导演语言，描述景别、机位、焦段、动作、表演和切镜理由。
- Prompt Envelope 是一次 AI 生成的打包范围；它与 Shot Row 不是一一对应关系。
- 一个 Envelope 可以包含多个连续 Shot Row。不得为了减少 Prompt 数量而删除镜头设计。
- 时长来自场景节奏和动作需要。生成器的 15 秒能力是上限，不是必须填满的目标。
- 同地点、同角色、同空间轴且构成一个紧密因果转折的短动作可以合并为一个多镜头 Envelope，即使内部包含多个 action beat。
- 只有地点、角色集合、空间关系、连续动作或生成可靠性发生实质变化时才拆 Envelope。
- HTML 必须保留 `Scene -> Shot Row -> Prompt Envelope` 映射、原始台词和完整中文 Prompt。

## 文件边界

- `deliverables/10_story/`：剧本与剧本审计
- `deliverables/20_assets/`：共享人物、场景、道具和风格资料
- `deliverables/30_shotlist/`：分镜拆解、场景 HTML、预演和生成记录
- `deliverables/00_admin/`：锁定条件、变更记录和用户明确要求保存的 QA 报告
- `archives/`：历史产物，只在比较或恢复时读取

共享资产只放在 `20_assets`；场景目录只保存该场景独有的补充资产。

## QA

QA 默认是一次简洁的人工可读检查：

- 原剧本动作和台词是否完整覆盖
- 每个切镜是否有观众信息、表演或空间上的理由
- Shot Row 是否完整保留导演设计
- Prompt Envelope 是否紧凑、可生成且没有为了填时长而拖慢动作
- HTML 中的 ID、映射、Prompt 和相对路径是否一致

结构检查不能证明创作质量。最终分镜质量以真实 HTML 和用户审阅为准。
