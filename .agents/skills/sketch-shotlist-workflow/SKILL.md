---
name: sketch-shotlist-workflow
description: Project-local Seedance/Higgsfield shotlist-builder workflow. Use as the default shotlist.primary slot when turning a script, scene range, uploaded references, or shotlist breakdown into scene-first Chinese production HTML with 15-second prompts, top-down spatial blocking, prompt quality gates, and rough e-conte previews.
---

# Sketch Shotlist Workflow

This is the active production path for Seedance/Higgsfield work in this repository. It imports the `shotlist-builder` method into the project file contract: screenplay scenes first, asset request, reference upload/mapping, spatial blocking, then scene-scoped HTML shotlists with Chinese Seedance prompts.

The HTML shotlist is the prompt source of truth. Do not split the same scope into separate board-prompt, art-prompt, or standalone video-prompt artifacts.

## Inputs

Use the latest numeric version unless the user names a file or scene range:

- Required: `deliverables/10_story/01_script_v{N}.md`, `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md`, or a user-supplied script
- Optional: `deliverables/20_assets/02_asset_guide_v{N}.md`
- Optional: `deliverables/20_assets/02_style_guide_v{N}.md`
- Optional: uploaded reference images, common local references under `deliverables/20_assets/`, scene-specific references under the scene package, rough sketch references, keyframes, generated video test results, or style override material
- Optional: user-selected scene, scene range, duration target, language, and image generation tool

If only a script is available, run Phase 1 and Phase 2 first. Do not skip directly to prompt generation unless the user explicitly asks for a rough draft and accepts the reference/status limitations.

## Outputs

Save current production files as scene-native packages under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/`:

- `Shotlist_<scene-scope>_ZH_v{N}.html`
- `manifest.md`
- `assets/asset_manifest.md`, only when there are scene-specific assets
- `previews/`
- `previews/manifest.md`
- `generated/`, only when real video tests are saved
- optional `spatial_blocking.md` or approved top-down schema references when Phase 3 required them

Use scene-native scope names:

- single screenplay scene: `scene-021_v1`
- small scene range: `scenes-021-023_v1`
- derived label when the script lacks numbering: `scene-001_v1`

Do not use legacy storyboard IDs as the new package split unit. Legacy legacy storyboard IDs identifiers may appear only inside old migrated artifacts or as compatibility notes.

Default asset lookup order:

1. Common project assets in `deliverables/20_assets/refs/` and `deliverables/20_assets/generated_ref_v{N}/`.
2. Scene-specific assets in `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/assets/`.

Do not duplicate common assets into a scene package unless the user asks for a portable export bundle. Scene `assets/` is for assets that exist only for that scene or override a common asset with an explicit manifest note.

Generated preview images are review assets, not production keyframes. Mark their reference status in the manifest:

- `text_only_draft`
- `text_dna_draft`
- `image_reference_bound`
- `prompt_only`

Generated video tests, if saved, belong under the scene package `generated/` directory with a manifest or README. They do not change the HTML source of truth.

## The Four-Phase Shotlist-Builder Loop

This workflow is stateful across turns. Do not collapse all phases into one response unless the user explicitly supplies every prerequisite and asks for a draft.

### Phase 1 - Read The Script

Read the entire current script or selected script source. If multiple files are provided and one is clearly a style reference, previous shotlist HTML, or director note, treat it as a style override.

Identify:

- scene numbers and INT/EXT/time-of-day headers
- characters appearing in each scene, including first appearances
- locations and sub-locations
- significant props, vehicles, screens, written notes, photos, weapons, or other visual-focus objects
- dialogue and action beats per scene
- mood/emotional register of each scene, because camera movement follows emotion

If the script lacks scene numbers, create derived labels from screenplay order, such as `scene-001`, and mark them as derived.

### Phase 2 - Asset Request

Output a clean Simplified Chinese asset request organized by:

- Characters
- Locations
- Props
- Style References

Use brief one-line descriptions, and end by asking the user to generate/upload the assets with clear filenames and tell Codex which scenes to build.

Stop after Phase 2 unless the user has already supplied usable references and an explicit scene scope. Do not continue to Phase 3 in the same production pass when assets are missing.

Project adaptation:

- Store common reusable assets under `deliverables/20_assets/`.
- Store scene-only assets under the relevant scene package `assets/`.
- If a required image is missing, mark downstream output as draft-only (`text_only_draft`, `text_dna_draft`, or `prompt_only`) unless the user pauses to provide references.

### Phase 3 - Scope And Spatial Blocking

When the user uploads or points to images, before generating any prompt:

1. Confirm scope: exact screenplay scene, scene range, or derived scene label.
2. Map filenames to assets; flag missing, extra, or ambiguous files. Never auto-assign ambiguous images silently.
3. Confirm style override if one was supplied; otherwise confirm default style.
4. Build a visual-fact table from every usable reference image before writing handles: face/hair/body, wardrobe, material/texture, prop geometry, location layout, light sources, foreground/background layers, and likely confusion risks.
5. For any scene with 2+ characters in frame, a key prop on a specific surface, or complex camera geometry, produce a top-down spatial schema and get user approval before writing prompts.
6. After the top-down schema is approved, lock prompt-level camera blocking for each 15-second prompt: camera planted where, looking which direction, first-frame composition, foreground/midground/background, frame-edge slivers, and the one action that must read.

Do not start writing prompts until scope, image-to-asset mapping, visual facts, required top-down spatial blocking, and per-prompt camera blocking are locked.

### Phase 4 - Generate The HTML Shotlist

For each scene in scope:

1. Break action into shot rows at script-beat granularity: one row per discrete action, camera setup, focal-length change, or visual-focus change.
2. Group consecutive shot rows into 15-second prompts using `reference/PROMPT_DENSITY.md`.
3. Write each Chinese Seedance 2.0 prompt following `reference/PROMPT_PATTERNS.md`, including the universal style block, camera-emotion sync, and performance micro-beats.
4. For multi-shot prompts, structure each internal cut as a `【镜头N】` block with its own `机位 / 背景 / 动作 / 微表演细节` sub-blocks.
5. Run the Prompt Quality Gate below on every prompt envelope. If a prompt fails, rewrite it before HTML assembly.
6. Assemble into `templates/HTML_TEMPLATE.md`.
7. Save into the scene package path under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/`.

