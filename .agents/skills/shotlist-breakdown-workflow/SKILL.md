---
name: shotlist-breakdown-workflow
description: "Project-only shotlist.breakdown workflow for one-Scene asset, blocking, Shot Row, and Prompt Envelope planning. Auto-select only in a project that registers this skill; elsewhere require explicit invocation."
---

# Shotlist Breakdown Workflow

Use this skill immediately after the script/audit stage when the user wants to move into Seedance/Higgsfield shotlist production.

This skill adapts the `shotlist-builder` four-phase method into one-Scene-at-a-time planning. It locks the selected Scene's source coverage, asset request, scope/blocking, Shot Rows, Prompt Envelopes, and production batches. It does not create standalone board prompts, art prompts, video prompts, or final Seedance prompts.

## Slot Compatibility

- slot: `shotlist.breakdown`
- contract_version: `1`
- canonical_outputs:
  - `deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md`
- qa_handoff: `qa.primary`
- state_contract: `reference-state-v2`

## Required Inputs

Resolve inputs with [local-script-workflow.md](../version-management/references/local-script-workflow.md). Use the coordinator’s exact script/audit and matching production decision; do not infer them from the largest version number or refresh Notion. If the requested working draft differs, handle its required audit/decision first.

- Exact production script selected by `workflow_state.json` (path, version, hash; active or archived)
- Required same-version audit report: `deliverables/1_story/01_audit_report_v{N}.md`
- Optional asset guide: `deliverables/2_assets/02_asset_guide_v{N}.md`
- Optional style guide: `deliverables/2_assets/02_style_guide_v{N}.md`
- Global locks: `deliverables/0_admin/locks.md`
- Required selected screenplay Scene label, such as `scene-021`

For a long script, first scan only Scene IDs/sluglines and their line ranges to establish a lightweight Scene queue. From the repository root, use `node .agents/skills/shotlist-breakdown-workflow/scripts/index-screenplay-scenes.mjs <script-path> --state deliverables/0_admin/workflow_state.json` when the source is a local Markdown screenplay. Then load the selected Scene body plus the immediately preceding/following boundary headers. Do not place the full screenplay body in the same directing or prompt-generation context, and do not draft Shot Rows or Prompt Envelopes for the whole screenplay in one pass. On first registration, establish Scene identities; after that, consume the stored mapping for this exact script hash. Stable source numbers are retained; positional numbers use persistent identities. Insertion must not renumber old Scenes; ambiguous duplicate/renamed/deleted scopes require concrete mapping choices.

Before Scene work, verify that the audit names the same script version and has no unresolved P0/P1. If the audit is missing, stale, or blocking, stop and return the exact script/audit paths to `script.primary` for revision or re-audit.

Resolve `interaction_mode` from `AGENTS.md` before selecting the Scene:

- `interactive`: require evidence that the user accepted the current script/audit and asset/style stage. After the first Scene Breakdown, stop before Prompt compilation and present the asset requests, blocking plan, Prompt Envelope plan, risks, and QA findings. After each Scene or approved 4—8 Envelope batch, stop before the next Scene.
- `autonomous`: treat the first Scene as an internal pilot. Run Breakdown QA, repair all P0/P1 and downstream-relevant P2 findings through the owning stage, re-run QA, then compile Prompt/HTML and continue Scene by Scene without routine confirmation. If a failure comes from the script or shared assets, return to that owning Skill, revise/version the upstream artifact, re-run impacted downstream work, and only then continue.

Do not interpret a broad workflow request as autonomous mode. Do not silently keep `text_only` when the autonomous scope requires complete production design.

If an existing `03_storyboard_v{N}.md` planning artifact is needed, read it from `archives/` as legacy input only. New production planning must use the selected Scene's canonical folder and filename.

## Outputs

- `deliverables/3_shotlist/<scene-label>_v{N}/03_shotlist_breakdown_<scene-label>_v{N}.md`
- Changelog entry and archives when revising
- Optional updates or downstream recommendations for `deliverables/2_assets/`
- No board-prompt, art-prompt, standalone video-prompt, or final Seedance prompt file

