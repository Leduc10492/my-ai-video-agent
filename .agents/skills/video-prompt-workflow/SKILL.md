---
name: video-prompt-workflow
description: Generate video prompts from storyboard and art artifacts. Use as the default video.prompt_builder slot for text-to-video prompts, image-to-video motion prompts, camera-motion specs, or per-shot video batches.
---

# Video Prompt Workflow

Use this skill to create or revise `deliverables/60_motion/06_video_prompts_v{N}.md`.

This is the current default implementation for the `video.prompt_builder` slot in `.agents/skill_registry.md`. Camera and subject motion detail comes from the `video.motion_adapter` slot, currently `video-motion-design`.

## Required Inputs

- Latest storyboard: `deliverables/30_breakdown/03_storyboard_v{N}.md`
- Latest style guide: `deliverables/20_guides/02_style_guide_v{N}.md`
- Latest asset guide: `deliverables/20_guides/02_asset_guide_v{N}.md`
- Optional art prompts: `deliverables/50_art/05_art_prompts_v{N}.md`
- Optional storyboard sheets: `deliverables/40_boards/generated/`
- Optional draft keyframes: `deliverables/50_art/generated/`
- Optional production keyframes: latest `deliverables/50_art/generated_ref_v{N}/`

Use the current `video.motion_adapter` implementation for camera and subject motion rules.

## Choose Mode

Ask only for missing choices:

- Platform: user requested platform, or one supported by the current video slot implementation
- Input type: text-to-video / image-to-video
- Range: all / section / shot range / selected shots
- Output length per shot
- Whether generated keyframes already exist

Default: if final keyframes are not available, use text-to-video prompts from storyboard and style guide.

## Per-Shot Motion Schema

Each video prompt should capture:

| Field | Meaning |
| --- | --- |
| Shot ID | Source shot number |
| Source | Storyboard/art/keyframe reference |
| Duration | Seconds |
| Frame | What is visible at first frame |
| Subject motion | Character/object action |
| Camera motion | Static, push-in, dolly out, pan, track, handheld, etc. |
| Motion intensity | subtle / moderate / dramatic |
| Emotional purpose | Why this motion exists |
| Style constraints | Lighting, color, texture |
| Negative constraints | Avoid drift, extra limbs, changed character, text artifacts |

## Output Template

```markdown
### Shot 010

**Platform**: Runway Gen-3
**Input Type**: Text-to-Video
**Duration**: 4s
**Source**: `03_storyboard_v1.md`, Shot 010
**Motion Purpose**: deliver information while preserving classroom stillness

**Prompt**:
```text
<platform-ready video prompt>
```

**Camera**: static eye-level medium shot
**Subject Motion**: teacher speaking, students react subtly
**Avoid**:
- changed uniforms
- exaggerated acting
- extra characters in foreground
- unstable camera
```

## Platform Notes

- Keep platform notes inside the current video implementation or its references.
- The default references cover Runway, Pika, and SVD.
- Replacement implementations may support other platforms, but must preserve the output schema and source/keyframe rules.

Do not mix platform syntax in the same prompt block.

## Image-to-Video Rules

When using keyframes:

- Reference the exact image path.
- Prefer `deliverables/50_art/generated_ref_v{N}/` for production image-to-video prompts.
- Treat `deliverables/50_art/generated/` as draft review material unless its manifest explicitly says `image_reference_bound`.
- Keep motion small unless the source image was designed for large motion.
- Avoid changing hair, outfit, props, background layout, or lighting.
- Use camera motion to enhance emotion, not to hide identity drift.

## Batch Strategy

Generate by section or shot range:

- quiet story section: 6-10 shots per batch
- heavy continuity section: 3-5 shots per batch
- image-to-video batch: only shots with available keyframes

After each batch, run video QA before continuing.

## Save

Save to `deliverables/60_motion/06_video_prompts_v{N}.md` with artifact metadata. Archive prior current version through `version-management` and append changelog.
