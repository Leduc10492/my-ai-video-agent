# 提示词示例

这些示例用于说明 Nano Banana 线稿分镜提示词结构。示例角色是占位角色，不代表项目固定设定。实际项目必须从最新 `02_asset_guide_v{N}.md` 提取角色 DNA。

## 完整JSON示例

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "Opening",
    "shot_range": "Shot 001-006",
    "shot_count": 6,
    "layout": "3x2 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Quiet observational tone. Consistent character DNA: Character A with short black hair, straight bangs, oval face, dark brown eyes, reserved expression, school uniform with navy jacket and red ribbon. Character B with shoulder-length brown hair, side part, warm brown eyes, open expression, light cardigan and canvas bag. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "character_a_school": "short black hair, straight bangs, oval face, dark brown eyes, reserved expression, school uniform, navy jacket, white shirt, red ribbon",
    "character_b_casual": "shoulder-length brown hair, side part, warm brown eyes, open expression, light cardigan, canvas shoulder bag"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 1: Wide Shot, static low angle. Empty train platform at dusk, overhead beams and long perspective lines dominate the frame, light rain visible against station lamps. No named character. Graphite texture with cool gray highlights. Technical notes written horizontally below the frame: 'Shot 001 - Establishing / Empty platform'. 'Shot_001' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 2: Medium Shot, eye-level. Short black hair, straight bangs, oval face, dark brown eyes, reserved expression, school uniform with navy jacket and red ribbon. Character A stands near a vending machine, shoulders still, one hand holding a folded note. Quiet restrained mood. Graphite texture with neutral gray tones. Technical notes written horizontally below the frame: 'Shot 002 - Character A / Waiting'. 'Shot_002' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 3: Close-Up, static. Folded paper note in Character A's hand, damp edge, thumb pressing the crease. No face visible. Object state must be legible. Graphite texture with cool gray highlights. Technical notes written horizontally below the frame: 'Shot 003 - Prop insert / Folded note'. 'Shot_003' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 4: Medium Wide Shot, tracking left to right. Shoulder-length brown hair, side part, warm brown eyes, open expression, light cardigan, canvas shoulder bag. Character B walks into the station entrance in the background while Character A remains foreground right. Direction arrows show tracking motion. Graphite texture with soft gray highlights. Technical notes written horizontally below the frame: 'Shot 004 - Entrance / Distance closes'. 'Shot_004' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 5,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 5: Two Shot, eye-level. [Foreground] Character A with short black hair, straight bangs, oval face, reserved expression, school uniform with navy jacket and red ribbon, holding folded note. [Background] Character B with shoulder-length brown hair, side part, light cardigan, canvas shoulder bag, slowing down near platform column. Spatial distance remains visible between them. Graphite texture with neutral gray tones. Technical notes written horizontally below the frame: 'Shot 005 - Two-shot / Hesitation'. 'Shot_005' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 6,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 6: Extreme Close-Up, static. Character A's eyes, straight bangs cutting across brow line, dark brown eyes looking slightly downward, expression controlled and unreadable. Minimal background. Graphite texture with cool gray highlights. Technical notes written horizontally below the frame: 'Shot 006 - Eye close-up / Decision'. 'Shot_006' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```

## Prompt Patterns

### Environment Shot

```json
{
  "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 1: Wide Shot, static low angle. Empty school corridor after sunset, lockers lining both walls, rain light reflected on floor. No named character. Graphite texture with cool gray highlights. Technical notes written horizontally below the frame: 'Shot 001 - Establishing / Corridor'. 'Shot_001' label in top-left. No vertical text. --ar 16:9"
}
```

### Single Character Shot

```json
{
  "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 5: Medium Shot, eye-level. Short black hair, straight bangs, oval face, dark brown eyes, reserved expression, school uniform with navy jacket and red ribbon. Character A stands beside classroom window, hands still, restrained posture. Soft window light. Graphite texture with neutral gray tones. Technical notes written horizontally below the frame: 'Shot 005 - Window pause'. 'Shot_005' label in top-left. No vertical text. --ar 16:9"
}
```

### Two Character Shot

```json
{
  "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 3: Medium Wide Shot, eye-level. [Foreground] Short black hair, straight bangs, oval face, dark brown eyes, reserved expression, school uniform with navy jacket and red ribbon. Character A sits at desk. [Background] Shoulder-length brown hair, side part, warm brown eyes, open expression, light cardigan, canvas shoulder bag. Character B stands by the door. Warm afternoon light. Graphite texture with neutral gray tones. Technical notes written horizontally below the frame: 'Shot 003 - Two-shot / Uneven distance'. 'Shot_003' label in top-left. No vertical text. --ar 16:9"
}
```

### Motion Shot

```json
{
  "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 4: Medium Shot, tracking left to right. Shoulder-length brown hair, side part, warm brown eyes, open expression, light cardigan, canvas shoulder bag. Character B moves through a crowded hallway, motion lines showing direction, background silhouettes simplified. Graphite texture with warm gray accents. Technical notes written horizontally below the frame: 'Shot 004 - Tracking / Passing crowd'. 'Shot_004' label in top-left. No vertical text. --ar 16:9"
}
```

## Common Errors

### Too Generic

Bad:

```json
{
  "prompt_text": "Black and white storyboard sketch. A beautiful student sits by the window, sad expression. --ar 16:9"
}
```

Good:

```json
{
  "prompt_text": "Black and white storyboard sketch. Panel 1: Close-Up, eye-level. Short black hair, straight bangs, oval face, dark brown eyes, reserved expression, school uniform with navy jacket and red ribbon. Character A sits by the classroom window, gaze lowered. Technical notes written horizontally below the frame: 'Shot 001 - Frozen reaction'. No vertical text. --ar 16:9"
}
```

### Missing Storyboard Structure

Bad:

```json
{
  "prompt_text": "Medium shot, character walking in hallway, pencil sketch style --ar 16:9"
}
```

Good:

```json
{
  "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 2: Medium Shot, eye-level. School hallway. Short black hair, straight bangs, oval face, dark brown eyes, reserved expression, school uniform with navy jacket and red ribbon. Character A walks slowly through hallway, shoulders still. Graphite texture with neutral gray tones. Technical notes written horizontally below the frame: 'Shot 002 - Hallway walk'. 'Shot_002' label in top-left. No vertical text. --ar 16:9"
}
```

### Wrong DNA Variant

Bad:

```json
{
  "prompt_text": "Black and white storyboard sketch. Panel 2: Medium Shot. Adult workplace lobby. Character A in school uniform, standing by elevator. --ar 16:9"
}
```

Good:

```json
{
  "prompt_text": "Black and white storyboard sketch. Panel 2: Medium Shot, eye-level. Adult workplace lobby. Character A adult variant: short black hair, straight bangs, oval face, dark brown eyes, reserved expression, dark wool coat, simple leather work bag. Character A stands by elevator, posture controlled. Technical notes written horizontally below the frame: 'Shot 002 - Adult variant / Lobby'. No vertical text. --ar 16:9"
}
```
