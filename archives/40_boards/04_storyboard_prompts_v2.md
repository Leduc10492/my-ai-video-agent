# Artifact: Storyboard Prompts
- id: A-20260122-005
- version: v2
- upstream: [A-20260122-004, A-20260121-003]
- locks:
  - must_keep:
    - 角色DNA锚定（从资产指南提取）
    - 铅笔素描分镜纸风格
    - 线稿质感，非彩色成品
    - 版式：70%画面+30%笔记留白
  - must_avoid:
    - 使用泛指词（"a girl", "a woman"等）
    - 彩色照片风格
    - 完成品插画风格
    - 角色外貌偏离DNA
  - budget_notes:
    - 总镜头数: 49
    - 平台: Nano Banana Pro
    - 宽高比: 16:9

---

# BIPOLAR MV - 线稿分镜故事板提示词

**项目**: BIPOLAR MV  
**平台**: Nano-Banana-Pro  
**总镜头数**: 49  

---

## 批次 1：序幕（Shot 001-009）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 9 |
| Grid布局 | 3x3 grid layout |
| DNA锚定 | mizore_school, nozomi_adult |
| 色调点缀 | cold blue accents, cool gray highlights |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "序幕",
    "shot_range": "Shot 001-009",
    "shot_count": 9,
    "layout": "3x3 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Cold and distant emotional tone, cinematic melancholy. Consistent character DNA: Nozomi (adult) with black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion with light freckles, mature refined features, black tailored coat, gray scarf, white over-ear headphones, Chanel 19 bag. Mizore (school) with long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie. Cold blue accents and cool gray highlights only. Airport and classroom spaces feel isolated and quiet. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "mizore_school": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, light blue pleated skirt",
    "nozomi_adult": "black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, mature refined features, black tailored coat, gray scarf, white over-ear headphones, Chanel 19 bag"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 1: Wide Shot, low angle. Kansai International Airport interior, steel beam ceiling and glass curtain wall. Overcast sky visible outside, fine snow drifting past the glass. Strong architectural geometry dominates the frame. Static camera. Cold, empty atmosphere. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 001 – Establishing / Cold space'. 'Shot_001' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 2: Medium Shot, back view, eye-level. Airport moving walkway. Black hair in high ponytail, wispy bangs visible from behind, black tailored coat, gray scarf covering half face, Chanel 19 quilted bag on shoulder with chain strap. Woman walking alone, crowd reduced to blurred silhouettes in background. Tracking direction implied with arrows. Cold, isolated atmosphere. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 002 – Tracking / Isolation'. 'Shot_002' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 3: Close-Up, side profile. Ear with white over-ear headphones filling the frame, strands of black hair in ponytail visible. Static camera. Symbol of sound isolation. Minimal background detail. Graphite texture with cool gray highlights. Technical notes written horizontally below the frame: 'Shot 003 – Sound barrier'. 'Shot_003' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 4: Close-Up, shoulder-level. Chanel 19 quilted bag detail on right shoulder, diamond stitching pattern and metal chain strap emphasized. Black tailored coat fabric visible. Slight implied sway with movement. Material texture rendered in graphite. Cold metallic highlights. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 004 – Material symbol'. 'Shot_004' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 5,
      "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 5: Close-Up, eye-level, full face. Black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, mature refined features. Gray scarf draped on shoulder. Woman turning head back toward camera at boarding gate. Calm, transparent confirmation in eyes, no tears, restrained composed expression, subtle lip line. Soft cold rim light. Slow-motion feeling implied through pose. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 005 – Turn / Farewell beat'. 'Shot_005' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 6,
      "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 6: Medium Shot, side view, window POV. Inside airplane cabin. Woman with black hair in ponytail seated by window, ponytail silhouette visible. Airplane wing extending outside window, heavy snow streaking across glass, ground lights blurred below. Claustrophobic framing. Oppressive, confined atmosphere. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 006 – Enclosed space'. 'Shot_006' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 7,
      "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 7: Extreme Close-Up, top-down, macro. iPhone screen held in slender hand, music player interface clearly legible showing 'Gone – Ofelia K'. Play bar and controls sketched cleanly. Screen glow in dim cabin. Narrative symbol emphasis. Graphite texture with cool gray highlights. Technical notes written horizontally below the frame: 'Shot 007 – Music trigger'. 'Shot_007' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 8,
      "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 8: Extreme Close-Up, static. Vintage Sony Walkman silver metallic body, cassette tape visible through transparent window showing mechanical spools rotating. Subtle texture of metal and plastic rendered in graphite. Time-shift transition symbol. Cold gray metallic shading. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 008 – Time transition'. 'Shot_008' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 9,
      "prompt_text": "Black and white storyboard sketch. 3x3 grid layout. Panel 9: Wide Shot, dolly out implied. Classroom interior at Kitauji High School. Long straight black hair with blunt bangs covering eyebrows, waist-length hair, hazel gray eyes closed, pale complexion, slight downturned eyes. Japanese sailor uniform with light blue trim and bow tie. Girl sleeping at classroom window, head resting on arms. Snow falling heavily outside window, accumulating on frame. Single cold light beam isolates her figure in dim room. Specimen-like solitary composition. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 009 – Dolly out / Isolation'. 'Shot_009' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```

