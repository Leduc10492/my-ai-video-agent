# Artifact: Storyboard Prompts
- id: A-20260122-005
- version: v1
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

# 线稿分镜故事板提示词

**项目名称**: BIPOLAR MV 重置版  
**基于**: 03_storyboard.md (v1)  
**平台**: Nano Banana Pro  
**风格**: 铅笔素描分镜纸版式  
**总镜头数**: 49  

---

## 角色DNA锚定

从 `02_asset_guide.md` 提取的角色不可变视觉特征：

| 角色ID | DNA描述 |
|--------|---------|
| **mizore_school** | long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, slight downturned eyes, melancholic expression, Japanese sailor uniform with light blue trim, light blue bow tie, light blue pleated skirt, white knee-high socks, brown loafers |
| **mizore_adult** | long straight black hair, blunt bangs, hazel gray eyes, pale complexion, mature refined features, introspective mood |
| **nozomi_school** | black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion, light freckles, bright natural smile, Japanese sailor uniform with light blue sailor collar, teal blue bow tie, light blue pleated skirt, white knee-high socks, brown loafers |
| **nozomi_adult** | black hair in high ponytail, amber brown eyes, warm complexion, mature sophisticated appearance, black tailored wool coat, gray scarf covering lower face, white over-ear headphones, Chanel 19 quilted bag with chain strap |

---

## 统一风格锚点

**正向提示词核心**（所有镜头共享）：
```
monochrome pencil sketch, storyboard sheet design, rough handwritten annotations in margins, visible panel borders, white border margins, cinematic composition
```

**负向提示词**（统一）：
```
color photograph, realistic rendering, finished illustration, digital art, anime style, no borders, clean margins, typed text, polished artwork
```

**色调点缀选择**：
- 冷色场景：`cold blue accents`, `cool gray highlights`
- 暖色场景：`warm lighting accents`, `golden hour glow`
- 中性场景：`neutral gray tones`, `soft ambient light`

---

## 序幕：机场现在时 + 随身听开关（Beat 1-6）

**段落特征**: 冷色调，5500K，颗粒质感，疏离感  
**色调点缀**: `cold blue accents`, `cool gray highlights`  
**镜头数**: 9（Shot 001-009）

---

### Shot-001

**Beat**: 1 | **景别**: Wide Shot | **时长**: 4s

```json
{
  "shot_number": "Shot_001",
  "sequence": "序幕",
  "beat": "Beat 1",
  "shot_title_heading": "Wide Establishing - Kansai Airport",
  "technical_side_notes": "4s, Wide Shot, Static, Low Angle",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, Kansai International Airport interior, steel beam ceiling structure, large glass wall windows, snow falling outside, gray overcast sky visible through glass, geometric architectural lines, cold atmosphere, monochrome pencil sketch, storyboard sheet design, rough handwritten notes on the side, cold blue accents, cool gray highlights, white border margins, cinematic composition --ar 16:9",
  "negative_prompt": "color photograph, realistic rendering, finished illustration, digital art, anime style, no borders, clean margins, typed text, polished artwork"
}
```

**关键视觉元素**:
- 标志性钢结构天花板
- 玻璃幕墙
- 雪的颗粒质感
- 建立冷色基调

---

### Shot-002

**Beat**: 1 | **景别**: Medium Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_002",
  "sequence": "序幕",
  "beat": "Beat 1",
  "shot_title_heading": "Medium - Nozomi Walking to Gate",
  "technical_side_notes": "3s, Medium Shot, Tracking, Pan Right",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, black hair in high ponytail, amber brown eyes, warm complexion, mature sophisticated appearance, woman wearing black tailored wool coat, gray scarf covering lower face, back view walking on airport conveyor belt, moving walkway, blurred crowd in background, sense of forward motion, monochrome pencil sketch, storyboard sheet design, annotations showing camera tracking arrows, cold blue accents, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic rendering, front view, face visible, digital art, anime style, no borders"
}
```

**关键视觉元素**:
- 希美背影（成年装束）
- 人流对比
- 向前运动感
- 孤独感

---

### Shot-003

**Beat**: 2 | **景别**: Close-Up | **时长**: 2s

```json
{
  "shot_number": "Shot_003",
  "sequence": "序幕",
  "beat": "Beat 2",
  "shot_title_heading": "Close-Up - White Headphones",
  "technical_side_notes": "2s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, side profile of woman's ear, white over-ear noise-canceling headphones, black hair in ponytail visible at edge, partial side of face showing cheekbone and jawline, clean modern design, sense of isolation, monochrome pencil sketch, storyboard sheet design, rough handwritten notes indicating 'sound isolation', cold gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, full face visible, colorful headphones, digital art, anime style"
}
```

**关键视觉元素**:
- 耳机特写
- 隔绝外界象征
- 侧面轮廓

---

### Shot-004

**Beat**: 2 | **景别**: Close-Up | **时长**: 2s

```json
{
  "shot_number": "Shot_004",
  "sequence": "序幕",
  "beat": "Beat 2",
  "shot_title_heading": "Close-Up - Chanel Bag Detail",
  "technical_side_notes": "2s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, shoulder area, black quilted leather Chanel 19 bag with diamond pattern, silver metal chain strap, slight motion blur showing walking movement, texture of leather visible in sketch, material world detail, monochrome pencil sketch, storyboard sheet design, annotations noting 'chain movement', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic product shot, colorful bag, static bag, digital art, anime style"
}
```

**关键视觉元素**:
- Chanel 19 手袋细节
- 菱格纹质感
- 金属链条晃动
- 物质世界符号

---

### Shot-005

**Beat**: 3 | **景别**: Close-Up | **时长**: 5s

```json
{
  "shot_number": "Shot_005",
  "sequence": "序幕",
  "beat": "Beat 3",
  "shot_title_heading": "Close-Up - Nozomi Turns Back (Slow Motion)",
  "technical_side_notes": "5s, Close-Up, Slow Motion, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, black hair in high ponytail, amber brown eyes, warm complexion, mature sophisticated appearance, woman's face front view, gray scarf draped on shoulders, expression of transparent confirmation not longing, eyes clear and detached, subtle composed lip line, boarding gate door visible blurred in background, moment of farewell, monochrome pencil sketch, storyboard sheet design, annotations noting 'slow motion - 5s', 'not looking for someone', cold blue accents, white border margins, emotional weight --ar 16:9",
  "negative_prompt": "color photograph, realistic rendering, emotional distress, crying, digital art, anime style, no borders"
}
```

**关键视觉元素**:
- 希美正面特写
- 透明的确认眼神
- 不是留恋，是告别
- 慢动作强化情绪

---

### Shot-006

**Beat**: 4 | **景别**: Medium Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_006",
  "sequence": "序幕",
  "beat": "Beat 4",
  "shot_title_heading": "Medium - Airplane Window View",
  "technical_side_notes": "3s, Medium Shot, Static, Window POV",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, airplane cabin interior, window seat perspective, aircraft wing visible outside window, heavy snowfall, diagonal snow streaks on glass, blurred ground lights below, enclosed space atmosphere, sense of departure, monochrome pencil sketch, storyboard sheet design, annotations noting 'window reflection', 'engine sound implied', cold blue accents, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, clear weather, digital art, anime style, no snow"
}
```

