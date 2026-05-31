# 变更日志

## 格式说明
```
## [日期] - [阶段]
### 变更类型
- 变更描述 (影响的文件)
```

---

## [2026-05-31] - Shotlist-First Workflow Hardening

### Changed
- Consolidated the active workflow around `script -> audit -> guides -> shotlist breakdown -> Seedance/Higgsfield shotlist HTML + previews -> QA`.
- Replaced the old visual-planning slot family with `shotlist.breakdown` and `shotlist.primary`; future planning artifacts use `deliverables/30_breakdown/03_shotlist_breakdown_v{N}.md`.
- Clarified that the shotlist HTML is the prompt source of truth and that QA independently reviews, but does not replace, generation hard gates.
- Updated `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `CODEX_SKILL_AUDIT.md`, `AGENT_SKILL_PLACEMENT_GUIDE.md`, `CODEX_REVIEW.md`, role specs, formatter/versioning skills, QA skills, and validation scripts.

### Removed
- Retired old active workflow skills for board prompts, art prompts, art platform adapters, standalone video prompts, and standalone motion design.
- Retired old standalone art and animation role configs from active routing.

## [2026-05-31] - Sketch Shotlist Workflow

### Added
- `.agents/skills/sketch-shotlist-workflow/`: project-local fork of the Higgsfield shotlist builder pattern, with copied reference material, Seedance 2.0 prompt-envelope rules, and rough e-conte preview handling.
- `.agents/skills/sketch-shotlist-workflow/templates/econte-preview-prompt.template.md`: prompt template for vertical manga-style line-art storyboard previews per 15-second envelope.
- `.agents/skills/sketch-shotlist-workflow/templates/preview-manifest.template.md`: manifest template mapping prompt envelope IDs to source shots and preview image paths.

### Changed
- `.agents/skill_registry.md`: added `shotlist.primary` with `sketch-shotlist-workflow` as the project-local default for Seedance production HTML.
- `.codex/agents/project-director.toml`, `.codex/agents/storyboard-director.toml`, `.codex/agents/animation-director.toml`: routed Higgsfield/Seedance shotlist work through `shotlist.primary` instead of forcing separate storyboard prompt, art prompt, and video prompt artifacts.
- `.gitignore`: ignored generated `shotlist_previews_*` folders by default.
- `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `CODEX_SKILL_AUDIT.md`, `CODEX_REVIEW.md`, `AGENT_SKILL_PLACEMENT_GUIDE.md`: documented the local shotlist route, preview asset folder, and slot contract.

---

## [2026-05-31] - Script Workflow Cleanup

### Removed
- `.agents/skills/script-workflow/SKILL.md`: removed the legacy McKee-first script workflow so `screenwriter-workflow` remains the only script.primary entrance.

### Changed
- `.agents/skills/mckee-*`: clarified that McKee skills return structure, audit, rewrite, scene, pacing, variation, or source packets and do not own final script artifacts.
- `.codex/agents/script-writer.toml`, `.agents/skill_registry.md`: tightened script-stage routing around `screenwriter-workflow` plus `mckee-coordinator`.
- `README.md`, `ARCHITECTURE.md`, `CODEX_SKILL_AUDIT.md`, `AGENT_SKILL_PLACEMENT_GUIDE.md`: removed legacy script-workflow references and updated current story-stage/generated-asset status.

---

## [2026-05-31] - Video Prompt Phase 4

### Added
- `deliverables/60_motion/06_video_prompts_v1.md`: created the `SB071-SB080` Seedance 2.0 prompt sheet with 52 continuous prompt envelopes (`P377-P428`), using approved storyboard v4 blocking and `generated_ref_v1` text DNA references.
- `deliverables/60_motion/Shotlist_SB071_SB080_ZH_v1.html`: created the self-contained Chinese production HTML shotlist with searchable/filterable prompt rows and copy buttons.

---

## [2026-05-31] - Reference Image Prompt Prep

### Added
- `deliverables/50_art/generated_ref_v1/README.md`: 建立 `SB071-SB080` 缺失参考图生成目录与 `text_dna_draft` 状态说明。
- `deliverables/50_art/generated_ref_v1/reference_image_prompts_v1.md`: 为 `SB071-SB080` 缺图表的 22 个资产补齐可直接用于内置 image generation 的提示词。
- `deliverables/50_art/generated_ref_v1/*.png`: 生成并归档 22 张文本 DNA 草图参考图，覆盖 `SB071-SB080` 缺图表中的人物、配角、群众/车辆、关键场景和红绳道具。

