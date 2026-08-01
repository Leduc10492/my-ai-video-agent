---
name: qa-checklists
description: Quality checklists for the shotlist-first workflow. Use when performing script, guide, shotlist breakdown, Prompt compilation, final HTML, generated test, or regression QA.
---

# Quality Checklists

## Slot Compatibility

- slot: `qa.checklists`
- contract_version: `1`
- canonical_outputs:
  - `stage-specific checklist results`
- qa_handoff: `qa.primary`
- state_contract: `reference-state-v2`

Use these checklists for stage QA, batch QA, regression QA, and final delivery review.

## Output Language

When reporting checklist results to the user or saving a QA report, translate checklist item names and explanations into Simplified Chinese by default. Keep technical tokens such as paths, artifact IDs, reference-state values, scene labels, shot-row IDs, `P###`, `P0/P1/P2/P3`, and `no action / inspect / regenerate / blocked` unchanged when they are part of the workflow contract.

## Artifact Structure

### Metadata

- [ ] Production markdown starts with `# Artifact: <Type>`.
- [ ] `id` follows `A-yyyymmdd-nnn`.
- [ ] `version` matches the filename suffix `_v{N}`.
- [ ] `upstream` IDs exist in current or archived artifacts.
- [ ] `locks` includes `must_keep`, `must_avoid`, and `budget_notes`.

### Path And Version

- [ ] Current version is under `deliverables/<stage>/`.
- [ ] Previous version is under `archives/<stage>/`.
- [ ] No `deliverables/*/archive/` directory is used.
- [ ] The latest numeric version is selected as the current input.
- [ ] Changelog records the change.

## Script Stage

- [ ] The current script has a same-version audit report before guides or shotlist production begin.
- [ ] The audit has no unresolved P0/P1 production blockers; otherwise downstream handoff is blocked.
- [ ] Inciting incident is present and specific.
- [ ] Crisis and climax test the protagonist's central conflict.
- [ ] Three-act rhythm is proportionate to the intended duration.
- [ ] Character desire and motivation stay consistent.
- [ ] Key props and motifs are introduced before they pay off.
- [ ] Estimated runtime stays within budget.

## Guide Stage

### Asset Guide

- [ ] Character DNA is specific and avoids generic labels.
- [ ] Costume, age/time variants, props, locations, and continuity rules are separated clearly.
- [ ] Every local reference image path exists or is explicitly marked missing.
- [ ] Reference roles are labeled, such as `<Character> identity reference` or `<Prop> prop reference`.
- [ ] Missing references list downstream production blockers.

### Style Guide

- [ ] Palette, lighting, texture, composition, and negative style rules are defined.
- [ ] Style language is platform-neutral unless a platform-specific section is labeled.
- [ ] The style guide can support Prompt compilation and final HTML integration.

## Shotlist Breakdown Stage

- [ ] File path is `deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md`.
- [ ] The source script and source audit versions match, and the audit has no unresolved P0/P1.
- [ ] Legacy `03_storyboard_v{N}.md` input, if used, is explicitly marked as migration source.
- [ ] A lightweight Scene queue was made from IDs/sluglines and line ranges; the selected Scene position and adjacent labels match it.
- [ ] Only the selected Scene body and boundary evidence entered directing/prompt context; the full screenplay body was not used for one-pass Shot Rows or Prompts.
- [ ] The Breakdown covers exactly one Scene and records its script header plus opening/closing source boundaries.
- [ ] Action beat map lists source scene, action/dialogue source, emotional turn, visual focus, asset need, and blocking need.
- [ ] Section durations add up to the target runtime or explain variance.
- [ ] Shot rows use `<scene-label>-R<NN>`; future or drafted `P###` prompt envelopes are unique, reserved, and tied to source rows.
- [ ] Character positions, eyelines, axis direction, entrances/exits, and spatial continuity are coherent.
- [ ] Key props, screens, vehicles, crowd movement, and practical light sources are marked in the relevant rows.
- [ ] Missing guides, missing references, draft reference status, and spatial-blocking gaps are visible before Phase 4.
- [ ] Production scope follows screenplay scenes first; overloaded scenes are split by action phase, camera setup, or reference-set change.
- [ ] Production batches prefer 4-8 Prompt Envelopes; more than 10 is split-required and each batch has a QA checkpoint.