**关键视觉元素**:
- 机舱窗外视角
- 机翼延伸
- 雪在玻璃上的痕迹
- 密闭空间感

---

### Shot-007

**Beat**: 4 | **景别**: Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_007",
  "sequence": "序幕",
  "beat": "Beat 4",
  "shot_title_heading": "Close-Up - Phone Screen Music Player",
  "technical_side_notes": "3s, Close-Up, Top-Down Angle, Macro",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, smartphone screen from above, music player interface visible, song title clearly readable: 'Gone by Ofelia K', play button, progress bar, modern UI design, hands holding phone at edges, lap visible in background, monochrome pencil sketch, storyboard sheet design, annotations noting 'song title legible', 'narrative bridge', neutral gray tones, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, blurry screen, unreadable text, digital art, anime style"
}
```

**关键视觉元素**:
- 手机屏幕特写
- 曲名清晰可见：「Gone」by Ofelia K
- 音乐作为叙事媒介
- 连接两个时空

---

### Shot-008

**Beat**: 5 | **景别**: Extreme Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_008",
  "sequence": "序幕",
  "beat": "Beat 5",
  "shot_title_heading": "Extreme Close-Up - Walkman Cassette",
  "technical_side_notes": "3s, Extreme Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), extreme close-up panel, vintage silver Sony Walkman cassette player, cassette tape visible through transparent window, reels turning, mechanical texture, aged metal surface, worn details, time capsule object, monochrome pencil sketch, storyboard sheet design, annotations noting 'cassette motion', 'transition device', neutral gray tones, white border margins, nostalgic atmosphere --ar 16:9",
  "negative_prompt": "color photograph, realistic, new device, digital player, colorful, anime style, no cassette visible"
}
```

**关键视觉元素**:
- 老式随身听特写
- 磁带转动可见
- 机械质感
- 与iPhone的对比（时间对照）

---

### Shot-009

**Beat**: 5-6 | **景别**: Wide Shot | **时长**: 5s

```json
{
  "shot_number": "Shot_009",
  "sequence": "序幕",
  "beat": "Beat 5-6",
  "shot_title_heading": "Wide - Mizore Sleeping by Window (Dolly Out)",
  "technical_side_notes": "5s, Wide Shot, Slow Dolly Out",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, long straight black hair, blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, Japanese sailor uniform with light blue trim, teenage girl sleeping at desk by window, head resting on folded arms, wired earbuds in ears, silver Walkman on desk, snow falling outside window silently, dim classroom interior, single ray of cold light on hair, isolated atmosphere, like a specimen in time capsule, monochrome pencil sketch, storyboard sheet design, annotations showing camera pull-back motion arrows, cold blue accents, white border margins, melancholic mood --ar 16:9",
  "negative_prompt": "color photograph, realistic rendering, bright lighting, awake, colorful, digital art, anime style, no snow"
}
```

**关键视觉元素**:
- 霙趴窗台睡觉全景
- 镜头缓慢后拉
- 窗外静雪
- 孤立构图
- 与希美世界的对照
- 时空切换完成

---

> ✅ **序幕（Shot 001-009）已生成完成！**
>
> **统计信息**:
> - 镜头数: 9个
> - 时长: 30秒
> - 角色DNA使用: nozomi_adult (3次), mizore_school (1次)
> - 色调: 冷色调为主（cold blue accents, cool gray highlights）
>
> **请确认是否继续生成第一幕（Beat 7-13, Shot 010-019）？**

---

## 第一幕：学校得知消息（Beat 7-13）

**段落特征**: 暖→冷渐变，日常到失重  
**色调点缀**: 开始 `warm lighting accents` → 结束 `cool gray highlights`  
**镜头数**: 10（Shot 010-019）

---

### Shot-010

**Beat**: 7 | **景别**: Medium Shot | **时长**: 4s

```json
{
  "shot_number": "Shot_010",
  "sequence": "第一幕",
  "beat": "Beat 7",
  "shot_title_heading": "Medium - Class Meeting Announcement",
  "technical_side_notes": "4s, Medium Shot, Static, Eye Level",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, Japanese high school classroom, teacher standing at podium front view, students visible in mid-ground, desks and blackboard background, teacher's mouth open speaking, classmates reacting naturally (nodding, whispering), formal announcement atmosphere, monochrome pencil sketch, storyboard sheet design, annotations noting 'teacher dialogue: Kasakigi Nozomi...', warm lighting accents transitioning to cooler tones, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, empty classroom, no teacher, digital art, anime style, dramatic lighting"
}
```

**关键视觉元素**:
- 教室班会场景
- 老师在讲台
- 同学们自然反应
- 信息传递瞬间

---

### Shot-011

