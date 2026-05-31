---
name: sketch-shotlist-workflow
description: Project-local Seedance/Higgsfield shotlist production workflow. Use as the default shotlist.primary slot when turning a script, shotlist breakdown, scene range, or shot range into Chinese production HTML with 15-second prompt envelopes, hard quality gates, and embedded rough e-conte previews.
---

# Sketch Shotlist Workflow

This is the active production path for Seedance/Higgsfield work in this repository. It packages the shotlist-builder method into the project file contract, Chinese-facing HTML output, preview manifests, and rough e-conte preview handling.

The HTML shotlist is the prompt source of truth. Do not split the same scope into separate board-prompt, art-prompt, or standalone video-prompt artifacts.

## Inputs

Use the latest numeric version unless the user names a file or range:

- Required: `deliverables/30_breakdown/03_shotlist_breakdown_v{N}.md`, `deliverables/10_story/01_script_v{N}.md`, or a legacy `deliverables/30_breakdown/03_storyboard_v{N}.md`
- Optional: `deliverables/20_guides/02_asset_guide_v{N}.md`
- Optional: `deliverables/20_guides/02_style_guide_v{N}.md`
- Optional: uploaded references, local generated references, rough sketch references, keyframes, or generated video test results
- Optional: user-selected scene range, shot range, duration target, language, and image generation tool

If only a script is available, create or update a shotlist breakdown first unless the requested scope is very small and the user explicitly wants a draft.

## Outputs

Save current production files in `deliverables/60_motion/`:

- `Shotlist_<scope>_ZH_v{N}.html`
- `shotlist_previews_<scope>_v{N}/`
- `shotlist_previews_<scope>_v{N}/manifest.md`

Generated preview images are review assets, not production keyframes. Mark their reference status in the manifest:

- `text_only_draft`
- `text_dna_draft`
- `image_reference_bound`
- `prompt_only`

Generated video tests, if saved, belong under `deliverables/60_motion/generated/` with a manifest or README. They do not change the HTML source of truth.

## Four-Phase Shotlist Loop

### 1. Read Script Or Breakdown

- Parse scenes, beats, dialogue, action, emotional turns, and existing `SB###` / `P###` ranges.
- Define the requested scope before generating rows.
- Use Chinese visible labels and Chinese Seedance prompts unless the user requests otherwise.
- Preserve any existing shot row order and prompt envelope numbering.

### 2. List Required Assets

- Identify characters, locations, props, vehicles, screens, wardrobe states, and recurring visual anchors.
- Build a visual-fact table from every reference image before writing handles: face/hair/body, wardrobe, material/texture, prop geometry, location layout, light sources, foreground/background layers, and likely confusion risks.
- If required reference images are missing, state the missing list and continue only as draft when the user wants speed.
- Do not invent local reference paths.

### 3. Confirm Spatial Blocking

- Lock geography, screen direction, entrances/exits, eyelines, foreground/background ownership, and continuity constraints.
- Ask only for missing high-impact spatial choices.
- If a reference is only `text_dna_draft`, use it as direction only. Do not treat it as a continuity-approved production lock.
- After top-down blocking, lock prompt-level camera blocking for each prompt envelope: camera planted where, looking which direction, first-frame composition, foreground/midground/background, frame-edge slivers, and the one action that must read.

### 4. Generate HTML Shotlist

- Build shot rows with plan type, camera note, action beat, source content, prompt handles, and prompt envelope grouping.
- Use the local references:
  - `reference/PLAN_TYPES.md`
  - `reference/CAMERA_EMOTION.md`
  - `reference/MICRO_BEATS.md`
  - `reference/SPATIAL_BLOCKING.md`
  - `reference/PROMPT_DENSITY.md`
  - `reference/PROMPT_PATTERNS.md`
  - `reference/STYLE_BLOCK.md`
- Use `templates/HTML_TEMPLATE.md` as the HTML contract.
- Run the Prompt Quality Gate below on every prompt envelope before HTML assembly. A prompt that has the right headings but generic camera/action language must be rewritten, not passed through.

## Prompt Quality Gate

Every prompt envelope must pass all checks before it is considered stable enough for HTML or preview generation:

