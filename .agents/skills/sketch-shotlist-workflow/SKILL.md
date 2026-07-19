---
name: sketch-shotlist-workflow
description: Project-local Seedance/Higgsfield Scene production workflow. Use as the default shotlist.primary slot when turning one approved Scene Breakdown into Chinese production HTML with compact variable-duration prompts, prompt quality gates, and optional user-authorized rough e-conte previews.
---

# Sketch Shotlist Workflow

This is the active HTML production path for Seedance/Higgsfield work in this repository. `shotlist.breakdown` has already completed the selected Scene's source analysis, asset request, scope/blocking, Shot Row Plan, Prompt Envelope Plan, and Production Batch Plan. This skill consumes that approved plan; it does not repeat whole-script breakdown.

The HTML shotlist is the prompt source of truth. Do not split the same scope into separate board-prompt, art-prompt, or standalone video-prompt artifacts.

## Slot Compatibility

- slot: `shotlist.primary`
- contract_version: `1`
- canonical_outputs:
  - `deliverables/3_shotlist/<scene-label>_v{N}/Shotlist_<scene-label>_ZH_v{N}.html`
  - `deliverables/3_shotlist/<scene-label>_v{N}/manifest.md`
- qa_handoff: `qa.primary`
- state_contract: `reference-state-v2`

## Inputs

Use the latest numeric version for the selected Scene unless the user names a file:

- Required: `deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md`
- Required upstream source: the script named by that Breakdown
- Optional: `deliverables/2_assets/02_asset_guide_v{N}.md`
- Optional: `deliverables/2_assets/02_style_guide_v{N}.md`
- Optional: uploaded reference images, common local references under `deliverables/2_assets/`, scene-specific references under the scene package, rough sketch references, keyframes, generated video test results, or style override material
- Required: the same single `<scene-label>` named by the Breakdown
- Optional: duration target, language, and separately authorized image/video generation tool

If only a script is available, stop this slot and run `shotlist.breakdown` for one selected Scene first. Do not bypass the Scene Breakdown or generate several Scenes in one production pass.

Continue only after the selected Scene and one execution mode are explicit:

- `production`: required images are attached, `reference_approval: locked`, spatial blocking is approved, and final QA is required.
- `draft`: supplied or generated references may be unapproved, but their files, visual facts, scope, and spatial blocking still must be explicit. Use `output_status: smoke_test` or `review_ready`.
- `prompt_only`: no image/video generation is attempted. `output_status: prompt_only` does not force a particular `reference_binding`; references may be `none`, `text_only`, or `images_attached` and must be recorded independently.

Consume the selected Scene Breakdown's four-phase structure before writing the HTML:

- `Phase 1 - 剧本拆解`: scene inventory, `动作 / 对白 Beat Map`, emotional/camera tendency, director split notes
- `Phase 2 - 资产请求`: characters, locations, props, style references
- `Phase 3 - 范围与空间调度`: scope lock, image-to-asset mapping, spatial blocking queue, top-down schema needs
- `Phase 4 - HTML 分镜生成计划`: `Shot Row Plan`, `Prompt Envelope Plan`, `Prompt Density Notes`, `Production Batch Plan`, `Scene Package Recommendation`

`Prompt Envelope Plan` is binding input for Phase 4 generation. If the latest breakdown uses an older shape and lacks `Prompt Envelope Plan`, repair or regenerate the breakdown first so each prompt has source rows, beat boundaries, dialogue boundaries, intended duration, grouping reason, and next-beat reservation.

## Outputs

Save current production files directly under `deliverables/3_shotlist/<scene-label>_v{N}/`:

- `03_shotlist_breakdown_<scene-label>_v{N}.md` from the previous slot
- `Shotlist_<scene-label>_ZH_v{N}.html`
- `manifest.md`
- `assets/asset_manifest.md`, only when there are scene-specific assets
- `previews/` and `previews/manifest.md`, only after the user explicitly authorizes preview image generation
- `generated/`, only when real video tests are saved
- optional `spatial_blocking.md` or approved top-down schema references when Phase 3 required them

The package `manifest.md` begins with Artifact metadata. The HTML includes `artifact-id`, `artifact-version`, and `source-artifact-ids` `<meta>` fields that match the manifest.

Use a Scene label without a version suffix as `<scene-label>`:

- screenplay Scene label: `scene-021`
- package folder: `scene-021_v1`
- derived Scene label when the script lacks numbering: `scene-001`

Use exactly one screenplay Scene as the package unit. Older multi-Scene artifacts may keep their historical identifiers only inside archives; they are not examples for new production.

Default asset lookup order:

1. Common project assets in `deliverables/2_assets/refs/` and `deliverables/2_assets/generated_ref_v{N}/`.
2. Scene-specific assets in `deliverables/3_shotlist/<scene-label>_v{N}/assets/`.

Do not duplicate common assets into a scene package unless the user asks for a portable export bundle. Scene `assets/` is for assets that exist only for that scene or override a common asset with an explicit manifest note.

Generated preview images are review assets, not production keyframes. Package, preview, and generated-test manifests use four independent fields:

- `asset_origin`: `user_provided`, `generated_from_text`, `generated_from_references`, or `mixed`
- `reference_binding`: `none`, `text_only`, or `images_attached`
- `reference_approval`: `draft`, `reviewed`, or `locked`
- `output_status`: `prompt_only`, `smoke_test`, `review_ready`, or `production_approved`

Read `text_only_draft`, `text_dna_draft`, and `image_reference_bound` only as legacy compatibility labels. `prompt_only` remains a valid current `output_status`. Never use `image_reference_bound` as proof that an image is approved.

### Prompt Purity Boundary

The four reference-state fields are project metadata, not Seedance instructions. Record them in `manifest.md` and expose them exactly once in the Scene HTML header through `{{REFERENCE_SUMMARY}}`. Never copy them into a Prompt Envelope, handle declaration, warning block, shot block, style block, footer, or clipboard payload.

Seedance prompt text must contain only generation-executable information: reference roles and visible facts, camera, composition, blocking, action, performance, light, physical sound, continuity, and shot-specific failure prevention. Model-facing role limits such as `@image2 仅参考服装和体型` are valid; project lifecycle prose such as `⚠️参考状态`, `asset_origin=...`, `reference_approval=...`, `prompt_only`, `production_approved`, `文本DNA`, `未附图`, `未获用户站位锁定`, or legacy `text_dna_draft` labels is not.

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

Preserve exact source dialogue in its original spoken language inside the Chinese prompt. Use the source line verbatim as `<exact source dialogue>`, then write the surrounding direction in Chinese: speaker, addressee, lip-sync framing, pre-line micro-beat, line delivery, and post-line reaction. Keep the raw speaker cue from the script. Determine the addressee from the current Scene's action, adjacent exchange, eyeline, and approved blocking; never default to the first listed character or a generic guessed name. If the evidence remains ambiguous, return the line to `shotlist.breakdown` for a visible note before final prompting.

## Scene HTML Production

This workflow is stateful across turns and starts only after one Scene Breakdown exists. Do not collapse whole-script analysis and multiple Scene outputs into one response.

### Step 1 - 核对 Scene Breakdown

Read the selected Scene Breakdown and verify its Scene label, exact script header, source boundaries, Shot Row Plan, Prompt Envelope Plan, Prompt ID Reservation, and Production Batch Plan against the named script.

Verify:

- the selected Scene is exactly one screenplay Scene
- source action and exact dialogue remain complete
- the Scene label still maps to the same header and opening/closing source boundaries
- Shot Rows preserve the approved director design
- Prompt Envelopes and production batches remain inside the selected Scene

Do not renumber or expand to adjacent Scenes. If the source mapping is ambiguous or changed, return to `shotlist.breakdown` before continuing.

### Step 2 - 核对资产与执行模式

Use the Breakdown's asset request and state fields. Do not recreate a second asset request inside the HTML stage. Confirm these categories are resolved or visibly limited:

- 人物
- 地点
- 道具
- 风格参考

Confirm missing assets, the selected Scene, and the execution mode.

Stop after Phase 2 only when scope or execution mode remains unresolved, filenames are ambiguous, or production mode lacks required references. Continue in `draft` or `prompt_only` mode when the user explicitly accepted that mode and the scope is unambiguous.

Project adaptation:

- Store common reusable assets under `deliverables/2_assets/`.
- Store scene-only assets under the relevant scene package `assets/`.
- If a required image is missing, production mode is blocked. Draft or prompt-only output may continue with `reference_binding: text_only`, `reference_approval: draft`, and a visible limitation.

