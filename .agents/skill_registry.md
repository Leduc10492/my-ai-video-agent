# Skill Assembly Registry

This registry defines the active workflow slots for the shotlist-first AI video pipeline. A slot is a capability interface; the listed skill is the current implementation. Downstream file paths stay stable unless the user explicitly approves a migration.

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
| `story.mckee_router` | `mckee-coordinator` | `script-writer` | structure, audit, rewrite, scene, pacing, variation, and source packets |
| `guides.primary` | `guide-workflow` | `guide-director` | `deliverables/20_assets/02_asset_guide_v{N}.md`, `02_style_guide_v{N}.md` |
| `shotlist.breakdown` | `shotlist-breakdown-workflow` | `storyboard-director` | `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md` with scene inventory, action beats, asset request, and blocking queue |
| `shotlist.primary` | `sketch-shotlist-workflow` | `storyboard-director` | `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/Shotlist_<scene-scope>_ZH_v{N}.html` plus scene package manifests/previews |
| `artifact.formatter` | `artifact-formatter` | all roles | artifact metadata and path contract |
| `version.manager` | `version-management` | all writing roles | archived old version plus current new version |
| `qa.primary` | `qa-workflow` | `qa-check` | chat QA or `deliverables/00_admin/qa_reports/` |
| `qa.checklists` | `qa-checklists` | all roles | stage-specific checks |

Retired slots are not active workflow contracts: storyboard prompt adapters, art prompt builders, art platform adapters, standalone video prompt builders, and standalone motion adapters. Existing legacy files may remain as historical or local comparison material, but new production work should use the shotlist-first path.

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
- Must report downstream impact on guides, shotlist breakdowns, shotlist HTML, previews, and QA.

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
- Must return packets by default, not write final script artifacts directly.
- Must load only the specific McKee sub-skill or reference needed.
- Must render user-facing structure packets, audits, rewrite plans, scene diagnoses, pacing notes, and variations in Simplified Chinese unless the user explicitly requests another language.
- Must keep `mckee-source` for explicit source/quote requests only.

### `guides.primary`

Inputs:

- Latest script and optional audit or shotlist breakdown
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
- Must state whether downstream shotlist output is allowed only as `text_only_draft`, `text_dna_draft`, `prompt_only`, or `image_reference_bound`.

### `shotlist.breakdown`

Inputs:

- Latest script and optional audit
- Latest asset and style guides when present
- Global locks
- Optional user-selected scene or shot range

Outputs:

- `03_shotlist_breakdown_v{N}.md` with artifact metadata
- Scene inventory, action beat map, asset request, blocking queue, reference status, and Phase 4 scope recommendations
- Changelog entry and archives when revising

Compatibility requirements:

- Must preserve screenplay scene order, scene numbers or derived scene labels, duration budgets, and source scene mapping.
- Must use the `shotlist-builder` Phase 1/2 method: read the script, identify scenes/actions/assets, then request missing assets before prompting.
- Must mark missing asset references, spatial blocking gaps, crowd/prop risks, and scope size before Phase 3/4.
- Must not introduce legacy storyboard IDs as the new production split unit; legacy legacy storyboard IDs may be read only as migration input.
- Existing `03_storyboard_v{N}.md` files are legacy input only; the next saved breakdown version must migrate to `03_shotlist_breakdown_v{N}.md`.

### `shotlist.primary`

Inputs:

- Latest script or `03_shotlist_breakdown_v{N}.md`
- Optional latest asset guide and style guide
- Optional uploaded references, local generated references, sketch references, or keyframes
- Global locks and any requested Higgsfield/Seedance settings
- User-selected screenplay scene, scene range, or derived scene label when generating a subset

Outputs:

- `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/Shotlist_<scene-scope>_ZH_v{N}.html`
- `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/manifest.md`
- Common asset references to `deliverables/20_assets/refs/` or `deliverables/20_assets/generated_ref_v{N}/`
- Scene-specific assets under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/assets/`
- Preview manifest and images under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/previews/`
- Optional generated clip manifests under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/generated/` when test clips are saved

Compatibility requirements:

- Must run the four-phase `shotlist-builder` loop: read script, request assets, confirm scope/spatial blocking, generate HTML shotlist.
- Must preserve screenplay scene order, shot row order, prompt envelope grouping, and 15-second envelope strategy.
- Must keep the HTML shotlist as the prompt source of truth for production handoff.
- Must embed preview thumbnails in the HTML with relative `<img src>` paths, not only list file paths.
- Must mark previews and generated tests as `text_only_draft`, `text_dna_draft`, `image_reference_bound`, or `prompt_only`.
- Must not claim rough e-conte previews are production keyframes.
- Must run internal hard gates before HTML assembly: reference facts, planted camera, first-frame composition, physical action path, unique micro-beats, shot-specific failure locks, adjacent-beat boundaries, reference status, and batch pressure checks.
- Must split by screenplay scene first; within an overloaded scene, split by action phase, camera setup, or reference-set change.
- Must not use legacy storyboard IDs as the new package split unit.
- Must render shotlists, prompt labels, manifest notes, and user-facing handoffs in Simplified Chinese unless the user explicitly requests another language.

### `qa.primary`

Inputs:

- Latest affected artifacts
- Upstream artifact IDs
- Locks
- Shotlist breakdowns, shotlist HTML, preview manifests, generated asset manifests, and generated video test manifests

Outputs:

- Chat findings for quick checks
- Persistent report under `deliverables/00_admin/qa_reports/` for stage, regression, final, or workflow QA

Compatibility requirements:

- Must not replace `shotlist.primary` internal hard gates; QA is an independent review layer.
- Must run before Phase 4, after dense scene prompt drafting, after HTML/previews are complete, and after real video generation tests.
- Must cite concrete scene numbers, shot rows, and `P###` prompt-envelope IDs when applicable.
- Must separate structural checks, spatial continuity, prompt executability, reference status, platform production risk, and creative taste recommendations.
- Must lead with blockers and list downstream impact after upstream edits.
- Must render chat QA and persistent QA reports in Simplified Chinese unless the user explicitly requests another language.