---

## [2026-05-31] - Storyboard Breakdown

### Added
- `deliverables/30_breakdown/03_storyboard_v1.md`: macro storyboard table for `01_script_v10.md`, covering the full 107-minute feature baseline in 80 production-beat shots and noting missing active asset/style guides before prompt generation.

### Changed
- `deliverables/30_breakdown/03_storyboard_v1.md` → `deliverables/30_breakdown/03_storyboard_v2.md`
  - Re-split the storyboard using `shotlist-builder`-style shot blocks, reserving 428 future 15-second Seedance prompt envelopes and adding camera-emotion, micro-performance, asset, and spatial-blocking notes.
  - Archived: `archives/30_breakdown/03_storyboard_v1_your-name_20260531.md`
  - Superseded by: `deliverables/30_breakdown/03_storyboard_v3.md`
- `deliverables/30_breakdown/03_storyboard_v2.md` → `deliverables/30_breakdown/03_storyboard_v3.md`
  - Added Phase 3 prep for the default continuation scope `SB071-SB080`: missing asset map, top-down SVG blocking schemas, and approval gates before Seedance prompt/HTML generation.
  - Archived: `archives/30_breakdown/03_storyboard_v2_your-name_20260531.md`
  - Superseded by: `deliverables/30_breakdown/03_storyboard_v4.md`
- `deliverables/30_breakdown/03_storyboard_v3.md` → `deliverables/30_breakdown/03_storyboard_v4.md`
  - Marked `SB071-SB080` spatial blocking as approved from user feedback and recorded the remaining Phase 4 blockers: reference images / asset mapping, or explicit `text_only_draft` approval.
  - Archived: `archives/30_breakdown/03_storyboard_v3_your-name_20260531.md`
  - Current: `deliverables/30_breakdown/03_storyboard_v4.md`

## [2026-05-31] - Hoshi no Koe Source Intake

### Added
- `deliverables/10_story/01_source_script_summary_hoshi-no-koe_v1.md`: timecoded source script summary from the user-provided DVD VobSub OCR and supplementary English PDF transcript, preserving structure/function notes without copying full source dialogue.
- `deliverables/10_story/01_source_transcript_hoshi-no-koe_v1.md`: complete timecoded subtitle transcript document from the selected main Japanese OCR track, preserving all 199 subtitle blocks as a local source-study artifact.
- `deliverables/00_admin/qa_reports/qa_report_hoshi_no_koe_vs_delayed_blue_v7_20260531.md`: source-parity comparison between the Hoshi no Koe transcript/summary and `01_script_delayed-blue_v7.md`, identifying v7's main gap as a weak delayed-communication engine.

### Changed
- `deliverables/00_admin/locks.md`: recorded that the Hoshi no Koe VobSub OCR is task-level comparison material and that the English PDF remains an unverified web transcript, not official screenplay proof.

## [2026-05-31] - Screenwriter Iteration Workflow

### Added
- `.agents/skills/screenwriter-workflow/templates/story-bone-intake.template.md`: lightweight Story Bone intake template for locking story sentence, protagonist, want, why-now pressure, obstacle, midpoint change, final cost, ending state, avoid list, and target format before structure drafting.
- `.agents/skills/screenwriter-workflow/templates/script-iteration-ladder.template.md`: reusable ladder for Story Bone, Structure Draft, Density Draft, Runtime Draft, Dialogue/Texture Draft, and Export Candidate screenplay iterations.
- `deliverables/10_story/01_script_delayed-blue_v6.md`: distinguished branch rewrite of the archived `Voices of a Distant Star` / `迟来的蓝光` v5 exercise using the new iterative Screenwriter logic.
- `deliverables/10_story/01_audit_report_delayed-blue_v6.md`: iteration gate and audit for the distinguished v6 branch rewrite.
- `deliverables/10_story/01_script_delayed-blue_v7.md`: Human Dialogue / Anti-AI Polish rewrite of the delayed-blue branch, preserving v6 structure while restoring fuller character-specific speech.
- `deliverables/10_story/01_audit_report_delayed-blue_v7.md`: v7 iteration gate, classifying the branch as `hold_current` after line-texture polish.