---

## 批次 2a：第一幕（Shot 010-015）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 6 |
| Grid布局 | 3x2 grid layout |
| DNA锚定 | mizore_school, nozomi_school |
| 色调点缀 | warm fading to cold accents |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "第一幕",
    "shot_range": "Shot 010-015",
    "shot_count": 6,
    "layout": "3x2 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Emotional tone shifting from daily routine to weightlessness, restrained internal collapse. Consistent character DNA: Mizore (school) with long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie. Nozomi (school) with black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, Japanese sailor uniform with teal blue bow tie. Warm fading to cold accents. School classroom spaces. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "mizore_school": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, light blue pleated skirt",
    "nozomi_school": "black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie, light blue pleated skirt"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 1: Medium Shot, eye-level, static. Japanese high school classroom interior. Teacher standing at podium speaking, students seated in rows reacting naturally with whispers and nods. Warm afternoon light through windows beginning to fade. Chalkboard visible in background. Information delivery moment. Graphite texture with warm fading to cold accents. Technical notes written horizontally below the frame: 'Shot 010 – Teacher announcement'. 'Shot_010' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 2: Close-Up, eye-level, static. Long straight black hair with blunt bangs covering eyebrows, waist-length hair, hazel gray eyes wide with sudden shock, pale complexion, slight downturned eyes showing restrained disbelief. Japanese sailor uniform with light blue trim visible at collar. Fingers gripping pencil tightly in lower frame. Frozen moment of impact. Graphite texture with warm fading to cold accents. Technical notes written horizontally below the frame: 'Shot 011 – Mizore frozen'. 'Shot_011' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 3: Medium Shot, subjective POV from Mizore. Classroom desk empty or girl with black hair in high ponytail busy packing items not looking back. Classroom environment with other students. Gaze falling on absence or distraction. Missed connection composition. Graphite texture with warm fading to cold accents. Technical notes written horizontally below the frame: 'Shot 012 – POV / Empty seat'. 'Shot_012' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 4: Close-Up, top-down, macro. Smartphone screen showing chat interface with typed Japanese message, pale slender finger hovering over send button then deleting entire text. Message bubble disappearing. Hesitation and retreat. Graphite texture with warm fading to cold accents. Technical notes written horizontally below the frame: 'Shot 013 – Message deleted'. 'Shot_013' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 5,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 5: Close-Up, static. A4 white paper survey form being pulled from school bag, completely blank form with visible grid lines, multiple fold creases on corners and center showing repeated handling. Pale fingers holding worn paper edge. Avoidance symbolism. Graphite texture with warm fading to cold accents. Technical notes written horizontally below the frame: 'Shot 014 – Blank survey form'. 'Shot_014' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 6,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 6: Medium Shot, static. Long straight black hair with blunt bangs, Japanese sailor uniform with light blue trim. Girl at classroom desk pushing folded paper deep into school bag. Avoidance body language with slightly hunched shoulders. Desk and bag visible. Hiding action emphasis. Graphite texture with warm fading to cold accents. Technical notes written horizontally below the frame: 'Shot 015 – Hiding the form'. 'Shot_015' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```

---

## 批次 2b：第一幕（Shot 016-019）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 4 |
| Grid布局 | 2x2 grid layout |
| DNA锚定 | mizore_school, nozomi_school |
| 色调点缀 | warm fading to cold accents |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "第一幕",
    "shot_range": "Shot 016-019",
    "shot_count": 4,
    "layout": "2x2 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Emotional tone shifting from daily routine to weightlessness, restrained internal collapse. Consistent character DNA: Mizore (school) with long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie. Nozomi (school) with black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, Japanese sailor uniform with teal blue bow tie. Warm fading to cold accents. School corridor and classroom spaces. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "mizore_school": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, light blue pleated skirt",
    "nozomi_school": "black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie, light blue pleated skirt"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 1: Wide Shot, tracking. Japanese high school corridor with students flowing. [Background] Long straight black hair girl with blunt bangs standing still in middle ground, Japanese sailor uniform with light blue trim. [Foreground] Black hair in high ponytail girl being surrounded by teacher or classmates, Japanese sailor uniform with teal blue bow tie. Distance between two figures emphasized, crowd movement versus stillness contrast. Blocked connection composition. Graphite texture with warm fading to cold accents. Technical notes written horizontally below the frame: 'Shot 016 – Corridor chase blocked'. 'Shot_016' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 2: Medium Shot, tracking. School corridor. [Foreground] Black hair in high ponytail girl walking ahead, back view, Japanese sailor uniform with teal blue bow tie. [Background] Long straight black hair girl with blunt bangs following half-step behind, pale complexion, lips slightly parted as if about to speak, Japanese sailor uniform with light blue trim. Unspoken words composition. Graphite texture with warm fading to cold accents. Technical notes written horizontally below the frame: 'Shot 017 – Words swallowed'. 'Shot_017' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 3: Medium Shot, static. Classroom interior. Long straight black hair with blunt bangs covering eyebrows, hazel gray eyes downcast, pale complexion, Japanese sailor uniform with light blue trim. Girl seated at classroom desk pushing wired earbuds deeper into ears. Vintage silver Walkman visible on desk. Withdrawal posture. Isolation choice. Graphite texture with warm fading to cold accents. Technical notes written horizontally below the frame: 'Shot 018 – Retreat to music'. 'Shot_018' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 4: Close-Up, static, transition. Vintage Sony Walkman silver metallic body, finger pressing play button, cassette spools beginning to rotate visible through window. Subtle sound wave ripple effect emanating from device suggesting music starting. Color gradient hint from cold to warm in wave pattern. Narrative gateway moment. Graphite texture with warm transitioning to warm glow. Technical notes written horizontally below the frame: 'Shot 019 – Play button / Transition'. 'Shot_019' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```