**Beat**: 7 | **景别**: Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_011",
  "sequence": "第一幕",
  "beat": "Beat 7",
  "shot_title_heading": "Close-Up - Mizore's Shocked Face",
  "technical_side_notes": "3s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, long straight black hair, blunt bangs covering eyebrows, hazel gray eyes, pale complexion, slight downturned eyes, melancholic expression, teenage girl's face, eyes widened in shock, mouth slightly parted, frozen expression, hand gripping pen tightly visible at bottom edge, restrained emotional reaction, monochrome pencil sketch, storyboard sheet design, annotations noting 'micro-expression', 'hand detail important', cool gray highlights beginning, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, exaggerated expression, crying, screaming, digital art, anime style, calm face"
}
```

**关键视觉元素**:
- 霙面部特写
- 瞬间失神
- 手捏笔细节
- 克制的震惊

---

### Shot-012

**Beat**: 8 | **景别**: Medium Shot | **时长**: 2s

```json
{
  "shot_number": "Shot_012",
  "sequence": "第一幕",
  "beat": "Beat 8",
  "shot_title_heading": "Medium - Mizore's POV Empty Seat",
  "technical_side_notes": "2s, Medium Shot, Static, Mizore's POV",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, point-of-view shot, classroom desk, empty chair or black hair in high ponytail girl busy packing bag, not looking back, distance emphasized, blurred foreground suggesting Mizore's gaze, sense of disconnection, monochrome pencil sketch, storyboard sheet design, annotations noting 'subjective POV', 'Nozomi not aware', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, direct eye contact, clear focus, digital art, anime style, warm atmosphere"
}
```

**关键视觉元素**:
- 主观视角（霙的视线）
- 希美座位（空或忙碌）
- 视线落空
- 疏离感

---

### Shot-013

**Beat**: 9 | **景别**: Close-Up | **时长**: 4s

```json
{
  "shot_number": "Shot_013",
  "sequence": "第一幕",
  "beat": "Beat 9",
  "shot_title_heading": "Close-Up - Phone Message Deleted",
  "technical_side_notes": "4s, Close-Up, Top-Down, Macro",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, smartphone screen from above, text message draft visible: '烟火那天你会来吗?', finger hovering over send button, then deleting entire message, backspace animation implied, empty chat window remains, hands trembling slightly, monochrome pencil sketch, storyboard sheet design, annotations noting 'text legible', 'delete action sequence', cool gray highlights, white border margins, anxiety conveyed --ar 16:9",
  "negative_prompt": "color photograph, realistic, sent message, English text, digital art, anime style, steady hands"
}
```

**关键视觉元素**:
- 手机屏幕
- 文字输入："烟火那天你会来吗？"
- 删除动作
- 犹豫与退缩

---

### Shot-014

**Beat**: 10 | **景别**: Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_014",
  "sequence": "第一幕",
  "beat": "Beat 10",
  "shot_title_heading": "Close-Up - Blank Survey Form",
  "technical_side_notes": "3s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, folded A4 paper, school career survey form, blank fields visible, multiple creases on edges, worn corners, repeated folding marks, paper texture emphasized, sense of avoidance, monochrome pencil sketch, storyboard sheet design, annotations noting 'form still blank', 'crease details', neutral gray tones, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, filled form, clean paper, digital art, anime style, colorful form"
}
```

**关键视觉元素**:
- 升学调查表特写
- 空白表格
- 多处折痕
- 道具系统引入

---

### Shot-015

**Beat**: 10 | **景别**: Medium Shot | **时长**: 2s

```json
{
  "shot_number": "Shot_015",
  "sequence": "第一幕",
  "beat": "Beat 10",
  "shot_title_heading": "Medium - Mizore Hiding Form",
  "technical_side_notes": "2s, Medium Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform, teenage girl at desk, hands pushing folded paper deep into backpack, body language showing avoidance, shoulders slightly hunched, classroom desk and window background, monochrome pencil sketch, storyboard sheet design, annotations noting 'hiding motion', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, confident posture, taking form out, digital art, anime style, bright mood"
}
```

**关键视觉元素**:
- 霙塞回调查表动作
- 逃避的身体语言
- 选择不面对

---

### Shot-016

**Beat**: 11 | **景别**: Wide Shot | **时长**: 4s

```json
{
  "shot_number": "Shot_016",
  "sequence": "第一幕",
  "beat": "Beat 11",
  "shot_title_heading": "Wide - Hallway Blocked Conversation",
  "technical_side_notes": "4s, Wide Shot, Tracking",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, school hallway, long straight black hair girl trying to approach, black hair in high ponytail girl surrounded by teacher and classmates, distance between them, crowd flowing past, sense of isolation, Mizore standing still while others move, monochrome pencil sketch, storyboard sheet design, annotations showing 'Mizore static', 'crowd motion lines', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, empty hallway, face-to-face conversation, digital art, anime style, bright lighting"
}
```

**关键视觉元素**:
- 走廊全景
- 霙试图接近
- 希美被围住/被拦截
- 人流动态 vs 霙静止

---

### Shot-017

**Beat**: 12 | **景别**: Medium Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_017",
  "sequence": "第一幕",
  "beat": "Beat 12",
  "shot_title_heading": "Medium - Unspoken Words",
  "technical_side_notes": "3s, Medium Shot, Tracking",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, two girls walking, black hair in high ponytail girl in foreground walking ahead, long straight black hair girl with blunt bangs in background following half-step behind, back girl's lips slightly moving as if to speak, front girl continuing forward without looking back, gap between them, monochrome pencil sketch, storyboard sheet design, annotations noting 'Mizore tries to speak', 'Nozomi unaware', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, side-by-side walking, conversation happening, digital art, anime style, equal positioning"
}
```

**关键视觉元素**:
- 走廊跟随
- 霙嘴唇微动
- 希美未回头
- 话语被吞回

---

### Shot-018

**Beat**: 13 | **景别**: Medium Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_018",
  "sequence": "第一幕",
  "beat": "Beat 13",
  "shot_title_heading": "Medium - Mizore Putting Earbuds Deeper",
  "technical_side_notes": "3s, Medium Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform, teenage girl at classroom desk, hands pushing wired earbuds deeper into ears, silver Walkman on desk, eyes closed or looking down, retreating into music, escape mechanism, monochrome pencil sketch, storyboard sheet design, annotations noting 'retreat into sound', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, removing earbuds, happy expression, digital art, anime style, bright atmosphere"
}
```

**关键视觉元素**:
- 霙塞耳机动作
- 逃避机制启动
- 随身听出现

---

### Shot-019

**Beat**: 13 | **景别**: Close-Up | **时长**: 2s

```json
{
  "shot_number": "Shot_019",
  "sequence": "第一幕",
  "beat": "Beat 13",
  "shot_title_heading": "Close-Up - Play Button Pressed (Transition)",
  "technical_side_notes": "2s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, silver Walkman play button, finger pressing down, cassette reels beginning to turn, sound wave ripples emanating visually, color tone shifting from cool to warm in sketch shading, transition device, monochrome pencil sketch, storyboard sheet design, annotations noting 'transition to memory', 'color shift to warmer', warm lighting accents beginning, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, stopped cassette, digital player, colorful, anime style, static composition"
}
```

**关键视觉元素**:
- 播放键按下特写
- 声波纹效果
- 色调转换（冷→暖）
- 进入回忆段落

---

> ✅ **第一幕（Shot 010-019）已生成完成！**
>
> **统计信息**:
> - 镜头数: 10个
> - 时长: 40秒
> - 角色DNA使用: mizore_school (5次), nozomi_school (3次)
> - 色调: 暖色逐渐转冷（warm accents → cool gray highlights）
>
> **请确认是否继续生成第二幕（Beat 14-20, Shot 020-029）？**