### Changed
- `.agents/skills/screenwriter-workflow/SKILL.md`: added Story Bone Intake before structure drafting, with 1-3 narrow questions for missing high-impact fields and McKee retained as a structure plugin after the skeleton is ready.
- `.agents/skills/screenwriter-workflow/templates/script-iteration-ladder.template.md`: added the Story Bone layer and renamed generic polish into Dialogue/Texture Draft for 生活质感、普通反应、沉默和未说出口的话.
- `.agents/skills/screenwriter-workflow/templates/iteration-quality-gate.template.md`: added Story Bone readiness, main story engine, structure drift, and concise Anti-AI checks while preserving the fixed gate decisions.
- `.agents/skills/screenwriter-workflow/SKILL.md`: added Iterative Screenplay Mode, fixed one-primary-problem iteration rules, and clarified task-level comparison material boundaries.
- `.agents/skills/screenwriter-workflow/templates/iteration-quality-gate.template.md`: expanded gate metrics with runtime, body lines, scene/transition units, dialogue cue count, overloaded scenes, action-chain checks, and fixed iteration decisions.
- `.agents/skills/screenwriter-workflow/SKILL.md`, `.agents/skills/mckee-*`, `.agents/skills/qa-*`, `.agents/skill_registry.md`, `.codex/agents/qa-check.toml`, `AGENTS.md`: set story/script/audit/QA user-facing outputs to Simplified Chinese by default unless explicitly requested otherwise.
- `deliverables/00_admin/locks.md`: recorded that the `迟来的蓝光` rewrite uses branch-specific filenames and must not be saved as generic `01_script_v11.md`.
- `deliverables/10_story/01_script_delayed-blue_v6.md`, `01_audit_report_delayed-blue_v6.md`
  - Archived v6 after using it as the over-compressed polish baseline.
  - Archived: `archives/10_story/01_script_delayed-blue_v6_20260531.md`, `archives/10_story/01_audit_report_delayed-blue_v6_20260531.md`
  - Current: `deliverables/10_story/01_script_delayed-blue_v7.md`, `deliverables/10_story/01_audit_report_delayed-blue_v7.md`
- `deliverables/00_admin/locks.md`: updated the delayed-blue branch current file and runtime note from v6 to v7.

## [2026-05-30] - Screenwriter Script Workflow Routing

### Added
- `.agents/skills/screenwriter-workflow/SKILL.md`: script-stage controller that applies Screenwriter writing mode while using McKee skills as structure plugins.
- `deliverables/00_admin/qa_reports/qa_report_screenwriter_workflow_routing_20260530.md`: persistent QA report for the script routing change.

