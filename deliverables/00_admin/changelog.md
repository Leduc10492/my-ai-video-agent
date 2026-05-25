# 变更日志

## 格式说明
```
## [日期] - [阶段]
### 变更类型
- 变更描述 (影响的文件)
```

---

## [2026-05-25] - Workflow Slot Architecture Hardening

### Added
- `AGENT_SKILL_PLACEMENT_GUIDE.md`: guidance for deciding which skills/subagents should stay project-local versus move to global scope.
- `.agents/skill_registry.md`: stable skill assembly slots, replacement rules, and compatibility interfaces for guide, storyboard, art, video, artifact, version, and QA stages.
- `.codex/agents/guide-director.toml`: dedicated owner for asset/style guide creation and reference registration.
- `.agents/skills/guide-workflow/SKILL.md`: guide-stage workflow for `02_asset_guide_v{N}.md`, `02_style_guide_v{N}.md`, and local reference image status.
- `deliverables/00_admin/qa_reports/qa_report_workflow_slot_architecture_20260525.md`: persistent QA report for the slot architecture hardening pass.

### Changed
- `AGENTS.md`: added skill registry as a rule source, registered `guide-director`, and defined slot-based replacement rules for storyboard/video adapters.
- `README.md`, `ARCHITECTURE.md`, `CODEX_SKILL_AUDIT.md`, `CODEX_REVIEW.md`, `QUICK_START.md`: updated role inventory, skill count, guide-stage coverage, replaceable slot model, and placement guide link.
- `.codex/agents/*.toml`: updated stage agents to resolve replaceable implementations through `.agents/skill_registry.md`.
- `.codex/config.toml`: increased the explicit thread limit to match the 7 available role specs.
- `.agents/skills/storyboard-workflow/SKILL.md`: changed storyboard prompt generation from hardcoded Nano Banana flow to the `storyboard.prompt_adapter` slot.
- `.agents/skills/script-workflow/SKILL.md`: routed post-script handoff through guide creation before storyboard work.
- `.agents/skills/art-prompt-workflow/SKILL.md`, `.agents/skills/art-platform-rules/SKILL.md`, `.agents/skills/video-prompt-workflow/SKILL.md`, `.agents/skills/video-motion-design/SKILL.md`, `.agents/skills/qa-workflow/SKILL.md`, `.agents/skills/qa-checklists/SKILL.md`: aligned wording with slot-based responsibilities and guide-stage QA.

## [2026-05-21] - Codex Standard Project Structure