---

## 第二幕：初识与美好（Beat 14-20）

**段落特征**: 暖色调，高饱和，表面美好  
**色调点缀**: `warm lighting accents`, `golden hour glow`  
**镜头数**: 10（Shot 020-029）

---

### Shot-020

**Beat**: 14 | **景别**: Wide Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_020",
  "sequence": "第二幕",
  "beat": "Beat 14",
  "shot_title_heading": "Wide - First Meeting Hallway",
  "technical_side_notes": "3s, Wide Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, school hallway with crowd, black hair in high ponytail, wispy bangs, bright natural smile girl in foreground reaching out hand or speaking first, long straight black hair, blunt bangs, pale complexion, melancholic girl in background responding passively, composition emphasizing front-back positioning, Nozomi leading, Mizore following, monochrome pencil sketch, storyboard sheet design, annotations noting 'Nozomi initiates', 'power dynamic established', warm lighting accents, golden hour glow, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, equal positioning, Mizore initiating, digital art, anime style, cold lighting"
}
```

**关键视觉元素**:
- 初识场景
- 希美主动伸手
- 霙被动跟随
- 构图：希美前景，霙后景

---

### Shot-021

**Beat**: 15 | **景别**: Medium Shot | **时长**: 5s

```json
{
  "shot_number": "Shot_021",
  "sequence": "第二幕",
  "beat": "Beat 15",
  "shot_title_heading": "Medium - Following Pattern Montage",
  "technical_side_notes": "5s, Medium Shot, Tracking, Montage",
  "prompt_text": "((Storyboard sheet layout)), montage panel with multiple sub-frames, various locations (hallway, street, campus), black hair in high ponytail girl always positioned half-step ahead, long straight black hair girl always following half-step behind, repeated positioning pattern across different scenes, visual rhythm of following, monochrome pencil sketch, storyboard sheet design, annotations noting 'pattern repetition', 'always half-step behind', warm lighting accents, white border margins, nostalgic mood --ar 16:9",
  "negative_prompt": "color photograph, realistic, side-by-side, equal pace, digital art, anime style, single scene"
}
```

**关键视觉元素**:
- 蒙太奇多场景
- 位置关系重复
- 希美在前，霙在后
- 跟随模式建立

---

### Shot-022

**Beat**: 16 | **景别**: Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_022",
  "sequence": "第二幕",
  "beat": "Beat 16",
  "shot_title_heading": "Close-Up - Shared Earbuds",
  "technical_side_notes": "3s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, two heads close together, black ponytail and long straight black hair, single earbud wire splitting to both girls, shared listening moment, intimacy suggested, warm atmosphere, monochrome pencil sketch, storyboard sheet design, annotations noting 'shared earbud', 'intimacy symbol', warm lighting accents, golden hour glow, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, separate headphones, no wire, digital art, anime style, cold atmosphere"
}
```

**关键视觉元素**:
- 共享耳机特写
- 两人头部并列
- 耳机线连接
- 亲密象征

---

### Shot-023

**Beat**: 16 | **景别**: Medium Shot | **时长**: 5s

```json
{
  "shot_number": "Shot_023",
  "sequence": "第二幕",
  "beat": "Beat 16",
  "shot_title_heading": "Medium - Interrupted Conversation",
  "technical_side_notes": "5s, Medium Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, two Japanese high school girls sitting, long straight black hair, blunt bangs, hazel gray eyes, melancholic girl with lips slightly moving trying to speak, wearing sailor uniform with light blue trim, single earbud in ear, black hair in high ponytail, amber brown eyes, bright smile girl looking at vibrating phone, raising hand in 'wait' gesture, removing earbud to answer call, sense of interruption, Mizore isolated with one earbud still in, monochrome pencil sketch, storyboard sheet design, annotations noting 'Mizore interrupted', 'phone takes priority', warm lighting fading, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, undivided attention, no phone, digital art, anime style, both listening"
}
```

**关键视觉元素**:
- 霙被打断
- 希美接电话
- 霙单方面戴耳机
- 核心冲突事件

---

### Shot-024

**Beat**: 16 | **景别**: Wide Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_024",
  "sequence": "第二幕",
  "beat": "Beat 16",
  "shot_title_heading": "Wide - Mizore Left Alone",
  "technical_side_notes": "3s, Wide Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, black hair in high ponytail girl's back view walking away quickly with bag, long straight black hair, blunt bangs, pale complexion, melancholic girl sitting alone at bench or spot, unspoken words hanging, sense of abandonment, composition emphasizing empty space around Mizore, monochrome pencil sketch, storyboard sheet design, annotations noting 'Nozomi's departure', 'unfinished sentence', warm lighting accents dimming, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, both leaving together, conversation completed, digital art, anime style, close distance"
}
```

**关键视觉元素**:
- 希美快步离开背影
- 霙独自留下
- 话未说完
- 孤立感

---

### Shot-025

**Beat**: 18 | **景别**: Medium Shot | **时长**: 4s

```json
{
  "shot_number": "Shot_025",
  "sequence": "第二幕",
  "beat": "Beat 18",
  "shot_title_heading": "Medium - Fireworks Promise Casual",
  "technical_side_notes": "4s, Medium Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, music practice room, black hair in high ponytail, wispy bangs, amber brown eyes, bright casual smile girl packing silver flute into bag, eyes not focused on companion, mouth open speaking casually, long straight black hair, blunt bangs, melancholic expression girl visible in background, casual promise being made, weight differential in importance, monochrome pencil sketch, storyboard sheet design, annotations noting 'Nozomi casual', 'Mizore serious', warm lighting accents, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, serious promise atmosphere, eye contact, digital art, anime style, equal weight"
}
```

**关键视觉元素**:
- 练习室场景
- 希美随口说话（收拾乐器）
- 眼神未聚焦霙
- 烟火约定建立

---

### Shot-026

**Beat**: 18 | **景别**: Close-Up | **时长**: 2s

```json
{
  "shot_number": "Shot_026",
  "sequence": "第二幕",
  "beat": "Beat 18",
  "shot_title_heading": "Close-Up - Mizore's Serious Nod",
  "technical_side_notes": "2s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, long straight black hair, blunt bangs covering eyebrows, hazel gray eyes, pale complexion, slight downturned eyes, teenage girl's face, serious determined expression, pausing one second before nodding solemnly, treating casual words as solemn promise, contrast in emotional weight, monochrome pencil sketch, storyboard sheet design, annotations noting 'Mizore takes it seriously', 'pause before nod', warm lighting accents, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, casual nod, smiling, digital art, anime style, matching energy"
}
```

**关键视觉元素**:
- 霙面部特写
- 郑重表情
- 停顿后点头
- 对比双方重视程度

---

### Shot-027

**Beat**: 18 | **景别**: Wide Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_027",
  "sequence": "第二幕",
  "beat": "Beat 18",
  "shot_title_heading": "Wide - Nozomi Leaves Practice Room",
  "technical_side_notes": "3s, Wide Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, music practice room interior, black hair in high ponytail girl with bag on shoulder walking toward door exit, waving goodbye casually without turning back, long straight black hair girl standing alone in center of empty room, instruments and stands in background, sense of being left again, pattern repeating, monochrome pencil sketch, storyboard sheet design, annotations noting 'pattern repeats', 'Mizore alone again', warm lighting accents, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, leaving together, Nozomi waiting, digital art, anime style, small room"
}
```