### Changed
- `.agents/skill_registry.md`: changed `script.primary` from `script-workflow` to `screenwriter-workflow` and added script/McKee router slot interfaces.
- `.codex/agents/script-writer.toml`: routed script-stage work through `screenwriter-workflow` before McKee plugin selection.
- `.agents/skills/script-workflow/SKILL.md`: marked the prior McKee-first script flow as legacy compatibility.
- `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `CODEX_SKILL_AUDIT.md`, `AGENT_SKILL_PLACEMENT_GUIDE.md`: updated active docs for the Screenwriter-first script workflow.

## [2026-05-30] - Script Stage

### Added
- `deliverables/10_story/01_script_v10.md`: fifth Screenwriter workflow draft for the `Your Name.` task, expanding v9 into about 102 scene/transition units while preserving the 107-minute target.
- `deliverables/10_story/01_audit_report_v10.md`: v10 audit judging the draft structurally dense enough for standard screenplay DOCX export.
- `deliverables/10_story/01_script_v10_standard_screenplay.docx`: standard screenplay-format DOCX exported from the v10 Markdown script after the comparison gate passed.
- `deliverables/00_admin/qa_reports/qa_report_your_name_v10_export_20260530.md`: v10 comparison/export QA report, including DOCX package checks and render limitation notes.
- `deliverables/10_story/01_script_v9.md`: fourth Screenwriter workflow draft for the `Your Name.` task, cutting v8's duplicate beats back to a 107-minute target while preserving density gains.
- `deliverables/10_story/01_audit_report_v9.md`: audit of v9, judging it the first runtime-controlled candidate but not yet final parity.
- `deliverables/00_admin/qa_reports/qa_report_your_name_v9_final_comparison_20260530.md`: final-comparison gate for v9, blocking final DOCX export because scene density remains below the uploaded PDF benchmark.
- `deliverables/10_story/01_script_v8.md`: third Screenwriter workflow draft for the `Your Name.` task, adding date/misdirection, more exchange micro-scenes, rescue time pressure, and adult aftermath.
- `deliverables/10_story/01_audit_report_v8.md`: audit of v8, judging it stronger but over target at about 114 minutes and requiring a v9 cut/polish pass.
- `deliverables/10_story/01_script_v7.md`: second Screenwriter workflow feature-length draft for the `Your Name.` task, expanding v6's body-swap comedy, supporting cast, ritual rules, search, rescue logistics, and adult near-miss rhythm.
- `deliverables/10_story/01_audit_report_v7.md`: audit of v7 against feature-length density, structure, logic, and comparison-readiness goals.
- `deliverables/00_admin/qa_reports/qa_report_your_name_v7_density_check_20260530.md`: density check comparing v7 progress against the uploaded 132-page PDF's rough scene distribution.
- `deliverables/10_story/Your-Name-Screenplay.pdf`: user-provided comparison PDF for the `Your Name.` task.
- `deliverables/10_story/01_script_v6.md`: first Screenwriter workflow feature-length functional draft for a `Your Name.`-style comparison exercise, estimated about 106 minutes.
- `deliverables/10_story/01_audit_report_v6.md`: audit of v6 against feature-length, structure, logic, and executable-screenplay goals.
- `deliverables/00_admin/qa_reports/qa_report_your_name_pdf_intake_20260530.md`: intake note identifying the uploaded PDF as user-provided fan-made comparison material, not verified official screenplay.
- `deliverables/00_admin/qa_reports/qa_report_your_name_v6_comparison_reflection_20260530.md`: comparison and reflection report documenting why v6 is below the uploaded PDF's density and structure level.
- `deliverables/10_story/01_script_v1.md`: Screenwriter workflow test draft, an original distant-communication short inspired only by public high-level reference facts.
- `deliverables/10_story/01_audit_report_v1.md`: McKee structure-plugin audit for `01_script_v1.md`.
- `deliverables/10_story/01_script_v4_standard_screenplay.docx`: standard screenplay-format DOCX export generated from approved `01_script_v4.md`.
- `deliverables/10_story/01_generated_function_index_v4.md`: generated-unit function index for future licensed-source comparison.
- `deliverables/00_admin/qa_reports/qa_report_script_docx_export_20260530.md`: QA note for the DOCX export and render limitation.
- `deliverables/00_admin/qa_reports/qa_report_hoshi_no_koe_source_acquisition_20260530.md`: legal source acquisition status for original `ほしのこえ` script/storyboard comparison.
- `deliverables/00_admin/qa_reports/qa_report_hoshi_no_koe_acquisition_action_plan_20260530.md`: actionable acquisition plan for official storyboard/DVD source materials.
- `deliverables/00_admin/qa_reports/qa_report_source_comparison_readiness_20260530.md`: readiness gate for licensed-source intake, source labels, and source function map creation.

### Changed
- `deliverables/10_story/01_script_v9.md`, `01_audit_report_v9.md`
  - Archived v9 after using it as the compressed runtime-controlled candidate.
  - Archived: `archives/10_story/01_script_v9_your-name_20260530.md`, `archives/10_story/01_audit_report_v9_your-name_20260530.md`
  - Current: `deliverables/10_story/01_script_v10.md`, `deliverables/10_story/01_audit_report_v10.md`
- `deliverables/00_admin/locks.md`
  - Updated current baseline from v9 to v10 and recorded `01_script_v10_standard_screenplay.docx` as the current derived standard screenplay export.
- `deliverables/10_story/01_script_v8.md`, `01_audit_report_v8.md`
  - Archived v8 after using it as the over-target density draft.
  - Archived: `archives/10_story/01_script_v8_your-name_20260530.md`, `archives/10_story/01_audit_report_v8_your-name_20260530.md`
  - Current: `deliverables/10_story/01_script_v9.md`, `deliverables/10_story/01_audit_report_v9.md`
- `deliverables/00_admin/locks.md`
  - Updated current baseline from v8 to v9 and recorded final comparison audit as the next gate before DOCX export.
- `deliverables/10_story/01_script_v7.md`, `01_audit_report_v7.md`
  - Archived v7 after using it as the second density baseline.
  - Archived: `archives/10_story/01_script_v7_your-name_20260530.md`, `archives/10_story/01_audit_report_v7_your-name_20260530.md`
  - Current: `deliverables/10_story/01_script_v8.md`, `deliverables/10_story/01_audit_report_v8.md`
- `deliverables/00_admin/locks.md`
  - Updated current baseline from v7 to v8 and recorded the v9 cut/polish requirement.
- `deliverables/10_story/01_script_v6.md`, `01_audit_report_v6.md`
  - Archived v6 after using it as the first measurable `Your Name.` baseline.
  - Archived: `archives/10_story/01_script_v6_your-name_20260530.md`, `archives/10_story/01_audit_report_v6_your-name_20260530.md`
  - Current: `deliverables/10_story/01_script_v7.md`, `deliverables/10_story/01_audit_report_v7.md`
- `deliverables/00_admin/qa_reports/qa_report_your_name_v6_comparison_reflection_20260530.md`
  - Updated current decision to point from v6 baseline to v7 current draft and v8 next pass.
- `deliverables/00_admin/locks.md`
  - Updated current baseline from v6 to v7 and preserved the no-skill-edit rule.
- `deliverables/10_story/01_script_v5.md`, `01_audit_report_v5.md`, `01_script_v5_standard_screenplay.docx`
  - Archived the previous `迟来的蓝光` baseline before starting the `Your Name.` comparison task.
  - Archived: `archives/10_story/01_script_v5_delayed-blue_20260530.md`, `archives/10_story/01_audit_report_v5_delayed-blue_20260530.md`, `archives/10_story/01_script_v5_standard_screenplay_20260530.docx`
  - Current: `deliverables/10_story/01_script_v6.md`, `deliverables/10_story/01_audit_report_v6.md`
- `deliverables/00_admin/locks.md`
  - Updated current target to the `Your Name.` comparison task, locked the no-skill-edit rule, and recorded that the uploaded PDF is comparison material rather than verified official screenplay.
- `deliverables/10_story/01_script_v4.md` → `deliverables/10_story/01_script_v5.md`
  - Rebuilt the draft for the correct 20+ minute short-animation target; v5 estimates about 23:25 instead of v4's 8:30 sketch length.
  - Archived: `archives/10_story/01_script_v4_delayed-blue_20260530.md`
  - Current: `deliverables/10_story/01_script_v5.md`
- `deliverables/10_story/01_audit_report_v4.md` → `deliverables/10_story/01_audit_report_v5.md`
  - Added the corrected 22-24 minute quality gate and approved v5 for DOCX export.
  - Archived: `archives/10_story/01_audit_report_v4_delayed-blue_20260530.md`
  - Current: `deliverables/10_story/01_audit_report_v5.md`
- `deliverables/10_story/01_script_v5_standard_screenplay.docx`
  - Exported the corrected v5 script as a standard screenplay-format DOCX.
  - Current: `deliverables/10_story/01_script_v5_standard_screenplay.docx`
- `deliverables/10_story/01_script_v4_standard_screenplay.docx`
  - Archived because v4 is superseded by the longer v5 script.
  - Archived: `archives/10_story/01_script_v4_standard_screenplay_20260530.docx`
- `deliverables/10_story/01_generated_function_index_v4.md`
  - Archived with v4 because source comparison is now treated as a project task outside the reusable Screenwriter skill.
  - Archived: `archives/10_story/01_generated_function_index_v4_delayed-blue_20260530.md`
- `.agents/skills/screenwriter-workflow/SKILL.md`, `.agents/skill_registry.md`, `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `CODEX_SKILL_AUDIT.md`
  - Removed original-source comparison from the reusable Screenwriter skill/slot contract; comparison remains a task-level project activity.
