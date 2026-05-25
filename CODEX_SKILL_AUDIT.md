# Codex Skill Audit

Audit date: 2026-05-25  
Scope: `AGENTS.md`, `.codex/agents/`, `.agents/skill_registry.md`, `.agents/skills/`, `deliverables/`, `archives/`, `scripts/`  
Current result: structurally usable, slot-based, and aligned to Codex-standard project directories.

## Current State

The repository has been reset to workflow-only state for the next active project:

- Test production deliverables were moved to `archives/`.
- `deliverables/` contains admin files and empty production stage directories.
- `AGENTS.md` is now the generic Codex rule entrypoint.
- `.codex/agents/<id>.toml` defines project-scoped Codex custom agents.
- `.agents/skill_registry.md` defines replaceable workflow slots and compatibility requirements.
- `.agents/skills/<skill>/SKILL.md` defines repo-scoped Codex skills.

Latest workflow audit report:

- `deliverables/00_admin/qa_reports/qa_report_workflow_slot_architecture_20260525.md`

## Inventory

| Check | Status |
| --- | --- |
| `.codex/agents/<id>.toml` | 7 custom agent configs present |
| `.agents/skill_registry.md` | Present; maps stable slots to default skills |
| `.agents/skills/*/SKILL.md` | 22/22 present |
| Explicit `references/*.md` links | No missing files found in latest audit |
| Obvious ghost skill references | None found outside compatibility mapping |
| Current production deliverables | None, by request |
| Generated test assets | Archived |

## Codex Conversion Status

| Area | Status | Notes |
| --- | --- | --- |
| Codex entrypoint | Done | `AGENTS.md` no longer hardcodes the prior test project |
| Codex project directories | Done | Custom agents live under `.codex/agents/`; repo skills live under `.agents/skills/` |
| Execution model | Done | Default local execution; explicit user request enables spawning from custom agent configs |
| Custom agents | Done | `.codex/agents/<id>.toml` defines mission, reads, writes, skills, and completion report |
| Guide stage ownership | Done | Added `guide-director` and `guide-workflow` for asset/style guide creation |
| Replaceable skill slots | Done | `.agents/skill_registry.md` defines defaults and replacement interfaces |
| Versioned file contract | Done | Current deliverables use `_v{N}.md` |
| Generated asset contract | Done | Canonical paths are defined in `AGENTS.md`, `README.md`, and `ARCHITECTURE.md` |
| Reference image hard gate | Done | Production image generation must load local refs when available |
| QA persistence | Done | Quick checks can stay in chat; larger audits go to `qa_reports/` |

## Skill Groups

| Group | Skills | Status |
| --- | --- | --- |
| General tools | `artifact-formatter`, `version-management` | Usable |
| Script/McKee | `script-workflow` plus McKee skills | Usable |
| Guides | `guide-workflow` | Usable; fills asset/style guide stage before visual prompt work |
| Storyboard | `storyboard-workflow`, `storyboard-analysis`, `storyboard-nanobanana` | Usable; `storyboard-nanobanana` is a replaceable prompt adapter |
| Art | `art-prompt-workflow`, `art-platform-rules` | Usable; platform adapter is replaceable and production depends on loaded image refs |
| Video | `video-prompt-workflow`, `video-motion-design` | Usable; prompt and motion adapters are replaceable, image-to-video should prefer `generated_ref_v{N}/` keyframes |
| QA | `qa-workflow`, `qa-checklists` | Usable |

## Current Risks

| Priority | Risk | Recommended Fix |
| --- | --- | --- |
| P2 | Helper scripts are PowerShell-first and may not run where `pwsh` is unavailable. | Add shell/Python equivalents or document `pwsh` setup. |
| P2 | Replacement skills can still be underspecified if their SKILL.md does not implement the registry slot interface. | During replacement, audit the target skill against `.agents/skill_registry.md` before changing defaults. |
| P3 | Historical changelog and QA reports preserve older intermediate path terminology. | Leave historical records intact; keep active docs on `.codex/agents/`, `.agents/skill_registry.md`, and `.agents/skills/`. |

## Recommended Next Cleanup

1. Add POSIX/Python equivalents for validation scripts.
2. Add blank artifact templates for each stage if repeated project initialization becomes common.
3. Add a lightweight registry validator that checks slot defaults and replacement compatibility in non-PowerShell environments.

## Operating Guidance

For active work, trust this order:

1. `AGENTS.md`
2. `.agents/skill_registry.md` for swappable skill implementation choices
3. latest files in `deliverables/`
4. relevant `.codex/agents/<role>.toml` when subagents are requested
5. relevant `.agents/skills/<skill>/SKILL.md`
6. archived files only when restoring, comparing, or mining historical examples
