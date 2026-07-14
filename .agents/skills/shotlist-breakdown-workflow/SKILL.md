---
name: shotlist-breakdown-workflow
description: Prepare the project-local four-phase scene breakdown for the shotlist-builder loop. Use as the default shotlist.breakdown slot when creating 03_shotlist_breakdown_v{N}.md with Chinese Phase 1/2/3 analysis, asset requests, spatial-blocking needs, and Phase 4 HTML generation planning.
---

# Shotlist Breakdown Workflow

Use this skill immediately after the script/audit stage when the user wants to move into Seedance/Higgsfield shotlist production.

This skill adapts the `shotlist-builder` four-phase method into the repository planning contract. It locks the analysis, asset request, scope/blocking, and final HTML generation plan. It does not create standalone board prompts, art prompts, video prompts, or final Seedance prompts.

## Slot Compatibility

- slot: `shotlist.breakdown`
- contract_version: `1`
- canonical_outputs:
  - `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md`
- qa_handoff: `qa.primary`
- state_contract: `reference-state-v2`

## Required Inputs

- Latest script: `deliverables/10_story/01_script_v{N}.md`
- Optional audit report: `deliverables/10_story/01_audit_report_v{N}.md`
- Optional asset guide: `deliverables/20_assets/02_asset_guide_v{N}.md`
- Optional style guide: `deliverables/20_assets/02_style_guide_v{N}.md`
- Global locks: `deliverables/00_admin/locks.md`
- Optional user-selected screenplay scene, scene range, or sequence

If an existing `03_storyboard_v{N}.md` planning artifact is needed, read it from `archives/` as legacy input only. If one appears under `deliverables/30_shotlist/`, archive it before continuing. The next saved production planning artifact must be `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md`.

## Outputs

- `deliverables/30_shotlist/03_shotlist_breakdown_v{N}.md`
- Changelog entry and archives when revising
- Optional updates or downstream recommendations for `deliverables/20_assets/`
- No board-prompt, art-prompt, standalone video-prompt, or final Seedance prompt file

The artifact must include metadata and locks. Preserve the artifact ID across versions of the same breakdown family when migrating from an older planning file.

## Breakdown Workflow

### Phase 1 - 剧本拆解

Read the full current script and identify:

- screenplay scene numbers and INT/EXT/time-of-day headers
- characters appearing in each scene, including first appearances
- locations and location sub-areas
- significant props, vehicles, screens, written notes, weapons, photos, or other visual-focus objects
- dialogue and action beats per scene
- mood/emotional register per scene, because it drives camera-emotion sync later
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

`动作 / 对白 Beat Map` must make the source of every beat explicit: script action line, exact dialogue line, implied reaction, or continuity transition. For every beat, state the emotional change, visual focus, likely shot split, and prompt-envelope recommendation.

`导演拆分备注` explains which beats become independent shots, which beats can share one prompt envelope, and why the merge preserves the immediate dramatic cause-effect chain.

Use screenplay scene labels as the production unit:

- `scene-021`
- `scenes-021-023`
- `scene-001` for derived labels when the script lacks numbering

Do not invent scene numbers. If the source script has no scene numbering, create stable labels from screenplay order and record that they are derived.

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

- Common reusable assets belong under `deliverables/20_assets/`.
- Scene-specific one-off assets belong under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/assets/`.
- Missing required assets must be marked as blockers for production mode or as draft constraints for `text_only_draft`, `text_dna_draft`, or `prompt_only`.

Record the current state with `asset_origin`, `reference_binding`, `reference_approval`, and `output_status`. Keep old labels only in a `legacy_reference_mode` compatibility note.

If required assets are missing, stop the production handoff and tell the user which assets to generate/upload before Phase 3. Continue only if the user explicitly accepts a draft/reference-limited mode.

### Phase 3 - 范围与空间调度

Before `shotlist.primary` writes prompts, the breakdown should state:

- approved scene scope or scene range, if already known
- candidate scene packages, using screenplay scene names such as `scene-021_v1` or `scenes-021-023_v1`
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

For each blocking item, record what must be approved before prompts are written: character positions, eyelines, prop placement, distances, camera positions, main view axis, and any occlusion or frame-edge constraints.

### Phase 4 - HTML 分镜生成计划

This phase prepares the handoff to `sketch-shotlist-workflow`; it does not write final prompts or HTML.

Write Phase 4 with these Chinese subsections:

```markdown
## Phase 4 - HTML 分镜生成计划

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

