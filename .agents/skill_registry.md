# Skill Registry

主控 Agent 只从本表选择生产 Skill。保持 slot 稳定，优先修改现有 Skill，不为同一职责增加平行层。

| Slot | Skill | Owner | Output |
| --- | --- | --- | --- |
| `script.primary` | `screenwriter-workflow` | `script-writer` | `deliverables/1_story/01_script_v{N}.md` |
| `story.mckee_router` | `mckee-coordinator` | `script-writer` | 返回结构、审计或改写 packet；持久化审计由 `script.primary` 写入 `01_audit_report_v{N}.md` |
| `guides.primary` | `guide-workflow` | `guide-director` | `deliverables/2_assets/` |
| `shotlist.breakdown` | `shotlist-breakdown-workflow` | `storyboard-director` | `deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md` |
| `shotlist.prompt_compiler` | `seedance-clean-zh` | `storyboard-director` | 将一个已批准 Prompt Envelope 编译为一段独立中文 Seedance Prompt |
| `shotlist.html_assembler` | `sketch-shotlist-workflow` | `storyboard-director` | 将 Breakdown、资产信息、Shot Rows 与已编译 Prompt 汇总为中文 HTML 与 manifest |
| `qa.primary` | `qa-workflow` | `qa-check` | 对话 QA；按需保存报告 |
| `qa.checklists` | `qa-checklists` | `qa-check` | 阶段检查清单 |
| `artifact.formatter` | `artifact-formatter` | 当前写入者 | 统一产物头与路径 |
| `version.manager` | `version-management` | 当前写入者 | 当前版本与历史归档 |

## Replacement Rule

替换 Skill 前必须用一个真实场景跑出目标产物，并确认它不改变上述稳定路径。主控 Agent 独立调用 `shotlist.prompt_compiler`，再把编译结果交给 `shotlist.html_assembler` 汇总。替换 compiler 只能改变 Prompt 内容，不能改变 Scene、Shot Row、Prompt Envelope、资产路由、HTML 或 manifest 契约。仅有文档声明、fixture 或结构检查不能证明替换成功。