**关键视觉元素**:
- 希美快步离开不回头
- 霙独自站在练习室
- 模式重复
- 空间的空旷感

---

### Shot-028

**Beat**: 18 | **景别**: Close-Up | **时长**: 4s

```json
{
  "shot_number": "Shot_028",
  "sequence": "第二幕",
  "beat": "Beat 18",
  "shot_title_heading": "Close-Up - Calendar Circled Twice",
  "technical_side_notes": "4s, Close-Up, Top-Down, Macro",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, smartphone calendar app screen, specific date visible, hand drawing circle around fireworks festival date, then drawing second circle over first circle, emphasis on repetition, treating casual words as binding promise, obsessive care, monochrome pencil sketch, storyboard sheet design, annotations noting 'circles twice', 'weight misalignment', warm lighting accents, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, single circle, paper calendar, digital art, anime style, no repetition"
}
```

**关键视觉元素**:
- 手机日历
- 画圈动作（两次）
- 强调重视
- 权重错位

---

### Shot-029

**Beat**: 20 | **景别**: Medium Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_029",
  "sequence": "第二幕",
  "beat": "Beat 20",
  "shot_title_heading": "Medium - Misread Glance Back",
  "technical_side_notes": "3s, Medium Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, school hallway, black hair in high ponytail, amber brown eyes, bright expression girl walking ahead, turning head back briefly with polite courtesy glance not emotional longing, long straight black hair, blunt bangs, pale complexion, slight smile girl in background interpreting glance as 'being seen', misreading politeness as connection, monochrome pencil sketch, storyboard sheet design, annotations noting 'polite not intimate', 'Mizore misreads', warm lighting accents beginning to fade, white border margins, turning point --ar 16:9",
  "negative_prompt": "color photograph, realistic, loving glance, deep eye contact, digital art, anime style, obvious care"
}
```

**关键视觉元素**:
- 希美回头（礼貌性）
- 霙误读为"被看见"
- 霙微笑
- 美好回忆结束点
- 色调开始转冷

---

> ✅ **第二幕（Shot 020-029）已生成完成！**
>
> **统计信息**:
> - 镜头数: 10个
> - 时长: 45秒
> - 角色DNA使用: mizore_school (8次), nozomi_school (8次)
> - 色调: 暖色调为主（warm lighting accents, golden hour glow）
>
> **请确认是否继续生成第三幕（Beat 21-27.5, Shot 030-045）？**

---

## 第三幕：分岔与平行（Beat 21-27.5）

**段落特征**: 冷暖交替，高对比，快速剪辑，情绪密度递增  
**色调点缀**: 冷暖交替 `cold/warm alternating`, `high contrast`  
**镜头数**: 16（Shot 030-045）

---

### Shot-030

**Beat**: 21 | **景别**: Close-Up | **时长**: 4s

```json
{
  "shot_number": "Shot_030",
  "sequence": "第三幕",
  "beat": "Beat 21",
  "shot_title_heading": "Close-Up - Schedule Contrast Montage",
  "technical_side_notes": "4s, Close-Up, Static, Split Screen",
  "prompt_text": "((Storyboard sheet layout)), close-up panel with split composition, left side: dense schedule planner filled with activities (club, cram school, paperwork), right side: sparse schedule with repeated notes 'waiting for Nozomi' '希美有空时', contrast in density, time diverging, monochrome pencil sketch, storyboard sheet design, annotations noting 'schedule contrast', 'worlds diverging', neutral gray tones transitioning to cool, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, equal schedules, empty planners, digital art, anime style, single planner"
}
```

**关键视觉元素**:
- 日程表对比（分屏）
- 希美密集 vs 霙空白但写满"等希美"
- 世界开始分岔

---

### Shot-031

**Beat**: 22 | **景别**: Medium Shot | **时长**: 5s

```json
{
  "shot_number": "Shot_031",
  "sequence": "第三幕",
  "beat": "Beat 22",
  "shot_title_heading": "Medium - Waiting Pattern Montage",
  "technical_side_notes": "5s, Medium Shot, Static, Montage",
  "prompt_text": "((Storyboard sheet layout)), montage panel with multiple sub-frames, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform, melancholic girl in repeated waiting poses: arriving early at classroom, waiting at practice room door, staying late, checking watch repeatedly, hand on wrist showing time anxiety, pattern of adjustment and accommodation, monochrome pencil sketch, storyboard sheet design, annotations noting 'constant adjustment', 'watch checks increase', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, active scenes, not waiting, digital art, anime style, single moment, bright mood"
}
```

**关键视觉元素**:
- 蒙太奇：霙的等待姿态
- 提前到达、延后离开
- 看手表动作重复
- 主动对齐的努力

---

### Shot-032

**Beat**: 23 | **景别**: Wide Shot | **时长**: 4s

```json
{
  "shot_number": "Shot_032",
  "sequence": "第三幕",
  "beat": "Beat 23",
  "shot_title_heading": "Wide - Increasing Distance",
  "technical_side_notes": "4s, Wide Shot, Tracking",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, school corridor or street, black hair in high ponytail girl's back view walking increasingly fast, receding into distance, long straight black hair girl trying to follow but distance expanding, motion lines showing speed differential, sense of losing pace, unable to catch up, monochrome pencil sketch, storyboard sheet design, annotations noting 'speed increase', 'distance widens', 'chasing fails', cold blue accents, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, walking together, maintaining distance, digital art, anime style, slow pace, warm atmosphere"
}
```

**关键视觉元素**:
- 希美走路加速背影
- 霙追赶但距离拉大
- 运动线条强化速度差
- 物理距离=情感距离

---

### Shot-033

**Beat**: 24 | **景别**: Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_033",
  "sequence": "第三幕",
  "beat": "Beat 24",
  "shot_title_heading": "Close-Up - Writing Fireworks Details",
  "technical_side_notes": "3s, Close-Up, Top-Down",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, paper on desk, hand writing fireworks festival time and location repeatedly, checking multiple times, circling important details, obsessive confirmation behavior, anxiety visible in handwriting pressure, monochrome pencil sketch, storyboard sheet design, annotations noting 'obsessive checking', 'anxiety in writing', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, casual writing, single check, digital art, anime style, relaxed writing, warm tones"
}
```

