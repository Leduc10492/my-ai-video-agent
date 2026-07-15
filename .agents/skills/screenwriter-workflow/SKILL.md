---
name: screenwriter-workflow
description: Script-stage controller for this file-based AI video workflow. Use as the default script.primary skill when creating, revising, iterating, auditing, timing, cutting, polishing, or exporting script artifacts. It applies the Screenwriter writing mode as the main user-facing workflow, uses McKee skills as structure plugins, and preserves deliverables/10_story artifact versioning.
---

# Screenwriter Workflow

## Desktop Candidate Runtime

When the macOS app invokes this Skill in Candidate Runtime, these rules override all file-based input, save, versioning, archive, changelog, and handoff steps below:

- Use only `context.json` and `RUN_RULES.md` supplied in the current run directory as project and runtime inputs. Do not scan or read the repository, `deliverables/`, `archives/`, `.agents/skill_registry.md`, or any other project path, and do not infer omitted state.
- Treat the run as read-only. Do not create, edit, delete, move, rename, or archive files or directories; do not write SQLite or invoke shell/network side effects.
- Stay inside the supplied `scopeIds`. Propose operations only for scoped entities, or scoped descendants and links explicitly exposed by `context.json` and permitted by `RUN_RULES.md`. Report any needed out-of-scope change in `summary` instead of proposing it.
- Return exactly one JSON object conforming to `draft-operations.schema.json`, with `summary` and `operations` as its only top-level fields. Every item in `operations` is a `DraftOperation`; encode its `payload` as the JSON string required by the schema. Return no Markdown or commentary outside that JSON object.
- For `patch`, `reorder`, or `archive` on an existing entity, copy its `currentRevisionId` from `context.json` exactly into `baseRevision`. Use `baseRevision: null` for `create`, `link`, or `unlink` unless `RUN_RULES.md` supplies a different mapping contract. Never invent a revision ID; omit the operation and explain the limitation in `summary` when the required current revision is absent.
- The app validates and stores the candidate, obtains user approval, applies formal revisions and dependency invalidation, and owns version increments, archives, changelog updates, deliverable rendering, and all file writes. Do not perform or simulate those steps in Candidate Runtime.

## Slot Compatibility

- slot: `script.primary`
- contract_version: `1`
- canonical_outputs:
  - `deliverables/10_story/01_script_v{N}.md`
  - `deliverables/10_story/01_audit_report_v{N}.md`
- qa_handoff: `qa.primary`
- state_contract: `n/a`

This is the script-stage controller for `script-writer`.

It turns the global Screenwriter craft mode into a repo-compatible workflow:

- `script-writer` owns file scope, versions, locks, changelog, and downstream impact.
- `screenwriter-workflow` owns the writing mode: intake, one-version iteration, screenplay style, Chinese user-facing output, timing/cutdown, and final script shape.
- `mckee-*` skills are structure plugins used only when the current task needs story-spine creation, audit, rewrite planning, scene diagnosis, pacing, variations, or source lookup.
- These plugins are optional. If the active registry does not bind `story.mckee_router`, continue with the general screenplay principles in this Skill and report the optional dependency as unavailable; never invent or silently substitute source material.

Do not make `mckee-create` the default script-writing entrance. For new script creation, use this workflow as the entrance and use McKee output as a structure packet.

## Required State Scan

Before substantial script work, read:

1. `deliverables/00_admin/locks.md`
2. Latest `deliverables/10_story/01_script_v{N}.md`, if present
3. Latest `deliverables/10_story/01_audit_report_v{N}.md`, if relevant
4. `.agents/skill_registry.md`
5. The specific McKee skill only when needed and actually available in the active registry

Find the highest numeric version suffix. Do not assume `v1`.

## Screenwriter Mode

Use these rules for all user-facing script work:

- Default to Simplified Chinese unless the user asks otherwise.
- This default applies to scripts, outlines, treatments, beat sheets, structure packets, iteration gates, audit reports, QA summaries, changelog descriptions, handoff notes, and chat responses.
- Keep skill files, internal method names, artifact IDs, paths, and fixed decision tokens in English when useful; translate the surrounding explanation and table labels into Chinese.
- If source material is in another language, preserve quoted dialogue or exact source labels in that language only when needed for accuracy. Explain the analysis in Chinese.
- Write screenplay content as visible and audible action, not prose interiority.
- Keep `INT.`, `EXT.`, `CUT TO:`, `FADE IN:`, and similar screenplay labels in standard form when useful.
- Give one strong version by default, not multiple alternatives.
- If context is missing, ask one narrow question; do not invent canon.
- If the user asks for a small revision, change only the requested target.
- Estimate runtime by beats and scene type, not by page count alone.
- Treat Campbell and Aristotle as secondary diagnosis frames:
  - Campbell: call, refusal, threshold, mentor/shadow, ordeal, return.
  - Aristotle: hamartia, reversal, recognition, catharsis, unity of action.

## Story Bone Intake

Use this before `Structure Draft` for a new concept, a substantial rewrite, or a loose story idea. The goal is to lock the user's story skeleton before drafting, not to create a theory-heavy questionnaire.

The Story Bone fields are:

- story sentence
- protagonist
- want
- why now
- strongest obstacle
- midpoint irreversible change
- final cost
- ending state or image
- must avoid
- target length / format / genre / tone

Behavior:

- If the user already provides a clear story path, render it as a Story Bone and proceed to `Structure Draft`.
- If the user gives only a concept, infer a concise Story Bone and ask the user to confirm or correct it before writing a full script.
- If only a few high-impact fields are missing, ask only 1-3 narrow questions.
- Do not use a long theoretical questionnaire.
- Load `templates/story-bone-intake.template.md` when creating or recording a Story Bone.
- Set `ready_for_structure: yes` only when protagonist, want, why-now pressure, obstacle, irreversible midpoint, final cost, ending state, and target length/format are present or defensibly inferred.
- For character speech, keep only three constraints per key character when useful: what they would not say, when they tell the truth, and how they avoid emotion.
- Do not create a large character voice package as a mandatory workflow step.
- Do not turn adaptation or comparison handling into default intake. Comparison material remains task-level QA only.

## Iterative Screenplay Mode

Use this mode whenever the task involves a feature, episode, short, substantial rewrite, comparison exercise, or `.docx` export candidate.

Do not write once and export. First classify the current script layer:

- `Story Bone`: story skeleton is missing, inferred but unconfirmed, or too vague to support structure drafting.
- `Structure Draft`: story spine is missing or unproven.
- `Density Draft`: spine works, but too many functions are compressed into broad scenes.
- `Runtime Draft`: density works, but the draft is over target.
- `Dialogue/Texture Draft`: structure, density, and runtime are acceptable; everyday texture, ordinary reactions, silence, unsaid emotion, dialogue identity, or action-line craft still need work.
- `Export Candidate`: P0/P1 checks pass and P2 issues are acceptable.

Load `templates/script-iteration-ladder.template.md` when planning or documenting a multi-version script iteration.

Iteration rules:

- Each new version must solve one primary problem only: story bone, structure, density, runtime, or dialogue/texture.
- For loose concepts, do not skip Story Bone and jump straight to full script drafting.
- Do not change premise, character canon, ending, or core genre just to fix density or runtime.
- If density is weak, split scenes into daily life, relationship, side-character pressure, obstacles, and action details; do not invent a new plot.
- If runtime is long, cut duplicate beats and compress transitions without removing crisis, climax, recognition, motif payoff, or agency turns.
- If dialogue or texture is weak, polish existing scenes; do not add plot unless the gate identifies a P0-P2 structural reason.
- A feature-length first draft may validate spine, but it should not be treated as a final DOCX candidate.

Task-level comparison material:

- If the user provides comparison material, use it only for abstract structure-density, rhythm, function coverage, and production-readiness checks.
- Do not include material-gathering procedures in this reusable skill.
- Do not save, quote, translate, or closely paraphrase comparison text inside reusable skill instructions.
- Persistent reports must state the comparison material status, whether it is verified official, and whether the comparison is function-level only.

## McKee Plugin Use

Use `story.mckee_router` (`mckee-coordinator`) as the internal router.

If that slot is absent, skip this section and continue with the core Screenwriter flow. Do not search outside the registered Skill pack.

The McKee plugins return structure packets, not final user-facing script ownership. A structure packet can include:

- logline
- controlling idea
- value axis and value movement
- protagonist desire and opposition
- inciting incident
- progressive complications
- crisis
- climax
- resolution
- scene function table
- causality risks
- P0-P3 structural findings
- rewrite priorities

