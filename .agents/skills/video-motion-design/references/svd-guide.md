# Stable Video Diffusion (SVD) Guide

## Overview

Stable Video Diffusion specializes in image-to-video generation. It animates a static image with realistic motion while preserving the original visual style.

## Mode

**Image-to-Video only** - Requires a source image (keyframe).

## Core Concept

SVD takes a source image and generates video by:
1. Analyzing the image content
2. Predicting realistic motion
3. Maintaining visual consistency

## Primary Parameter

### motion_bucket_id

Controls motion intensity.

| Value | Effect | Use Case |
|-------|--------|----------|
| 20-50 | Very subtle | Portraits, ambient |
| 50-100 | Light motion | Gentle scenes |
| 100-150 | Moderate | Standard motion |
| 150-200 | Strong | Dynamic scenes |
| 200-255 | Maximum | High action |

## Prompt Structure

For SVD, prompts describe the motion to apply:

```
[Subject motion] + [Environmental motion] + [Atmosphere changes]
```

## Motion Description Examples

### Subtle Motion (motion_bucket_id: 30-50)
```
Gentle breathing motion
Subtle hair movement in light breeze
Eyes blinking slowly
Slight fabric ripple
```

### Light Motion (motion_bucket_id: 50-100)
```
Head slowly turning
Hair flowing gently
Leaves rustling in background
Soft fabric movement
```

### Moderate Motion (motion_bucket_id: 100-150)
```
Walking forward slowly
Arms gesturing while speaking
Dress flowing in wind
Water rippling prominently
```

### Strong Motion (motion_bucket_id: 150-200)
```
Running or dancing
Hair whipping dramatically
Clothes billowing strongly
Action movements
```

## Best Practices

### Image Selection
✅ High resolution source images
✅ Clear subject definition
✅ Neutral or dynamic poses work best
✅ Good lighting in source

### Motion Planning
✅ Match motion_bucket_id to content
✅ Keep prompts focused on motion
✅ Describe realistic physics
✅ Consider source image pose

### Technical
✅ 1024x576 or 576x1024 recommended
✅ 14-25 frames typical
✅ fps 6-8 for smooth playback

## Complete Examples

### Example 1: Portrait Animation
```
Source: Portrait photo of woman
motion_bucket_id: 40

Prompt:
Gentle breathing motion, eyes blinking softly,
subtle movement in loose hair strands,
peaceful expression maintained
```

### Example 2: Nature Scene
```
Source: Mountain landscape with clouds
motion_bucket_id: 80

Prompt:
Clouds drifting slowly across sky,
mist rolling through valley,
trees swaying gently in breeze
```

### Example 3: Action Portrait
```
Source: Warrior in battle stance
motion_bucket_id: 150

Prompt:
Cape billowing dramatically behind,
hair whipping in strong wind,
slight movement forward into stance
```

### Example 4: Ambient Scene
```
Source: Cozy fireplace interior
motion_bucket_id: 60

Prompt:
Fire flickering and dancing,
shadows playing on walls,
subtle smoke rising
```

## Limitations

❌ Cannot add new elements not in source
❌ Cannot change camera angle
❌ Cannot dramatically alter composition
❌ Limited to realistic motion physics

## Workflow Integration

1. Generate keyframe using art prompt (Midjourney/等)
2. Save or reference keyframe from latest `deliverables/50_art/generated_ref_v{N}/`
3. Create SVD prompt describing motion
4. Set appropriate motion_bucket_id
5. Generate video
6. Review and iterate

## Duration

- Default: 14 frames (~2s at 7fps)
- Extended: 25 frames (~3.5s at 7fps)

## Quality Tips

1. **Higher motion_bucket_id = more risk**
   - Start lower, increase if needed
   - High values can cause distortion

2. **Source image matters most**
   - Quality in = quality out
   - Composition affects motion naturally

3. **Keep prompts motion-focused**
   - Don't describe static elements
   - Focus on what should move
