---
name: sketch-shotlist-workflow
description: Project-local Seedance/Higgsfield shotlist-builder workflow. Use as the default shotlist.primary slot when turning a script, scene range, uploaded references, or shotlist breakdown into scene-first Chinese production HTML with compact variable-duration prompts, top-down spatial blocking, prompt quality gates, and rough e-conte previews.
---

# Sketch Shotlist Workflow

This is the active production path for Seedance/Higgsfield work in this repository. It imports the `shotlist-builder` method into the project file contract: screenplay scenes first, asset request, reference upload/mapping, spatial blocking, then scene-scoped HTML shotlists with Chinese readable modules and Chinese Seedance prompts.

The HTML shotlist is the prompt source of truth. Do not split the same scope into separate board-prompt, art-prompt, or standalone video-prompt artifacts.

## Slot Compatibility

- slot: `shotlist.primary`
- contract_version: `1`
- canonical_outputs:
  - `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/Shotlist_<scene-scope>_ZH_v{N}.html`
  - `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/manifest.md`
- qa_handoff: `qa.primary`
- state_contract: `reference-state-v2`

## Inputs

Use the latest numeric version unless the user names a file or scene range:

- Required: `deliverables/10_story/01_script_v{N}.md`, `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md`, or a user-supplied script
- Optional: `deliverables/20_assets/02_asset_guide_v{N}.md`
- Optional: `deliverables/20_assets/02_style_guide_v{N}.md`
- Optional: uploaded reference images, common local references under `deliverables/20_assets/`, scene-specific references under the scene package, rough sketch references, keyframes, generated video test results, or style override material
- Optional: user-selected scene, scene range, duration target, language, and image generation tool

If only a script is available, run Phase 1 and Phase 2 first. Continue only after the scene scope and one execution mode are explicit:

- `production`: required images are attached, `reference_approval: locked`, spatial blocking is approved, and final QA is required.
- `draft`: supplied or generated references may be unapproved, but their files, visual facts, scope, and spatial blocking still must be explicit. Use `output_status: smoke_test` or `review_ready`.
- `prompt_only`: no image/video generation is attempted. Text-only handles and preview prompts are allowed after the user accepts the limitation; use `reference_binding: text_only` and `output_status: prompt_only`.

When a `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md` artifact exists, consume its four-phase structure before writing the HTML:

- `Phase 1 - 剧本拆解`: scene inventory, `动作 / 对白 Beat Map`, emotional/camera tendency, director split notes
- `Phase 2 - 资产请求`: characters, locations, props, style references
- `Phase 3 - 范围与空间调度`: scope lock, image-to-asset mapping, spatial blocking queue, top-down schema needs
- `Phase 4 - HTML 分镜生成计划`: `Shot Row Plan`, `Prompt Envelope Plan`, `Prompt Density Notes`, `Scene Package Recommendation`

`Prompt Envelope Plan` is binding input for Phase 4 generation. If the latest breakdown uses an older shape and lacks `Prompt Envelope Plan`, repair or regenerate the breakdown first so each prompt has source rows, beat boundaries, dialogue boundaries, intended duration, grouping reason, and next-beat reservation.

## Outputs

