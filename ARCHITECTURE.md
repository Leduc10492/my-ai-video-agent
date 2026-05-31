# Codex Workflow Architecture

Version: 7.1
Updated: 2026-05-31

## Overview

This repository contains a Codex-native, file-based AI video workflow. The active rule entrypoint is [AGENTS.md](AGENTS.md). Project-scoped custom agents live under `.codex/agents/<id>.toml`, repo-scoped skills live under `.agents/skills/<skill>/SKILL.md`, and `.agents/skill_registry.md` maps stable workflow slots to replaceable skill implementations.

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
| `script-writer` | `.codex/agents/script-writer.toml` | `screenwriter-workflow`, McKee skill set |
| `guide-director` | `.codex/agents/guide-director.toml` | `guide-workflow`, `artifact-formatter`, `version-management` |
| `storyboard-director` | `.codex/agents/storyboard-director.toml` | `storyboard-workflow`, `storyboard-analysis`, `storyboard-nanobanana`, `sketch-shotlist-workflow` |
| `artist-director` | `.codex/agents/artist-director.toml` | `art-prompt-workflow`, `art-platform-rules` |
| `animation-director` | `.codex/agents/animation-director.toml` | `video-prompt-workflow`, `video-motion-design`, `sketch-shotlist-workflow` |
| `qa-check` | `.codex/agents/qa-check.toml` | `qa-workflow`, `qa-checklists` |

## Skill Assembly Slots

Workflow stages call slots, not only hardwired skill names. The current slot map is maintained in `.agents/skill_registry.md`.

| Slot | Current Default | Stable Contract |
| --- | --- | --- |
| `script.primary` | `screenwriter-workflow` | `01_script_v{N}.md`, optional iteration gates, audit reports, timing plans, and derived DOCX exports |
| `story.mckee_router` | `mckee-coordinator` | structure, audit, rewrite, scene, pacing, variation, and source packets |
| `guides.primary` | `guide-workflow` | `02_asset_guide_v{N}.md`, `02_style_guide_v{N}.md` |
| `storyboard.prompt_adapter` | `storyboard-nanobanana` | `04_storyboard_prompts_v{N}.md` |
| `shotlist.primary` | `sketch-shotlist-workflow` | `Shotlist_<scope>_ZH_v{N}.html` plus e-conte preview manifest/images |
| `art.prompt_builder` | `art-prompt-workflow` | `05_art_prompts_v{N}.md` |
| `art.platform_adapter` | `art-platform-rules` | platform syntax inside art prompts |
| `video.prompt_builder` | `video-prompt-workflow` | `06_video_prompts_v{N}.md` |
| `video.motion_adapter` | `video-motion-design` | camera and subject motion fields |

Replacement skills must satisfy the slot interface, preserve canonical output paths, and keep QA/reporting behavior compatible. If a replacement needs a new storage layout, treat it as a migration rather than a slot swap.

## Skill Inventory

There are 24 skill directories under `.agents/skills/`, each with a `SKILL.md`:

- General tools: `artifact-formatter`, `version-management`
- Script/Screenwriter/McKee: `screenwriter-workflow`, `script-workflow` (legacy compatibility), `mckee-coordinator`, `mckee-create`, `mckee-audit`, `mckee-rewrite-plan`, `mckee-scene-doctor`, `mckee-expand-pace`, `mckee-variations`, `mckee-source`, `mckee-shared`
- Guides: `guide-workflow`
- Storyboard/Shotlist: `storyboard-workflow`, `storyboard-analysis`, `storyboard-nanobanana`, `sketch-shotlist-workflow`
- Art: `art-prompt-workflow`, `art-platform-rules`
- Video: `video-prompt-workflow`, `video-motion-design`
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
│   └── 03_storyboard_v{N}.md
├── 40_boards/
│   ├── 04_storyboard_prompts_v{N}.md
│   └── generated/
├── 50_art/
│   ├── 05_art_prompts_v{N}.md
│   ├── generated/
│   └── generated_ref_v{N}/
└── 60_motion/
    ├── 06_video_prompts_v{N}.md
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
  -> 03_storyboard_v{N}.md
      -> 04_storyboard_prompts_v{N}.md
      -> 05_art_prompts_v{N}.md
          -> generated_ref_v{N}/ keyframes
          -> 06_video_prompts_v{N}.md
      -> Shotlist_<scope>_ZH_v{N}.html
          -> shotlist_previews_<scope>_v{N}/
```

## Generated Asset Contract

Generated folders must include a manifest or README with:

- source prompt artifact
- asset count
- reference mode: `source`, `text_dna_draft`, `text_only_draft`, or `image_reference_bound`
- shot range or file naming pattern
- known limitations

Production character keyframes must be generated with relevant local references loaded or attached. Text DNA alone is not sufficient for `image_reference_bound`.

Higgsfield/Seedance e-conte previews are review aids. They must be manifest-backed and embedded into the shotlist HTML with relative image paths, but they are not production keyframes unless a later stage explicitly promotes and regenerates them under the keyframe contract.

## QA Strategy

QA runs at four levels:

- State check: concise current status
- Stage QA: validate one newly produced artifact
- Regression QA: evaluate downstream impact after upstream edits
- Final/workflow QA: save a report under `deliverables/00_admin/qa_reports/`

The important checks are version suffixes, artifact metadata, upstream IDs, locks, latest-version selection, reference images, generated asset manifests, shot count consistency, and motion feasibility.

## Tooling

The repo includes PowerShell helper scripts under `scripts/`. In environments without `pwsh`, Codex should either run equivalent shell checks or state that the PowerShell scripts cannot be executed.

Important scripts:

- `scripts/status.ps1`
- `scripts/validate-artifacts.ps1`
- `scripts/validate-generated-assets.ps1`
- `scripts/skill-audit.ps1`
- `scripts/new-version.ps1`

## Current State

As of 2026-05-31, the reusable role/skill rules live in Codex-standard project directories. The workflow now has Screenwriter-first script routing, iteration quality gates, explicit guide-stage ownership, a skill assembly registry for replacing storyboard, art, video, and QA implementations, and a project-local Sketch/Seedance shotlist route that embeds rough e-conte previews without changing the standard storyboard/art/video contracts.
