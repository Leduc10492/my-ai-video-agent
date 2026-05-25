# Midjourney Prompt Guide

## Language

English only. Use descriptive, specific language.

## Structure Template

```
[Subject] + [Details] + [Environment] + [Style] + [Lighting] + [Parameters]
```

## Subject Description

### People
```
A young woman in her 20s
An elderly man with white beard
A child running through a field
Two friends laughing together
```

### Actions
```
standing on / sitting at / walking through
holding / reaching for / looking at
running towards / jumping over
embracing / dancing / fighting
```

## Environment Description

### Natural Scenes
```
in a misty forest
on a rocky cliff overlooking the ocean
in a field of wildflowers at sunset
under a starry night sky
```

### Urban Scenes
```
in a neon-lit cyberpunk city
on a quiet cobblestone street
inside a cozy coffee shop
on a rooftop at dusk
```

## Style Keywords

### Art Styles
```
cinematic photography
oil painting style
watercolor illustration
concept art
anime style
hyperrealistic
digital art
```

### Specific Artists (use sparingly)
```
in the style of Studio Ghibli
reminiscent of Wes Anderson
inspired by Roger Deakins cinematography
```

## Lighting

```
golden hour lighting
dramatic rim lighting
soft diffused light
harsh shadows
volumetric fog
backlit silhouette
```

## Parameters

### Aspect Ratio (--ar)
| Value | Use Case |
|-------|----------|
| 16:9 | Cinematic, landscape |
| 9:16 | Portrait, mobile |
| 4:3 | Classic photo |
| 1:1 | Square, social media |
| 21:9 | Ultra-wide |

### Style (--style)
| Value | Effect |
|-------|--------|
| raw | Less stylized, more realistic |
| cute | Softer, more kawaii |

### Stylization (--s)
- Range: 0-1000
- Low (0-250): More literal interpretation
- High (750-1000): More artistic interpretation

### Chaos (--c)
- Range: 0-100
- Low: More consistent results
- High: More varied/unexpected results

### Model Version (--v)
- v6: Latest, best quality
- v5.2: Previous stable version

## Complete Examples

### Example 1: Cinematic Portrait
```
A young woman in a flowing cyan dress standing on an ancient stone bridge,
layered misty mountains in the background, morning golden hour,
ethereal atmosphere, cinematic photography, soft rim lighting
--ar 16:9 --style raw --v 6
```

### Example 2: Action Scene
```
A warrior in ornate armor charging into battle,
dust clouds and debris flying, sunset behind,
dynamic composition, epic fantasy concept art,
dramatic lighting with lens flare
--ar 21:9 --s 500 --v 6
```

### Example 3: Cozy Interior
```
A cozy reading nook by a window, rain outside,
warm lamplight, books stacked everywhere,
a cat sleeping on a cushion, watercolor illustration style,
soft warm colors, peaceful atmosphere
--ar 4:3 --s 750 --v 6
```

## Best Practices

✅ Be specific and descriptive
✅ Include lighting information
✅ Specify art style clearly
✅ Use parameters appropriately

## Avoid

❌ Vague descriptions ("beautiful", "nice")
❌ Too many conflicting styles
❌ Overloading with parameters
❌ Copyrighted character names

## Weight Syntax

Emphasize or de-emphasize elements:
```
(emphasized element)::1.5
(de-emphasized element)::0.5
```

## Negative Prompt (--no)

Exclude unwanted elements:
```
--no text, watermark, blurry, distorted
```
