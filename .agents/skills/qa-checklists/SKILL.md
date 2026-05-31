---
name: qa-checklists
description: Quality checklists for the shotlist-first workflow. Use when performing script, guide, shotlist breakdown, prompt-envelope, HTML/preview, generated test, or regression QA.
---

# Quality Checklists

Use these checklists for stage QA, batch QA, regression QA, and final delivery review.

## Output Language

When reporting checklist results to the user or saving a QA report, translate checklist item names and explanations into Simplified Chinese by default. Keep technical tokens such as paths, artifact IDs, reference modes, `SB###`, `P###`, `P0/P1/P2/P3`, and `no action / inspect / regenerate / blocked` unchanged when they are part of the workflow contract.

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

- [ ] File path is `deliverables/30_breakdown/03_shotlist_breakdown_v{N}.md`.
- [ ] Legacy `03_storyboard_v{N}.md` input, if used, is explicitly marked as migration source.
- [ ] Every shot block has `SB###`, source scene, plan, camera/lens, performance micro-beats, assets/blocking gate, and QA notes.
- [ ] Shot-block count matches the summary table.
- [ ] Section durations add up to the target runtime or explain variance.
- [ ] Future `P###` prompt-envelope ranges are unique, monotonic, and tied to shot blocks.
- [ ] Character positions, eyelines, axis direction, entrances/exits, and spatial continuity are coherent.
- [ ] Key props, screens, vehicles, crowd movement, and practical light sources are marked in the relevant rows.
- [ ] Missing guides, missing references, draft reference status, and spatial-blocking gaps are visible before Phase 4.
- [ ] Any scope above 10 prompt envelopes is split into 4-8 envelope batches or tight dramatic clusters.

## Shotlist Prompt Envelope QA

- [ ] Every envelope cites its source `SB###` row and `P###` ID.
- [ ] Reference handles include concrete visual facts, or explicitly label `text_dna_draft`, `text_only_draft`, `prompt_only`, or `image_reference_bound`.
- [ ] Camera is physically planted: position, facing direction, foreground/midground/background, and first-frame composition are stated.
- [ ] Action path is decomposed into physical steps with object contact, eyeline, body movement, and end state.
- [ ] Micro-beats are specific to the exact character, shot, and emotional turn; generic repeated beats fail.
- [ ] Failure locks are shot-specific and name likely model errors.
- [ ] Adjacent-beat boundaries prevent earlier/later action from leaking into this prompt.
- [ ] Dialogue, if present, is constrained to the correct speaker and shot.
- [ ] Forbidden elements from locks are preserved, including no captions, logos, watermarks, or unapproved story beats.

## Shotlist HTML / Preview QA

- [ ] HTML contains every expected `SB###` and `P###` in order.
- [ ] Prompt envelope count matches the breakdown or approved scope.
- [ ] Copy buttons, filters, or search affordances do not alter prompt text.
- [ ] Preview manifest entry count matches prompt envelope count, unless entries are marked `prompt_only`.
- [ ] Every embedded `<img src>` is relative and points to an existing file.
- [ ] Preview images are rough e-conte planning aids and do not claim final keyframe status.
- [ ] Manifest records source artifact, scope, asset count, reference mode, and known limitations.
- [ ] HTML and manifest use the same reference status labels.

## Generated Assets And Video Tests

- [ ] Generated folders include a README or manifest.
- [ ] Manifest states source artifact, source prompt envelope, count, reference mode, and known limitations.
- [ ] `image_reference_bound` is used only when required references were actually loaded or attached.
- [ ] `text_dna_draft`, `text_only_draft`, and `prompt_only` outputs are not called production-approved.
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
| Shotlist breakdown | shotlist HTML, preview manifest, generated tests | `SB###`, `P###`, duration, composition, narrative function |
| Shotlist HTML | previews, generated tests | prompt text, handles, reference mode, copy behavior |
| Preview manifest | HTML and preview files | path existence, count parity, reference status |
| Generated video test | prompt batch and QA report | model failure modes and retry guidance |
| Skill registry | affected role and stage outputs | replacement skill exists, preserves paths, satisfies slot interface |

Regression conclusion must list:

- changed artifact
- impacted artifacts
- required action: no action / inspect / regenerate / blocked