### Step 3 - 核对空间调度

When the user uploads or points to images, before generating any prompt:

1. Confirm the exact single screenplay Scene or derived Scene label.
2. Map filenames to assets; flag missing, extra, or ambiguous files. Never auto-assign ambiguous images silently.
3. Confirm style override if one was supplied; otherwise confirm default style.
4. Build a visual-fact table from every usable reference image before writing handles: face/hair/body, wardrobe, material/texture, prop geometry, location layout, light sources, foreground/background layers, and likely confusion risks.
5. For any scene with 2+ characters in frame, a key prop on a specific surface, or complex camera geometry, produce a top-down spatial schema and get user approval before writing production prompts.
6. After the top-down schema is approved, lock prompt-level camera blocking for each prompt: camera planted where, looking which direction, first-frame composition, foreground/midground/background, frame-edge slivers, and the one action that must read.

Do not start writing prompts until scope, image-to-asset mapping, visual facts, required top-down spatial blocking, and per-prompt camera blocking are locked.

### Step 4 - 生成 HTML 分镜

For the selected Scene:

1. Consume the breakdown `Shot Row Plan` as the starting shot-row map.
2. Consume the breakdown `Prompt Envelope Plan` as the prompt grouping contract: source rows, beat boundary, dialogue boundary, character/asset set, intended duration, grouping reason, and next-beat reservation.
3. Consume the breakdown `Prompt ID Reservation`. Shot rows use `<scene-label>-R<NN>`; only prompt envelopes use reserved `P###` IDs. Never reuse a retired prompt ID as a row ID.
4. Revise grouping when `reference/PROMPT_DENSITY.md` clearly requires it; record the reason in `Prompt Density Notes` or the scene package manifest. Do not treat every shot-row boundary as a separate prompt. If adjacent short beats share location, character set, spatial axis, and one immediate emotional cause-effect turn, merge them into one compact multi-shot envelope with internal `【镜头N】` blocks.
5. Write each Chinese Seedance 2.0 prompt following `reference/PROMPT_PATTERNS.md`, including handle declarations, universal warnings, camera/frame lock, spatial blocking, per-shot blocks, style block, background activity, shot-specific failure-mode lock, and closing footer. Keep project status and approval metadata outside the prompt block.
6. For multi-shot prompts, structure each internal cut as a `【镜头N】` block with its own `机位 / 背景 / 动作 / 微表演细节` sub-blocks.
7. Before grouping or writing prompts, compare the Breakdown dialogue lines against the selected Scene in the source script. Preserve every line once and in source order. Bind each line to its own lip-sync Shot Row and internal shot, or to one explicit off-screen-audio row when the source cue is marked `O.S.` / `V.O.`. A Prompt Envelope may contain several dialogue lines, but no internal shot may carry more than one independent source line.
8. Run the Prompt Quality Gate below on every prompt envelope. If a prompt fails, rewrite it before HTML assembly.
9. Assemble from `assets/shotlist-house-template.html` using the placeholder contract in `templates/HTML_TEMPLATE.md`.
10. Save the complete Scene package under `deliverables/3_shotlist/<scene-label>_v{N}/`.

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
5. an insert/cutaway changes the reference set, blocking setup, or generation reliability enough that it cannot safely remain inside the immediate cause-effect envelope

When uncertain, test both risks: split if one envelope overloads blocking or performance; merge if separate envelopes would stretch one immediate causal turn. Record the decision in `Prompt Density Notes`.

## Prompt Quality Gate

Every prompt envelope must pass all checks before HTML or preview generation:

