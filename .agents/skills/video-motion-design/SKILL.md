---
name: video-motion-design
description: Design camera and subject motion for video generation. Use as the default video.motion_adapter slot when creating video prompts that require specific movement descriptions.
---

# Video Motion Design

Design camera movements and subject motion for video generation platforms.

This is the current default implementation for the `video.motion_adapter` slot in `.agents/skill_registry.md`.

## When to Use

- Creating video generation prompts
- Describing camera movements for shots
- Specifying motion parameters for platforms

## Camera Movement Types

| Movement | Description | Narrative Purpose |
|----------|-------------|-------------------|
| Static | Camera fixed, only subject moves | Stability, observation |
| Push In | Camera moves forward | Focus, intimacy, tension |
| Pull Out | Camera moves backward | Context, reveal, isolation |
| Pan | Horizontal rotation | Follow action, environment |
| Tilt | Vertical rotation | Reveal height, power dynamics |
| Tracking | Follow alongside subject | Journey, pursuit |
| Orbit | Circle around subject | Examination, drama |
| Crane | Vertical movement | Establish, transcend |

## Motion Speed

| Speed | Multiplier | Use Case |
|-------|------------|----------|
| Slow motion | 0.3-0.6x | Emotion, detail, impact |
| Normal | 1.0x | Realistic narrative |
| Fast | 1.2-1.5x | Tension, action, urgency |

## Motion Amplitude

| Level | Range | Use Case |
|-------|-------|----------|
| Subtle | 0.2-0.4 | Portraits, close-ups |
| Moderate | 0.5-0.7 | Standard shots |
| Dramatic | 0.8-1.0 | Action, reveals |

## Design Principles

### Serve the Narrative
- **Reveal information**: Push in, pan to show context
- **Emphasize emotion**: Slow motion, close-up
- **Guide attention**: Tracking, orbit
- **Create tension**: Fast cuts, unstable camera

### Maintain Continuity
- Consistent movement style within sequences
- Logical direction changes
- Smooth speed transitions

### Technical Feasibility
- Know platform motion limits
- Avoid overly complex combinations
- Control amplitude to prevent distortion

## Platform Quick Reference

| Platform | Motion Control | Best For |
|----------|----------------|----------|
| Runway Gen-3 | Natural language | Complex camera moves |
| Pika Labs | -motion parameter | Simple, consistent motion |
| SVD | motion_bucket_id | Subtle image animation |

**Platform details**: See `references/` for:
- `runway-guide.md`
- `pika-guide.md`
- `svd-guide.md`

## Motion Description Template

```
Camera: [movement type] at [speed] with [amplitude]
Subject: [action description] at [speed]
Duration: [seconds]
```

Example:
```
Camera: Slow push in, subtle amplitude
Subject: Woman turns to face camera, reaching out hand
Duration: 4s
```

## Image-To-Video Field Schema

Use this table shape when a keyframe exists:

| Field | Required | Description |
| --- | --- | --- |
| `source_keyframe` | yes | Exact path to the reference-bound keyframe image |
| `input_type` | yes | image-to-video |
| `duration` | yes | Shot duration from storyboard |
| `camera` | yes | Camera motion from storyboard |
| `identity_preservation` | yes | What must remain unchanged from source image |
| `motion_scope` | yes | Allowed movement only: camera drift, micro-expression, hair/fabric/environment motion |
| `negative` | yes | Identity drift, changed hair, changed costume, random text, logo, watermark |

For production video prompts, do not ask the model to redesign characters. The keyframe owns identity and composition; the motion prompt only animates it.