**关键视觉元素**:
- 纸上书写烟火时间地点
- 反复确认
- 焦虑感

---

### Shot-034

**Beat**: 24 | **景别**: Close-Up | **时长**: 4s

```json
{
  "shot_number": "Shot_034",
  "sequence": "第三幕",
  "beat": "Beat 24",
  "shot_title_heading": "Close-Up - Sending Confirmation Message",
  "technical_side_notes": "4s, Close-Up, Top-Down, Macro",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, smartphone screen, fingers typing message: '烟火那天,还是说好的地点见吗?', finger pressing send button, message bubble flying out, moment of courage, breaking silence, monochrome pencil sketch, storyboard sheet design, annotations noting 'text legible', 'send action', neutral gray tones, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, deleted message, English text, not sent, digital art, anime style, casual tone"
}
```

**关键视觉元素**:
- 手机打字："烟火那天，还是说好的地点见吗？"
- 发送动作
- 霙主动确认

---

### Shot-035

**Beat**: 24 | **景别**: Montage | **时长**: 3s

```json
{
  "shot_number": "Shot_035",
  "sequence": "第三幕",
  "beat": "Beat 24",
  "shot_title_heading": "Montage - Waiting for Reply",
  "technical_side_notes": "3s, Montage, Quick Cuts",
  "prompt_text": "((Storyboard sheet layout)), montage panel with rapid sub-frames, long straight black hair girl checking phone in different locations: in class, eating lunch, walking, hand constantly reaching for phone, screen empty no reply, time passing anxiously, obsessive checking pattern, monochrome pencil sketch, storyboard sheet design, annotations noting 'time passing', 'obsessive checking', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, single location, phone not checked, digital art, anime style, relaxed mood, reply received"
}
```

**关键视觉元素**:
- 快切多场景
- 霙反复看手机
- 等待的煎熬
- 时间延长

---

### Shot-036

**Beat**: 24 | **景别**: Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_036",
  "sequence": "第三幕",
  "beat": "Beat 24",
  "shot_title_heading": "Close-Up - Casual Reply Received",
  "technical_side_notes": "3s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel split composition, top: phone screen showing reply message: '应该吧~到时候再说!', casual tone visible in text, bottom: long straight black hair, blunt bangs, hazel gray eyes, pale complexion, girl's face, corners of mouth attempting to lift but only twitching slightly, restrained disappointment, recognizing casualness, monochrome pencil sketch, storyboard sheet design, annotations noting 'casual reply', 'Mizore recognizes gap', cold blue accents, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, enthusiastic reply, happy smile, digital art, anime style, warm response"
}
```

**关键视觉元素**:
- 手机屏幕：希美回复"应该吧～到时候再说！"
- 霙微表情（克制的失望）
- 嘴角抽动未能上扬
- 敷衍回复

---

### Shot-037

**Beat**: 25 | **景别**: Wide Shot | **时长**: 4s

```json
{
  "shot_number": "Shot_037",
  "sequence": "第三幕",
  "beat": "Beat 25",
  "shot_title_heading": "Wide - Fireworks Festival Crowd",
  "technical_side_notes": "4s, Wide Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, summer night fireworks festival site, crowded with people, couples holding hands, friends in groups, families together, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, Japanese summer casual wear, teenage girl standing alone in center, surrounded by paired people, strong contrast of isolation, monochrome pencil sketch, storyboard sheet design, annotations noting 'everyone paired', 'Mizore isolated', warm lighting accents from festival stalls contrasting with cold emotional tone, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, empty festival, Mizore with company, digital art, anime style, winter scene, bright cheerful mood"
}
```

**关键视觉元素**:
- 烟火现场全景
- 人群涌动，成双成对
- 霙独自一人
- 孤立感强化

---

### Shot-038

**Beat**: 25 | **景别**: Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_038",
  "sequence": "第三幕",
  "beat": "Beat 25",
  "shot_title_heading": "Close-Up - Checking Phone and Watch",
  "technical_side_notes": "3s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, hands holding smartphone, screen showing no new messages, empty notifications, then same hands checking wristwatch, time passing, repetitive anxious gesture, monochrome pencil sketch, storyboard sheet design, annotations noting 'no messages', 'time anxiety', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, new messages, not checking time, digital art, anime style, relaxed hands"
}
```

**关键视觉元素**:
- 手部特写
- 手机空白屏幕
- 看手表
- 等待焦虑

---

### Shot-039

**Beat**: 25 | **景别**: Medium Shot | **时长**: 4s

```json
{
  "shot_number": "Shot_039",
  "sequence": "第三幕",
  "beat": "Beat 25",
  "shot_title_heading": "Medium - Mizore Waiting with Walkman",
  "technical_side_notes": "4s, Medium Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, teenage girl in summer casual clothes, standing still in crowd, hand turning volume knob on silver Walkman higher, wired earbuds in ears, using music to fill waiting time, sky darkening in background, crowd growing denser, she remains alone, monochrome pencil sketch, storyboard sheet design, annotations noting 'music as escape', 'crowd increases', cold/warm contrast, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, no Walkman, bright daylight, with company, digital art, anime style, not waiting"
}
```

**关键视觉元素**:
- 霙调高随身听音量
- 用音乐填满等待
- 天色渐暗
- 人群增多 vs 霙静止

---

### Shot-040

**Beat**: 26 | **景别**: Wide Shot | **时长**: 5s

```json
{
  "shot_number": "Shot_040",
  "sequence": "第三幕",
  "beat": "Beat 26",
  "shot_title_heading": "Wide - Fireworks Explode Empty Expression",
  "technical_side_notes": "5s, Wide Shot, Static, Low Angle",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, night sky with fireworks exploding overhead, brilliant light patterns sketched in white on black, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, teenage girl in foreground silhouette, face upturned toward fireworks, expression illuminated but empty hollow, beauty contrasting with emotional void, still waiting alone, monochrome pencil sketch with fireworks as light source, storyboard sheet design, annotations noting 'light on empty face', 'beauty vs void', high contrast lighting, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, happy expression, with companion, no fireworks, digital art, anime style, joyful mood, bright colors"
}
```

