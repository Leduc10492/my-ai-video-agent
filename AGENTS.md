# Codex Project Instructions

## Project Identity

This repository is a file-based AI video creation workflow package. It is not a runnable software app. Its purpose is to guide Codex from a story concept or script to production-ready Seedance/Higgsfield shotlist assets:

1. script and McKee-style audit
2. asset and style guides
3. shotlist breakdown and spatial-blocking prep
4. Seedance/Higgsfield shotlist HTML with 15-second prompt envelopes
5. rough e-conte previews and generated video test manifests when requested
6. QA and regression checks

The workflow is project-agnostic. Do not hardcode a story title, character name, reference image path, shot count, platform choice, or duration unless it appears in the current `deliverables/` state, `locks.md`, or the user's latest request.

## Rule Sources

- Treat this `AGENTS.md` as the Codex-native project rule entrypoint.
- Treat `.codex/agents/<id>.toml` as project-scoped Codex custom agent configs.
- Treat `.agents/skills/<skill>/SKILL.md` as repo-scoped Codex skills.
- Treat `.agents/skill_registry.md` as the project-scoped skill assembly registry. It maps workflow slots to the current default skill implementations and defines replacement requirements.
- Default execution is local in the current thread unless the user explicitly asks for subagents, parallel agents, delegation, or names a specific subagent.
- When spawning, load the matching subagent spec and pass it as the role/task instructions to the spawned Codex agent.
- Only spawn parallel Codex agents when the user explicitly asks for parallel agents or delegation.
- When a legacy file says "call a skill", read the matching active `.agents/skills/<skill>/SKILL.md` if the skill still exists; otherwise map to the active shotlist-first skill listed below.
- `deliverables/` is the source of truth for current project state. `archives/` is historical reference unless the user asks to restore or inspect archived material.
- On the reusable `main` baseline, `deliverables/` should remain project-neutral: starter admin files only, no story-specific locks, scripts, references, generated assets, QA reports, or archived production history. Copied project instances, generated worktrees, or forks may fill in concrete project state.

## State Scan

Start every substantial task by scanning:

- `deliverables/`
- `deliverables/00_admin/locks.md`
- the latest versioned upstream files required by the requested stage

When selecting an input file, find the highest numeric version suffix in the relevant directory instead of assuming `v1`.

## File Contract

Use versioned filenames for current production deliverables. If older docs mention unversioned names like `01_script.md`, interpret them only as shorthand for the latest matching `*_v{N}.md` file.

Current path patterns:

- `deliverables/10_story/01_script_v{N}.md`
- `deliverables/10_story/01_audit_report_v{N}.md`
- `deliverables/20_assets/02_asset_guide_v{N}.md`
- `deliverables/20_assets/02_style_guide_v{N}.md`
- `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md`
- `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/Shotlist_<scene-scope>_ZH_v{N}.html`

Legacy planning files such as `03_storyboard_v{N}.md` may be read from `archives/` as historical input. If a legacy planning file appears under `deliverables/30_shotlist/`, treat it as stale active-state residue and archive it before continuing. The next saved planning artifact must use `03_shotlist_breakdown_v{N}.md`.

Admin files are intentionally unversioned:

- `deliverables/00_admin/README.md`
- `deliverables/00_admin/locks.md`
- `deliverables/00_admin/changelog.md`

Asset and shotlist package directories are intentionally unversioned or package-versioned by folder:

- `deliverables/20_assets/refs/`: common local reference images declared by the latest asset guide
- `deliverables/20_assets/generated_ref_v{N}/`: common local generated references; generation origin, binding, approval, and output status are recorded separately
- `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/assets/`: scene-specific assets only; common assets should be referenced from `deliverables/20_assets/`
- `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/previews/`: generated rough e-conte preview images embedded in the scene shotlist HTML
- `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/generated/`: generated video clips or platform exports for that scene package, if saved locally

Every generated asset directory or scene package should include a `README.md` or manifest with source artifact, asset count, reference-state fields, common-asset links, scene-specific asset list, and known limitations.

## Artifact Format

Every created or updated Markdown production deliverable should begin with artifact metadata:

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

Keep the same artifact ID across versions of the same deliverable. New deliverables get new IDs.

All current Markdown production deliverables should include this metadata. If a legacy file lacks metadata, repair it before editing content.

Scene-package HTML stores the same identity in `<meta name="artifact-id">`, `<meta name="artifact-version">`, and `<meta name="source-artifact-ids">`. The sibling `manifest.md` is the canonical package metadata record and must use the Markdown artifact header above.

## Versioning Rules

When saving a new version:

1. Read the current highest version.
2. Move the previous current file to the matching `archives/<stage>/` directory.
3. Save the new file to `deliverables/<stage>/..._v{N+1}.md`.
4. Update the artifact metadata `version`.
5. Preserve or update `upstream` and `locks`.
6. Append a short entry to `deliverables/00_admin/changelog.md`.