The artifact must include metadata and locks. Preserve the artifact ID across versions of the same breakdown family when migrating from an older planning file.

## Breakdown Workflow

### Phase 1 - 剧本拆解

Use the lightweight Scene queue to confirm order, then analyze only the selected Scene body. Identify for that Scene:

- screenplay Scene number and INT/EXT/time-of-day header
- characters appearing in the selected Scene, including first appearances
- locations and location sub-areas
- significant props, vehicles, screens, written notes, weapons, photos, or other visual-focus objects
- dialogue and action beats in the selected Scene
- mood/emotional register of the selected Scene, because it drives camera-emotion sync later
- likely style override material, if the user supplied previous shotlists or director notes

Write Phase 1 with these Chinese subsections:

```markdown
## Phase 1 - 剧本拆解

### 场景清单

| Scene | Header | Characters | Location | Emotional Register | Key Props | Notes |
| --- | --- | --- | --- | --- | --- | --- |

### 动作 / 对白 Beat Map

| Scene | Beat | 动作来源 | 对白来源 | 情绪变化 | 视觉焦点 | 镜头拆分建议 | Prompt Envelope 建议 |
| --- | --- | --- | --- | --- | --- | --- | --- |

### 情绪与镜头倾向

### 导演拆分备注
```

`动作 / 对白 Beat Map` must make the source of every beat explicit: script action line, exact dialogue line, implied reaction, or continuity transition. Extract every source dialogue line in source order before drafting Shot Rows. Preserve the raw speaker cue and exact spoken line; infer the addressee only from the selected Scene's action, adjacent exchange, eyeline, and blocking. If that evidence is insufficient or contradictory, record the ambiguity in `导演拆分备注` and do not invent a named addressee. For every beat, state the emotional change, visual focus, likely shot split, and prompt-envelope recommendation.

Each exact source dialogue line must map to one lip-sync Shot Row, except source-marked `O.S.` / `V.O.` lines, which map to one clearly identified off-screen-audio row. Two independent source dialogue lines may share one Prompt Envelope only when each keeps its own internal shot and Shot Row; never collapse them into one lip-sync shot.

`导演拆分备注` explains which beats become independent shots, which beats can share one prompt envelope, and why the merge preserves the immediate dramatic cause-effect chain.

Use one screenplay Scene label as the production unit:

- `scene-021`
- `scene-001` for derived labels when the script lacks numbering

Do not invent scene numbers. If the source script has no scene numbering, create stable labels from screenplay order, record that they are derived, and preserve the selected Scene's exact header plus opening/closing source lines so later script edits cannot silently shift the mapping.

Record the selected Scene's position in the lightweight queue and its immediate previous/next Scene labels. Do not copy the full screenplay or every Scene body into each Breakdown.

### Phase 2 - 资产请求

Create a clean Chinese asset request organized by the same categories used by `shotlist-builder`:

```markdown
## Phase 2 - 资产请求

### 人物
- <Name>: one-line visual/role description

### 地点
- <Location>: one-line layout and atmosphere description

### 道具
- <Prop>: one-line shape/material/story-use description

### 风格参考
- <Reference>: optional style, wardrobe, or look reference request
```

Project adaptation:

- Common reusable assets belong under `deliverables/2_assets/`.
- Scene-specific one-off assets belong under `deliverables/3_shotlist/<scene-label>_v{N}/assets/`.
- Missing required assets must be marked as blockers for production mode or as draft constraints for `text_only_draft`, `text_dna_draft`, or `prompt_only`.

Record the current state with `asset_origin`, `reference_binding`, `reference_approval`, and `output_status`. Keep old labels only in a `legacy_reference_mode` compatibility note.

If required assets are missing, stop the production handoff. In `interactive`, tell the user which assets to upload/generate and continue only after an explicit draft/reference-limited choice. In `autonomous`, return the missing-asset packet to `guides.primary`, generate or repair the shared references, QA them, update the guide and this Breakdown, then resume Phase 3. Continue as `text_only` only when the user's autonomous scope explicitly ends at text planning.

### Phase 3 - 范围与空间调度

