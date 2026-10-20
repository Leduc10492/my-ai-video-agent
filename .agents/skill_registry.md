# Skill Registry

主控 Agent 只从本表选择生产 Skill。保持 slot 稳定，优先修改现有 Skill，不为同一职责增加平行层。

| Slot | Skill | Owner | Output |
| --- | --- | --- | --- |
| `script.primary` | `screenwriter-workflow` | `script-writer` | `deliverables/1_story/01_script_v{N}.md` |
| `story.mckee_router` | `mckee-coordinator` | `script-writer` | 返回结构、审计或改写 packet；持久化审计由 `script.primary` 写入 `01_audit_report_v{N}.md` |
| `guides.primary` | `guide-workflow` | `guide-director` | `deliverables/2_assets/` |
| `shotlist.breakdown` | `shotlist-breakdown-workflow` | `storyboard-director` | `deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md` |
| `shotlist.prompt_compiler` | `cinedance` | `storyboard-director` | 将一个已批准 Prompt Envelope 编译为一段独立中文 Seedance Prompt |
| `shotlist.html_assembler` | `shotlist-html-assembler` | `storyboard-director` | 将 Breakdown、资产信息、Shot Rows 与已编译 Prompt 汇总为中文 HTML 与 manifest |
| `qa.primary` | `qa-workflow` | `qa-check` | 对话 QA；按需保存报告 |
| `qa.checklists` | `qa-checklists` | `qa-check` | 阶段检查清单 |
| `artifact.formatter` | `artifact-formatter` | 当前写入者 | 统一产物头与路径 |
| `version.manager` | `version-management` | 当前写入者 | 当前版本与历史归档 |

## Replacement Rule

替换 Skill 前必须用一个真实场景跑出目标产物，并确认它不改变上述稳定路径。主控 Agent 独立调用 `shotlist.prompt_compiler`，再把编译结果交给 `shotlist.html_assembler` 汇总。替换 compiler 只能改变 Prompt 内容，不能改变 Scene、Shot Row、Prompt Envelope、资产路由、HTML 或 manifest 契约。仅有文档声明、fixture 或结构检查不能证明替换成功。

## 当前替换状态

用户已明确指定将默认 compiler 切换为 `cinedance`；项目本地入口为 [CINEDANCE](skills/cinedance/SKILL.md)，使用 COMPILE MODE，保持中文输出和原生产接口。它来自已安装的 CINEDANCE V4.13，加项目适配约束；全局更新不会自动覆盖此副本。旧生产包保留其实际 compiler 记录，不自动重编译。

已用既有 Scene 081 完成本地 `cinedance → shotlist-html-assembler` 重跑：保留 3 个 Shot Rows、2 个 Prompt Envelopes 与两句源对白；通过结构校验、真实浏览器显示／复制／搜索／筛选检查。见 [Scene 081 v2 验证记录](../deliverables/3_shotlist/scene-081_v2/manifest.md)。旧版保持不变；未生成图片或视频，实际生成效果和用户接受仍未验证。

## 已导入的分镜候选

[script-to-shots](skills/script-to-shots/SKILL.md) 是用户在 Claude 中制作的 Fountain 剧本 → 拆解 → 舞台 → 镜头 → 提示词／审片页完整流程。2026-10-18 从同仓库 `main/` 工作目录导入完整 16 文件包，内容保持一致；后续本项目维护使用本目录中的副本。

该 Skill 已登记为项目候选，尚未绑定上表的默认生产 slot。它的独立编译器同时生成 Prompt 和审片 HTML，不能仅靠修改 `shotlist.breakdown` 的映射就视为完成接入。默认生产继续以本表的分阶段接口为准；采用这套完整流程时，应先明确其与现有 Shot Row、Prompt Envelope、compiler 和 assembler 的职责及产物映射。

导入检查：原样例在临时目录重跑得到 40 镜、25 段、0 ERROR、6 WARN；不代表通用场景或视觉验收。原 Skill 已列出的银行场景硬编码仍然存在，通用化时应将这些假设改为舞台数据。后续 Claude 版本对比后合入此副本，其他工作目录和全局 Skill 不自动同步。
