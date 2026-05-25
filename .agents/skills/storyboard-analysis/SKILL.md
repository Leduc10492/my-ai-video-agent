---
name: storyboard-analysis
description: Analyze short-film, MV, ad, and animation scripts into production-ready storyboard beats and shot cuts. Use when converting a script into a shot table, estimating shot duration, planning montage sections, or checking whether storyboard shots serve narrative function.
---

# Storyboard Analysis

Use this skill before creating or revising `deliverables/30_breakdown/03_storyboard_v{N}.md`.

## Inputs

- Latest script: `deliverables/10_story/01_script_v{N}.md`
- Optional asset guide: `deliverables/20_guides/02_asset_guide_v{N}.md`
- Optional style guide: `deliverables/20_guides/02_style_guide_v{N}.md`
- Global locks: `deliverables/00_admin/locks.md`

## Analysis Workflow

### 1. Classify Format

Identify the project format first because shot rhythm changes by format:

- MV / music video: emotion, rhythm, motif, and visual repetition drive cuts.
- Short film: scene conflict and dramatic turns drive cuts.
- Ad: product/action clarity and recall drive cuts.
- Animation: staging, silhouette, and continuity drive cuts.

For an MV under 5 minutes, do not use long-form sequence assumptions like "10-15 minute sequences". Treat song sections, emotional beats, object motifs, and montage arcs as the main segmentation layer.

### 2. Build Beat Map

Create a compact beat map:

| Beat/Section | Time Budget | Location | Characters | Emotional Value | Required Visual Motif | Output Shots |
| --- | --- | --- | --- | --- | --- | --- |

Rules:

- Each beat must have a narrative or emotional function.
- Mark object arcs such as Walkman, survey form, phone, instrument, letter, product, or weapon.
- Mark visual contrast pairs such as before/after, near/far, warm/cold, together/apart.

### 3. Decide Shot Count

Use duration-driven shot planning:

| Use case | Typical shot length | Notes |
| --- | --- | --- |
| Quiet emotional beat | 4-8s | allow micro-expression and stillness |
| Dialogue/info beat | 3-5s | keep information legible |
| Object insert | 1-3s | use only when object state matters |
| Montage | 1-2.5s | repeat visual grammar intentionally |
| Climax / rupture | 2-5s | vary length to create impact |
| Closing resolve | 5-8s | give final image time to land |

Check total duration against project budget. If the script already has duration locks, preserve them.

### 4. Cut New Shots

Create a new shot when one of these changes:

- point of view
- subject/object focus
- emotional value
- action phase
- spatial relationship
- time jump
- motif state
- rhythm section

Avoid creating a new shot only because the prose has a new sentence.

### 5. Assign Shot Language

For each shot, decide:

- Shot size: wide / medium / close-up / extreme close-up / montage.
- Camera: static / tracking / pan / tilt / dolly in / dolly out / handheld / slow motion.
- Duration: seconds.
- Narrative function: what this shot changes or reveals.
- Continuity anchor: object, eyeline, screen direction, color temperature, or body position.

## Output Draft Template

```markdown
### Shot 001
**对应Beat**: Beat X
**景别**: <Wide/Medium/Close-Up/ECU/Montage>
**机位**: <static/tracking/dolly/pan/etc>
**时长**: <seconds>

**画面描述**:
<concrete visible action and composition>

**角色/场景**: <who/where>
**道具/视觉锚点**: <props/motifs>
**对白/旁白**: <dialogue/VO/none>
**视觉重点**: <what the viewer must notice>
**叙事功能**: <what changes or is revealed>
```

## MV-Specific Checks

- Does every repeated motif evolve, rather than repeat flatly?
- Does the edit rhythm follow the song section or emotional contour?
- Are empty/quiet shots intentionally placed, not accidental filler?
- Are object inserts tied to state change?
- Are montage shots grouped clearly enough for downstream prompt batching?
- Are character positions consistent with the asset guide's relationship rules?

## Handoff

Pass the analyzed shot table to `storyboard-workflow`. Use `qa-checklists` after the table is drafted to validate duration, shot count, narrative function, and continuity.
