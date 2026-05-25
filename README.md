# AI Video Workflow Package

This repository is a Markdown-first workflow package for AI video creation. It is designed for Codex to move a project from story concept or script to production-ready video assets through versioned files, local role workflows, and QA gates.

The current repository state is workflow-only: test production artifacts have been archived, and `deliverables/` is reserved for the next active project.

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
  -> script and optional McKee audit
  -> asset guide and style guide
  -> structured storyboard
  -> storyboard image prompts
  -> art prompts and keyframes
  -> video motion prompts
  -> QA and regression checks
```

## Local Roles

| Role | Spec | Responsibility |
| --- | --- | --- |
| `project-director` | `.codex/agents/project-director.toml` | Scan state, route work, check preconditions, track downstream impact |
| `script-writer` | `.codex/agents/script-writer.toml` | Create, audit, revise, or expand scripts using McKee references when useful |
| `guide-director` | `.codex/agents/guide-director.toml` | Create asset and style guides, register reference images, and define visual continuity |
| `storyboard-director` | `.codex/agents/storyboard-director.toml` | Convert scripts into shot tables and storyboard prompts |
| `artist-director` | `.codex/agents/artist-director.toml` | Produce still-image prompts and keyframe generation plans |
| `animation-director` | `.codex/agents/animation-director.toml` | Produce text-to-video or image-to-video motion prompts |
| `qa-check` | `.codex/agents/qa-check.toml` | Validate structure, locks, versions, continuity, generated assets, and regressions |

## Replaceable Skill Slots

Use `.agents/skill_registry.md` as the assembly layer for swappable implementations. The current defaults include:

| Slot | Current Default | Purpose |
| --- | --- | --- |
| `guides.primary` | `guide-workflow` | Asset and style guides |
| `storyboard.prompt_adapter` | `storyboard-nanobanana` | Storyboard prompt batches |
| `art.prompt_builder` | `art-prompt-workflow` | Still-image and keyframe prompts |
| `video.prompt_builder` | `video-prompt-workflow` | Video generation prompt artifacts |
| `video.motion_adapter` | `video-motion-design` | Camera and subject motion rules |

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
    └── generated/
```

Historical versions live under matching `archives/<stage>/` directories. Do not create `deliverables/*/archive/`.

## Generated Assets

- `deliverables/20_guides/refs/`: local reference images declared by the latest asset guide.
- `deliverables/40_boards/generated/`: generated storyboard sheets.
- `deliverables/50_art/generated/`: draft or review art keyframes.
- `deliverables/50_art/generated_ref_v{N}/`: production candidate keyframes generated with required local references attached.
- `deliverables/60_motion/generated/`: generated video clips or platform exports, if saved locally.

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

Before downstream work, check latest versions, upstream IDs, locks, style/asset guide requirements, reference image paths, generated asset manifests, shot counts, and duration consistency.

## Current State

- Test deliverables and generated assets were moved to `archives/` on 2026-05-20.
- Current active production stages are empty.
- Latest workflow hardening pass: skill slot registry, guide stage coverage, and replaceable storyboard/video adapters added on 2026-05-25.