- `.agents/skills/screenwriter-workflow/templates/licensed-source-intake-checklist.template.md`, `.agents/skills/screenwriter-workflow/templates/source-function-map.template.md`
  - Removed comparison templates from the reusable skill after scope correction.
- `deliverables/00_admin/locks.md`
  - Updated current baseline to `01_script_v5.md`, target runtime to 22-24 minutes, and source comparison as task-level work outside the reusable skill.
- `deliverables/10_story/01_script_v1.md` → `deliverables/10_story/01_script_v2.md`
  - Improved protagonist agency, visible deep-space cost, and irreversible final send.
  - Archived: `archives/10_story/01_script_v1_delayed-blue_20260530.md`
  - Current: `deliverables/10_story/01_script_v2.md`
- `deliverables/10_story/01_audit_report_v1.md` → `deliverables/10_story/01_audit_report_v2.md`
  - Added quality comparison dimensions based on public high-level source facts.
  - Archived: `archives/10_story/01_audit_report_v1_delayed-blue_20260530.md`
  - Current: `deliverables/10_story/01_audit_report_v2.md`
- `deliverables/10_story/01_script_v2.md` → `deliverables/10_story/01_script_v3.md`
  - Compressed repeated beats, strengthened Xu Cheng's agency, and approved for DOCX export.
  - Archived: `archives/10_story/01_script_v2_delayed-blue_20260530.md`
  - Superseded by: `deliverables/10_story/01_script_v4.md`
