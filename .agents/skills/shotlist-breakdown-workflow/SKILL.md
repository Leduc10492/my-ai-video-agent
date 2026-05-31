---
name: shotlist-breakdown-workflow
description: Convert scripts into production shotlist breakdowns for Seedance/Higgsfield work. Use as the default shotlist.breakdown slot when creating 03_shotlist_breakdown_v{N}.md with shot blocks, prompt-envelope ranges, asset requirements, spatial-blocking gates, and QA notes.
---

# Shotlist Breakdown Workflow

Use this skill before Phase 4 shotlist HTML generation. It replaces the old visual-planning stage as the active structural middle layer.

The output is not a board-prompt or art-prompt artifact. It is a production planning artifact that lets `sketch-shotlist-workflow` generate stable Seedance/Higgsfield prompt envelopes without drifting in long tasks.

## Required Inputs

- Latest script: `deliverables/10_story/01_script_v{N}.md`
- Optional audit report: `deliverables/10_story/01_audit_report_v{N}.md`
- Optional asset guide: `deliverables/20_guides/02_asset_guide_v{N}.md`
- Optional style guide: `deliverables/20_guides/02_style_guide_v{N}.md`
- Global locks: `deliverables/00_admin/locks.md`
- Optional user-selected scene, sequence, or shot range

If an existing `deliverables/30_breakdown/03_storyboard_v{N}.md` is the latest planning artifact, treat it as legacy input. The next saved production breakdown must use `deliverables/30_breakdown/03_shotlist_breakdown_v{N}.md`.

## Outputs

- `deliverables/30_breakdown/03_shotlist_breakdown_v{N}.md`
- Changelog entry and archives when revising
- No board prompt, art prompt, or standalone video prompt file

The artifact must include metadata and locks. Preserve the artifact ID across versions of the same breakdown family when migrating from a legacy storyboard file.

## Breakdown Workflow

### 1. Scope The Task

Define whether the output covers:

- full script
- one sequence
- one scene
- a shot-block range such as `SB071-SB080`

For long-form work, prefer full-script planning at the shot-block level, then Phase 4 prompt generation in small batches.

### 2. Build A Beat Map

Create a compact beat map:

| Beat/Section | Time Budget | Location | Characters | Emotional Value | Required Visual Motif | Shot Blocks |
| --- | ---: | --- | --- | --- | --- | --- |

Rules:

- Each beat must have narrative or emotional function.
- Mark object arcs and motif state changes.
- Mark required crowd, vehicle, screen, prop, and location transitions.
- Preserve duration locks from the script, audit, or `locks.md`.

### 3. Create Shot Blocks

Each row should be a script-beat or camera-emotion unit, not a final video prompt.

Use this structure:

```markdown
### Shot SB-001
**Prompt envelopes**: P001-P004
**Source scene**: <script scene or beat>
**Plan**: <what this shot block changes or reveals>
**Camera / lens**: <camera position, lens, movement, emotional purpose>
**Performance micro-beats**: <specific physical beats that must read>
**Assets / blocking gate**: <characters, props, locations, missing refs, blocking need>
**QA notes**: <known drift risks, adjacency risks, or production blockers>
```

Shot block rules:

- Preserve story order and source scene mapping.
- Use stable `SB###` IDs and future `P###` envelope ranges.
- Assign 15-second envelope ranges where possible, but do not write final Seedance prompt text here.
- Mark rows with two or more characters, crowd movement, vehicles, or key props on surfaces as requiring spatial blocking.
- Mark missing asset or style guides as production blockers or draft-mode constraints.

### 4. Preflight Phase 4

Before handing off to `shotlist.primary`, list:

- approved scope for Phase 4
- required characters, locations, props, vehicles, screens, and wardrobe states
- missing or draft-only references
- spatial-blocking decisions needed
- long-task batch splits
- reference mode allowed for the next step: `prompt_only`, `text_only_draft`, `text_dna_draft`, or `image_reference_bound`

For any scope above 10 prompt envelopes, propose batches of 4-8 envelopes or one tight dramatic beat cluster. Do not recommend one unreviewed generation pass for long ranges.

## QA Before Handoff

- Artifact metadata exists and version matches filename.
- Latest numeric script/audit versions were used.
- Shot block count matches the summary table.
- Duration totals match the target or explain variance.
- Every shot block has source scene, plan, camera/lens, performance micro-beats, assets/blocking gate, and QA notes.
- Every future prompt envelope range is unique and monotonic.
- Missing guides, missing references, and spatial-blocking gaps are visible before Phase 4.
- Downstream handoff names the next exact scope and whether output is production or draft mode.

## Handoff

Report in Simplified Chinese by default:

- file created/updated/archived
- shot-block count and estimated prompt-envelope count
- next Phase 4 batch recommendation
- missing references or spatial-blocking blockers
- whether QA should run before prompt generation
