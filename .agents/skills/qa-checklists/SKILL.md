---
name: qa-checklists
description: Quality checklists for each workflow stage (script, storyboard, art, video). Use when performing quality checks at any stage.
---

# Quality Checklists

Use these checklists for stage QA, regression QA, and final delivery review.

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
- [ ] The style guide can support storyboard prompts, still art prompts, and video prompts.

## Storyboard Stage

- [ ] Every shot has a shot ID, beat, duration, camera size, camera movement, visual description, and narrative function.
- [ ] Total shot count matches the storyboard statistics.
- [ ] Section durations add up to the target runtime.
- [ ] Character positions follow the asset guide relationship rules.
- [ ] Axis, gaze direction, and spatial continuity are coherent.
- [ ] Key props appear in the required shots.

## Storyboard Prompt Stage

### Character DNA
- [ ] Every prompt involving a named character uses the full asset-guide DNA.
- [ ] Generic labels such as `a girl` or `a woman` are not used as substitutes.
- [ ] Hairstyle, eye color, costume, and symbolic props remain stable.

### Sheet Layout
- [ ] Grid layout matches the batch shot count.
- [ ] Panel labels match the shot range.
- [ ] Prompt stays in storyboard sketch style, not final colored art.
- [ ] Negative constraints include no realism, no finished illustration, no vertical text, and no watermark.

## Art Prompt And Keyframe Stage

### Reference Images
- [ ] Latest asset guide is read before generation.
- [ ] Every local reference image linked from the asset guide exists.
- [ ] Relevant reference images are loaded or attached before any production character image generation.
- [ ] Prompt labels image roles explicitly, such as `<Character> identity reference` or `<Character> costume reference`.
- [ ] Text DNA supplements the reference image; it does not replace it.
- [ ] If the platform cannot use reference images, outputs are marked `text_only_draft`.
- [ ] Generated folder contains a README or manifest with `source_prompt_artifact`, `image_count`, `reference_mode`, and known limitations.

### Character Continuity
- [ ] Character features match the reference image and asset-guide DNA.
- [ ] Face, hair silhouette, costume, and body proportion do not drift between adjacent shots.
- [ ] Adult styling adaptations are called out separately from school identity references.
- [ ] Expressions remain restrained unless the script explicitly requires escalation.

### Style Continuity
- [ ] Style guide is referenced.
- [ ] Section color temperature matches the style guide.
- [ ] Lighting and texture stay consistent across the section.
- [ ] Composition supports the narrative function.

### Platform Format
- [ ] Jimeng, Midjourney, and Nano Banana syntax are not mixed.
- [ ] Every prompt states platform and source shot.
- [ ] Platform parameters are placed correctly.
- [ ] Negative constraints include identity drift, changed hairstyle, changed costume, random text, logo, watermark, and vertical text.

## Video Prompt Stage

### Motion Logic
- [ ] Character movement follows physics and the storyboard.
- [ ] Camera movement supports narrative function.
- [ ] Motion speed and amplitude match the emotional tone.
- [ ] Adjacent shots do not create direction or identity jumps.

### Image-To-Video
- [ ] Every image-to-video prompt references a specific keyframe path.
- [ ] Motion prompt does not ask for major identity, hair, or costume changes from the source image.
- [ ] Source keyframe composition can support the requested camera movement.
- [ ] Same character does not drift across adjacent video shots.

## Regression Matrix

| Upstream Change | Downstream To Check | Focus |
| --- | --- | --- |
| Script | audit, asset/style guide, storyboard, all prompts | beat, motivation, motif arc, duration |
| Guide slot or guide content | storyboard prompts, art prompts, generated images, video prompts | DNA, style, refs, props, locations |
| Asset guide | storyboard prompts, art prompts, generated images, video prompts | DNA, costume, props, reference images |
| Character reference image | art prompts, generated images, video prompts | identity anchor, face, hair, costume |
| Style guide | storyboard prompts, art prompts, generated images, video prompts | color temperature, lighting, texture |
| Storyboard | board prompts, art prompts, video prompts | shot ID, duration, composition, narrative function |
| Board prompts | generated storyboard sheets, art prompts | character consistency, grid, panel labels |
| Art prompts/keyframes | video prompts | keyframe path, motion amplitude, identity preservation |
| Skill registry | affected role and stage outputs | replacement skill exists, preserves paths, satisfies slot interface |

Regression conclusion must list:

- changed artifact
- impacted artifacts
- required action: no action / inspect / regenerate / blocked