For scene-package revisions, archive the entire previous `<scene-scope>_v{N}/` directory under `archives/30_shotlist/scenes/`, then create the next package directory. Do not version only the HTML while leaving manifests, previews, or generated-test mappings behind.

Do not create `deliverables/*/archive/` directories.

If there is no current file for a stage, create `v1` directly in `deliverables/<stage>/`.

## Codex Role Routing

Use these role responsibilities locally by default. Use the matching subagent spec when spawning is explicitly requested:

- `project-director`: `.codex/agents/project-director.toml`
- `script-writer`: `.codex/agents/script-writer.toml`
- `guide-director`: `.codex/agents/guide-director.toml`
- `storyboard-director`: `.codex/agents/storyboard-director.toml` (shotlist-first visual planning and production)
- `qa-check`: `.codex/agents/qa-check.toml`

The old standalone art and animation agent roles are retired from the active workflow. Existing local generated references or generated video tests may still be read as inputs.

## Skill Assembly Slots

Use `.agents/skill_registry.md` to resolve replaceable workflow capability slots. The slot is the stable contract; the skill listed there is only the current implementation.

Important slots:

- `script.primary`: creates, revises, audits, times, and exports script artifacts for `deliverables/10_story/`; current default is `screenwriter-workflow`.
- `story.mckee_router`: routes structure, audit, rewrite, scene repair, pacing, variation, and source tasks for script work; current default is `mckee-coordinator`.
- `guides.primary`: creates asset and style guides plus common reference manifests for `deliverables/20_assets/`.
- `shotlist.breakdown`: creates `03_shotlist_breakdown_v{N}.md` with scene inventory, action beats, asset request, and spatial-blocking queue; current default is `shotlist-breakdown-workflow`.
- `shotlist.primary`: runs the four-phase shotlist-builder loop and creates scene-first Seedance/Higgsfield production HTML with 15-second prompt envelopes and embedded e-conte preview images; current default is `sketch-shotlist-workflow`.
- `qa.primary`: performs stage, batch, regression, final, and workflow QA.

When replacing a skill, do not change canonical deliverable paths. Add or select a real skill under `.agents/skills/<skill>/SKILL.md`, update `.agents/skill_registry.md`, and verify the replacement satisfies the slot interface before using it for production work.

### Spawn Policy

When the user explicitly asks for subagents, parallel agents, delegation, or names a subagent:

1. Read the matching `.codex/agents/<id>.toml`.
2. Give the spawned agent a bounded task, required input paths, and an explicit write scope.
3. Choose non-overlapping write scopes when spawning multiple agents.
4. Tell spawned agents they are not alone in the workspace and must not revert changes made by others.
5. Prefer read-only/explorer work for QA unless the task includes writing a QA report.
6. Review returned changes before integrating or continuing.

Do not spawn an agent for the immediate blocking task if doing the work locally is the shorter critical path.

When legacy workflow files mention missing granular skills, map them to the active consolidated skills:

- legacy visual-prompt or standalone motion-prompt requests: use `shotlist-breakdown-workflow` and `sketch-shotlist-workflow` instead
- Higgsfield/Seedance shotlist HTML with preview images: `sketch-shotlist-workflow`
- asset and style guide generation: `guide-workflow`
- QA checks: `qa-workflow`, `qa-checklists`
- formatting and versioning: `artifact-formatter`, `version-management`

## Normal Workflow

Use this sequence unless the user asks for a specific stage:

1. Script: produce or update `01_script_v{N}.md`; optionally produce `01_audit_report_v{N}.md`.
2. Guides: produce or update asset and style guides before visual production work using `guide-workflow` or the `guides.primary` slot replacement.
3. Shotlist breakdown: produce or update `03_shotlist_breakdown_v{N}.md` with scene inventory, action beats, asset requirements, spatial-blocking queue, and Phase 4 scope recommendations.
4. Shotlist HTML: run the four-phase shotlist-builder loop through `shotlist.primary`, then produce or update `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/Shotlist_<scene-scope>_ZH_v{N}.html` and optional rough e-conte previews.
5. QA: check locks, upstream version consistency, character DNA, reference status, spatial continuity, prompt-envelope quality, embedded preview paths, generated asset manifests, video test results, and downstream impact.

The shotlist HTML is the prompt source of truth for Seedance/Higgsfield production. Do not create separate board-prompt, art-prompt, or standalone video-prompt artifacts for the same active scope.

If a user asks for a specific stage, do that stage directly after checking prerequisites.

## Reference Image Contract

Local reference images declared in the latest asset guide are production inputs, not decorative documentation. Markdown image links inside the asset guide do not automatically reach an image or video model.

Before producing any prompt or generation test that contains a named character or continuity-critical object:

1. Read the latest `02_asset_guide_v{N}.md`, if present.
2. Resolve every relevant local reference image path from that asset guide or generated-reference manifest.
3. Confirm the referenced image files exist on disk.
4. State each reference image role in the prompt or handle, for example `<Character> identity reference`, `<Character> costume reference`, or `<Object> prop reference`.
5. Use text DNA only as a supplement to visual references, not as a replacement for locked production continuity.

