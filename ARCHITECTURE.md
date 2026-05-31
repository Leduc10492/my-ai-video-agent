# Codex Workflow Architecture

Version: 8.0
Updated: 2026-05-31

## Overview

This repository contains a Codex-native, file-based AI video workflow. The active rule entrypoint is [AGENTS.md](AGENTS.md). Project-scoped custom agents live under `.codex/agents/<id>.toml`, repo-scoped skills live under `.agents/skills/<skill>/SKILL.md`, and `.agents/skill_registry.md` maps stable workflow slots to replaceable skill implementations.

The active production architecture is shotlist-first. Old standalone board-prompt, art-prompt, and video-prompt stages are retired from active routing.

## Rule Layers

| Layer | Path | Purpose |
| --- | --- | --- |
| Codex entrypoint | `AGENTS.md` | Active project rules, file contract, role routing, QA gates |
| Codex custom agents | `.codex/agents/<id>.toml` | Spawnable role specifications and ownership boundaries |
| Skill assembly registry | `.agents/skill_registry.md` | Replaceable workflow slots and compatibility requirements |
| Repo-scoped skills | `.agents/skills/*/SKILL.md` | Stage-specific procedures and reference links |
| Admin state | `deliverables/00_admin/` | Locks, changelog, QA reports |
| Current production artifacts | `deliverables/<stage>/` | Latest versioned deliverables |
| Historical artifacts | `archives/<stage>/` | Archived versions and test material |

## Codex Execution Model

Default execution is local in the parent Codex thread. Subagents are spawned only when the user explicitly asks for subagents, parallel agents, delegation, or names a specific subagent.

When spawning, the parent reads `.codex/agents/<id>.toml`, passes it as role instructions, assigns a bounded task, and gives the spawned agent a disjoint write scope.

On macOS Finder, `.codex/` and `.agents/` are hidden by default. Press `Cmd+Shift+.` to show hidden directories.

## Role Map

| Role | Spec | Primary skills |
| --- | --- | --- |
| `project-director` | `.codex/agents/project-director.toml` | `artifact-formatter`, `version-management`, `qa-workflow`, slot routing |
| `script-writer` | `.codex/agents/script-writer.toml` | `screenwriter-workflow`, `mckee-coordinator` |
| `guide-director` | `.codex/agents/guide-director.toml` | `guide-workflow`, `artifact-formatter`, `version-management` |
| `storyboard-director` | `.codex/agents/storyboard-director.toml` | `shotlist-breakdown-workflow`, `sketch-shotlist-workflow`, `qa-workflow` |
| `qa-check` | `.codex/agents/qa-check.toml` | `qa-workflow`, `qa-checklists` |

The `storyboard-director` role name is retained for compatibility, but the active role is shotlist-first planning and production.

## Skill Assembly Slots

Workflow stages call slots, not only hardwired skill names. The current slot map is maintained in `.agents/skill_registry.md`.

| Slot | Current Default | Stable Contract |
| --- | --- | --- |
| `script.primary` | `screenwriter-workflow` | `01_script_v{N}.md`, optional iteration gates, audit reports, timing plans, and derived DOCX exports |
| `story.mckee_router` | `mckee-coordinator` | structure, audit, rewrite, scene, pacing, variation, and source packets |
| `guides.primary` | `guide-workflow` | `02_asset_guide_v{N}.md`, `02_style_guide_v{N}.md` |
| `shotlist.breakdown` | `shotlist-breakdown-workflow` | `03_shotlist_breakdown_v{N}.md` |
| `shotlist.primary` | `sketch-shotlist-workflow` | `Shotlist_<scope>_ZH_v{N}.html` plus e-conte preview manifest/images |
| `qa.primary` | `qa-workflow` | chat QA or persistent reports under `deliverables/00_admin/qa_reports/` |

Replacement skills must satisfy the slot interface, preserve canonical output paths, and keep QA/reporting behavior compatible. If a replacement needs a new storage layout, treat it as a migration rather than a slot swap.

