# E-conte Preview Prompt Template

Use one prompt per Seedance prompt envelope.

```text
Create a vertical Japanese manga e-conte strip for production review.

Format:
- portrait 9:16 e-conte sheet
- {PANEL_COUNT} stacked panels in top-to-bottom order
- black-and-white rough pencil/ink line art on white paper
- simple readable figures, clear blocking, clear eyelines
- red camera frame boxes and blue motion arrows only if they clarify staging
- no polished anime coloring, no final key art, no photorealism
- no vertical text, no decorative lettering, no subtitles

Continuity:
- source prompt envelope: {PROMPT_ID}
- source shot rows: {SHOT_IDS}
- scene/location: {LOCATION}
- characters and visual DNA: {CHARACTER_DNA}
- props/anchors: {PROPS}
- spatial blocking: {SPATIAL_BLOCKING}

Panels:
{PANEL_BEATS}

Purpose:
Help the director judge staging, shot order, and motion readability before using the Seedance prompt. This is a rough preview, not a production keyframe.
```

## Panel Beat Format

```text
Panel {N}: {plan_type}, {camera_note}. {visible_action}. {emotion_or_micro_beat}. Composition priority: {composition_priority}.
```