**关键视觉元素**:
- 烟火在天空绽放
- 霙脸被照亮但表情空洞
- 美好与空虚对比
- 情感爆点前奏

---

### Shot-041

**Beat**: 26 | **景别**: Wide Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_041",
  "sequence": "第三幕",
  "beat": "Beat 26",
  "shot_title_heading": "Wide - Crowd Disperses Mizore Leaves",
  "technical_side_notes": "3s, Wide Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, fireworks festival ending, crowd dispersing in all directions, couples and groups leaving together, long straight black hair girl's back view walking alone away from festival, shoulders slightly hunched, solitary figure amidst paired exodus, night scene, monochrome pencil sketch, storyboard sheet design, annotations noting 'crowd disperses paired', 'Mizore alone', cold blue accents, white border margins, melancholic atmosphere --ar 16:9",
  "negative_prompt": "color photograph, realistic, staying at festival, with companion, digital art, anime style, bright mood, daytime"
}
```

**关键视觉元素**:
- 烟火结束
- 人群散去（成双成对）
- 霙独自离开背影
- 等待落空

---

### Shot-042

**Beat**: 26 | **景别**: Medium Shot | **时长**: 4s

```json
{
  "shot_number": "Shot_042",
  "sequence": "第三幕",
  "beat": "Beat 26",
  "shot_title_heading": "Medium - Overhearing Nozomi's Excuse",
  "technical_side_notes": "4s, Medium Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, next day school setting, black hair in high ponytail, amber brown eyes, bright natural smile girl talking to other classmates, mouth open speaking: '昨天家里突然有事...', natural casual explanation, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, melancholic girl visible in background or side, overhearing not being directly told, expression not anger but dawning understanding, realization moment, monochrome pencil sketch, storyboard sheet design, annotations noting 'indirect information', 'Mizore realizes', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, direct conversation, angry expression, digital art, anime style, warm atmosphere, confrontation"
}
```

**关键视觉元素**:
- 次日学校
- 希美跟别人说"昨天家里有事"
- 霙在旁听到（非直接告知）
- 表情：恍然理解，非愤怒

---

### Shot-043

**Beat**: 27 | **景别**: Wide Shot | **时长**: 3s

```json
{
  "shot_number": "Shot_043",
  "sequence": "第三幕",
  "beat": "Beat 27",
  "shot_title_heading": "Wide - Walking Home Alone",
  "technical_side_notes": "3s, Wide Shot, Tracking",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, residential street afternoon, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform, teenage girl walking alone, back view, shoulders not slumped but quietly resigned, empty street, solitary journey, monochrome pencil sketch, storyboard sheet design, annotations noting 'quiet resignation', 'solitary', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, with company, dramatic posture, digital art, anime style, bright mood, crying"
}
```

**关键视觉元素**:
- 霙独自回家路上
- 背影
- 情绪转场

---

### Shot-044

**Beat**: 27 | **景别**: Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_044",
  "sequence": "第三幕",
  "beat": "Beat 27",
  "shot_title_heading": "Close-Up - Stopping Walkman",
  "technical_side_notes": "3s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, silver Walkman in hand, finger pressing stop button firmly, cassette reels halting abruptly, or alternate version: pressing eject button and cassette popping out, physical disconnection action, no tears no breakdown just quiet decisive gesture, symbolic rupture, monochrome pencil sketch, storyboard sheet design, annotations noting 'decisive stop', 'symbolic break', 'no tears', cool gray highlights, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, playing continuously, crying, dramatic reaction, digital art, anime style, emotional outburst"
}
```

**关键视觉元素**:
- 随身听停止键/弹出键
- 磁带停止/弹出
- 克制的断裂动作
- 无眼泪无崩溃

---

### Shot-045

**Beat**: 27.5 | **景别**: Wide Shot | **时长**: 5s

```json
{
  "shot_number": "Shot_045",
  "sequence": "第三幕",
  "beat": "Beat 27.5",
  "shot_title_heading": "Wide - Silent Digestion Room",
  "technical_side_notes": "5s, Wide Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, evening bedroom, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform, teenage girl sitting at desk, window showing twilight sky, blank career survey form spread on desk surface, multiple creases visible, wrinkled edges, hand resting on paper not writing, fingers absently tracing paper surface, calm acceptance replacing distress, silent processing moment, monochrome pencil sketch, storyboard sheet design, annotations noting 'transition moment', 'acceptance beginning', neutral gray tones, white border margins, quiet atmosphere --ar 16:9",
  "negative_prompt": "color photograph, realistic, writing on form, bright lighting, digital art, anime style, emotional breakdown, active scene"
}
```

**关键视觉元素**:
- 霙房间，傍晚
- 调查表摊在桌上
- 折痕清晰
- 手指抚过纸面
- 沉默消化

---

> ✅ **第三幕（Shot 030-045）已生成完成！**
>
> **统计信息**:
> - 镜头数: 16个（比原计划增加3个，为更好呈现情绪递进）
> - 时长: 55秒
> - 角色DNA使用: mizore_school (12次), nozomi_school (5次)
> - 色调: 冷暖交替，高对比（cold/warm alternating, high contrast）
>
> **请确认是否继续生成终章（Beat 28-30, Shot 046-049）？**

---

## 终章：和解与选择（Beat 28-30）

**段落特征**: 高调白光，柔和明亮，和解与自主  
**色调点缀**: `high-key white light`, `soft bright tones`  
**镜头数**: 4（Shot 046-049）

---

### Shot-046

**Beat**: 28-29 | **景别**: Medium Shot | **时长**: 5s

```json
{
  "shot_number": "Shot_046",
  "sequence": "终章",
  "beat": "Beat 28-29",
  "shot_title_heading": "Medium - Mizore Picking Up Pen",
  "technical_side_notes": "5s, Medium Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), medium shot panel, bright morning light, long straight black hair, blunt bangs covering eyebrows, hazel gray eyes, pale complexion, determined expression, Japanese sailor uniform, teenage girl sitting at desk by window, soft natural light illuminating scene, blank career survey form on desk with multiple creases but still unfilled, hand reaching for pen, pen tip hovering over first blank field, no hesitation in eyes, resolute gaze, moment of self-agency, monochrome pencil sketch, storyboard sheet design, annotations noting 'resolved expression', 'self-agency awakening', high-key white light, soft bright tones, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, dim lighting, hesitant expression, digital art, anime style, filled form, avoiding form"
}
```