Save current production files as scene-native packages under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/`:

- `Shotlist_<scene-scope>_ZH_v{N}.html`
- `manifest.md`
- `assets/asset_manifest.md`, only when there are scene-specific assets
- `previews/`
- `previews/manifest.md`
- `generated/`, only when real video tests are saved
- optional `spatial_blocking.md` or approved top-down schema references when Phase 3 required them

The package `manifest.md` begins with Artifact metadata. The HTML includes `artifact-id`, `artifact-version`, and `source-artifact-ids` `<meta>` fields that match the manifest.

Use scene-native scope names:

- single screenplay scene: `scene-021_v1`
- small scene range: `scenes-021-023_v1`
- derived label when the script lacks numbering: `scene-001_v1`

Use screenplay scene labels as the package split unit. Older migrated artifacts may keep their historical identifiers only as compatibility notes inside those archived files.

Default asset lookup order:

1. Common project assets in `deliverables/20_assets/refs/` and `deliverables/20_assets/generated_ref_v{N}/`.
2. Scene-specific assets in `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/assets/`.

Do not duplicate common assets into a scene package unless the user asks for a portable export bundle. Scene `assets/` is for assets that exist only for that scene or override a common asset with an explicit manifest note.

Generated preview images are review assets, not production keyframes. Package, preview, and generated-test manifests use four independent fields:

- `asset_origin`: `user_provided`, `generated_from_text`, `generated_from_references`, or `mixed`
- `reference_binding`: `none`, `text_only`, or `images_attached`
- `reference_approval`: `draft`, `reviewed`, or `locked`
- `output_status`: `prompt_only`, `smoke_test`, `review_ready`, or `production_approved`

Read `text_only_draft`, `text_dna_draft`, `image_reference_bound`, and `prompt_only` only as legacy compatibility labels. Never use `image_reference_bound` as proof that an image is approved.

Generated video tests, if saved, belong under the scene package `generated/` directory with a manifest or README. They do not change the HTML source of truth.

## Output Language Contract

The final HTML is for Chinese users by default. Use Simplified Chinese for every visible reader-facing module:

- HTML UI labels, toolbar text, filter labels, scene headers, summaries, and stats
- `Action` / action cells
- `Scene Text` / script excerpt cells
- `Asset List` and reader-facing manifest notes
- prompt tags, prompt labels, QA notes, and preview metadata
- Seedance prompt blocks

Keep stable machine-facing fields in English/numeric form for automation and filtering:

- plan codes such as `WS`, `MS`, `CU`, `ECU`, `MACRO`, `PAN`, `OS`, `VO`
- `data-plan`, CSS class names, file paths, artifact IDs, prompt IDs, and HTML/JS function names

Preserve exact source dialogue in its original spoken language inside the Chinese prompt. Use the source line verbatim as `<exact source dialogue>`, then write the surrounding direction in Chinese: speaker, addressee, lip-sync framing, pre-line micro-beat, line delivery, and post-line reaction.

## The Four-Phase Shotlist-Builder Loop

This workflow is stateful across turns. Do not collapse all phases into one response unless the user explicitly supplies every prerequisite and asks for a draft.

### Phase 1 - 剧本拆解

Read the entire current script or selected script source. If multiple files are provided and one is clearly a style reference, previous shotlist HTML, or director note, treat it as a style override.

Identify:

- scene numbers and INT/EXT/time-of-day headers
- characters appearing in each scene, including first appearances
- locations and sub-locations
- significant props, vehicles, screens, written notes, photos, weapons, or other visual-focus objects
- dialogue and action beats per scene
- mood/emotional register of each scene, because camera movement follows emotion

If the script lacks scene numbers, create derived labels from screenplay order, such as `scene-001`, and mark them as derived.

### Phase 2 - 资产请求

Output a clean Simplified Chinese asset request organized by:

- 人物
- 地点
- 道具
- 风格参考

Use brief one-line descriptions, then state the missing assets, requested scope, and available execution modes.

Stop after Phase 2 only when scope or execution mode remains unresolved, filenames are ambiguous, or production mode lacks required references. Continue in `draft` or `prompt_only` mode when the user explicitly accepted that mode and the scope is unambiguous.

Project adaptation:

- Store common reusable assets under `deliverables/20_assets/`.
- Store scene-only assets under the relevant scene package `assets/`.
- If a required image is missing, production mode is blocked. Draft or prompt-only output may continue with `reference_binding: text_only`, `reference_approval: draft`, and a visible limitation.

### Phase 3 - 范围与空间调度

When the user uploads or points to images, before generating any prompt:

1. Confirm scope: exact screenplay scene, scene range, or derived scene label.
2. Map filenames to assets; flag missing, extra, or ambiguous files. Never auto-assign ambiguous images silently.
3. Confirm style override if one was supplied; otherwise confirm default style.
4. Build a visual-fact table from every usable reference image before writing handles: face/hair/body, wardrobe, material/texture, prop geometry, location layout, light sources, foreground/background layers, and likely confusion risks.
5. For any scene with 2+ characters in frame, a key prop on a specific surface, or complex camera geometry, produce a top-down spatial schema and get user approval before writing production prompts.
6. After the top-down schema is approved, lock prompt-level camera blocking for each prompt: camera planted where, looking which direction, first-frame composition, foreground/midground/background, frame-edge slivers, and the one action that must read.

Do not start writing prompts until scope, image-to-asset mapping, visual facts, required top-down spatial blocking, and per-prompt camera blocking are locked.

### Phase 4 - 生成 HTML 分镜

For each scene in scope:

1. Consume the breakdown `Shot Row Plan` as the starting shot-row map.
2. Consume the breakdown `Prompt Envelope Plan` as the prompt grouping contract: source rows, beat boundary, dialogue boundary, character/asset set, intended duration, grouping reason, and next-beat reservation.
3. Consume the breakdown `Prompt ID Reservation`. Shot rows use `<scene-label>-R<NN>`; only prompt envelopes use reserved `P###` IDs. Never reuse a retired prompt ID as a row ID.
4. Revise grouping when `reference/PROMPT_DENSITY.md` clearly requires it; record the reason in `Prompt Density Notes` or the scene package manifest. Do not treat every shot-row boundary as a separate prompt. If adjacent short beats share location, character set, spatial axis, and one immediate emotional cause-effect turn, merge them into one compact multi-shot envelope with internal `【镜头N】` blocks.
5. Write each Chinese Seedance 2.0 prompt following `reference/PROMPT_PATTERNS.md`, including handle declarations, universal warnings, camera/frame lock, spatial blocking, per-shot blocks, style block, background activity, shot-specific failure-mode lock, and closing footer.
6. For multi-shot prompts, structure each internal cut as a `【镜头N】` block with its own `机位 / 背景 / 动作 / 微表演细节` sub-blocks.
7. Preserve original dialogue inside the Chinese prompt. Bind every line to the speaker, addressee, lip-sync shot, pre-line micro-beat, line delivery, and post-line reaction.
8. Run the Prompt Quality Gate below on every prompt envelope. If a prompt fails, rewrite it before HTML assembly.
9. Assemble from `assets/shotlist-house-template.html` using the placeholder contract in `templates/HTML_TEMPLATE.md`.
10. Save the complete scene package under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/`.

## Prompt Density

There is no fixed shot-row-to-prompt ratio. Use `reference/PROMPT_DENSITY.md` as the grouping standard and decide per scene.

Group shot rows into one prompt only when all are true:

1. same character set in frame
2. same location or sub-location
3. continuous emotional/temporal unit
4. can be staged within the selected generator cap without padding
5. the combined Chinese prompt stays practical for generation

Use one multi-shot prompt for a short cause-effect chain that would feel slow as separate prompts. For example, a warning gesture, the listener's realization, and the resulting release action may share one envelope when cast, location, axis, and immediate causal turn remain stable.

Split into separate prompts when any are true:

1. hard cut between locations
2. major character entrance/exit changes the handle list
3. aspect/lens/setup change needs its own prompt
4. performance arc deserves its own independent envelope
5. insert/cutaway to a prop, screen, hand, eye, or written note

When uncertain, test both risks: split if one envelope overloads blocking or performance; merge if separate envelopes would stretch one immediate causal turn. Record the decision in `Prompt Density Notes`.

## Prompt Quality Gate

Every prompt envelope must pass all checks before HTML or preview generation:

1. **Reference facts:** every handle contains concrete visual facts and respects the package's `reference_binding` and `reference_approval` values.
2. **Camera planted:** every prompt states where the camera is physically placed, what direction it faces, and foreground/midground/background.
3. **Frame composition:** every prompt describes first-frame composition with left/right/top/bottom or foreground/midground/background relationships.
4. **Action path:** every action is decomposed into physical steps with body movement, object contact, eyeline, and end state.
5. **Micro-beats are unique:** emotional beats are tailored to this exact character, action, and scene turn.
6. **Failure-mode lock:** every prompt names likely model errors specific to this shot.
7. **Adjacent-beat boundary:** sequential prompt envelopes state which earlier/later beat must not leak into this prompt.
8. **Reference state gate:** all four reference-state fields agree across HTML metadata, package manifest, preview manifest, and generated tests.
9. **Batch pressure check:** when a scene or selected scope produces more than 8 prompts, run a scene-by-scene self-audit before finalizing.
10. **Dialogue preservation:** exact source dialogue remains in its original language inside quotes, with speaker, addressee, lip-sync framing, and before/after micro-beats.
11. **HTML language check:** UI labels, scene headers, action cells, scene-text cells, asset lists, prompt tags, and prompt blocks are Simplified Chinese, while stable machine fields remain unchanged.

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
- envelope duration and grouping strategy
- source script excerpt mapping
- copy-button behavior for Seedance prompts

## QA Handoff

Internal hard gates happen inside this skill. Independent QA happens through `qa.primary`.

Before reporting completion:

- Count scenes, shot rows, and prompt envelopes in the HTML.
- Count preview manifest entries.
- Confirm the HTML consumed the latest breakdown `Prompt Envelope Plan`, or record the explicit grouping revision reason.
- Confirm every prompt envelope passed the Prompt Quality Gate.
- Confirm any scene above 8 prompts has a self-audit note.
- Confirm exact source dialogue is preserved inside prompt blocks without substituting a translated line.
- Confirm HTML UI, scene headers, action cells, scene-text cells, asset lists, prompt tags, and prompt blocks are Simplified Chinese.
- Confirm prompt envelope count equals preview entries, unless manifest marks `prompt_only`.
- Confirm every `<img src>` file exists on disk.
- Confirm no preview path is absolute when the HTML is meant to be portable inside its scene package.
- Confirm generated previews do not claim to be final art or production keyframes.
- Confirm generated assets have a manifest with source artifact, count, all four reference-state fields, and limitations.
- Confirm shot rows and prompt envelopes use distinct identifiers and all `P###` values fall inside the reserved range.
- Check the final HTML, manifest, source-row mapping, Prompt IDs, dialogue coverage, relative paths, and reference state directly before handoff.
- Request or run `qa.primary` after HTML/previews are complete and after any real video generation test.

If an image generation tool is unavailable, still create the HTML prompt structure and preview prompt manifest, then use `reference_binding: text_only`, `reference_approval: draft`, and `output_status: prompt_only` and report the limitation.