### Scene Package Recommendation
```

`Prompt Envelope Plan` is a hard handoff contract. For every planned prompt, specify which shot rows it contains, the internal shot plan if multiple short beats share one envelope, the first and last action beat, any exact dialogue line that must be preserved, the shortest believable intended duration, why the grouping is safe, and which adjacent beat belongs to the next prompt.

Shot rows and prompt envelopes are different entities. Use `<scene-label>-R<NN>` for rows, such as `scene-021-R01`; use `P###` only for prompt envelopes. Before assigning new prompt IDs, scan `deliverables/30_shotlist/scenes/` and `archives/30_shotlist/scenes/`, find the highest existing `P###`, and reserve a non-overlapping contiguous range in `Prompt ID Reservation`. Preserve migrated IDs only when a retained generated output depends on them; record any legacy aliases in the scene-package manifest.

Do not inflate every shot row into its own prompt. When short adjacent beats share the same location, character set, spatial axis, and immediate cause-effect turn, plan them as one compact multi-shot envelope with internal timing derived from the action rather than a preset total.

`Prompt Density Notes` follows `../sketch-shotlist-workflow/reference/PROMPT_DENSITY.md`: group rows only when they share character set, location/sub-location, emotional/temporal unit, spatial axis, selected-generator feasibility, and practical prompt length. Split when location, character set, blocking, continuous action, or generation reliability changes materially; an insert or cutaway alone does not force a new envelope.

`Scene Package Recommendation` should use scene-native names:

- `scene-021_v1`
- `scene-023_v1`
- `scenes-021-023_v1` for a small approved range

When a single scene is too dense, recommend splitting by action phase inside that scene: setup, confrontation, decision, release, aftermath, camera family, or reference-set change.

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

## Phase 4 - HTML 分镜生成计划

### Shot Row Plan
### Prompt Envelope Plan
### Prompt Density Notes
### Prompt ID Reservation
### Scene Package Recommendation
```

## QA Before Handoff

- Artifact metadata exists and version matches filename.
- Latest numeric script/audit versions were used.
- Scene inventory preserves screenplay order.
- `动作 / 对白 Beat Map` shows action source, dialogue source, emotional turn, visual focus, shot split recommendation, and prompt-envelope recommendation.
- `导演拆分备注` explains independent shots and safe merges.
- Asset request is separated into `人物`, `地点`, `道具`, and `风格参考`.
- Missing references and draft-only references are visible before Phase 3.
- Image-to-asset mapping status is explicit before prompt writing.
- Blocking queue includes every multi-character scene, key-prop scene, and complex camera geometry scene.
- `Prompt Envelope Plan` states source rows, internal shot plan when multiple short beats share one envelope, beat boundary, dialogue boundary, intended duration, grouping reason, and next-beat reservation.
- Shot-row IDs and `P###` prompt IDs are distinct, and `Prompt ID Reservation` proves the range does not collide with active or archived packages.
- Phase 4 recommendation names exact scene scope and whether output is production or draft mode.

## Handoff

Report in Simplified Chinese by default:

- file created/updated/archived
- scene count and requested scope
- asset request summary
- missing references or ambiguous filename blockers
- Phase 3 spatial-blocking queue
- Phase 4 `Prompt Envelope Plan` readiness
- recommended next user action before prompt generation
