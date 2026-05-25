# Runway Gen-3 Video Prompt Guide

## Overview

Runway Gen-3 Alpha uses natural language prompts for video generation. It excels at understanding complex camera movements and scene descriptions.

## Prompt Structure

```
[Scene description] + [Camera movement] + [Subject action] + [Atmosphere/Style]
```

## Camera Movement Keywords

### Basic Movements
```
Static shot of...
Camera slowly pushes in on...
Camera pulls back to reveal...
Camera pans left/right across...
Camera tilts up/down to show...
```

### Advanced Movements
```
Tracking shot following...
Orbit shot circling around...
Crane shot rising above...
Dolly zoom on... (vertigo effect)
Handheld camera following...
```

### Movement Modifiers
```
Slowly / Gradually / Smoothly
Quickly / Rapidly / Suddenly
Steadily / Gently / Dramatically
```

## Subject Motion Keywords

### Basic Actions
```
A person walking through...
A figure standing still as...
Someone running towards...
A character turning to face...
```

### Detailed Actions
```
Hair flowing in the wind
Dress billowing gently
Leaves rustling and falling
Water rippling outward
Smoke rising slowly
```

## Atmosphere Keywords

### Lighting
```
Golden hour sunlight
Soft diffused morning light
Dramatic rim lighting
Moody shadows
Volumetric fog/rays
```

### Style
```
Cinematic quality
Documentary style
Dreamlike and ethereal
Hyper-realistic
Stylized animation
```

## Technical Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| Duration | 4s, 8s, 16s | Video length |
| Resolution | 720p, 1080p | Output quality |
| Aspect Ratio | 16:9, 9:16, 1:1 | Frame shape |

## Complete Examples

### Example 1: Emotional Portrait
```
Close-up of a young woman's face as she slowly turns toward camera,
soft golden hour light illuminating her features,
hair gently moving in a light breeze,
shallow depth of field with bokeh background,
cinematic quality, 4s duration
```

### Example 2: Action Sequence
```
Tracking shot following a man running through a narrow alley,
camera keeping pace beside him,
dramatic shadows from overhead lights,
puddles splashing under his feet,
tense atmospheric, 8s duration
```

### Example 3: Establishing Shot
```
Crane shot rising slowly above a misty mountain village at dawn,
traditional houses with tiled roofs coming into view,
smoke rising from chimneys,
birds flying past camera,
peaceful and serene atmosphere, 16s duration
```

### Example 4: Reveal Shot
```
Static shot of an empty room, camera holds steady,
then slowly pushes in toward a window,
through which we see a figure approaching in the distance,
suspenseful mood, soft ambient lighting, 8s duration
```

## Best Practices

✅ Be specific about camera movement direction and speed
✅ Describe subject motion separately from camera motion
✅ Include atmospheric details (lighting, weather)
✅ Specify duration when important
✅ Use natural language, not technical jargon

## Avoid

❌ Conflicting movements (push in AND pull out)
❌ Too many actions in short duration
❌ Vague descriptions without direction
❌ Ignoring physics (impossible movements)

## Mode Selection

### Text-to-Video
- Full prompt describes entire scene
- Best for creative concepts

### Image-to-Video
- Uses keyframe as starting point
- Prompt describes motion only
- Higher visual consistency

When using Image-to-Video:
```
The woman in the image slowly turns her head,
a gentle smile forming on her face,
hair swaying slightly in the breeze
```

## Duration Guidelines

| Duration | Best For |
|----------|----------|
| 4s | Close-ups, simple motions |
| 8s | Medium shots, moderate action |
| 16s | Complex sequences, multiple actions |