1. **Reference facts:** every handle contains concrete visible facts from its source image, or explicitly says the source is `text_dna_draft`. Characters need face/hair/body/wardrobe/identity markers; locations need camera-readable layout, light sources, foreground/background layers; props need shape/material/scale.
2. **Camera planted:** every prompt states where the camera is physically placed, what direction it faces, and what is in foreground/midground/background. A lens label alone fails.
3. **Frame composition:** every prompt describes first-frame composition with left/right/top/bottom or foreground/midground/background relationships, including frame-edge slivers or occlusions when relevant.
4. **Action path:** every prompt decomposes its action into timed or numbered physical steps. A line like `动作：门打开` or `动作：他很愤怒` fails unless it is expanded into body movement, object contact, eyeline, and end state.
5. **Micro-beats are unique:** do not reuse the same generic micro-beat set across prompt envelopes. Micro-beats must be tailored to the character, action, and emotional turn of this exact shot.
6. **Failure-mode lock:** every prompt must include shot-specific failure locks. Generic forbiddens are not enough. It must name what the model is likely to do wrong in this shot: wrong camera side, wrong object position, empty background, handle contamination, premature later beat, missing prop, wrong hand direction, etc.
7. **Adjacent-beat boundary:** when a scene is split into sequential prompt envelopes, each prompt states which earlier/later beat must not leak into this prompt.
8. **Reference status gate:** if required continuity images are only `text_dna_draft`, label the HTML, preview manifest, and any generated video test as draft/smoke-test artifacts. Do not call them final production or `image_reference_bound`.
9. **Batch pressure check:** when a scope produces more than 8 prompt envelopes, run a scene-by-scene self-audit before final HTML. Specifically check duplicate micro-beats, generic action lines, missing camera positions, copied failure locks, and adjacent-beat leakage.

## Batch Splitting Rule

Large scopes are allowed for planning, but not for unreviewed production output.

- **Preferred production batch:** 1 scene or 4-8 prompt envelopes.
- **Upper limit for one quality pass:** 10 prompt envelopes.
- **Anything larger than 10 envelopes:** split by scene or dramatic beat cluster, generate/review one batch at a time, then merge into the final HTML only after every batch passes the Prompt Quality Gate and QA review.
- **Long continuous action scenes:** split by camera setup and action phase, not by arbitrary count.
- **Review cadence:** after each batch, report blockers and corrected prompt IDs before moving on.

## E-conte Preview Layer

After prompt envelopes are stable, create one vertical rough e-conte preview image per prompt envelope.

Preview rules:

- One prompt envelope maps to one preview image.
- If the envelope contains multiple internal cuts such as `【镜头1】`, stack them as vertical panels in reading order.
- Preserve prompt envelope ID, source shot rows, handle tag, duration, and Chinese Seedance prompt text exactly.
- Do not merge, split, or reorder prompt envelopes just to make prettier preview pages.
- Use rough black-and-white or grayscale line art, not polished color key art.
- Use simple figures and readable staging; prioritize blocking over illustration quality.
- Add red camera frame boxes and blue motion arrows only as annotations when useful.
- Keep labels outside or below panels. Do not put necessary final-video text inside the image.
- Treat preview images as planning aids, not continuity-approved production keyframes.

Default preview format:

- portrait image, 9:16 or tall manga e-conte strip
- white page background
- black pencil/ink lines
- 2-5 stacked panels depending on internal beats
- Japanese e-conte / manga rough-board feeling
- minimal annotation, readable at HTML thumbnail size

Use `templates/econte-preview-prompt.template.md` for generation prompts and `templates/preview-manifest.template.md` for manifest structure.

## HTML Preview Embedding

The HTML must show image previews, not only local paths.

For each prompt block:

- add a preview thumbnail next to the prompt block
- use a relative path such as `shotlist_previews_<scope>_v{N}/P377.png`
- wrap the thumbnail in a link to the full image
- include alt text with prompt ID and source shot range
- keep the raw path visible in small text only as secondary debug info

Use base64 image embedding only if the user asks for a single self-contained share file. Local relative paths are the default because preview folders are easier to inspect and replace.

## Do Not Change

When adding preview images or QA fixes, do not change:

- shot IDs
- shot row order
- scene order
- prompt envelope IDs
- prompt envelope grouping
- prompt handle tags
- 15-second envelope strategy
- source script excerpt mapping
- copy-button behavior for Seedance prompts

## QA Handoff

Internal hard gates happen inside this skill. Independent QA happens through `qa.primary`.

Before reporting completion:

- Count shot rows in the HTML.
- Count prompt envelopes in the HTML.
- Count preview manifest entries.
- Confirm every prompt envelope passed the Prompt Quality Gate.
- Confirm any batch above 8 envelopes has a scene-by-scene self-audit note.
- Confirm prompt envelope count equals preview entries, unless manifest marks `prompt_only`.
- Confirm every `<img src>` file exists on disk.
- Confirm no preview path is absolute when the HTML is meant to be portable inside `deliverables/60_motion/`.
- Confirm generated previews do not claim to be final art or production keyframes.
- Confirm generated assets have a manifest with source artifact, count, reference mode, and limitations.
- Request or run `qa.primary` before merging long batches, after HTML/previews are complete, and after any real video generation test.

If an image generation tool is unavailable, still create the HTML prompt structure and preview prompt manifest, then mark the preview status as `prompt_only` and report the limitation.