Then this workflow turns the packet into screenplay pages, revision notes, or repo artifacts.

All McKee packets that are shown to the user or saved as repo artifacts must be rendered in Simplified Chinese by default, even if the plugin SKILL.md uses English method labels internally.

### Plugin Selection

- New concept or weak premise: read `mckee-create` for story spine and scene-outline support, then write through Screenwriter mode.
- Existing draft diagnosis: read `mckee-audit`, then package results into `01_audit_report_v{N}.md` when a persistent report is needed.
- Known structural problems: read `mckee-rewrite-plan`.
- One flat scene: read `mckee-scene-doctor`.
- Rhythm, density, exposition, or tension: read `mckee-expand-pace`.
- Explicit request for alternatives: read `mckee-variations`.
- Explicit request for McKee source text or quotes: read `mckee-source`; keep quotes brief and use paraphrase when possible.

Do not load `mckee-source` for ordinary writing, audit, or rewrite work.

## Script Creation Flow

For a new concept:

1. Create or confirm a Story Bone using `templates/story-bone-intake.template.md`.
2. If `ready_for_structure: no`, ask 1-3 critical questions or present the inferred Story Bone for confirmation; do not write a full script yet.
3. Identify the main story engine, such as time, secret, task, misunderstanding, spatial limit, identity change, countdown, or relationship pressure.
4. After the Story Bone is ready, build a structure packet using Screenwriter principles plus McKee support when useful.
5. Create a runtime map before drafting substantial pages.
6. Draft the first saved version as the smallest useful structure or density draft for the target format.
7. Add a short craft note: story engine, value movement, causal spine, risk points, measurable density, and estimated runtime.
8. Save only when the user asks for a production artifact or the stage task clearly requires a deliverable.

For a complete or near-complete draft:

1. Preserve the user's material as source truth.
2. Diagnose structure before polishing dialogue.
3. When revising, keep edits scoped to the requested goal.
4. If the revision changes story facts, list downstream guide, shotlist breakdown, shotlist HTML, preview, and QA artifacts that may need inspection.

## Iteration Quality Gate

Use `templates/iteration-quality-gate.template.md` before creating a new script version or exporting a derived `.docx`.

The gate decides whether to revise structure, expand density, cut runtime, polish dialogue/action, hold the current version, or export. It must check Story Bone readiness, main story engine, structure drift, story spine, causality, protagonist agency, second-side agency, copyright distance, runtime density, motif payoff, Screenwriter style, dialogue/texture constraints, concise Anti-AI risks, production feasibility, scene/transition count, screenplay body lines, dialogue cue count, overloaded scenes, and executable rescue/action chain where relevant.

Create the smallest useful next script version only when the gate finds a real P0-P2 issue or a clearly bounded P3 polish pass requested by the user. Do not keep rewriting just because another pass is possible.

Use only these gate decisions:

- `revise_structure`
- `expand_density`
- `cut_runtime`
- `polish_dialogue`
- `export_docx`
- `hold_current`

## Artifact Contract

When writing a production script artifact:

- Path: `deliverables/10_story/01_script_v{N}.md`
- Use artifact metadata at the top.
- If no current script exists, create `v1`.
- If revising a current script, archive the previous current file to `archives/10_story/` before saving `v{N+1}`.
- Preserve the same artifact id across versions of the same script.
- Append a short entry to `deliverables/00_admin/changelog.md`.

When writing a persistent audit:

- Path: `deliverables/10_story/01_audit_report_v{N}.md`
- Use artifact metadata.
- Use Chinese headings, table headers, issue descriptions, evidence, impact, and fix recommendations unless the user asks for another language.
- Separate structure, continuity, production feasibility, and taste recommendations.
- Lead with P0/P1 blockers when present.

Keep `.docx` exports as optional derived files when the user asks for them. The Markdown file in `deliverables/10_story/` remains the source of truth for this repo.

For standard screenplay DOCX export, use `.agents/skills/screenwriter-workflow/scripts/export_screenplay_docx.js` on the current Markdown script after the iteration quality gate passes.

## Handoff

After script work, report:

- files created, updated, or archived
- current script and audit versions
- unresolved assumptions
- downstream artifacts to inspect or regenerate

Report the handoff in Simplified Chinese by default.

Next normal stage is `guide-director` / `guides.primary`, then `shotlist.breakdown`, unless the user explicitly skips guides.
