---
name: shotlist-breakdown-workflow
description: Prepare the project-local scene breakdown for the shotlist-builder four-phase loop. Use as the default shotlist.breakdown slot when creating 03_shotlist_breakdown_v{N}.md with screenplay scenes, action beats, asset requests, style/reference status, spatial-blocking needs, and Phase 4 scope notes.
---

# Shotlist Breakdown Workflow

Use this skill immediately after the script/audit stage when the user wants to move into Seedance/Higgsfield shotlist production.

This skill adapts the `shotlist-builder` Phase 1 and Phase 2 work into the repository file contract. It does not create standalone board prompts, art prompts, video prompts, or final Seedance prompts.

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

The artifact must include metadata and locks. Preserve the artifact ID across versions of the same breakdown family when migrating from a legacy planning file.

## Breakdown Workflow

### Phase 1 - Read The Script

Read the full current script and identify:

- screenplay scene numbers and INT/EXT/time-of-day headers
- characters appearing in each scene, including first appearances
- locations and location sub-areas
- significant props, vehicles, screens, written notes, weapons, photos, or other visual-focus objects
- dialogue and action beats per scene
- mood/emotional register per scene, because it drives camera-emotion sync later
- likely style override material, if the user supplied previous shotlists or director notes

Do not invent scene numbers. If the source script has no scene numbering, create stable scene labels from screenplay order, such as `scene-001`, `scene-002`, and record that they are derived labels.

### Phase 2 - Asset Request

Create a clean asset request organized by the same categories used by `shotlist-builder`:

```markdown
## Characters
- <Name>: one-line visual/role description

## Locations
- <Location>: one-line layout and atmosphere description

## Props
- <Prop>: one-line shape/material/story-use description

## Style References
- <Reference>: optional style or wardrobe reference request
```

Project adaptation:

- Common reusable assets belong under `deliverables/20_assets/`.
- Scene-specific one-off assets belong under `deliverables/30_shotlist/scenes/<scene-scope>_v{N}/assets/`.
- Missing required assets must be marked as blockers for production mode or as draft constraints for `text_only_draft`, `text_dna_draft`, or `prompt_only`.

If required assets are missing, stop the production handoff and tell the user which assets to generate/upload before Phase 3. Do not jump directly to final HTML unless the user explicitly accepts draft mode.

### Phase 3 Prep - Scope And Spatial Blocking Needs

Before `shotlist.primary` writes prompts, the breakdown should state:

- approved scene scope or scene range, if already known
- candidate scene packages, using screenplay scene names such as `scene-021_v1` or `scenes-021-023_v1`
- required reference images per scene
- ambiguous filenames or asset mappings that must be confirmed
- scenes that require top-down spatial blocking:
  - 2+ characters in frame
  - key prop on a specific surface
  - complex camera geometry
  - user-requested position change
- likely prompt-density risk: simple, moderate, dense, or overloaded

Do not use legacy storyboard IDs as the new production split unit. Legacy legacy storyboard IDs IDs may be preserved only when reading or migrating older artifacts.

## Breakdown Artifact Shape

Use this structure:

```markdown
## Scene Inventory

| Scene | Header | Characters | Location | Emotional Register | Key Props | Notes |
| --- | --- | --- | --- | --- | --- | --- |

## Action Beat Map

| Scene | Beat | Dialogue / Action Source | Emotional Turn | Visual Focus | Asset Need | Blocking Need |
| --- | --- | --- | --- | --- | --- | --- |

## Asset Request

## Phase 3 Blocking Queue

## Phase 4 Scope Recommendation
```

Phase 4 scope recommendations should use scene-native names:

- `scene-021_v1`
- `scene-023_v1`
- `scenes-021-023_v1` only for a small approved range

When a single scene is too dense, recommend splitting by action phase inside that scene: setup, confrontation, decision, release, aftermath, camera family, or reference-set change.

## QA Before Handoff

- Artifact metadata exists and version matches filename.
- Latest numeric script/audit versions were used.
- Scene inventory preserves screenplay order.
- Asset request is separated into Characters, Locations, Props, and Style References.
- Missing references and draft-only references are visible before Phase 3.
- Blocking queue includes every multi-character scene, key-prop scene, and complex camera geometry scene.
- Phase 4 recommendation names exact scene scope and whether output is production or draft mode.

## Handoff

Report in Simplified Chinese by default:

- file created/updated/archived
- scene count and requested scope
- asset request summary
- missing references or ambiguous filename blockers
- Phase 3 spatial-blocking queue
- recommended next user action before prompt generation