### Reference State Contract

Do not overload one label with asset origin, model binding, approval, and output readiness. Every asset batch, scene package, preview manifest, and generated-test manifest records these fields:

- `asset_origin`: `user_provided`, `generated_from_text`, `generated_from_references`, or `mixed`
- `reference_binding`: `none`, `text_only`, or `images_attached`
- `reference_approval`: `draft`, `reviewed`, or `locked`
- `output_status`: `prompt_only`, `smoke_test`, `review_ready`, or `production_approved`

Legacy labels are read-only compatibility hints:

- `text_only_draft` or `text_dna_draft`: normally `reference_binding: text_only`, `reference_approval: draft`
- `image_reference_bound`: `reference_binding: images_attached`; it makes no approval claim
- `prompt_only`: maps to `output_status: prompt_only`

An output may be `production_approved` only when required references were actually attached, approval is `locked`, and independent QA passed. A generated-from-text image may still be attached to a model; in that case use `asset_origin: generated_from_text`, `reference_binding: images_attached`, and `reference_approval: draft`.

## Quality Gates

Generation hard gates live inside `shotlist.primary`; independent review lives in `qa.primary`.

Before changing downstream artifacts, verify:

- required upstream files exist
- latest numeric versions are being used
- `locks.md` and per-artifact locks are respected
- artifact `version` matches the filename suffix
- upstream artifact IDs exist in current or archived artifacts
- character descriptions match the latest asset guide when one exists
- character reference image paths in the latest asset guide or generated-reference manifest exist on disk
- style work has a style guide, or the absence is called out explicitly
- screenplay scene order, shot row counts, duration, source scene mapping, and prompt-envelope grouping agree
- shot rows use `<scene-label>-R<NN>`, prompt envelopes use reserved `P###` IDs, and the two identifiers are never conflated
- prompt envelopes include reference facts, planted camera, first-frame composition, physical action path, unique micro-beats, shot-specific failure locks, adjacent-beat boundaries, and reference status labels
- production work is split by screenplay scene first; overloaded scenes are split by action phase, camera setup, or reference-set change
- shotlist prompt envelopes agree with preview manifest entries and embedded image paths
- generated asset folders include manifests with source artifact, count, reference mode, and limitations
- generated asset folders include manifests with all four reference-state fields and known limitations
- any replacement skill selected in `.agents/skill_registry.md` exists and satisfies the relevant slot interface

If an upstream artifact changes, list downstream artifacts that may need inspection, revision, or regeneration.

## QA Output

- Quick state checks can be reported in chat only.
- Stage QA, batch QA, final QA, workflow audits, and regression checks that affect future work should be saved under `deliverables/00_admin/qa_reports/`.
- QA findings should separate structural checks, spatial continuity, prompt executability, reference status, platform production risk, and creative taste recommendations.
- Shotlist QA should cite concrete scene numbers, shot rows, and `P###` prompt-envelope IDs when applicable.

## P0 Structural Guardrails

These rules protect the project from drifting while it is Markdown-first and manually edited:

- Do not introduce a new project structure unless the user explicitly asks for a migration.
- Keep workflow rules in Markdown for now. Do not replace them with YAML/JSON as the source of truth.
- Keep `AGENTS.md` as the Codex entrypoint, `.codex/agents/` as project-scoped Codex custom agents, `.agents/skills/` as repo-scoped Codex skills, and root docs as human-facing documentation.
- Every subagent reference must point to a real `.codex/agents/<id>.toml` file.
- Every new production deliverable must use a versioned filename and artifact metadata.
- Every workflow skill reference must point to a real directory under `.agents/skills/`.
- Every default skill listed in `.agents/skill_registry.md` must point to a real skill directory under `.agents/skills/`.
- Skill replacements must preserve canonical output paths unless the user explicitly asks for a migration.
- Every referenced `references/*.md` file must exist.
- When adding, moving, or renaming a core doc or artifact path, update `README.md`, `ARCHITECTURE.md`, `CODEX_SKILL_AUDIT.md`, and `deliverables/00_admin/changelog.md` in the same pass.
- Do not edit generated project artifacts merely to make a rule cleaner; preserve creative content unless the task is to revise that stage.

## Communication

Be concrete and file-backed. Report current state, blocker, and next action. Keep creative judgment separated from structural QA: structure, continuity, prompt executability, reference status, and production feasibility are checks; taste is a recommendation.

For story/script work, McKee packets, audits, QA findings, iteration gates, shotlists, and user-facing handoffs, default to Simplified Chinese unless the user explicitly requests another language. Keep file paths, artifact IDs, version suffixes, fixed decision tokens, screenplay scene labels, shot-row IDs, `P###` IDs, and standard screenplay labels unchanged when useful.