Before Prompt compilation begins, the Breakdown states:

- approved single Scene label
- target Scene package, such as `scene-021_v1`
- required reference images per scene
- image-to-asset mapping status, including ambiguous filenames that must be confirmed
- visual-fact table requirements for every usable reference image: face/hair/body, wardrobe, material/texture, prop geometry, location layout, practical light sources, foreground/background layers, and confusion risks
- scenes that require top-down spatial blocking:
  - 2+ characters in frame
  - key prop on a specific surface
  - complex camera geometry
  - user-requested position change
- likely prompt-density risk: simple, moderate, dense, or overloaded

Write Phase 3 with these Chinese subsections:

```markdown
## Phase 3 - 范围与空间调度

### 范围锁定

### 图片到资产映射

### 空间 Blocking 队列

### 俯视图 / 站位图需求
```

For each blocking item, record what must be approved before Prompt compilation: character positions, eyelines, prop placement, distances, camera positions, main view axis, and any occlusion or frame-edge constraints.

Use `reference/SPATIAL_BLOCKING.md` for the approved spatial schema and the mode-aware fact packet handed to the Prompt compiler.

### Phase 4 - Prompt 编译与 HTML 汇总计划

This phase prepares two separate downstream calls: first `shotlist.prompt_compiler`, then `shotlist.html_assembler`. It writes neither final Prompt prose nor HTML.

Write Phase 4 with these Chinese subsections:

```markdown
## Phase 4 - Prompt 编译与 HTML 汇总计划

### Shot Row Plan

| Scene | Row | Lens / Plan Code | Action Beat | Scene Text Source | Asset / Reference Need | Blocking Note |
| --- | --- | --- | --- | --- | --- | --- |

### Prompt Envelope Plan

| Prompt | Scene | Source Rows | Internal Shot Plan | Beat Boundary | Dialogue Boundary | Character / Asset Set | Intended Duration / Grouping Reason | Next Beat Reserved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

### Prompt ID Reservation

| Reserved Range | Scan Scope | Existing Maximum | Reserved By | Collision Check |
| --- | --- | --- | --- | --- |

### Prompt Density Notes

### Production Batch Plan

| Batch | Prompt IDs | Source Rows | Action Phase | QA Gate |
| --- | --- | --- | --- | --- |

### Scene Package Recommendation
```

`Prompt Envelope Plan` is a hard handoff contract. For every planned prompt, specify which shot rows it contains, the internal shot plan if multiple short beats share one envelope, the first and last action beat, any exact dialogue line that must be preserved, the shortest believable intended duration, why the grouping is safe, and which adjacent beat belongs to the next prompt. Complete dialogue extraction and dialogue-to-Row mapping before grouping Rows into Envelopes; Envelope grouping may not change the speaker, addressee, source order, or one-line/one-lip-sync-shot boundary.

Shot rows and prompt envelopes are different entities. Use `<scene-label>-R<NN>` for rows, such as `scene-021-R01`; use `P###` only for prompt envelopes. Before assigning new prompt IDs, scan Scene folders directly under `deliverables/3_shotlist/` and `archives/3_shotlist/`, find the highest existing `P###`, and reserve a non-overlapping contiguous range in `Prompt ID Reservation`. Preserve migrated IDs only when a retained generated output depends on them; record any legacy aliases in the Scene manifest.

Use the stable Shot Row codes in `reference/PLAN_TYPES.md`; detailed camera and action facts remain in their dedicated planning columns.

Do not inflate every shot row into its own prompt. When short adjacent beats share the same location, character set, spatial axis, and immediate cause-effect turn, plan them as one compact multi-shot envelope with internal timing derived from the action rather than a preset total.

`Prompt Density Notes` follows `reference/PROMPT_DENSITY.md`: group rows only when they share character set, location/sub-location, emotional/temporal unit, spatial axis, selected-generator feasibility, and practical Prompt length. Split when location, character set, blocking, continuous action, or generation reliability changes materially; an insert or cutaway alone does not force a new Envelope.

`Production Batch Plan` is a hard quality gate:

- Prefer 4-8 Prompt Envelopes in one quality pass.
- A Scene with 10 or fewer Envelopes may remain one batch when it is coherent.
- More than 10 Envelopes must be split by action phase, camera family, or reference-set change and reviewed batch by batch.
- Batches are working divisions inside the same Scene Breakdown and final Scene package. Do not create new batch folder taxonomy.

`Scene Package Recommendation` should use one Scene-native folder:

- `scene-021_v1`

When a single Scene is too dense, split the work by action phase inside that Scene: setup, confrontation, decision, release, aftermath, camera family, or reference-set change. Finish QA for the selected Scene before beginning the next Scene.

## Breakdown Artifact Shape

Use this structure exactly:

```markdown
## Phase 1 - 剧本拆解

### 场景清单
### 动作 / 对白 Beat Map
### 情绪与镜头倾向
### 导演拆分备注

## Phase 2 - 资产请求

### 人物
### 地点
### 道具
### 风格参考

## Phase 3 - 范围与空间调度

### 范围锁定
### 图片到资产映射
### 空间 Blocking 队列
### 俯视图 / 站位图需求

## Phase 4 - Prompt 编译与 HTML 汇总计划

### Shot Row Plan
### Prompt Envelope Plan
### Prompt Density Notes
### Production Batch Plan
### Prompt ID Reservation
### Scene Package Recommendation
```

## QA Before Handoff

- Artifact metadata exists and version matches filename.
- Latest numeric script/audit versions were used.
- The audit covers the selected script version and has no unresolved P0/P1 production blocker.
- The selected Scene's position, header, and previous/next labels match the lightweight screenplay queue.
- The artifact covers exactly one selected Scene and records its source header plus opening/closing boundary evidence.
- `动作 / 对白 Beat Map` shows action source, dialogue source, emotional turn, visual focus, shot split recommendation, and prompt-envelope recommendation.
- Every exact source dialogue line appears once and in source order; its raw speaker cue and exact wording are unchanged.
- Each spoken line has one lip-sync Shot Row, while source-marked `O.S.` / `V.O.` lines have one explicit off-screen-audio row; no Row silently absorbs two independent lines.
- Speaker and addressee follow the selected Scene's action, adjacent exchange, eyeline, and blocking. Ambiguity is visible in `导演拆分备注` instead of being replaced with a guessed name.
- `导演拆分备注` explains independent shots and safe merges.
- Asset request is separated into `人物`, `地点`, `道具`, and `风格参考`.
- Missing references and draft-only references are visible before Phase 3.
- Image-to-asset mapping status is explicit before prompt writing.
- Blocking queue includes every multi-character scene, key-prop scene, and complex camera geometry scene.
- `Prompt Envelope Plan` states source rows, internal shot plan when multiple short beats share one envelope, beat boundary, dialogue boundary, intended duration, grouping reason, and next-beat reservation.
- `Production Batch Plan` keeps quality passes near 4-8 Envelopes and splits any Scene above 10 Envelopes before production prompting.
- Shot-row IDs and `P###` prompt IDs are distinct, and `Prompt ID Reservation` proves the range does not collide with active or archived packages.
- Phase 4 recommendation names exact scene scope and whether output is production or draft mode.
- The active interaction-mode gate is satisfied. `interactive` has user approval for this Scene/batch; `autonomous` has repair evidence and no unresolved P0/P1 or fixable downstream-relevant P2.

## Handoff

Report in Simplified Chinese by default:

- active `interaction_mode`
- file created/updated/archived
- selected Scene label and its position in the full script Scene queue
- asset request summary
- missing references or ambiguous filename blockers
- Phase 3 spatial-blocking queue
- Phase 4 `Prompt Envelope Plan` readiness
- production batch count and per-batch Prompt IDs
- recommended next user action before prompt generation

The downstream order is fixed: the orchestrating Agent sends each approved Prompt Envelope to `shotlist.prompt_compiler`, collects the compiled Prompt set, and then passes that set with all Breakdown outputs to `shotlist.html_assembler`. In `interactive`, approval comes from the user gate. In `autonomous`, approval comes from the completed repair-and-QA loop.
