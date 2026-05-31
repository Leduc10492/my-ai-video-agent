# AI Video Workflow Package

This repository is a Markdown-first workflow package for AI video creation. It is designed for Codex to move a project from story concept or script to production-ready Seedance/Higgsfield shotlist assets through versioned files, local role workflows, and QA gates.

The current workflow is shotlist-first: standalone board-prompt, art-prompt, and video-prompt stages have been retired from the active path.

## Codex Entry

Use [AGENTS.md](AGENTS.md) as the active project rule entrypoint.

- Codex executes roles locally in the current thread.
- `.codex/agents/<id>.toml` files are project-scoped Codex custom agent configs.
- `.agents/skills/<skill>/SKILL.md` files are repo-scoped Codex skills.
- `.agents/skill_registry.md` maps stable workflow slots to current default skills so implementations can be replaced without changing deliverable paths.
- Default execution is local; when the user explicitly asks for subagents, parallel agents, or delegation, Codex uses the matching custom agent config.
- On macOS Finder, use `Cmd+Shift+.` to show hidden `.codex/` and `.agents/` directories.

## Workflow

```text
concept or script
  -> Screenwriter-mode script and optional McKee-style audit
  -> asset guide and style guide
  -> shotlist breakdown and spatial-blocking prep
  -> Seedance/Higgsfield shotlist HTML with 15-second prompt envelopes
  -> rough e-conte previews and optional generated video tests
  -> QA and regression checks
```

## Local Roles

| Role | Spec | Responsibility |
| --- | --- | --- |
| `project-director` | `.codex/agents/project-director.toml` | Scan state, route work, check preconditions, track downstream impact |
| `script-writer` | `.codex/agents/script-writer.toml` | Create, audit, revise, time, or expand scripts using Screenwriter mode and McKee structure plugins |
| `guide-director` | `.codex/agents/guide-director.toml` | Create asset and style guides, register reference images, and define visual continuity |
| `storyboard-director` | `.codex/agents/storyboard-director.toml` | Own shotlist breakdowns, asset/blocking gates, Seedance/Higgsfield HTML, e-conte previews, and batch QA handoff |
| `qa-check` | `.codex/agents/qa-check.toml` | Validate structure, locks, versions, spatial continuity, prompt executability, generated assets, and regressions |

The role name `storyboard-director` is retained for compatibility, but its active responsibility is shotlist-first planning and production.

## Replaceable Skill Slots

Use `.agents/skill_registry.md` as the assembly layer for swappable implementations. The current defaults include:

| Slot | Current Default | Purpose |
| --- | --- | --- |
| `script.primary` | `screenwriter-workflow` | Script-stage writing, audit, quality gates, timing, revision, and export controller |
| `story.mckee_router` | `mckee-coordinator` | Structure, audit, rewrite, scene, pacing, variation, and source plugins |
| `guides.primary` | `guide-workflow` | Asset and style guides |
| `shotlist.breakdown` | `shotlist-breakdown-workflow` | Shot-block map, prompt-envelope ranges, asset requirements, and spatial-blocking prep |
| `shotlist.primary` | `sketch-shotlist-workflow` | Seedance/Higgsfield production HTML with 15-second prompt envelopes and e-conte previews |
| `qa.primary` | `qa-workflow` | Stage, batch, regression, final, and workflow QA |

To replace an implementation, add or choose a real skill under `.agents/skills/`, update the registry slot, and keep the canonical output path stable.

See [AGENT_SKILL_PLACEMENT_GUIDE.md](AGENT_SKILL_PLACEMENT_GUIDE.md) for when to keep skills/subagents project-local versus promoting them to global scope.

## File Contract

Current production deliverables use versioned filenames:

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
├── 20_assets/
│   ├── 02_asset_guide_v{N}.md
│   ├── 02_style_guide_v{N}.md
│   ├── refs/
│   └── generated_ref_v{N}/
└── 30_shotlist/
    ├── 03_shotlist_breakdown_v{N}.md
    └── scenes/
        └── <scope>_v{N}/
            ├── Shotlist_<scope>_ZH_v{N}.html
            ├── manifest.md
            ├── assets/
            ├── previews/
            ├── generated/
            └── qa/
```

Historical versions live under matching `archives/<stage>/` directories. Do not create `deliverables/*/archive/`.

Legacy `03_storyboard_v{N}.md` and local companion prompt files may remain on disk as historical inputs, but the active workflow writes `03_shotlist_breakdown_v{N}.md` and scene-scoped shotlist HTML packages under `30_shotlist/scenes/`.

## Generated Assets

- `deliverables/20_assets/refs/`: common local reference images declared by the latest asset guide.
- `deliverables/20_assets/generated_ref_v{N}/`: common local generated references; production-approved only when the manifest says `image_reference_bound`.
- `deliverables/30_shotlist/scenes/<scope>_v{N}/assets/`: scene-specific assets only; common assets should be referenced from `20_assets`.
- `deliverables/30_shotlist/scenes/<scope>_v{N}/previews/`: rough e-conte previews embedded in the scene shotlist HTML.
- `deliverables/30_shotlist/scenes/<scope>_v{N}/generated/`: generated video clips or platform exports for that scene package, if saved locally.

Each generated directory should include a `README.md` or manifest with source artifact, asset count, `reference_mode`, and known limitations.

## Quality Rules

Every production deliverable starts with artifact metadata:

```markdown
# Artifact: <Type>
- id: A-<yyyymmdd>-<nnn>
- version: v<number>
- upstream: [<artifact ids>]
- locks:
  - must_keep:
    - ...
  - must_avoid:
    - ...
  - budget_notes:
    - ...

---
```

Before downstream work, check latest versions, upstream IDs, locks, guide/reference requirements, shot-block counts, prompt-envelope IDs, spatial continuity, embedded preview paths, generated asset manifests, and production feasibility.

`sketch-shotlist-workflow` owns generation hard gates. `qa-workflow` provides independent review, regression checks, and persistent reports.

## Current State

- Current local story-stage locks point to `deliverables/10_story/01_script_v10.md`, `01_audit_report_v10.md`, and the derived DOCX export when those local generated files are present.
- Story scripts, source-comparison material, DOCX/PDF exports, generated image folders, generated video tests, and archives are local generated artifacts and are ignored by Git by default.
- Latest workflow hardening pass: Screenwriter-first script routing, McKee structure-packet plugins, guide stage coverage, shotlist breakdown migration, Seedance/Higgsfield HTML as prompt source of truth, batch quality gates, and QA checklists for prompt executability.