---

## 批次 3a：第二幕（Shot 020-025）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 6 |
| Grid布局 | 3x2 grid layout |
| DNA锚定 | mizore_school, nozomi_school |
| 色调点缀 | warm lighting accents, golden hour glow |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "第二幕",
    "shot_range": "Shot 020-025",
    "shot_count": 6,
    "layout": "3x2 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Surface warmth masking underlying imbalance, nostalgic golden memories. Consistent character DNA: Mizore (school) with long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie. Nozomi (school) with black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie. Warm lighting accents and golden hour glow. School corridor, campus, and practice room spaces. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "mizore_school": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, light blue pleated skirt",
    "nozomi_school": "black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie, light blue pleated skirt"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 1: Wide Shot, static. Japanese high school corridor with student crowd flowing. [Foreground] Black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie. Girl reaching hand out or speaking first. [Background] Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform with light blue trim. Girl standing slightly behind. Nozomi initiating contact, power dynamic established. Warm afternoon light. Graphite texture with warm lighting accents. Technical notes written horizontally below the frame: 'Shot 020 – First contact / Power dynamic'. 'Shot_020' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 2: Medium Shot, tracking, montage feel. Multiple scene fragments suggested: corridor, street, campus. [Foreground always] Black hair in high ponytail, wispy bangs, amber brown eyes, bright expression, Japanese sailor uniform with teal blue bow tie. Girl walking half-step ahead. [Background always] Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform with light blue trim. Girl following half-step behind. Repeated spatial relationship emphasized. Movement arrows implied. Graphite texture with warm lighting accents. Technical notes written horizontally below the frame: 'Shot 021 – Montage / Following pattern'. 'Shot_021' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 3: Close-Up, static. Two heads close together sharing wired earbuds, one earbud each. [Left] Black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles. [Right] Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, slight hint of smile. Earphone cable connecting them visually. Intimate moment, connection symbolism. Warm soft lighting. Graphite texture with golden hour glow. Technical notes written horizontally below the frame: 'Shot 022 – Shared earbuds / Intimacy'. 'Shot_022' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 4: Medium Shot, static. Campus or street setting. [Left] Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, lips parted as if about to speak, Japanese sailor uniform with light blue trim, still wearing one earbud. [Right] Black hair in high ponytail, wispy bangs, amber brown eyes, Japanese sailor uniform with teal blue bow tie, looking at phone screen, hand raised in 'wait' gesture, removing earbud to answer call. Mizore interrupted mid-sentence. Connection broken moment. Graphite texture with warm fading to neutral. Technical notes written horizontally below the frame: 'Shot 023 – Interrupted / Priority revealed'. 'Shot_023' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 5,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 5: Wide Shot, static. Same location. [Foreground] Black hair in high ponytail, wispy bangs, Japanese sailor uniform with teal blue bow tie. Girl packing belongings quickly, body turned toward exit. [Background] Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform with light blue trim. Girl sitting alone, mouth slightly open with unfinished words. Distance growing between figures. Abandonment composition. Graphite texture with warm lighting accents. Technical notes written horizontally below the frame: 'Shot 024 – Left behind again'. 'Shot_024' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 6,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 6: Medium Shot, static. Music practice room interior with instrument cases and music stands. [Right] Black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, Japanese sailor uniform with teal blue bow tie. Girl casually packing flute case, eyes not looking at companion, speaking offhandedly. [Left] Long straight black hair with blunt bangs visible at frame edge, listening. Casual invitation moment. Sheet music and flute case visible. Graphite texture with warm lighting accents. Technical notes written horizontally below the frame: 'Shot 025 – Fireworks invitation / Casual'. 'Shot_025' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```

---

## 批次 3b：第二幕（Shot 026-029）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 4 |
| Grid布局 | 2x2 grid layout |
| DNA锚定 | mizore_school, nozomi_school |
| 色调点缀 | warm lighting accents, beginning to cool |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "第二幕",
    "shot_range": "Shot 026-029",
    "shot_count": 4,
    "layout": "2x2 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Surface warmth beginning to cool, weight imbalance revealed, beautiful memories ending. Consistent character DNA: Mizore (school) with long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie. Nozomi (school) with black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie. Warm lighting accents beginning to cool. Practice room and corridor spaces. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "mizore_school": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, light blue pleated skirt",
    "nozomi_school": "black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie, light blue pleated skirt"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 1: Close-Up, static. Long straight black hair with blunt bangs covering eyebrows, hazel gray eyes showing brief pause then solemn resolve, pale complexion, subtle serious expression. Face filling frame. Deliberate nod implied through pose. Grave acceptance of casual invitation. Contrast to previous shot's casualness. Graphite texture with warm lighting accents. Technical notes written horizontally below the frame: 'Shot 026 – Solemn acceptance'. 'Shot_026' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 2: Wide Shot, static. Music practice room interior. [Foreground moving toward door] Black hair in high ponytail, wispy bangs, Japanese sailor uniform with teal blue bow tie, bag on shoulder, walking away quickly, not looking back. [Background standing alone] Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform with light blue trim. Girl standing alone in empty room, instrument cases around her. Left behind again pattern. Graphite texture with warm lighting accents. Technical notes written horizontally below the frame: 'Shot 027 – Left alone again'. 'Shot_027' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 3: Close-Up, top-down macro. Smartphone screen showing calendar app interface, pale slender finger drawing circle around a specific date, then drawing another circle over the same date. Double-circled date emphasized. Promise weight visualization. Screen glow in dim room. Graphite texture with warm lighting accents. Technical notes written horizontally below the frame: 'Shot 028 – Double circle / Promise weight'. 'Shot_028' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 4: Medium Shot, static. School corridor. [Foreground walking away] Black hair in high ponytail, wispy bangs, Japanese sailor uniform with teal blue bow tie. Girl glancing back over shoulder, polite acknowledgment expression, not emotional waiting. [Background] Long straight black hair with blunt bangs, hazel gray eyes brightening with misread hope, pale complexion, corner of lips lifting in small smile, Japanese sailor uniform with light blue trim. Misinterpretation moment. Warm light beginning to cool at edges. Graphite texture with warm fading to cool accents. Technical notes written horizontally below the frame: 'Shot 029 – Misread glance / End of warmth'. 'Shot_029' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```

