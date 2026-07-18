---
name: qa-checklists
description: Quality checklists for the shotlist-first workflow. Use when performing script, guide, shotlist breakdown, prompt-envelope, HTML/preview, generated test, or regression QA.
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
- [ ] The style guide can support Seedance/Higgsfield shotlist prompts and e-conte previews.

## Shotlist Breakdown Stage

- [ ] File path is `deliverables/30_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md`.
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

## Shotlist Prompt Envelope QA

- [ ] Every envelope cites its source scene/shot row and `P###` ID.
- [ ] Reference handles include concrete visual facts and the manifest records all four `reference-state-v2` fields.
- [ ] Camera is physically planted: position, facing direction, foreground/midground/background, and first-frame composition are stated.
- [ ] Action path is decomposed into physical steps with object contact, eyeline, body movement, and end state.
- [ ] Micro-beats are specific to the exact character, shot, and emotional turn; generic repeated beats fail.
- [ ] Failure locks are shot-specific and name likely model errors.
- [ ] Adjacent-beat boundaries prevent earlier/later action from leaking into this prompt.
- [ ] Dialogue, if present, is constrained to the correct speaker and shot.
- [ ] Exact source dialogue count and order match the selected Scene; raw speaker cues and spoken wording are unchanged.
- [ ] Every spoken line has one distinct lip-sync Shot Row/internal shot; source-marked `O.S.` / `V.O.` lines remain explicit off-screen audio.
- [ ] Speaker and addressee follow current Scene action, adjacent exchange, eyeline, and blocking; ambiguity is reported, while guessed names, generic stand-ins, and unexplained self-direction fail.
- [ ] Forbidden elements from locks are preserved, including no captions, logos, watermarks, or unapproved story beats.

## Shotlist HTML / Preview QA

- [ ] HTML and its Scene Breakdown are inside the same `deliverables/30_shotlist/<scene-label>_v{N}/` folder.
- [ ] Common assets are referenced from `deliverables/20_assets/`; only scene-specific assets are stored under the scene package `assets/`.
- [ ] HTML contains every expected source scene, shot row, and `P###` in order.
- [ ] Prompt envelope count matches the breakdown or approved scope.
- [ ] Copy buttons, filters, or search affordances do not alter prompt text.
- [ ] Search and plan filters preserve complete Prompt Envelope row groups; a later matching Row never remains visible after the first `rowspan` Row carrying its prompt/source/preview cells is hidden.
- [ ] When preview generation was authorized, preview manifest entry count matches Prompt Envelope count.
- [ ] In `prompt_only`, HTML shows a visible text state and does not require a preview manifest.
- [ ] Every generated `<img src>` is relative and points to an existing file.
- [ ] Preview images are rough e-conte planning aids and do not claim final keyframe status.
- [ ] Manifest records source artifact, scope, asset count, all four reference-state fields, and known limitations.
- [ ] HTML metadata and manifest use the same reference-state values.
- [ ] Independent QA derives expected Scenes, dialogue, IDs, and paths from the script and final files rather than trusting builder decisions or manifest counts.
- [ ] A deliberately corrupted temporary copy fails for missing/duplicate dialogue, reused lip-sync Row, duplicate/gapped `P###`, placeholder, or broken preview state.
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
| Script | audit, guides, shotlist breakdown, shotlist HTML, previews | beat, motivation, motif arc, duration |
| Guide slot or guide content | shotlist breakdown, prompt envelopes, previews, generated tests | DNA, style, refs, props, locations |
| Asset guide | prompt handles, generated references, generated video tests | DNA, costume, props, reference images |
| Character reference image | prompt handles, previews, generated tests | identity anchor, face, hair, costume |
| Style guide | prompt envelopes, previews, generated tests | color temperature, lighting, texture |
| Shotlist breakdown | shotlist HTML, preview manifest, generated tests | scene labels, shot rows, `P###`, duration, composition, narrative function |
| Shotlist HTML | previews, generated tests | prompt text, handles, reference mode, copy behavior |
| Preview manifest | HTML and preview files | path existence, count parity, reference status |
| Generated video test | prompt batch and QA report | model failure modes and retry guidance |
| Skill registry | affected role and stage outputs | replacement skill exists, preserves paths, satisfies slot interface |

Regression conclusion must list:

- changed artifact
- impacted artifacts
- required action: no action / inspect / regenerate / blocked