- `deliverables/10_story/01_audit_report_v2.md` → `deliverables/10_story/01_audit_report_v3.md`
  - Final quality gate judged the original comparable script ready for standard screenplay DOCX export.
  - Archived: `archives/10_story/01_audit_report_v2_delayed-blue_20260530.md`
  - Superseded by: `deliverables/10_story/01_audit_report_v4.md`
- `deliverables/10_story/01_script_v3.md` → `deliverables/10_story/01_script_v4.md`
  - Removed the false-signal breath scene after the child-TV repair, reducing the runtime estimate from 9:05 to 8:30 while preserving story spine and copyright distance.
  - Archived: `archives/10_story/01_script_v3_delayed-blue_20260530.md`
  - Current: `deliverables/10_story/01_script_v4.md`
- `deliverables/10_story/01_audit_report_v3.md` → `deliverables/10_story/01_audit_report_v4.md`
  - Added the iteration quality gate result and approved current DOCX export.
  - Archived: `archives/10_story/01_audit_report_v3_delayed-blue_20260530.md`
  - Current: `deliverables/10_story/01_audit_report_v4.md`
- `deliverables/10_story/01_script_v3_standard_screenplay.docx` → `deliverables/10_story/01_script_v4_standard_screenplay.docx`
  - Re-exported the current standard screenplay DOCX from `01_script_v4.md`.
  - Archived: `archives/10_story/01_script_v3_standard_screenplay_20260530.docx`
  - Current: `deliverables/10_story/01_script_v4_standard_screenplay.docx`
- `.agents/skills/screenwriter-workflow/SKILL.md`: added Source Comparison Mode with legal-source classification and non-reproductive function-map workflow.
- `.agents/skills/screenwriter-workflow/templates/licensed-source-intake-checklist.template.md`: added a required intake gate for legally acquired screenplay/storyboard/DVD source material before detailed comparison.
- `.agents/skills/screenwriter-workflow/templates/source-function-map.template.md`: added a reusable comparison template for licensed screenplay/storyboard sources.
- `.agents/skills/screenwriter-workflow/templates/iteration-quality-gate.template.md`: added a repeatable quality gate before revisions and DOCX export.
- `.agents/skills/screenwriter-workflow/scripts/export_screenplay_docx.js`: added a deterministic Markdown screenplay to DOCX exporter for current script artifacts.
- `.agents/skills/screenwriter-workflow/SKILL.md`, `.agents/skill_registry.md`, `AGENTS.md`: added generated function index handling while licensed source material is unavailable.
- `deliverables/00_admin/qa_reports/qa_report_hoshi_no_koe_source_acquisition_20260530.md`: updated with current acquisition availability and practical source route.
- `deliverables/00_admin/qa_reports/qa_report_hoshi_no_koe_source_acquisition_20260530.md`: expanded acquisition routes with the 2017 KADOKAWA storyboard book and original DVD listing evidence.
- `deliverables/00_admin/qa_reports/qa_report_hoshi_no_koe_acquisition_action_plan_20260530.md`: updated original DVD route with Suruga-ya availability and `動画コンテ` evidence.
- `deliverables/00_admin/qa_reports/qa_report_hoshi_no_koe_acquisition_action_plan_20260530.md`, `qa_report_hoshi_no_koe_source_acquisition_20260530.md`, `qa_report_source_comparison_readiness_20260530.md`: refined source priority after availability recheck; original DVD is now fastest practical route, storyboard book remains cleanest official storyboard route.
- `deliverables/00_admin/qa_reports/qa_report_hoshi_no_koe_acquisition_action_plan_20260530.md`, `qa_report_hoshi_no_koe_source_acquisition_20260530.md`, `qa_report_source_comparison_readiness_20260530.md`: upgraded the older `DVD BOOK ほしのこえ` to the strongest practical source route after confirming a complete Suruga-ya listing and a Bunken Shoin backup listing; warned against disc-only copies.
- `deliverables/00_admin/locks.md`: synchronized active acquisition priority order to complete DVD BOOK first, original DVD second, 2017 storyboard book third.
- `deliverables/00_admin/locks.md`: recorded the active story-stage goal, legal-source gate, priority acquisition targets, iteration gate, and DOCX export gate.
- `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `.agents/skill_registry.md`, `CODEX_SKILL_AUDIT.md`: documented source-comparison policy, slot requirements, iteration quality gate, licensed-source intake gate, and active story-stage state.

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