---

## 批次 4a：第三幕（Shot 030-035）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 6 |
| Grid布局 | 3x2 grid layout |
| DNA锚定 | mizore_school, nozomi_school |
| 色调点缀 | alternating warm and cold, high contrast |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "第三幕",
    "shot_range": "Shot 030-035",
    "shot_count": 6,
    "layout": "3x2 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Emotional tone of chasing, losing speed, priority misalignment, restrained collapse. Consistent character DNA: Mizore (school) with long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie. Nozomi (school) with black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie. Alternating warm and cold accents, high contrast. School, corridor, and street spaces. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "mizore_school": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, light blue pleated skirt",
    "nozomi_school": "black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie, light blue pleated skirt"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 1: Close-Up, static, split-screen feel. [Left half] Planner page densely filled with schedule entries, club activities, cram school, procedures. [Right half] Planner page with sparse entries like 'wait for Nozomi', 'when Nozomi is free'. Contrasting time density. Montage composition. Graphite texture with alternating warm and cold accents. Technical notes written horizontally below the frame: 'Shot 030 – Diverging schedules'. 'Shot_030' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 2: Medium Shot, static, montage feel. Multiple scene fragments: classroom, practice room, corridor. Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform with light blue trim. Girl arriving early, staying late, checking wristwatch repeatedly. Waiting posture emphasized across scenes. Time anxiety visualization. Graphite texture with alternating warm and cold accents. Technical notes written horizontally below the frame: 'Shot 031 – Adjusting rhythm / Waiting'. 'Shot_031' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 3: Wide Shot, tracking. School corridor or street. [Foreground receding] Black hair in high ponytail, wispy bangs, Japanese sailor uniform with teal blue bow tie. Girl walking fast, back to camera, not looking back. [Background chasing] Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform with light blue trim. Girl trying to keep up, distance growing. Physical gap symbolizing emotional gap. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 032 – Falling behind'. 'Shot_032' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 4: Close-Up, static. Desktop surface with paper. Pale slender hand writing fireworks festival time and location on paper, checking and re-checking. Pen and paper visible. Anxious confirmation action. Graphite texture with alternating warm and cold accents. Technical notes written horizontally below the frame: 'Shot 033 – Writing details / Anxiety'. 'Shot_033' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 5,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 5: Close-Up, top-down macro. Smartphone screen showing chat app interface. Pale slender fingers typing message: visible Japanese text asking about fireworks meeting place. Send button being pressed. Message bubble flying out. Breaking silence moment. Screen glow. Graphite texture with alternating warm and cold accents. Technical notes written horizontally below the frame: 'Shot 034 – Sending message / Breaking silence'. 'Shot_034' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 6,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 6: Medium Shot, montage, rapid cut feel. Multiple fragments: classroom checking phone, eating while checking phone, walking while checking phone. Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform with light blue trim. Repeated phone-checking anxiety across scenes. Time passage visualization. Graphite texture with alternating warm and cold accents. Technical notes written horizontally below the frame: 'Shot 035 – Waiting montage'. 'Shot_035' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```

