# Nano Banana Prompt Guide

## Format

JSON structured prompts with specific fields for character and style consistency.

## Base Schema

```json
{
  "shot_id": "shot_001",
  "prompt": "Natural language scene description",
  "negative_prompt": "Elements to avoid",
  "character_ref": "character_id",
  "character_consistency": "high",
  "style_ref": "style_id",
  "camera": {
    "shot_type": "medium_shot",
    "angle": "eye_level",
    "movement": "static"
  },
  "params": {
    "aspect_ratio": "16:9",
    "quality": "high"
  }
}
```

## Field Specifications

### prompt (required)
Natural language description of the scene.
- Be specific about actions, expressions, positions
- Include environmental details
- Reference time of day/lighting

```json
"prompt": "A young woman with long black hair in a cyan dress stands on an ancient stone bridge, looking towards distant misty mountains, early morning, soft golden light"
```

### negative_prompt (recommended)
Elements to exclude from generation.

```json
"negative_prompt": "blurry, distorted, text, watermark, extra limbs, deformed"
```

### character_ref (for consistency)
Reference ID from asset guide for character consistency.

```json
"character_ref": "protagonist_001"
```

Must match an entry in latest `02_asset_guide_v{N}.md`.

### character_consistency
How strictly to maintain character appearance.

| Value | Use Case |
|-------|----------|
| high | Same character, different shots |
| medium | Similar style, some variation OK |
| low | General character type |

### style_ref
Reference ID from style guide.

```json
"style_ref": "main_visual_style"
```

Must match an entry in latest `02_style_guide_v{N}.md`.

### camera.shot_type

| Value | Description |
|-------|-------------|
| extreme_close_up | Face detail only |
| close_up | Head and shoulders |
| medium_close_up | Waist up |
| medium_shot | Knees up |
| medium_long_shot | Full body with space |
| long_shot | Full body, environment visible |
| extreme_long_shot | Wide establishing shot |

### camera.angle

| Value | Description |
|-------|-------------|
| eye_level | Neutral, most common |
| low_angle | Looking up, heroic |
| high_angle | Looking down, vulnerable |
| dutch_angle | Tilted, tension |
| birds_eye | Directly above |
| worms_eye | From ground level |

### camera.movement

| Value | Description |
|-------|-------------|
| static | No movement |
| pan | Horizontal rotation |
| tilt | Vertical rotation |
| dolly | Move closer/farther |
| tracking | Follow subject |
| crane | Vertical movement |

### params.aspect_ratio

| Value | Use Case |
|-------|----------|
| 16:9 | Cinematic standard |
| 4:3 | Classic film |
| 1:1 | Square format |
| 9:16 | Vertical/mobile |
| 21:9 | Ultra-wide |

### params.quality

| Value | Description |
|-------|-------------|
| draft | Fast, lower quality |
| standard | Balanced |
| high | Best quality |

## Complete Examples

### Example 1: Character Introduction
```json
{
  "shot_id": "shot_001",
  "prompt": "A young woman with long flowing black hair wearing a traditional cyan hanfu dress stands gracefully on an ancient wooden bridge, misty mountains in the distance, early morning golden light streaming through the fog, peaceful and serene atmosphere",
  "negative_prompt": "blurry, distorted, modern clothing, text",
  "character_ref": "protagonist_mei",
  "character_consistency": "high",
  "style_ref": "chinese_painting_style",
  "camera": {
    "shot_type": "long_shot",
    "angle": "eye_level",
    "movement": "static"
  },
  "params": {
    "aspect_ratio": "16:9",
    "quality": "high"
  }
}
```

### Example 2: Action Shot
```json
{
  "shot_id": "shot_015",
  "prompt": "The warrior lunges forward with sword raised, dust particles catching the sunset light, dynamic motion blur on the blade, intense determined expression",
  "negative_prompt": "static, stiff, peaceful, blurry face",
  "character_ref": "warrior_zhang",
  "character_consistency": "high",
  "style_ref": "action_style",
  "camera": {
    "shot_type": "medium_shot",
    "angle": "low_angle",
    "movement": "tracking"
  },
  "params": {
    "aspect_ratio": "21:9",
    "quality": "high"
  }
}
```

### Example 3: Emotional Close-up
```json
{
  "shot_id": "shot_024",
  "prompt": "Close-up of Mei's face as tears stream down her cheeks, soft backlight creating a halo effect, eyes filled with determination despite the sadness, rain drops visible in the foreground",
  "negative_prompt": "happy, smiling, dry, bright",
  "character_ref": "protagonist_mei",
  "character_consistency": "high",
  "style_ref": "emotional_style",
  "camera": {
    "shot_type": "close_up",
    "angle": "eye_level",
    "movement": "static"
  },
  "params": {
    "aspect_ratio": "16:9",
    "quality": "high"
  }
}
```

## Asset Guide Integration

Character refs must be defined in latest `02_asset_guide_v{N}.md`:

```markdown
## Characters

### protagonist_mei
- Age: 22
- Hair: Long, black, flowing
- Eyes: Dark brown, expressive
- Clothing: Cyan hanfu dress with white trim
- Distinctive: Jade pendant necklace
```

## Style Guide Integration

Style refs must be defined in latest `02_style_guide_v{N}.md`:

```markdown
## Visual Styles

### chinese_painting_style
- Influence: Traditional ink wash painting
- Colors: Muted earth tones with cyan accents
- Atmosphere: Misty, ethereal
- Lighting: Soft, diffused
```

## Best Practices

✅ Always include character_ref for recurring characters
✅ Maintain consistent style_ref across related shots
✅ Be specific in prompt descriptions
✅ Use appropriate shot types for narrative purpose

## Avoid

❌ Mixing incompatible styles
❌ Vague character descriptions without refs
❌ Inconsistent character_consistency settings
❌ Missing negative prompts
