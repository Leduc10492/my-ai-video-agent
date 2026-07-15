# AI Director packaged Skill registry

This distribution contains only the reviewed, copyright-safe core workflow pack.

| Slot | Default Skill | Purpose |
| --- | --- | --- |
| `script.primary` | `screenwriter-workflow` | 剧本创建、修改与版本候选 |
| `guides.primary` | `guide-workflow` | 资产与风格资料 |
| `shotlist.breakdown` | `shotlist-breakdown-workflow` | 场景四阶段拆解 |
| `shotlist.primary` | `sketch-shotlist-workflow` | Shot Row、Prompt Envelope 与 HTML |
| `qa.primary` | `qa-workflow` | 人工可读 QA |
| `artifact.formatter` | `artifact-formatter` | 产物元数据格式 |
| `version.manager` | `version-management` | 版本归档与恢复 |

McKee analysis and source Skills are not included in the application bundle. A
project that depends on optional local story-analysis plugins must show that
dependency as unavailable instead of silently substituting another Skill.