1. **Reference facts:** every handle contains concrete visual facts and uses only references allowed by the package's `reference_binding` and `reference_approval` values, without serializing those project fields into the prompt.
2. **Camera planted:** every prompt states where the camera is physically placed, what direction it faces, and foreground/midground/background.
3. **Frame composition:** every prompt describes first-frame composition with left/right/top/bottom or foreground/midground/background relationships.
4. **Action path:** every action is decomposed into physical steps with body movement, object contact, eyeline, and end state.
5. **Micro-beats are unique:** emotional beats are tailored to this exact character, action, and scene turn.
6. **Failure-mode lock:** every prompt names likely model errors specific to this shot.
7. **Adjacent-beat boundary:** sequential prompt envelopes state which earlier/later beat must not leak into this prompt.
8. **Reference state gate:** all four reference-state fields agree across the Scene HTML header, package manifest, preview manifest, and generated tests.
9. **Prompt purity:** Prompt Envelopes contain no project lifecycle/status paragraph or tokens such as `asset_origin`, `reference_binding`, `reference_approval`, `output_status`, `prompt_only`, `production_approved`, or `text_dna_draft`.
10. **Batch pressure check:** prefer 4-8 Prompt Envelopes in one quality pass; more than 10 is split-required and must follow the Breakdown `Production Batch Plan` with QA after each batch.
11. **Dialogue preservation:** exact source dialogue count and order match the selected source Scene; each line remains in its original language inside quotes, keeps its raw speaker cue, and has its own lip-sync Shot Row/internal shot or source-marked off-screen-audio row. The addressee follows current Scene action, adjacent exchange, eyeline, and blocking; unresolved ambiguity returns to the Breakdown instead of being guessed.
12. **HTML language check:** UI labels, scene headers, action cells, scene-text cells, asset lists, prompt tags, and prompt blocks are Simplified Chinese, while stable machine fields remain unchanged.

## Production Batch Gate

- Prefer 4-8 Prompt Envelopes in one quality pass.
- A coherent Scene may contain up to 10 Envelopes in one pass.
- More than 10 Envelopes is split-required: follow the Breakdown `Production Batch Plan`, finish Prompt Quality Gate and QA for one batch, then continue.
- Batch divisions remain inside the same Scene Breakdown, HTML, and manifest. Do not create batch directories or parallel workflow layers.

## E-conte Preview Layer

Only after the user explicitly authorizes preview image generation, create one vertical rough e-conte preview image per approved Prompt Envelope. Completing Prompt or HTML work does not authorize this step.

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

When preview images were authorized and generated, the HTML must show the images, not only local paths. In `prompt_only` mode, show a visible Chinese text state and do not require a preview directory or preview manifest.

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
- Count preview manifest entries only when preview generation was authorized.
- Confirm the HTML consumed the latest breakdown `Prompt Envelope Plan`, or record the explicit grouping revision reason.
- Confirm every prompt envelope passed the Prompt Quality Gate.
- Confirm the `Production Batch Plan` uses 4-8 Envelopes where practical and that any Scene above 10 was processed and reviewed in required batches.
- Confirm exact source dialogue is preserved inside prompt blocks without substituting a translated line.
- Confirm source-dialogue count and order match the selected Scene, every spoken line has a distinct lip-sync Shot Row/internal shot, and source-marked `O.S.` / `V.O.` lines remain off-screen audio.
- Confirm speaker and addressee follow current Scene evidence; generic stand-ins, first-cast defaults, and unexplained self-direction fail the handoff.
- Confirm HTML UI, scene headers, action cells, scene-text cells, asset lists, prompt tags, and prompt blocks are Simplified Chinese.
- Confirm search and plan filters preserve complete Prompt Envelope row groups: a matching later Row must not appear without the first `rowspan` Row that carries its source, prompt, and preview state.
- When previews were authorized, confirm Prompt Envelope count equals preview entries. In `prompt_only`, confirm the HTML contains a text state and no broken `<img>`.
- When previews were authorized, confirm every `<img src>` file exists on disk.
- Confirm no preview path is absolute when the HTML is meant to be portable inside its scene package.
- Confirm generated previews do not claim to be final art or production keyframes.
- Confirm generated assets have a manifest with source artifact, count, all four reference-state fields, and limitations.
- Confirm shot rows and prompt envelopes use distinct identifiers and all `P###` values fall inside the reserved range.
- Check the final HTML, manifest, source-row mapping, Prompt IDs, dialogue coverage, relative paths, and reference state directly before handoff.
- Request or run `qa.primary` after HTML/previews are complete and after any real video generation test. From the repository root, run `node .agents/skills/qa-workflow/scripts/validate-shotlist-project.mjs --script <script-path> --shotlist-root <shotlist-root>` as independent structural evidence for a local Scene package; add `--require-complete` for a full-screenplay replay. Human QA still decides directing, performance, spatial logic, and addressee correctness.

If preview generation was not authorized or an image tool is unavailable, create only the HTML prompt structure, use the independently correct reference-state fields with `output_status: prompt_only`, and report the limitation. Do not create preview files automatically.
