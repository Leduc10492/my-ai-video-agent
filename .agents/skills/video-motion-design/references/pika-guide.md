# Pika Labs Video Prompt Guide

## Overview

Pika Labs uses concise prompts with specific parameters to control video generation. Known for stylized animations and consistent motion.

## Prompt Structure

```
[Scene description] [Parameters]
```

## Parameters

### Motion Intensity (-motion)
Controls overall motion amount.

| Value | Effect |
|-------|--------|
| -motion 1 | Subtle, minimal movement |
| -motion 2 | Light movement |
| -motion 3 | Moderate movement |
| -motion 4 | Strong movement |

### Frames Per Second (-fps)
Controls video smoothness.

| Value | Effect |
|-------|--------|
| -fps 8 | Stylized, stop-motion feel |
| -fps 24 | Standard cinematic |

### Aspect Ratio (-ar)
Output frame shape.

| Value | Use Case |
|-------|----------|
| -ar 16:9 | Landscape, cinematic |
| -ar 9:16 | Portrait, mobile |
| -ar 1:1 | Square, social |
| -ar 4:3 | Classic |

### Guidance Scale (-gs)
How closely to follow the prompt.

| Value | Effect |
|-------|--------|
| -gs 8 | More creative freedom |
| -gs 12 | Balanced (default) |
| -gs 16 | Strict prompt following |

### Negative Prompt (-neg)
Elements to avoid.

```
-neg "blurry, distorted, static, frozen"
```

## Camera Movement Commands

Pika supports specific camera commands:

```
camera zoom in
camera zoom out
camera pan left
camera pan right
camera tilt up
camera tilt down
camera rotate left
camera rotate right
```

## Complete Examples

### Example 1: Subtle Portrait
```
A woman with flowing hair looking at camera,
soft lighting, gentle breeze moving her hair
-motion 1 -ar 16:9 -fps 24
```

### Example 2: Action Scene
```
A warrior swinging sword through the air,
dust particles flying, dramatic lighting,
camera zoom in
-motion 4 -ar 21:9 -fps 24
```

### Example 3: Atmospheric Landscape
```
Misty mountains at dawn, clouds slowly drifting,
sun rays breaking through, peaceful atmosphere,
camera pan right
-motion 2 -ar 16:9 -fps 24
```

### Example 4: Stylized Animation
```
Anime style girl spinning around,
cherry blossoms falling around her,
magical sparkles, pastel colors,
camera rotate left
-motion 3 -ar 1:1 -fps 8
```

## Motion Descriptions

### Subject Motion Keywords
```
floating / drifting / hovering
walking / running / jumping
turning / spinning / dancing
waving / reaching / grabbing
breathing / blinking / smiling
```

### Environment Motion Keywords
```
wind blowing / leaves falling
water flowing / rippling
fire flickering / burning
clouds moving / drifting
light rays shifting
```

## Best Practices

✅ Keep prompts concise (under 100 words)
✅ Use -motion appropriately for content
✅ Include one camera command if needed
✅ Specify atmosphere/style
✅ Use -neg to prevent unwanted elements

## Avoid

❌ Multiple camera commands together
❌ Overly complex scenes
❌ Conflicting motion descriptions
❌ Very long prompts

## Mode Selection

### Text-to-Video
```
[Full scene description] [parameters]
```

### Image-to-Video
```
[Motion description only] [parameters]
```

When using Image-to-Video, describe only motion:
```
The subject slowly turns, hair flowing,
a gentle smile appearing
-motion 2 -ar 16:9
```

## Duration

Pika generates 3-second clips by default.
- Extend in editor for longer sequences
- Loop for continuous motion