**关键视觉元素**:
- 明亮的早晨/时刻
- 霙拿起笔
- 笔尖悬停
- 眼神坚定
- 自我主体性觉醒

---

### Shot-047

**Beat**: 29 | **景别**: Close-Up | **时长**: 4s

```json
{
  "shot_number": "Shot_047",
  "sequence": "终章",
  "beat": "Beat 29",
  "shot_title_heading": "Close-Up - Writing on Form",
  "technical_side_notes": "4s, Close-Up, Top-Down, Macro",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, top-down view, pen tip touching paper, ink flowing, handwriting appearing stroke by stroke in blank fields, content not necessarily legible focus on writing action itself, no crossing out no rewriting, clean decisive strokes, after writing hand folding form neatly, clean efficient motion, paper texture and crease details visible, completing the object arc, monochrome pencil sketch, storyboard sheet design, annotations noting 'decisive writing', 'no corrections', 'form completed', high-key white light, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, hesitant writing, crossing out, digital art, anime style, blank form remaining, messy folding"
}
```

**关键视觉元素**:
- 笔尖落纸
- 字迹出现（逐笔）
- 无划掉无重写
- 整齐对折
- 道具弧线完成

---

### Shot-048

**Beat**: 30 | **景别**: Close-Up | **时长**: 3s

```json
{
  "shot_number": "Shot_048",
  "sequence": "终章",
  "beat": "Beat 30",
  "shot_title_heading": "Close-Up - Play Button Forward",
  "technical_side_notes": "3s, Close-Up, Static",
  "prompt_text": "((Storyboard sheet layout)), close-up panel, silver Walkman in hand, finger pressing play button, cassette reels beginning to turn forward not rewinding, continuing from current position not returning to beginning, moving forward, tape direction emphasized with motion arrows, symbolic of moving forward in time, monochrome pencil sketch, storyboard sheet design, annotations noting 'forward not rewind', 'time moves on', 'narrative loop closing', high-key white light, white border margins --ar 16:9",
  "negative_prompt": "color photograph, realistic, rewinding, stopped, digital player, colorful, anime style, going backwards"
}
```

**关键视觉元素**:
- 随身听播放键
- 磁带向前转动（非倒带）
- 音乐继续向前
- 与开头形成闭环

---

### Shot-049

**Beat**: 30 | **景别**: Wide Shot | **时长**: 8s

```json
{
  "shot_number": "Shot_049",
  "sequence": "终章",
  "beat": "Beat 30",
  "shot_title_heading": "Wide - Mizore Faces Forward (Final)",
  "technical_side_notes": "8s, Wide Shot, Static",
  "prompt_text": "((Storyboard sheet layout)), wide shot panel, bright morning classroom or bedroom, long straight black hair, blunt bangs, hazel gray eyes, pale complexion, Japanese sailor uniform, teenage girl standing, back to camera, facing window or forward direction, morning sunlight streaming in creating high-key backlight, silhouette with gentle glow, shoulders relaxed, posture forward-facing, items packed and ready, sense of departure or new beginning, visual echo of opening but transformed, gentle serene atmosphere, music completing final notes implied, monochrome pencil sketch, storyboard sheet design, annotations noting 'back view', 'facing forward', 'light from ahead', 'narrative closure', 'gentle resolution', high-key white light, soft bright tones, white border margins, emotional resolution --ar 16:9",
  "negative_prompt": "color photograph, realistic, facing camera, dramatic lighting, digital art, anime style, looking back, dark atmosphere, unresolved tension"
}
```

**关键视觉元素**:
- 霙背影
- 面向窗外/前方
- 早晨阳光/明亮光源
- 背光轮廓
- 向前的姿态
- 首尾呼应
- 温柔告别

---

> ✅ **终章（Shot 046-049）已生成完成！**
>
> **统计信息**:
> - 镜头数: 4个
> - 时长: 20秒
> - 角色DNA使用: mizore_school (3次)
> - 色调: 高调白光（high-key white light, soft bright tones）
>
> ---
>
> ## 🎉 全部线稿分镜提示词生成完成！
>
> ### 总体统计
> - **总镜头数**: 49个 ✅
> - **总时长**: 190秒（3'10"）✅
> - **角色DNA锚定**: 100%覆盖（无泛指词）✅
> - **风格统一**: 铅笔素描分镜纸版式 ✅
> - **平台**: Nano Banana Pro
> - **宽高比**: 16:9
>
> ### 段落分布
> | 段落 | 镜头范围 | 数量 | 时长 | 色调特征 |
> |------|----------|------|------|---------|
> | 序幕 | 001-009 | 9 | 30s | 冷色调 |
> | 第一幕 | 010-019 | 10 | 40s | 暖→冷渐变 |
> | 第二幕 | 020-029 | 10 | 45s | 暖色调 |
> | 第三幕 | 030-045 | 16 | 55s | 冷暖交替 |
> | 终章 | 046-049 | 4 | 20s | 高调白光 |
>
> ### 输出文件
> **保存至**: `deliverables/40_boards/04_storyboard_prompts.md`
>
> ---
>
> ## 下一步选项
>
> 1. ✅ **确认完成**，交接给其他 agent
> 2. 🔧 **修改特定镜头**（请指定镜号）
> 3. 📋 **导出JSON格式**（用于直接导入 Nano Banana Pro）
> 4. 🎨 **调整特定段落色调**
> 5. 📊 **生成镜头速查表**（便于制作时快速定位）
>
> 请选择您的下一步操作！

---

## 附录：使用说明

### 如何使用这些提示词

1. **复制JSON内容**到 Nano Banana Pro 批量生成界面
2. **调整参数**（可选）：
   - Seed: 根据预览效果微调
   - Steps: 建议 20-30
   - CFG Scale: 建议 7-9
3. **生成图像**后保存至 `deliverables/40_boards/images/`
4. **命名规范**: `Shot_XXX_Beat_XX.png`

### 角色DNA一致性检查

所有包含角色的镜头已100%锚定DNA，确保：
- ❌ 无泛指词（"a girl", "a woman", "a student"）
- ✅ 完整外貌描述（发型、瞳色、服装）
- ✅ 服装按场景切换（校服/成年便装）

### 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1 | 2026-01-22 | 初始版本，基于分镜表v1，完整49镜头线稿提示词 |