### Changed
- Replaced the intermediate `workflow/` directory with Codex-standard project directories.
- Moved repo-scoped skills to `.agents/skills/<skill>/SKILL.md`.
- Converted role specs to project-scoped Codex custom agent configs at `.codex/agents/<id>.toml`.
- Added `.codex/config.toml` with project agent limits.
- Updated `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `CODEX_REVIEW.md`, `CODEX_SKILL_AUDIT.md`, `QUICK_START.md`, and `scripts/skill-audit.ps1` to use `.codex/agents/` and `.agents/skills/`.
- Removed empty noncanonical generated-asset directories from `deliverables/`.

### Added
- `deliverables/00_admin/qa_reports/qa_report_codex_standard_structure_20260521.md`: verification report for the Codex-standard project directory migration.

## [2026-05-21] - Intermediate Subagent Spec Cleanup

### Changed
- Replaced flat tool-specific role files with directory-based subagent specs during the intermediate cleanup pass.
- Added explicit spawn policy and role routing in `AGENTS.md`.

### Added
- `deliverables/00_admin/qa_reports/qa_report_subagent_specs_20260521.md`: verification report for the intermediate subagent spec structure.

## [2026-05-21] - Intermediate Visible Workflow Directory

### Changed
- Renamed the hidden `.cursor/` folder to temporary visible `workflow/` before the final Codex-standard migration.
- Refreshed root docs during the intermediate pass.

### Added
- `deliverables/00_admin/qa_reports/qa_report_workflow_dir_rename_20260521.md`: historical report for the intermediate visible-directory migration.

## [2026-05-20] - Test Deliverables Archive

### Archived
- Moved current test deliverables out of `deliverables/` into matching `archives/` stage directories before workflow audit.
- Archived generated storyboard sheets as `archives/40_boards/generated_20260520_test/`.
- Archived generated art keyframes as `archives/50_art/generated_20260520_test/`.
- Archived test character references as `archives/20_guides/refs_20260520_test/`.

### Added
- `deliverables/00_admin/qa_reports/qa_report_workflow_audit_20260520.md`: audit of the pre-migration agent-skill workflow, path contracts, generated asset contract, and validation scripts.

## [2026-05-20] - Codex Generic Workflow Rules

### Changed
- `AGENTS.md`: rewrote as a generic Codex-native workflow entrypoint without test-project character or shot-count assumptions.
- Old flat role files: added Codex compatibility notes and clarified that legacy agent instructions are local role workflows in Codex.
- `.agents/skills/artifact-formatter/SKILL.md`: aligned generated asset path contract with `generated/` and `generated_ref_v{N}/`.
- `.agents/skills/video-prompt-workflow/SKILL.md`: aligned image-to-video keyframe inputs with `deliverables/50_art/generated_ref_v{N}/`.
- `scripts/validate-generated-assets.ps1`: removed the hardcoded 49-shot assumption and allowed empty/prompt-only project states.
- `README.md`, `ARCHITECTURE.md`, `CODEX_SKILL_AUDIT.md`, `QUICK_START.md`: refreshed as Codex-first generic workflow documentation.
- `.agents/skills/storyboard-nanobanana/references/`: replaced test-project-specific examples with neutral placeholder character examples.

### Added
- `deliverables/00_admin/qa_reports/qa_report_codex_rules_cleanup_20260520.md`: verification report for Codex rules cleanup.

## [2026-05-07] - Reference-Bound Production Chain

### Added
- `deliverables/50_art/05_art_prompts_v3.md`: reference-aware art prompt artifact with per-shot reference image fields and output targets.
- `deliverables/60_motion/06_video_prompts_v4.md`: image-to-video prompt artifact bound to `generated_ref_v1` keyframe paths.
- `scripts/validate-generated-assets.ps1`: generated image manifest, shot coverage, reference mode, and video keyframe path validator.

### Changed
- `scripts/status.ps1`: lists all generated image directories and their `reference_mode`.
- `.agents/skills/art-platform-rules/SKILL.md`: documents platform-specific reference image usage.
- `.agents/skills/storyboard-nanobanana/SKILL.md`: documents when storyboard sheets need reference-bound generation.
- `.agents/skills/video-motion-design/SKILL.md`: adds image-to-video field schema.
- `.agents/skills/qa-workflow/SKILL.md`: adds generated asset validation step.
- `.codex/agents/artist-director.toml`: adds production reference-image hard gate.

### Archived
- `05_art_prompts_v2.md` -> `archives/50_art/05_art_prompts_v2.md`
- `06_video_prompts_v3.md` -> `archives/60_motion/06_video_prompts_v3.md`

---

## [2026-05-06] - Reference Image Guardrail

### Added
- `deliverables/50_art/generated/README.md`: marks current keyframes as `text_only_draft` because local character reference images were not used during generation.
- `deliverables/40_boards/generated/README.md`: marks current storyboard sheets as `text_dna_draft`.

### Changed
- `AGENTS.md`: added image generation contract requiring local character references before production character image generation.
- `.agents/skills/art-prompt-workflow/SKILL.md`: added reference image binding rules and QA requirements.
- `.agents/skills/qa-checklists/SKILL.md`: rewrote checklist in clean UTF-8 and added reference-image QA.
- `scripts/validate-artifacts.ps1`: now validates local markdown image links exist.

---

## [2026-05-02] - Full Workflow Rerun

### Added
- `scripts/status.ps1`: 项目阶段状态扫描
- `scripts/validate-artifacts.ps1`: artifact 元数据、版本和 upstream 校验
- `scripts/skill-audit.ps1`: skill frontmatter、references 和 ghost 引用检查
- `scripts/new-version.ps1`: 安全归档并创建下一版本的辅助脚本
- `deliverables/10_story/01_audit_report_v2.md`: 基于当前脚本的重新审核报告
- `deliverables/60_motion/06_video_prompts_v3.md`: 全片 49 镜视频提示词版本
- `deliverables/00_admin/qa_reports/qa_report_full_rerun_20260502.md`: 完整流程重跑 QA 报告

### Changed
- `02_asset_guide`: v2 -> v3
- `02_style_guide`: v1 -> v2
- `03_storyboard`: v1 -> v2
- `04_storyboard_prompts`: v2 -> v3
- `05_art_prompts`: v1 -> v2

### Archived
- `01_audit_report_v1.md` -> `archives/10_story/01_audit_report_v1.md`
- `02_asset_guide_v2.md` -> `archives/20_guides/02_asset_guide_v2.md`
- `02_style_guide_v1.md` -> `archives/20_guides/02_style_guide_v1.md`
- `03_storyboard_v1.md` -> `archives/30_breakdown/03_storyboard_v1.md`
- `04_storyboard_prompts_v2.md` -> `archives/40_boards/04_storyboard_prompts_v2.md`
- `05_art_prompts_v1.md` -> `archives/50_art/05_art_prompts_v1.md`
- `06_video_prompts_v2.md` -> `archives/60_motion/06_video_prompts_v2.md`

---

## [2026-05-02] - Codex Structure Repair

### Added
- `AGENTS.md`: Codex 项目规则入口
- `CODEX_REVIEW.md`: 项目结构与优化建议
- `CODEX_SKILL_AUDIT.md`: Skill 完成度与优化审计
- `deliverables/20_guides/02_style_guide_v1.md`: 补齐风格指南 artifact
- `.agents/skills/mckee-shared/SKILL.md`: 将共享 McKee 参考目录补齐为可索引 skill
- `.agents/skills/artifact-formatter/references/file-templates.md`: 补齐 artifact 模板参考
- `.agents/skills/artifact-formatter/references/locks-inheritance.md`: 补齐 locks 继承参考
- `.agents/skills/version-management/references/versioning-spec.md`: 补齐版本规范参考
- `.agents/skills/version-management/references/changelog-format.md`: 补齐 changelog 格式参考

### Changed
- `deliverables/40_boards/04_storyboard_prompts_v2.md`: 补齐 artifact 元数据
- `.agents/skills/storyboard-workflow/SKILL.md`: 修复不存在的 storyboard 细分 skill 引用
- `.agents/skills/art-prompt-workflow/SKILL.md`: 修复不存在的 art 细分 skill 引用
- `.agents/skills/video-prompt-workflow/SKILL.md`: 修复不存在的 video 细分 skill 引用
- `.agents/skills/qa-workflow/SKILL.md`: 改为引用 `qa-checklists` 的对应章节
- `README.md`, `ARCHITECTURE.md`, `QUICK_START.md`, `deliverables/00_admin/README.md`: 统一 Codex 入口与版本化文件名契约
- 6 个 workflow skill: 移除 Codex 校验不接受的 frontmatter `version` 字段

---

## [2026-05-02] - P0/P1 Skill Hardening

### Added
- `deliverables/00_admin/qa_reports/README.md`: QA 报告落盘目录说明

### Changed
- `AGENTS.md`: 增加 P0 结构防漂移规则
- `.agents/skills/storyboard-analysis/SKILL.md`: 补强短片/MV 分镜拆解、shot duration、蒙太奇和输出模板
- `.agents/skills/storyboard-workflow/SKILL.md`: 增加固定分镜表模板和 shot 计数规则
- `.agents/skills/art-prompt-workflow/SKILL.md`: 补强批次策略、平台选择、prompt 字段、四宫格和 QA
- `.agents/skills/video-prompt-workflow/SKILL.md`: 补强视频 prompt schema、图生视频规则、平台差异和批次策略
- `.agents/skills/qa-workflow/SKILL.md`: 改为支持结构检查、回归检查和持久化 QA 报告
- `.agents/skills/qa-checklists/SKILL.md`: 增加 artifact 元数据、版本、分镜提示词、平台格式和回归矩阵检查

---

## [2026-01-21] - Asset Guide Stage

### Added
- 02_asset_guide.md: v1 → v2
  - 霙（Mizore）角色视觉规范 ✅
  - 希美（Nozomi）角色视觉规范 ✅
  - 发型、面部、服装、道具详细定义
  - 提示词模板
  - 角色对比速查表
  - ID: A-20260121-003

### Assets
- refs/mizore_reference.png: 霙角色参考图
- refs/nozomi_reference.png: 希美角色参考图

---

## [2026-01-21] - Script Stage

### Added
- 01_script.md: v1
  - BIPOLAR 重置版 MV 30-Beat 详细节拍脚本（修复版）
  - 包含 6 项 McKee 原则修复
  - ID: A-20260121-001

- 01_audit_report.md: v1
  - McKee 原则审核报告
  - 6 个问题诊断 + 修复方案
  - ID: A-20260121-002

### Changed (Script Fixes)
- Beat 16: 增加具体冲突事件（霙被打断的话）
- Beat 17: 合并至 Beat 18
- Beat 18: 扩展烟火约定场景，删除直白 VO
- Beat 21: VO 改为"后来的事，我不太记得了"
- Beat 24: 增加主动确认动作，VO 改为"我还是问了"
- Beat 27.5: 新增过渡场景（沉默的消化）
- VO 整体: 精简 20→18 条

---

## [2026-01-21] - 项目初始化
### Added
- 创建项目目录结构
- 创建管理文档模板