---

## 批次 4b：第三幕（Shot 036-041）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 6 |
| Grid布局 | 3x2 grid layout |
| DNA锚定 | mizore_school |
| 色调点缀 | cold blue accents, fireworks warm flashes |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "第三幕",
    "shot_range": "Shot 036-041",
    "shot_count": 6,
    "layout": "3x2 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Emotional tone of waiting, disappointment, emptiness beneath beauty. Consistent character DNA: Mizore (school) with long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, summer yukata for festival scenes. Cold blue accents with occasional warm fireworks flashes. Fireworks festival and school spaces. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "mizore_school": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, light blue pleated skirt",
    "mizore_yukata": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, simple pale blue yukata with subtle pattern"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 1: Close-Up, static. Smartphone screen lighting up with reply notification. Message visible: casual Japanese text suggesting 'probably, we'll see'. Long straight black hair with blunt bangs, hazel gray eyes, pale complexion. Girl's face in background, corner of mouth twitching slightly trying to smile but failing. Restrained disappointment. Fingers touching Walkman in pocket. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 036 – Lukewarm reply'. 'Shot_036' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 2: Wide Shot, static. Summer fireworks festival grounds with crowd flowing. Festival stall lights glowing warm. Long straight black hair with blunt bangs, waist-length hair, hazel gray eyes, pale complexion, simple pale blue yukata. Girl standing alone at good viewing spot. Couples, friends, families surrounding her in pairs and groups. Isolation emphasized. Graphite texture with cold blue accents and warm stall light touches. Technical notes written horizontally below the frame: 'Shot 037 – Alone in crowd'. 'Shot_037' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 3: Close-Up, static. Hand detail. Pale slender hand holding smartphone showing no new messages. Same hand checking wristwatch. Empty screen and passing time. Anxiety props. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 038 – No message / Time passing'. 'Shot_038' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 4: Medium Shot, static. Fireworks festival grounds, dusk deepening. Long straight black hair with blunt bangs, waist-length hair, hazel gray eyes, pale complexion, simple pale blue yukata. Girl turning up Walkman volume, earbuds visible. Crowd growing denser around her. Still alone. Music as escape. Static figure versus flowing crowd. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 039 – Music fills waiting'. 'Shot_039' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 5,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 5: Wide Shot, low angle. Night sky with fireworks exploding in full bloom. Long straight black hair with blunt bangs, hazel gray eyes, pale complexion, simple pale blue yukata. Girl's face lit by firework flashes, expression empty and hollow despite the beauty above. Stark contrast between spectacular sky and vacant eyes. Still waiting. Graphite texture with cold blue accents and warm firework highlights. Technical notes written horizontally below the frame: 'Shot 040 – Fireworks / Empty eyes'. 'Shot_040' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 6,
      "prompt_text": "Black and white storyboard sketch. 3x2 grid layout. Panel 6: Wide Shot, static. Post-fireworks scene. Crowd dispersing, festival grounds emptying. Long straight black hair with blunt bangs, waist-length hair, pale complexion, simple pale blue yukata. Girl walking away alone, back to camera. Solitary figure amid departing crowd. Abandonment realized. Graphite texture with cold blue accents. Technical notes written horizontally below the frame: 'Shot 041 – Leaving alone'. 'Shot_041' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```

