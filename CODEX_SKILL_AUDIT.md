# Codex Skill Audit

Audit date: 2026-06-27
Scope: `AGENTS.md`, `.codex/agents/`, `.agents/skill_registry.md`, `.agents/skills/`, `deliverables/`, `archives/`
Current result: structurally usable, shotlist-first, aligned to Codex-standard project directories, and reset as a reusable workflow starter.

## Current State

The repository is workflow-first and `main` is intentionally project-neutral:

- Generated production deliverables and archives belong in copied project instances, generated worktrees, or project forks.
- `deliverables/00_admin/` contains neutral starter admin files only.
- `deliverables/00_admin/locks.md` starts with no active project locks.
- `deliverables/00_admin/changelog.md` starts as a project-instance changelog template.
- `deliverables/00_admin/qa_reports/` starts with only `README.md`; persistent reports are created by real projects when needed.
- `AGENTS.md` is the generic Codex rule entrypoint.
- `.codex/agents/<id>.toml` defines project-scoped Codex custom agents.
- `.agents/skill_registry.md` defines active workflow slots and compatibility requirements.
- `.agents/skills/<skill>/SKILL.md` defines repo-scoped Codex skills.

## Inventory

| Check | Status |
| --- | --- |
| `.codex/agents/<id>.toml` | 5 active custom agent configs present |
| `.agents/skill_registry.md` | Present; maps active shotlist-first slots to default skills |
| `.agents/skills/*/SKILL.md` | Active skills present after retiring old prompt/art/video workflow skills |
| Explicit `references/*.md` links | No missing active references expected |
| Obvious ghost skill references | Should be checked after each workflow migration |
| Current production deliverables | None in the reusable `main` baseline |
| Generated test assets | Not present in `main`; keep them in copied project instances, generated worktrees, or project forks |

## Codex Conversion Status

| Area | Status | Notes |
| --- | --- | --- |
| Codex entrypoint | Done | `AGENTS.md` now describes the shotlist-first workflow |
| Codex project directories | Done | Custom agents live under `.codex/agents/`; repo skills live under `.agents/skills/` |
| Execution model | Done | Default local execution; explicit user request enables spawning from custom agent configs |
| Custom agents | Done | Active roles are project, script, guide, shotlist, and QA |
| Guide stage ownership | Done | `guide-director` and `guide-workflow` create asset/style guides before visual production |
| Replaceable skill slots | Done | `.agents/skill_registry.md` defines active defaults and replacement interfaces |
| Shotlist route | Done | `shotlist-breakdown-workflow` plus `sketch-shotlist-workflow` are the active visual production path |
| Versioned file contract | Done | Current production deliverables use `_v{N}` naming |
| Generated asset contract | Done | Canonical paths are defined in `AGENTS.md`, `README.md`, and `ARCHITECTURE.md` |
| Reference image hard gate | Done | Production generation must label reference status and cannot promote text-only outputs |
| QA persistence | Done | Quick checks can stay in chat; larger audits go to `qa_reports/` |

## Skill Groups

| Group | Skills | Status |
| --- | --- | --- |
| General tools | `artifact-formatter`, `version-management` | Usable |
| Script/Screenwriter/McKee | `screenwriter-workflow` plus McKee structure plugins; legacy McKee-first workflow removed | Usable; includes Story Bone intake, Screenwriter-first drafting, timing, audit, iteration quality gates, and DOCX export |
| Guides | `guide-workflow` | Usable; fills asset/style guide stage before shotlist work |
| Shotlist | `shotlist-breakdown-workflow`, `sketch-shotlist-workflow` | Usable; owns the four-phase shotlist-builder loop, scene inventory, asset request, spatial blocking, shot rows, prompt envelopes, HTML source of truth, rough e-conte previews, and internal prompt hard gates |
| QA | `qa-workflow`, `qa-checklists` | Usable; now covers shotlist breakdown, prompt envelopes, HTML/previews, generated tests, and regression |

Retired active skills: old board prompt, art prompt, art platform adapter, standalone video prompt, and standalone motion design workflows.

## Current Risks

| Priority | Risk | Recommended Fix |
| --- | --- | --- |
| P1 | Long shotlist scopes can still drift if generated as one pass. | Follow screenplay scene boundaries first; split overloaded scenes by action phase, camera setup, or reference-set change and require QA before previews/generated tests. |
| P1 | Draft references can be mistaken for production continuity locks. | Keep `text_dna_draft`, `text_only_draft`, `prompt_only`, and `image_reference_bound` visible in HTML, manifests, and QA. |
| P1 | A copied project can start generating too late without locks. | Fill `deliverables/00_admin/locks.md` before production work once a concrete story or platform target exists. |
| P2 | Empty starter state can be mistaken for missing workflow capability. | Treat empty deliverable stages as expected in `main`; use `.agents/skill_registry.md` and `AGENTS.md` for the workflow contract. |

## Recommended Next Cleanup

1. Add blank templates for `03_shotlist_breakdown_v{N}.md` and shotlist QA reports if repeated project initialization becomes common.
2. Add a lightweight portable registry validator if repeated manual checks become costly.

## Operating Guidance

For active work, trust this order:

1. `AGENTS.md`
2. `.agents/skill_registry.md` for swappable skill implementation choices
3. latest files in `deliverables/`
4. relevant `.codex/agents/<role>.toml` when subagents are requested
5. relevant `.agents/skills/<skill>/SKILL.md`
6. archived files only when restoring, comparing, or mining historical examples
