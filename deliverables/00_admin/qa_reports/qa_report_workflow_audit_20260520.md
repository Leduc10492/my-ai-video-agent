# QA Report: Agent Skill Workflow Audit
- date: 2026-05-20
- scope: `AGENTS.md`, `.codex/agents/`, `.agents/skills/`, root workflow docs, `scripts/`
- result: pass-with-warnings

Superseded note: the open Codex-conversion findings in this report were addressed later on 2026-05-20 and 2026-05-21. See `qa_report_workflow_dir_rename_20260521.md` for the current verification state.

## Current Deliverable State

Current test production artifacts were moved from `deliverables/` to `archives/` before this audit.

- `deliverables/` now keeps only admin files and empty stage directories.
- Archived test character refs: `archives/20_guides/refs_20260520_test/`
- Archived test storyboard sheets: `archives/40_boards/generated_20260520_test/`
- Archived test art keyframes: `archives/50_art/generated_20260520_test/`

## Inventory Checks

| Check | Result |
| --- | --- |
| Agent specs under `.codex/agents/` | 6/6 present |
| Skill directories under `.agents/skills/` | 21 present |
| Skill directories with `SKILL.md` | 21/21 present |
| Explicit `references/*.md` paths | No missing files found |
| Obvious ghost skill references | None found outside the compatibility note in `AGENTS.md` |
| Current production deliverables | None, by request |
| PowerShell validation scripts | Present, but not runnable here because `pwsh` is not installed |

## Findings

| Priority | File | Issue | Evidence | Suggested Fix | Status |
| --- | --- | --- | --- | --- | --- |
| P1 | `AGENTS.md` | Codex entrypoint still contains project-specific BIPOLAR/Mizore/Nozomi assumptions after test assets were archived. | Lines 15 and 131-134 hardcode BIPOLAR and character reference paths that no longer exist in `deliverables/`. | Split generic workflow rules from project instance rules, or replace hardcoded character refs with "resolve from latest asset guide". | Open |
| P1 | Former flat project-director agent file | Legacy agent file still described real sub-agent dispatch, while `AGENTS.md` said Codex should execute roles locally. | The old project-director role text conflicted with the parent-thread execution model. | Replaced by `.codex/agents/project-director.toml` and explicit spawn policy. | Resolved |
| P1 | Workflow image path contract | Generated image/keyframe directories are inconsistent across rules. | `AGENTS.md` describes `generated` manifests; `artifact-formatter` lists `40_boards/images`, `50_art/refs`, `60_motion/refs`; previous workflow used `40_boards/generated`, `50_art/generated`, `50_art/generated_ref_v1`. | Choose one canonical generated asset contract and update `AGENTS.md`, `artifact-formatter`, `video-prompt-workflow`, scripts, README, and architecture docs together. | Open |
| P1 | `scripts/validate-generated-assets.ps1` | Generated asset validator has BIPOLAR test assumptions and treats an empty/new project as blocked. | Lines 46 and 50-52 default to 49 shots and require generated art directories even when no current art prompt exists. | Make the script mode-aware: empty project/state check should pass or warn; production validation should require generated assets only when art/video prompts exist. | Open |
| P2 | Former flat storyboard and QA agent files, `.agents/skills/artifact-formatter/SKILL.md`, `QUICK_START.md` | Legacy docs still used unversioned filenames in operational sections. | Old role specs and workflow docs mixed unversioned shorthand with versioned artifact paths. | Operational docs now use `_v{N}.md`; shorthand is limited to explicitly marked legacy context. | Resolved |
| P2 | Former flat QA agent file and `.agents/skills/qa-workflow/SKILL.md` | QA persistence rule conflicted. | The old QA role text said to report only in chat while QA workflow defined persistent reports. | Current rule: quick checks may stay in chat; larger audits save under `deliverables/00_admin/qa_reports/`. | Resolved |
| P2 | Scripts/tooling | Validation automation is PowerShell-only, and `pwsh` is unavailable in this local environment. | `command -v pwsh` returned no path. | Add POSIX shell or Python equivalents, or document `pwsh` as a setup prerequisite. | Open |
| P2 | Former flat agent files | Legacy agent frontmatter pinned non-Codex model names. | Examples included non-Codex model names. | Replaced by directory-based Codex subagent specs without provider-specific model pins. | Resolved |
| P3 | Former flat artist-director agent file, `.agents/skills/storyboard-nanobanana/SKILL.md` | Mixed CRLF line endings. | `file` reported CRLF line terminators for the old files. | Normalize line endings in a cleanup pass. | Superseded for agent file; open for deeper formatting pass |

## Workflow Health Summary

The workflow is structurally usable:

- Role coverage is complete: project, script, storyboard, art, animation, QA.
- Skill coverage is complete enough for the intended pipeline.
- Reference files are present.
- The strongest parts are the artifact/version contract, storyboard prompt rules, reference-image hard gate, and generated asset QA concept.

The main risk is not missing skills. The main risk is rule drift:

- Codex-native rules and the old flat agent files described different execution models.
- Current workflow rules still embed a test project identity.
- Generated asset paths need one canonical schema before real production begins.
- Automation scripts need bootstrap/empty-project behavior instead of assuming the previous 49-shot test chain.

## Recommended Repair Order

1. Genericize `AGENTS.md`: remove BIPOLAR-specific lines or move them into a project instance note.
2. Normalize generated asset path contract across all docs and scripts.
3. Replace flat role files with `.codex/agents/<id>.toml` subagent specs.
4. Replace unversioned operational paths in legacy docs.
5. Make validation scripts usable for empty projects and non-PowerShell environments.
6. Refresh `README.md`, `ARCHITECTURE.md`, and `CODEX_SKILL_AUDIT.md` after the above changes.