---

## 批次 4c：第三幕（Shot 042-045）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 4 |
| Grid布局 | 2x2 grid layout |
| DNA锚定 | mizore_school, nozomi_school |
| 色调点缀 | cold gray tones, muted light |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "第三幕",
    "shot_range": "Shot 042-045",
    "shot_count": 4,
    "layout": "2x2 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Emotional tone of quiet realization, restrained collapse, silent digestion. Consistent character DNA: Mizore (school) with long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie. Nozomi (school) with black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, Japanese sailor uniform with teal blue bow tie. Cold gray tones and muted light. School and home spaces. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "mizore_school": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, light blue pleated skirt",
    "nozomi_school": "black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright expression, Japanese sailor uniform with teal blue bow tie, light blue pleated skirt"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 1: Medium Shot, static. School interior next day. [Foreground] Black hair in high ponytail, wispy bangs, amber brown eyes, Japanese sailor uniform with teal blue bow tie. Girl talking to other classmates, casual body language, explaining 'family matter came up suddenly'. [Background separate frame] Long straight black hair with blunt bangs, hazel gray eyes showing quiet dawning understanding not anger, pale complexion, Japanese sailor uniform with light blue trim. Overhearing realization. Priority revealed. Graphite texture with cold gray tones. Technical notes written horizontally below the frame: 'Shot 042 – Overhearing truth'. 'Shot_042' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 2: Wide Shot, tracking. Street or path. Long straight black hair with blunt bangs, waist-length hair, hazel gray eyes, pale complexion, Japanese sailor uniform with light blue trim. Girl walking home alone, back to camera. Solitary figure. Empty street. Quiet understanding settling in. Graphite texture with cold gray tones. Technical notes written horizontally below the frame: 'Shot 043 – Walking home alone'. 'Shot_043' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 3: Close-Up, static. Vintage Sony Walkman in pale slender hand. Finger pressing stop button or ejecting cassette tape. No tears, no dramatic breakdown. Quiet physical action of disconnection. Symbolic rupture moment. Graphite texture with cold gray tones. Technical notes written horizontally below the frame: 'Shot 044 – Stop button / Rupture'. 'Shot_044' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 4: Wide Shot, static. Mizore's room interior, evening light through window. Long straight black hair with blunt bangs, waist-length hair, hazel gray eyes, pale complexion. Girl sitting at desk, pulling out wrinkled career survey form from deep in school bag. Paper with multiple fold creases and worn corners spread on desk. Fingers tracing blank form surface. Quiet contemplation. Transition to resolution. Graphite texture with cold gray tones and soft evening light. Technical notes written horizontally below the frame: 'Shot 045 – Survey form returned / Digestion'. 'Shot_045' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```