## Compiled Prompt Boundary QA

- [ ] `shotlist.prompt_compiler` resolves to one existing Skill and its implementation name is recorded.
- [ ] Every approved Prompt Envelope maps to exactly one compiled result with the same `P###` and source Rows.
- [ ] The compiler received the approved beat boundary, duration, dialogue, blocking, active asset tags/routes, reference-fitness findings, and style facts.
- [ ] The compiler result passed that Skill's own acceptance gate; QA does not substitute a second Prompt grammar.
- [ ] Exact source dialogue count, order, raw cues, wording, addressee evidence, and lip-sync/off-screen mapping remain unchanged.
- [ ] The final HTML embeds each compiled Prompt byte-for-byte.
- [ ] Project state, Row IDs, QA prose, and workflow mapping remain outside copyable Prompt blocks.

## Shotlist HTML QA

- [ ] HTML and its Scene Breakdown are inside the same `deliverables/3_shotlist/<scene-label>_v{N}/` folder.
- [ ] Common assets are referenced from `deliverables/2_assets/`; only scene-specific assets are stored under the scene package `assets/`.
- [ ] HTML contains every expected source scene, shot row, and `P###` in order.
- [ ] Prompt envelope count matches the breakdown or approved scope.
- [ ] Copy buttons, filters, or search affordances do not alter prompt text.
- [ ] Search and plan filters preserve complete Prompt Envelope row groups; a later matching Row never remains visible after the first `rowspan` Row carrying its Prompt/source cells is hidden.
- [ ] Manifest records source artifact, scope, asset count, all four reference-state fields, and known limitations.
- [ ] HTML metadata and manifest use the same reference-state values.
- [ ] Independent QA derives expected Scenes, dialogue, IDs, and paths from the script and final files rather than trusting builder decisions or manifest counts.
- [ ] A deliberately corrupted temporary copy fails for missing/duplicate dialogue, reused lip-sync Row, duplicate/gapped `P###`, unresolved placeholder, or broken Prompt-row grouping.
- [ ] Structural proof, browser proof, and generation proof are reported as separate conclusions.

## Generated Assets And Video Tests

- [ ] Generated folders include a README or manifest.
- [ ] Manifest states source artifact, source prompt envelope, count, all four reference-state fields, and known limitations.
- [ ] `reference_binding: images_attached` is used only when required references were actually loaded or attached.
- [ ] `production_approved` requires `images_attached`, `reference_approval: locked`, and an independent QA pass.
- [ ] Generated video tests list source `P###`, platform/settings, duration, aspect ratio, and file path.
- [ ] Video tests are checked for identity drift, empty backgrounds, wrong camera side, missing props, adjacent-beat leakage, and unapproved story beats.

## Regression Matrix

| Upstream Change | Downstream To Check | Focus |
| --- | --- | --- |
| Script | audit, guides, shotlist breakdown, compiled Prompts, shotlist HTML | beat, motivation, motif arc, duration |
| Guide slot or guide content | shotlist breakdown, compiled Prompts, shotlist HTML, generated tests | DNA, style, refs, props, locations |
| Asset guide | prompt handles, generated references, generated video tests | DNA, costume, props, reference images |
| Character reference image | compiled Prompts, shotlist HTML, generated tests | identity anchor, face, hair, costume |
| Style guide | compiled Prompts, shotlist HTML, generated tests | color temperature, lighting, texture |
| Shotlist breakdown | compiled Prompts, shotlist HTML, generated tests | scene labels, shot rows, `P###`, duration, composition, narrative function |
| Shotlist HTML | generated tests | Prompt text, handles, reference mode, copy behavior |
| Generated video test | prompt batch and QA report | model failure modes and retry guidance |
| Skill registry | affected role and stage outputs | replacement skill exists, preserves paths, satisfies slot interface |

Regression conclusion must list:

- changed artifact
- impacted artifacts
- required action: no action / inspect / regenerate / blocked
