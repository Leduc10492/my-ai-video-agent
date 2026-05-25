---
name: art-platform-rules
description: Generate art prompts for specific image platforms. Use as the default art.platform_adapter slot for Jimeng, Midjourney, Nano Banana, or compatible replacement platform syntax.
---

# Art Platform Rules

Generate image prompts optimized for each platform's requirements.

This is the current default implementation for the `art.platform_adapter` slot in `.agents/skill_registry.md`.

## Platform Selection

| Platform | Best For | Language |
|----------|----------|----------|
| 即梦 (Jimeng) | Chinese aesthetics, atmosphere | 中文 |
| Midjourney | Realistic, high quality | English |
| Nano Banana | Character consistency | JSON |

## Quick Format Reference

### 即梦 (Jimeng)

```
[主体描述], [环境/氛围], [艺术风格], [技术参数]
```

Example:
```
一位身着青色长裙的少女站在古桥上，远处是层叠的青山，
薄雾缭绕，意境悠远，工笔画风格，高清细节
```

**Detailed guide**: `references/jimeng-guide.md`

---

### Midjourney

```
[subject], [details], [style], [lighting], [parameters]
```

Example:
```
A young woman in flowing cyan dress standing on ancient stone bridge,
layered mountains in distance, morning mist, Chinese ink painting style,
ethereal atmosphere --ar 16:9 --style raw --v 6
```

**Common Parameters**:
| Param | Values | Purpose |
|-------|--------|---------|
| --ar | 16:9, 4:3, 1:1 | Aspect ratio |
| --style | raw, cute | Style preset |
| --v | 6, 5.2 | Model version |
| --s | 0-1000 | Stylization |
| --c | 0-100 | Chaos/variety |

**Detailed guide**: `references/midjourney-guide.md`

---

### Nano Banana

```json
{
  "scene_description": "Detailed scene in natural language",
  "character_ref": "protagonist_001",
  "character_consistency": "high",
  "style_ref": "style_001",
  "composition": "rule_of_thirds",
  "camera": {
    "shot_type": "medium_shot",
    "angle": "eye_level"
  }
}
```

**Detailed guide**: `references/nanobanana-guide.md`

---

## Workflow

1. Read shot description from latest `03_storyboard_v{N}.md`
2. Read character specs from latest `02_asset_guide_v{N}.md`
3. Read style specs from latest `02_style_guide_v{N}.md`
4. Select target platform(s)
5. Generate prompts using platform-specific format
6. Include character/style references for consistency
7. Save to `05_art_prompts_v{N}.md`

## Consistency Rules

### Character Consistency
- Always reference character ID from asset guide
- Include distinctive features in every prompt
- Maintain clothing/appearance across shots
- When local reference images exist, attach or load them before production generation. Text DNA is a supplement, not the identity anchor.
- Label every attached image role explicitly, for example `<Character> identity reference` or `<Character> costume reference`.
- If a platform cannot use image references, mark outputs as `text_only_draft`.

### Reference Image Support

| Platform | Reference Image Use | Production Rule |
| --- | --- | --- |
| Jimeng | Use uploaded reference images when available; keep prompt Chinese and describe which image controls identity | acceptable only if references are actually uploaded |
| Midjourney | Put character reference URLs or image prompts before text; use text for scene, light, and camera | production keyframes need image references, not text-only prompts |
| Nano Banana | Prefer structured fields with explicit `reference_images` and `reference_roles` | best default for character consistency |
| Built-in image generation | Load local refs into the conversation context first, then label their roles in the prompt | required for repo production keyframes |

### Style Consistency
- Reference style guide in every prompt
- Use consistent lighting descriptors
- Maintain color palette references

## Platform Comparison

| Feature | Jimeng | Midjourney | Nano Banana |
|---------|--------|------------|-------------|
| Language | Chinese | English | JSON |
| Char consistency | Low | Medium | High |
| Style control | Descriptive | Parameters | Structured |
| Best quality | Artistic | Realistic | Consistent |

**Full platform guides in `references/`**