---

## 批次 5：终章（Shot 046-049）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 4 |
| Grid布局 | 2x2 grid layout |
| DNA锚定 | mizore_school |
| 色调点缀 | high-key white light, soft bright tones |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "终章",
    "shot_range": "Shot 046-049",
    "shot_count": 4,
    "layout": "2x2 grid layout",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. Emotional tone of reconciliation, self-agency, gentle farewell. Consistent character DNA: Mizore (school) with long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie. High-key white light, soft bright tones. Room and window spaces with natural light. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "mizore_school": "long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, Japanese sailor uniform with light blue trim and bow tie, light blue pleated skirt"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 1: Medium Shot, static. Bright, quiet space with soft natural light. Desk or window area. Long straight black hair with blunt bangs covering eyebrows, waist-length hair, hazel gray eyes showing calm determination, pale complexion, Japanese sailor uniform with light blue trim. Girl sitting at desk, picking up wrinkled career survey form with multiple fold creases and worn edges but still blank. Picking up pen, pen tip hovering above first blank space. No more hesitation, no more waiting. Determined gaze. High-key soft lighting. Graphite texture with high-key white light accents. Technical notes written horizontally below the frame: 'Shot 046 – Ready to write / Agency awakened'. 'Shot_046' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 2,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 2: Close-Up, top-down macro. Career survey form on desk surface. Pen tip touching paper, beginning to write. Characters appearing stroke by stroke in blank grid spaces. Content not fully legible but writing action emphasized. No crossing out, no hesitation rewrites. After completion, form being neatly folded with clean decisive movement. Pale slender hands visible. Writing and folding action. Graphite texture with high-key white light accents. Technical notes written horizontally below the frame: 'Shot 047 – Writing / Prop arc complete'. 'Shot_047' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 3,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 3: Close-Up, static. Vintage Sony Walkman in pale slender hand. Finger pressing play button. Cassette tape beginning to rotate forward, not rewinding to beginning but continuing from current position. Forward movement emphasized. Music continuing, time continuing. Structural callback to opening. Graphite texture with high-key white light accents. Technical notes written horizontally below the frame: 'Shot 048 – Play forward / Loop closure'. 'Shot_048' label in top-left. No vertical text. --ar 16:9"
    },
    {
      "panel_index": 4,
      "prompt_text": "Black and white storyboard sketch. 2x2 grid layout. Panel 4: Wide Shot, static. Room or classroom interior with morning sunlight streaming through window. Alternative: airport with airplane taking off visible through glass. Long straight black hair with blunt bangs, waist-length hair, pale complexion, Japanese sailor uniform with light blue trim. Girl standing up from desk, belongings gathered, back to camera, facing window or forward direction, facing the light source. Silhouette against bright light. Forward-facing posture. Music playing to completion suggested through pose. Structural echo with opening sequence. Emotional closure, reconciliation complete, gentle farewell. Graphite texture with high-key white light flooding frame. Technical notes written horizontally below the frame: 'Shot 049 – Facing forward / End'. 'Shot_049' label in top-left. No vertical text. --ar 16:9"
    }
  ]
}
```
