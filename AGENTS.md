# Codex Project Instructions

## Project Identity

This repository is a file-based AI video creation workflow package. It is not a runnable software app. Its purpose is to guide Codex from a story concept or script to production-ready video creation assets:

1. script and McKee-style audit
2. asset and style guides
3. structured storyboard
4. storyboard image prompts
5. final art prompts and keyframes
6. video motion prompts
7. QA and regression checks

The workflow is project-agnostic. Do not hardcode a story title, character name, reference image path, shot count, platform choice, or duration unless it appears in the current `deliverables/` state, `locks.md`, or the user's latest request.

## Rule Sources

- Treat this `AGENTS.md` as the Codex-native project rule entrypoint.
- Treat `.codex/agents/<id>.toml` as project-scoped Codex custom agent configs.
- Treat `.agents/skills/<skill>/SKILL.md` as repo-scoped Codex skills.
- Treat `.agents/skill_registry.md` as the project-scoped skill assembly registry. It maps workflow slots to the current default skill implementations and defines replacement requirements.
- Default execution is local in the current thread unless the user explicitly asks for subagents, parallel agents, delegation, or names a specific subagent.
- When spawning, load the matching subagent spec and pass it as the role/task instructions to the spawned Codex agent.
- Only spawn parallel Codex agents when the user explicitly asks for parallel agents or delegation.
- When a legacy file says "call a skill", read the matching `.agents/skills/<skill>/SKILL.md` and follow the relevant procedure locally.
- `deliverables/` is the source of truth for current project state. `archives/` is historical reference unless the user asks to restore or inspect archived material.

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
- `deliverables/20_guides/02_asset_guide_v{N}.md`
- `deliverables/20_guides/02_style_guide_v{N}.md`
- `deliverables/30_breakdown/03_storyboard_v{N}.md`
- `deliverables/40_boards/04_storyboard_prompts_v{N}.md`
- `deliverables/50_art/05_art_prompts_v{N}.md`
- `deliverables/60_motion/06_video_prompts_v{N}.md`

Admin files are intentionally unversioned:

- `deliverables/00_admin/README.md`
- `deliverables/00_admin/locks.md`
- `deliverables/00_admin/changelog.md`

Generated asset directories are intentionally unversioned or batch-versioned by folder:

- `deliverables/20_guides/refs/`: local reference images declared by the latest asset guide
- `deliverables/40_boards/generated/`: generated storyboard sheets
- `deliverables/50_art/generated/`: draft or review art keyframes that are not reference-bound
- `deliverables/50_art/generated_ref_v{N}/`: production candidate keyframes generated with required image references
- `deliverables/60_motion/generated/`: generated video clips or platform exports, if saved locally

Every generated asset directory should include a `README.md` or manifest with source artifact, asset count, reference mode, and known limitations.

## Artifact Format

Every created or updated production deliverable should begin with artifact metadata:

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

All current production deliverables should include this metadata. If a legacy file lacks metadata, repair it before editing content.

## Versioning Rules

When saving a new version:

1. Read the current highest version.
2. Move the previous current file to the matching `archives/<stage>/` directory.
3. Save the new file to `deliverables/<stage>/..._v{N+1}.md`.
4. Update the artifact metadata `version`.
5. Preserve or update `upstream` and `locks`.
6. Append a short entry to `deliverables/00_admin/changelog.md`.

Do not create `deliverables/*/archive/` directories.

If there is no current file for a stage, create `v1` directly in `deliverables/<stage>/`.

## Codex Role Routing

Use these role responsibilities locally by default. Use the matching subagent spec when spawning is explicitly requested:

- `project-director`: `.codex/agents/project-director.toml`
- `script-writer`: `.codex/agents/script-writer.toml`
- `guide-director`: `.codex/agents/guide-director.toml`
- `storyboard-director`: `.codex/agents/storyboard-director.toml`
- `artist-director`: `.codex/agents/artist-director.toml`
- `animation-director`: `.codex/agents/animation-director.toml`
- `qa-check`: `.codex/agents/qa-check.toml`

## Skill Assembly Slots

Use `.agents/skill_registry.md` to resolve replaceable workflow capability slots. The slot is the stable contract; the skill listed there is only the current implementation.

Important slots:

