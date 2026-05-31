# Skill Assembly Registry

This registry defines replaceable workflow slots. A slot is a capability interface; the listed skill is the current implementation. Downstream file paths stay stable even when a slot implementation changes.

## Replacement Rule

To replace a skill implementation:

1. Put the replacement under `.agents/skills/<skill-id>/SKILL.md`.
2. Ensure its frontmatter description clearly triggers for the slot use case.
3. Confirm it satisfies the slot interface below: inputs, outputs, artifact metadata, versioning, QA handoff, and storage contract.
4. Update this registry's default skill for the slot.
5. Update affected agent read scopes only if the replacement needs additional files or a different write scope.
6. Run skill and artifact validation before using the replacement for production deliverables.

Do not change canonical deliverable paths just to fit a new skill. If a replacement requires a different storage layout, treat that as a project migration and update `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `CODEX_SKILL_AUDIT.md`, and `deliverables/00_admin/changelog.md` in the same pass.

## Current Slot Map

| Slot | Default skill | Owner role | Stable output |
| --- | --- | --- | --- |
| `script.primary` | `screenwriter-workflow` | `script-writer` | `deliverables/10_story/01_script_v{N}.md` |
| `story.mckee_router` | `mckee-coordinator` | `script-writer` | script, audit, rewrite notes as requested |
| `guides.primary` | `guide-workflow` | `guide-director` | `deliverables/20_guides/02_asset_guide_v{N}.md`, `02_style_guide_v{N}.md` |
| `storyboard.analysis` | `storyboard-analysis` | `storyboard-director` | analysis feeding `03_storyboard_v{N}.md` |
| `storyboard.table` | `storyboard-workflow` | `storyboard-director` | `deliverables/30_breakdown/03_storyboard_v{N}.md` |
| `storyboard.prompt_adapter` | `storyboard-nanobanana` | `storyboard-director` | `deliverables/40_boards/04_storyboard_prompts_v{N}.md` |
| `art.prompt_builder` | `art-prompt-workflow` | `artist-director` | `deliverables/50_art/05_art_prompts_v{N}.md` |
| `art.platform_adapter` | `art-platform-rules` | `artist-director` | platform-specific prompt blocks inside `05_art_prompts_v{N}.md` |
| `video.prompt_builder` | `video-prompt-workflow` | `animation-director` | `deliverables/60_motion/06_video_prompts_v{N}.md` |
| `video.motion_adapter` | `video-motion-design` | `animation-director` | motion fields inside `06_video_prompts_v{N}.md` |
| `artifact.formatter` | `artifact-formatter` | all roles | artifact metadata and path contract |
| `version.manager` | `version-management` | all writing roles | archived old version plus current new version |
| `qa.primary` | `qa-workflow` | `qa-check` | chat QA or `deliverables/00_admin/qa_reports/` |
| `qa.checklists` | `qa-checklists` | all roles | stage-specific checks |

## Slot Interfaces

### `script.primary`

Inputs:

- User concept, outline, script, or revision request
- Global locks
- Latest script and audit versions, if present
- Optional McKee structure packets, source context, or user-provided references

Outputs:

- `01_script_v{N}.md` with artifact metadata when a production script is saved
- Optional `01_audit_report_v{N}.md` when a persistent audit is requested or needed
- Optional iteration quality gate when deciding whether to revise or export
- Optional derived `.docx` exports when requested
- Changelog entry and archives when revising

Compatibility requirements:

- Must preserve the versioned script path and artifact metadata contract.
- Must treat McKee skills as structure plugins, not competing final script owners.
- Must keep user-facing script work in the Screenwriter mode: visible action, concise screenplay format, one-version iteration, and Chinese output unless requested otherwise.
- Must render audits, iteration gates, rewrite notes, timing tables, and handoff summaries in Simplified Chinese unless the user explicitly requests another language.
- Must use an iteration quality gate before creating a new script version or exporting DOCX.
- Must report downstream impact on guides, storyboard, prompts, keyframes, and video prompts after story changes.

### `story.mckee_router`

Inputs:

- Current user story task
- Latest script or draft material when present
- Targeted analysis need: creation, audit, rewrite, scene repair, pacing, variations, or source lookup

Outputs:

- Structure packets, audit packets, rewrite plans, scene diagnosis, pacing notes, variations, or source excerpts
- Final script or audit artifacts only when wrapped by `script.primary`

Compatibility requirements:

- Must not override `script.primary` as the default writing entrance.
- Must load only the specific McKee sub-skill or reference needed.
- Must render user-facing structure packets, audits, rewrite plans, scene diagnoses, pacing notes, and variations in Simplified Chinese unless the user explicitly requests another language.
- Must keep `mckee-source` for explicit source/quote requests only.

### `guides.primary`

Inputs:

- Latest script and optional audit/storyboard
- Global locks
- Existing guide versions
- User-provided reference images or style requirements

Outputs:

- Asset guide with character DNA, reference image paths and roles, props, locations, and continuity rules
- Style guide with palette, lighting, medium, composition, platform-neutral prompt language, and negative style rules
- Changelog entry and archives when revising

Compatibility requirements:

- Must not invent missing reference paths.
- Must separate asset facts from style rules.
- Must mark missing references and downstream production blockers.

### `storyboard.prompt_adapter`

Inputs:

- Latest storyboard
- Latest asset guide
- Optional style guide
- Global locks
- User-selected platform or adapter default

Outputs:

- `04_storyboard_prompts_v{N}.md` with artifact metadata
- Shot coverage summary and batch ranges
- Prompt blocks that preserve shot IDs, character DNA, layout rules, and draft/reference mode expectations
- Generated storyboard sheet manifest if image sheets are produced

Compatibility requirements:

- Must preserve canonical shot IDs and shot count.
- Must not turn rough storyboard sheets into final art prompts.
- Must state whether outputs are `text_dna_draft`, `text_only_draft`, or `image_reference_bound` when generation occurs.
- Must follow the image reference contract from `AGENTS.md` for character-critical sheets.

### `art.prompt_builder`

Inputs:

- Latest storyboard
- Latest asset guide and style guide
- Optional storyboard prompts
- Required local reference image paths for named characters

Outputs:

- `05_art_prompts_v{N}.md` with per-shot or per-range prompt blocks
- Reference image roles, platform syntax, negative constraints, and output target folders
- Generated keyframe manifest if images are produced

Compatibility requirements:

- Must not call text-only outputs production keyframes when required references exist.
- Must keep platform syntax isolated by prompt block.
- Must preserve source shot IDs and continuity anchors.

### `video.prompt_builder`

Inputs:

- Latest storyboard
- Latest asset and style guides
- Optional art prompts
- Optional draft keyframes and production keyframes
- User-selected platform and input mode

Outputs:

- `06_video_prompts_v{N}.md` with artifact metadata
- Per-shot source, duration, frame, subject motion, camera motion, motion intensity, identity preservation, and avoid list
- Generated clip manifest if clips are produced

Compatibility requirements:

- Must reference exact source keyframe paths for image-to-video prompts.
- Must not ask the video model to redesign identity, costume, props, layout, or lighting from source keyframes.
- Must preserve storyboard duration and shot ID coverage or state any intentional omissions.

### `qa.primary`

Inputs:

- Latest affected artifacts
- Upstream artifact IDs
- Locks
- Generated asset manifests

Outputs:

- Chat findings for quick checks
- Persistent report under `deliverables/00_admin/qa_reports/` for stage, regression, final, or workflow QA

Compatibility requirements:

- Must separate structure, continuity, production feasibility, and taste recommendations.
- Must lead with blockers and list downstream impact after upstream edits.
- Must render chat QA and persistent QA reports in Simplified Chinese unless the user explicitly requests another language.
