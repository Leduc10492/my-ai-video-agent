# Skill Registry

主控 Agent 只从本表选择生产 Skill。保持 slot 稳定，优先修改现有 Skill，不为同一职责增加平行层。

| Slot | Skill | Owner | Output |
| --- | --- | --- | --- |
| `script.primary` | `screenwriter-workflow` | `script-writer` | `deliverables/10_story/01_script_v{N}.md` |
| `story.mckee_router` | `mckee-coordinator` | `script-writer` | 按需返回结构、审计或改写建议 |
| `guides.primary` | `guide-workflow` | `guide-director` | `deliverables/20_assets/` |
| `shotlist.breakdown` | `shotlist-breakdown-workflow` | `storyboard-director` | `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md` |
| `shotlist.primary` | `sketch-shotlist-workflow` | `storyboard-director` | 场景级中文 Shotlist HTML 与 manifest |
| `qa.primary` | `qa-workflow` | `qa-check` | 对话 QA；按需保存报告 |
| `qa.checklists` | `qa-checklists` | `qa-check` | 阶段检查清单 |
| `artifact.formatter` | `artifact-formatter` | 当前写入者 | 统一产物头与路径 |
| `version.manager` | `version-management` | 当前写入者 | 当前版本与历史归档 |

## Replacement Rule

替换 Skill 前必须用一个真实场景跑出目标产物，并确认它不改变上述稳定路径。仅有文档声明、fixture 或结构检查不能证明替换成功。