## Prompt Density

There is no fixed shot-row-to-prompt ratio. Decide per scene.

Group shot rows into one prompt only when all are true:

1. same character set in frame
2. same location or sub-location
3. continuous emotional/temporal unit
4. can be staged in 15 seconds or less
5. the combined Chinese prompt stays practical for generation

Split into separate prompts when any are true:

1. hard cut between locations
2. major character entrance/exit changes the handle list
3. aspect/lens/setup change needs its own prompt
4. performance arc deserves its own 15-second envelope
5. insert/cutaway to a prop, screen, hand, eye, or written note

When in doubt, use more prompts with shorter envelopes. Seedance handles tight prompts better than overloaded prompts.

## Prompt Quality Gate

Every prompt envelope must pass all checks before HTML or preview generation:

1. **Reference facts:** every handle contains concrete visual facts from the source image or explicitly labels `text_dna_draft`.
2. **Camera planted:** every prompt states where the camera is physically placed, what direction it faces, and foreground/midground/background.
3. **Frame composition:** every prompt describes first-frame composition with left/right/top/bottom or foreground/midground/background relationships.
4. **Action path:** every action is decomposed into physical steps with body movement, object contact, eyeline, and end state.
5. **Micro-beats are unique:** emotional beats are tailored to this exact character, action, and scene turn.
6. **Failure-mode lock:** every prompt names likely model errors specific to this shot.
7. **Adjacent-beat boundary:** sequential prompt envelopes state which earlier/later beat must not leak into this prompt.
8. **Reference status gate:** draft references keep the HTML, preview manifest, and generated tests labeled as draft/smoke-test.
9. **Batch pressure check:** when a scene or selected scope produces more than 8 prompts, run a scene-by-scene self-audit before finalizing.

## E-conte Preview Layer

After prompt envelopes are stable, create one vertical rough e-conte preview image per prompt envelope.

Preview rules:

- One prompt envelope maps to one preview image.
- If the envelope contains multiple internal cuts such as `【镜头1】`, stack them as vertical panels in reading order.
- Preserve prompt envelope ID, source shot rows, handle tag, duration, and Chinese Seedance prompt text exactly.
- Do not merge, split, or reorder prompt envelopes just to make prettier preview pages.
- Use rough black-and-white or grayscale line art, not polished color key art.
- Use simple figures and readable staging; prioritize blocking over illustration quality.
- Keep labels outside or below panels. Do not put necessary final-video text inside the image.
- Treat preview images as planning aids, not continuity-approved production keyframes.

Use `templates/econte-preview-prompt.template.md` for generation prompts and `templates/preview-manifest.template.md` for manifest structure.

## HTML Preview Embedding

The HTML must show image previews, not only local paths.

For each prompt block:

- add a preview thumbnail next to the prompt block
- use a scene-package relative path such as `previews/P001.png`
- wrap the thumbnail in a link to the full image
- include alt text with prompt ID and source scene/shot row
- keep the raw path visible in small text only as secondary debug info

Use base64 image embedding only if the user asks for a single portable HTML. Local relative paths are the default because preview folders are easier to inspect and replace.

## Do Not Change During QA Fixes

- source scene order
- shot row order
- prompt envelope grouping
- prompt handle tags
- 15-second envelope strategy
- source script excerpt mapping
- copy-button behavior for Seedance prompts

## QA Handoff

Internal hard gates happen inside this skill. Independent QA happens through `qa.primary`.

Before reporting completion:

- Count scenes, shot rows, and prompt envelopes in the HTML.
- Count preview manifest entries.
- Confirm every prompt envelope passed the Prompt Quality Gate.
- Confirm any scene above 8 prompts has a self-audit note.
- Confirm prompt envelope count equals preview entries, unless manifest marks `prompt_only`.
- Confirm every `<img src>` file exists on disk.
- Confirm no preview path is absolute when the HTML is meant to be portable inside its scene package.
- Confirm generated previews do not claim to be final art or production keyframes.
- Confirm generated assets have a manifest with source artifact, count, reference mode, and limitations.
- Request or run `qa.primary` after HTML/previews are complete and after any real video generation test.

If an image generation tool is unavailable, still create the HTML prompt structure and preview prompt manifest, then mark the preview status as `prompt_only` and report the limitation.