- `script.primary`: creates, revises, audits, times, and exports script artifacts for `deliverables/10_story/`; current default is `screenwriter-workflow`.
- `story.mckee_router`: routes structure, audit, rewrite, scene repair, pacing, variation, and source tasks for script work; current default is `mckee-coordinator`.
- `guides.primary`: creates asset and style guides for `deliverables/20_guides/`.
- `storyboard.prompt_adapter`: creates `04_storyboard_prompts_v{N}.md`; current default is `storyboard-nanobanana`.
- `art.prompt_builder` and `art.platform_adapter`: create still-image prompt artifacts and platform-specific prompt blocks.
- `video.prompt_builder` and `video.motion_adapter`: create `06_video_prompts_v{N}.md`; current defaults are `video-prompt-workflow` and `video-motion-design`.
- `qa.primary`: performs stage, regression, final, and workflow QA.

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

When legacy workflow files mention missing granular skills such as `storyboard-output-format`, `art-platform-jimeng`, or `qa-script-check`, map them to the actual consolidated skills:

- storyboard output and prompt generation: `storyboard-workflow`, `storyboard-analysis`, `storyboard-nanobanana`
- asset and style guide generation: `guide-workflow`
- art platform rules: `art-prompt-workflow`, `art-platform-rules`
- video platform rules: `video-prompt-workflow`, `video-motion-design`
- QA checks: `qa-workflow`, `qa-checklists`
- formatting and versioning: `artifact-formatter`, `version-management`

## Normal Workflow

Use this sequence unless the user asks for a specific stage:

1. Script: produce or update `01_script_v{N}.md`; optionally produce `01_audit_report_v{N}.md`.
2. Guides: produce or update asset and style guides before visual prompt work using `guide-workflow` or the `guides.primary` slot replacement.
3. Storyboard: produce or update `03_storyboard_v{N}.md`.
4. Board prompts: produce or update `04_storyboard_prompts_v{N}.md`.
5. Art prompts: produce or update `05_art_prompts_v{N}.md`.
6. Keyframes: generate or register keyframes under the canonical generated asset directories when requested.
7. Video prompts: produce or update `06_video_prompts_v{N}.md`.
8. QA: check locks, upstream version consistency, character DNA, visual continuity, generated asset manifests, motion logic, and downstream impact.

If a user asks for a specific stage, do that stage directly after checking prerequisites.

## Image Generation Contract

Local reference images declared in the latest asset guide are production inputs, not decorative documentation. Markdown image links inside the asset guide do not automatically reach an image model.

Before generating any image that contains a named character or continuity-critical object:

1. Read the latest `02_asset_guide_v{N}.md`.
2. Resolve every relevant local reference image path from that asset guide.
3. Confirm the referenced image files exist on disk.
4. Load or attach the matching reference images into the active image-generation context before calling the image tool or external platform.
5. State each reference image role in the prompt, for example `<Character> identity reference`, `<Character> costume reference`, or `<Object> prop reference`.
6. Use text DNA from the asset guide only as a supplement to visual references, not as a replacement.

If the active image tool or platform cannot consume required image references, mark outputs as `text_only_draft` or `text_dna_draft` in the generated folder README and do not treat them as continuity-approved production assets.

Use `image_reference_bound` in the generated folder README only when the required local reference images were actually attached or loaded during generation.

## Quality Gates

Before changing downstream artifacts, verify:

- required upstream files exist
- latest numeric versions are being used
- `locks.md` and per-artifact locks are respected
- artifact `version` matches the filename suffix
- upstream artifact IDs exist in current or archived artifacts
- character descriptions match the latest asset guide when one exists
- character reference image paths in the latest asset guide exist on disk
- production image generation used relevant local image references, not text-only descriptions
- style work has a style guide, or the absence is called out explicitly
- storyboard shot counts and duration agree across script, storyboard, board prompts, art prompts, and video prompts
- generated asset folders include manifests with source artifact, count, reference mode, and limitations
- any replacement skill selected in `.agents/skill_registry.md` exists and satisfies the relevant slot interface

If an upstream artifact changes, list downstream artifacts that may need inspection, revision, or regeneration.

## QA Output

- Quick state checks can be reported in chat only.
- Stage QA, final QA, workflow audits, and regression checks that affect future work should be saved under `deliverables/00_admin/qa_reports/`.
- QA findings should separate structural checks, continuity checks, production feasibility, and creative taste recommendations.

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

Be concrete and file-backed. Report current state, blocker, and next action. Keep creative judgment separated from structural QA: structure, continuity, and production feasibility are checks; taste is a recommendation.

For story/script work, McKee packets, audits, QA findings, iteration gates, shotlists, and user-facing handoffs, default to Simplified Chinese unless the user explicitly requests another language. Keep file paths, artifact IDs, version suffixes, fixed decision tokens, and standard screenplay labels unchanged when useful.