## Skill Inventory

Active skill directories under `.agents/skills/` include:

- General tools: `artifact-formatter`, `version-management`
- Script/Screenwriter/McKee: `screenwriter-workflow`, `mckee-coordinator`, `mckee-create`, `mckee-audit`, `mckee-rewrite-plan`, `mckee-scene-doctor`, `mckee-expand-pace`, `mckee-variations`, `mckee-source`, `mckee-shared`
- Guides: `guide-workflow`
- Shotlist: `shotlist-breakdown-workflow`, `sketch-shotlist-workflow`
- QA: `qa-workflow`, `qa-checklists`

## Canonical Paths

```text
deliverables/
├── 00_admin/
│   ├── README.md
│   ├── locks.md
│   ├── changelog.md
│   └── qa_reports/
├── 10_story/
│   ├── 01_script_v{N}.md
│   └── 01_audit_report_v{N}.md
├── 20_guides/
│   ├── 02_asset_guide_v{N}.md
│   ├── 02_style_guide_v{N}.md
│   └── refs/
├── 30_breakdown/
│   └── 03_shotlist_breakdown_v{N}.md
└── 60_motion/
    ├── Shotlist_<scope>_ZH_v{N}.html
    ├── shotlist_previews_<scope>_v{N}/
    └── generated/
```

Archived versions use the same stage names under `archives/`.

## Dependency Graph

```text
01_script_v{N}.md
  -> 01_audit_report_v{N}.md
  -> 02_asset_guide_v{N}.md + 02_style_guide_v{N}.md
  -> 03_shotlist_breakdown_v{N}.md
      -> Shotlist_<scope>_ZH_v{N}.html
          -> shotlist_previews_<scope>_v{N}/
          -> generated/ video tests
      -> qa_reports/
```

Legacy `03_storyboard_v{N}.md` files can be read as migration inputs. The next saved planning version should use `03_shotlist_breakdown_v{N}.md`.

## Generated Asset Contract

Generated folders must include a manifest or README with:

- source artifact
- asset count
- reference mode: `source`, `text_dna_draft`, `text_only_draft`, `prompt_only`, or `image_reference_bound`
- shot range or file naming pattern
- known limitations

Production character references must be generated or supplied with relevant local references loaded or attached. Text DNA alone is not sufficient for `image_reference_bound`.

Higgsfield/Seedance e-conte previews are review aids. They must be manifest-backed and embedded into the shotlist HTML with relative image paths, but they are not production keyframes unless a later task explicitly promotes them and records that status.

## QA Strategy

QA runs at five levels:

- State check: concise current status
- Stage QA: validate one newly produced artifact
- Batch QA: validate each 4-8 prompt-envelope batch before a long scope is merged
- Regression QA: evaluate downstream impact after upstream edits
- Final/workflow QA: save a report under `deliverables/00_admin/qa_reports/`

The important checks are version suffixes, artifact metadata, upstream IDs, locks, latest-version selection, reference images, generated asset manifests, shot-block count, prompt-envelope ID consistency, spatial continuity, prompt executability, embedded preview paths, and platform production risk.

## Tooling

The repo includes PowerShell helper scripts under `scripts/`. In environments without `pwsh`, Codex should either run equivalent shell checks or state that the PowerShell scripts cannot be executed.

Important scripts:

- `scripts/status.ps1`
- `scripts/validate-artifacts.ps1`
- `scripts/validate-generated-assets.ps1`
- `scripts/skill-audit.ps1`
- `scripts/new-version.ps1`

## Current State

As of 2026-05-31, the reusable role/skill rules live in Codex-standard project directories. The workflow now has Screenwriter-first script routing, iteration quality gates, explicit guide-stage ownership, shotlist breakdown as the only active visual planning layer, Seedance/Higgsfield HTML as prompt source of truth, internal prompt hard gates, and QA checklists for batch-level prompt executability.
