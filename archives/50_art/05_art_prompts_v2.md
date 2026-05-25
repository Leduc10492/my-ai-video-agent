# Artifact: Art Prompts (Midjourney)
- id: A-20260126-001
- version: v2
- upstream: [A-20260122-004, A-20260121-003]
- locks:
  - must_keep:
    - 角色视觉一致性（按资产指南v2）
    - 色温演进（冷→暖→冷→高调白光）
    - 构图位置规则（霙后景/希美前景）
  - must_avoid:
    - 角色面部特征偏离
    - 色温与分镜设定不符
    - 情绪表达过于外放
  - budget_notes:
    - Platform: Midjourney v6
    - Total shots: 49
    - Aspect ratio: 16:9 (default)

---

# BIPOLAR MV Midjourney 提示词

**生成平台**: Midjourney v6  
**总镜头数**: 49  
**默认参数**: `--ar 16:9 --v 6 --style raw`

---

## 角色基础提示词（复用）

### 霙 (Mizore) - 高中生
```
Japanese high school girl, long straight black hair with blunt bangs covering eyebrows, waist-length hair, hazel gray eyes, pale complexion, melancholic expression, wearing white sailor uniform with light blue trim, light blue pleated skirt, light blue bow tie, white knee-high socks, brown loafers
```

### 希美 (Nozomi) - 高中生
```
Japanese high school girl, black hair in high ponytail, wispy bangs, amber brown eyes, warm complexion with light freckles, bright natural smile, wearing white sailor uniform with light blue sailor collar, teal blue bow tie, light blue pleated skirt, white knee-high socks, brown loafers
```

### 希美 (Nozomi) - 成年（序幕）
```
Japanese young adult woman, black hair in low ponytail, wispy bangs, amber brown eyes, mature sophisticated appearance, wearing elegant black wool coat, gray scarf covering half of face, black Chanel quilted bag with chain strap, white over-ear headphones
```

---

## 序幕：机场现在时 + 随身听开关（Shot 001-009）

**色调设定**: 冷色调 5500K，颗粒胶片质感  
**情绪关键词**: 疏离、平行时空、情感真空

---

### Shot 001
**Beat 1 | 全景 | 固定仰角 | 4秒**

```
Kansai International Airport interior, iconic curved steel ceiling structure, floor-to-ceiling glass curtain wall, overcast lead-gray sky outside, fine snowflakes drifting past terminal lights like white dust, cold winter morning atmosphere, architectural photography, cinematic composition, muted cool tones 5500K, film grain texture, melancholic mood --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 002
**Beat 1 | 中景 | 跟拍平移 | 3秒**

```
Japanese young adult woman walking on airport moving walkway, black hair in low ponytail, wispy bangs, wearing elegant tailored black wool coat, gray scarf covering half of face, carrying black Chanel 19 quilted bag with chain strap, crowds of travelers around her, from behind, sense of isolation amid busy terminal, cool lighting 5500K, cinematic depth of field, film grain texture --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 003
**Beat 2 | 特写 | 固定 | 2秒**

```
Close-up side profile of Japanese woman's ear wearing white over-ear noise-canceling headphones, sleek modern design, soft skin texture, black hair visible, sense of isolation and blocking out the world, cool blue-gray lighting, shallow depth of field, minimalist composition, film grain --ar 16:9 --v 6 --style raw --s 150
```

---

### Shot 004
**Beat 2 | 特写 | 固定 | 2秒**

```
Close-up of woman's shoulder carrying black Chanel 19 handbag, quilted leather texture catching cold light, metallic chain strap gently swaying with walking motion, elegant sophisticated style, symbol of adult world, cool lighting reflecting on leather, shallow depth of field, fashion photography style --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 005
**Beat 3 | 特写 | 慢动作固定 | 5秒**

```
Japanese young adult woman turning back at airplane boarding gate doorway, black hair in low ponytail, wispy bangs, amber brown eyes with transparent gaze, mature sophisticated face showing neither longing nor struggle, only calm confirmation of farewell, gray scarf draped over shoulder, subtle polite arc on lips, slow motion effect, soft backlighting from boarding bridge, cool tones 5500K, emotional turning point, cinematic portrait, film grain --ar 16:9 --v 6 --style raw --s 300
```

---

### Shot 006
**Beat 4 | 中景 | 固定窗外视角 | 3秒**

```
Interior airplane cabin window seat, Japanese woman sitting by window looking out, airplane wing extending into view, heavy snow falling outside, snowflakes leaving diagonal white streaks on glass, blurring ground lights below, claustrophobic enclosed space, muted engine hum atmosphere, cool blue interior lighting, sense of departure and compression, cinematic framing, film grain texture --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 007
**Beat 4 | 特写 | 微距俯视 | 3秒**

```
Extreme close-up overhead shot of smartphone screen in woman's hands, music player interface displayed, song title "Gone by Ofelia K" clearly visible on screen, woman's lap slightly visible, airplane interior background blur, cool blue lighting, shallow depth of field, digital device detail, narrative symbol, cinematic macro photography --ar 16:9 --v 6 --style raw --s 150
```

---

### Shot 008
**Beat 5 | 极特写 | 固定 | 3秒**

```
Extreme close-up of vintage Sony Walkman cassette player, silver metallic body, visible cassette tape slowly rotating through window, subtle mechanical sound texture, early 2000s nostalgia, contrast with modern iPhone, warm orange-brown tint on device, transition element between time periods, macro photography, shallow depth of field, film grain --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 009
**Beat 5-6 | 全景 | 缓慢后拉 | 5秒**

```
Wide shot slowly pulling back, Japanese high school girl with long straight black hair and blunt bangs resting by classroom window, head pillowed on her arms, eyes closed, breathing evenly, wearing white sailor uniform with light blue trim, snow falling silently outside accumulating on window frame, single streak of cold light falling on her hair, like a specimen frozen in time, dimly lit empty classroom, melancholic isolation, contrast with airport scene, cool blue tones, dolly out movement, cinematic composition, film grain texture --ar 16:9 --v 6 --style raw --s 300
```

---

## 第一幕：学校得知消息（Shot 010-019）

**色调设定**: 暖色逐渐转冷 3800K→5000K  
**情绪关键词**: 从日常到失重，克制的内部崩塌

---

### Shot 010
**Beat 7 | 中景 | 固定平视 | 4秒**

```
Japanese high school classroom interior, teacher standing at podium making announcement, students seated at desks reacting naturally, some nodding some whispering, warm natural daylight through windows, typical school day atmosphere, focus on teacher speaking, Japanese classroom details, warm tones 3800K transitioning cooler, slice of life documentary style, cinematic framing --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 011
**Beat 7 | 特写 | 固定 | 3秒**

```
Close-up of Japanese high school girl's face, long straight black hair with blunt bangs, hazel gray eyes, moment of shock freezing on face, restrained stunned expression, hand unconsciously gripping pen tightly, pale complexion, controlled internal reaction, shallow depth of field on eyes, warm light shifting cooler, emotional weight, subtle acting, cinematic portrait --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 012
**Beat 8 | 中景 | 主观镜头 | 2秒**

```
POV shot from seated student perspective looking across classroom at another desk, either empty seat or girl with high ponytail busy packing belongings not looking back, sense of searching for connection and finding none, classroom interior with other students, natural school lighting, feeling of disconnection, subjective camera, soft focus edges, transitional cool tones --ar 16:9 --v 6 --style raw --s 150
```

---

### Shot 013
**Beat 9 | 特写 | 俯视微距 | 4秒**

```
Overhead close-up of smartphone screen showing messaging app, Japanese text being typed "烟火那天你会来吗？" (Will you come to the fireworks that day?), finger hovering over send button, then entire message being deleted, hesitation and retreat captured, cool blue phone screen light, emotional weight of unsent message, subtle finger movement, intimate documentary style --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 014
**Beat 10 | 特写 | 固定 | 3秒**

```
Close-up of hands pulling folded paper from school bag compartment, A4 white form paper - Japanese career survey form, blank unfilled, multiple visible fold creases on edges showing repeated handling, paper texture detail, sense of avoidance and directionlessness, shallow depth of field, cool lighting, documentary intimacy --ar 16:9 --v 6 --style raw --s 150
```

---

### Shot 015
**Beat 10 | 中景 | 固定 | 2秒**

```
Japanese high school girl with long straight black hair, hazel gray eyes, wearing sailor uniform, sitting at classroom desk, pushing folded paper back deep into school bag, avoidance body language, choosing not to face the future, classroom background soft focus, natural light shifting cooler, restrained emotion, slice of life framing --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 016
**Beat 11 | 全景 | 跟拍 | 4秒**

```
Wide shot of Japanese high school corridor, girl with long straight black hair trying to catch up with girl with high ponytail ahead, ponytail girl being stopped by teacher or surrounded by classmates, long-hair girl stopping in place as stream of students flows past her, physical distance symbolizing emotional distance, natural school lighting, sense of isolation in crowd, tracking shot feeling, cinematic composition --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 017
**Beat 12 | 中景 | 跟拍 | 3秒**

```
Two Japanese high school girls walking in corridor, girl with high ponytail in foreground walking ahead, girl with long straight black hair and blunt bangs half-step behind, long-hair girl's lips slightly moving as if about to speak but no words come out, ponytail girl continues forward without looking back, unspoken words swallowed, communication failure, depth composition, cool lighting, emotional tension --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 018
**Beat 13 | 中景 | 固定 | 3秒**

```
Japanese high school girl with long straight black hair and blunt bangs returning to classroom seat, pushing wired earbuds deeper into ears, wearing sailor uniform, vintage silver Walkman visible, escape mechanism activating, self-isolation gesture, natural school lighting transitioning cool, sense of withdrawal, slice of life composition --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 019
**Beat 13 | 特写 | 固定 | 2秒**

```
Close-up of finger pressing play button on vintage Sony Walkman cassette player, silver metallic body, visible tape starting to rotate, sound wave ripple effect emanating in soft colors transitioning from cool to warm, visual transition element, entering memory sequence, macro detail, shallow depth of field, music as narrative device --ar 16:9 --v 6 --style raw --s 250
```

---

## 第二幕：初识与美好（Shot 020-029）

**色调设定**: 暖色调 3200K，高饱和柔光  
**情绪关键词**: 表面美好，细节里埋藏不对等

---

### Shot 020
**Beat 14 | 全景 | 固定 | 3秒**

```
Wide shot of Japanese high school corridor with students, girl with black hair in high ponytail in foreground initiating conversation or extending hand first, girl with long straight black hair and blunt bangs in background following, establishing who leads the relationship, warm golden hour lighting 3200K, soft glow, nostalgic memory atmosphere, power dynamic established, cinematic composition --ar 16:9 --v 6 --style raw --s 300
```

---

### Shot 021
**Beat 15 | 中景 | 跟拍 | 5秒**

```
Montage-style composition showing multiple scenes overlaid or rapid sequence, high ponytail girl always half-step ahead, long straight hair girl always half-step behind following, locations including school corridor street campus, consistent position relationship, warm golden lighting, dreamy nostalgic atmosphere, following pattern established, visual rhythm, cinematic tracking feel --ar 16:9 --v 6 --style raw --s 350
```

---

### Shot 022
**Beat 16 | 特写 | 固定 | 3秒**

```
Close-up of two Japanese high school girls sharing wired earphones, one ear each, heads close together listening to same song, intimate connection symbol, high ponytail girl and long straight hair girl, warm soft lighting, shallow depth of field, earphone wire connecting them, tender moment, nostalgic atmosphere, golden hour glow --ar 16:9 --v 6 --style raw --s 300
```

---

### Shot 023
**Beat 16 | 中景 | 固定 | 5秒**

```
Two Japanese high school girls, girl with long straight black hair and blunt bangs about to speak "Nozomi, after this...", girl with high ponytail's phone vibrating interrupting, ponytail girl checking screen gesturing to wait then removing earphone to take call, long-hair girl still wearing earphone unable to hear conversation watching ponytail girl's lips move and smile, core conflict moment interrupted communication, warm lighting contrasting emotional disconnect, priority revealed --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 024
**Beat 16 | 全景 | 固定 | 3秒**

```
Wide shot of scene aftermath, girl with high ponytail already packing belongings saying "Sorry I have to go! Let's talk next time!", walking away quickly, girl with long straight black hair still sitting in place, words never finished, warm lighting but sense of being left behind, visual isolation, nostalgic but melancholic, unfinished conversation --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 025
**Beat 18 | 中景 | 固定 | 4秒**

```
Japanese high school music practice room doorway, girl with high ponytail packing silver flute casually saying "Oh right, the summer fireworks festival, let's go together", eyes not looking at other person focusing on putting sheet music in bag, casual offhand invitation, girl with long straight black hair visible in background, warm afternoon light, music room interior, unequal weight of invitation --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 026
**Beat 18 | 特写 | 固定 | 2秒**

```
Close-up of Japanese high school girl's face, long straight black hair with blunt bangs, hazel gray eyes, moment of pause then solemn serious nod, saying "Okay" with earnest weight, her seriousness contrasting with the casual invitation just received, warm soft lighting, shallow depth of field, subtle but significant expression, emotional investment --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 027
**Beat 18 | 全景 | 固定 | 3秒**

```
Wide shot of Japanese high school music practice room, girl with high ponytail already heading to door with bag saying "We'll figure out details later - I have to go!", walking out quickly not looking back, girl with long straight black hair standing alone in practice room, pattern repeating being left behind again, warm afternoon light streaming through windows, isolation in warm space --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 028
**Beat 18 | 特写 | 微距俯视 | 4秒**

```
Overhead macro shot of smartphone calendar app, finger circling the fireworks festival date, then circling it again with another circle, treating casual words as serious promise, intimate detail shot, warm screen glow, shallow depth of field, emotional investment visible in simple action, weight imbalance captured --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 029
**Beat 20 | 中景 | 固定 | 3秒**

```
Japanese high school corridor, girl with high ponytail walking ahead suddenly turning back to glance, the look more like polite confirmation than emotional waiting or care, but girl with long straight black hair and blunt bangs behind interprets it as "being seen", her lips curving into slight hopeful smile, misreading the moment, warm lighting beginning to shift cooler, beautiful memory ending point, false hope established --ar 16:9 --v 6 --style raw --s 250
```

---

## 第三幕：分岔与平行（Shot 030-045）

**色调设定**: 冷暖交替，高对比快速剪辑  
**情绪关键词**: 追赶、失速、优先级错位、克制崩塌

---

### Shot 030
**Beat 21 | 特写 | 固定 | 4秒**

```
Split screen or rapid cut montage of two schedule books, one showing increasingly packed schedule with club activities tutoring paperwork, other showing entries like "wait for Nozomi" "when Nozomi is free", time density contrast, cool and warm tones alternating, visual representation of diverging worlds, documentary intimate style, high contrast --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 031
**Beat 22 | 中景 | 固定 | 5秒**

```
Montage of Japanese high school girl with long straight black hair constantly adjusting her rhythm, arriving early at classroom waiting, staying late waiting to leave together, rearranging her practice and study time to fit into other person's gaps, watching her wristwatch frequently, increasing time anxiety, cool lighting, sense of accommodation and waiting, slice of life documentary --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 032
**Beat 23 | 全景 | 跟拍 | 4秒**

```
Wide tracking shot of Japanese high school corridor or street, girl with high ponytail walking faster and faster, her back getting smaller in distance, girl with long straight black hair and blunt bangs trying to follow behind but gap widening, ponytail girl no longer turning back to check if other is keeping up, physical distance symbolizing emotional distance, chase failing, cool blue lighting, sense of losing pace --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 033
**Beat 24 | 特写 | 固定 | 3秒**

```
Close-up of hands writing fireworks festival time and location on paper, checking and rechecking details, anxious careful handwriting, girl with long straight black hair visible in soft focus, desk surface, natural cool lighting, sense of trying to hold onto something, documentary intimacy --ar 16:9 --v 6 --style raw --s 150
```

---

### Shot 034
**Beat 24 | 特写 | 微距俯视 | 4秒**

```
Overhead macro shot of smartphone messaging screen, fingers typing Japanese text "The fireworks day, still meeting at the agreed place?", deep breath moment then pressing send, message bubble flying out, breaking silence with proactive confirmation, cool blue phone light, intimate documentary style, emotional courage --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 035
**Beat 24 | 蒙太奇 | 多机位快切 | 3秒**

```
Rapid montage sequence of Japanese high school girl with long straight black hair checking phone repeatedly, during class checking phone, during meals checking phone, while walking checking phone, time passing in compressed cuts, waiting anxiety, no new messages, cool desaturated tones, documentary urgency --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 036
**Beat 24 | 特写 | 固定 | 3秒**

```
Close-up of phone screen lighting up with reply notification, message reading "Probably~ We'll see when it comes!" in Japanese, casual dismissive tone, then cut to girl's face with long straight black hair and blunt bangs, hazel gray eyes, attempting to smile but only slight twitch of lips, restrained disappointment, reaching into pocket touching Walkman, cool blue lighting, emotional deflation --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 037
**Beat 25 | 全景 | 固定 | 4秒**

```
Wide shot of Japanese summer fireworks festival venue at dusk, crowds gathering, paper lanterns and food stalls, couples friends families everywhere in pairs and groups, Japanese high school girl with long straight black hair standing alone in good viewing spot, isolation amid togetherness, warm stall lights contrasting her solitude, anticipation and loneliness --ar 16:9 --v 6 --style raw --s 300
```

---

### Shot 038
**Beat 25 | 特写 | 固定 | 3秒**

```
Close-up of hands checking smartphone with no new messages, then checking wristwatch, Japanese high school girl waiting, time passing, anticipation fading, warm ambient light from festival, intimate detail shot, shallow depth of field, growing anxiety --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 039
**Beat 25 | 中景 | 固定 | 4秒**

```
Japanese high school girl with long straight black hair and blunt bangs at fireworks festival, wearing sailor uniform, turning up volume on vintage silver Walkman, trying to fill waiting time with music, sky darkening, crowd growing around her, still alone, warm festival lights contrasting cool emotional state, wired earbuds in, music as escape mechanism, visual stillness amid movement --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 040
**Beat 26 | 全景 | 固定仰角 | 5秒**

```
Wide low angle shot of fireworks exploding in night sky, brilliant colors and patterns, below Japanese high school girl with long straight black hair still waiting, her face illuminated by firework light but expression empty hollow, beauty above contrasting emptiness within, crowds celebrating around her, dramatic lighting from explosions, high contrast, emotional climax approaching --ar 16:9 --v 6 --style raw --s 350
```

---

### Shot 041
**Beat 26 | 全景 | 固定 | 3秒**

```
Wide shot of fireworks festival aftermath, fireworks ended, crowds dispersing, Japanese high school girl with long straight black hair walking away alone, solitary figure from behind, emptying venue, warm lights fading, sense of unfulfilled waiting, quiet aftermath, melancholic resolution --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 042
**Beat 26 | 中景 | 固定 | 4秒**

```
Japanese high school next day, girl with long straight black hair and blunt bangs overhearing conversation, girl with high ponytail telling other classmates "Something came up with family yesterday, couldn't notify everyone in time", casual explanation, long-hair girl's expression not angry but dawning understanding realization, not special just one of everyone, cool natural school lighting, priority becoming clear --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 043
**Beat 27 | 全景 | 跟拍 | 3秒**

```
Wide tracking shot of Japanese street after school, girl with long straight black hair walking home alone, isolated figure on quiet residential street, contemplative mood, cool blue evening light, sense of processing and accepting, solitary journey --ar 16:9 --v 6 --style raw --s 200
```

---

### Shot 044
**Beat 27 | 特写 | 固定 | 3秒**

```
Extreme close-up of vintage Sony Walkman cassette player, finger pressing stop button or opening compartment to eject cassette tape, physical deliberate disconnection action, no tears no dramatic crying just quiet physical severance, mechanical click of stop, symbolic break, shallow depth of field, cool blue lighting, restrained closure --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 045
**Beat 27.5 | 全景 | 固定 | 5秒**

```
Wide shot of Japanese girl's bedroom, evening light through window, girl with long straight black hair and blunt bangs sitting at desk, pulling crumpled career survey form from deep in school bag, spreading it on desk surface, paper showing multiple fold creases and worn corners, staring at blank form, fingers unconsciously tracing paper surface, silent digestion moment, transitioning to acceptance, cool transitioning to neutral lighting --ar 16:9 --v 6 --style raw --s 250
```

---

## 终章：和解与选择（Shot 046-049）

**色调设定**: 高调白光 6000K，干净明亮  
**情绪关键词**: 和解、自主选择、温柔告别

---

### Shot 046
**Beat 28-29 | 中景 | 固定 | 5秒**

```
Japanese high school girl with long straight black hair and blunt bangs sitting at desk by window, soft natural bright light flooding space, picking up wrinkled but blank career survey form, holding pen with tip hovering over first blank space, no more hesitation no more waiting, eyes determined and clear, self-agency awakening, high key lighting 6000K, clean bright atmosphere, decisive moment --ar 16:9 --v 6 --style raw --s 300
```

---

### Shot 047
**Beat 29-30 | 特写 | 微距俯视 | 4秒**

```
Overhead macro shot of pen tip touching paper and beginning to write, handwritten characters appearing in blank form spaces, specific content not important focus on action of filling in, writing completed without crossing out without hesitant rewriting, then hands neatly folding form and putting away with clean decisive movements, prop arc completed, self-determination established, bright clean lighting, documentary intimacy --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 048
**Beat 30 | 特写 | 固定 | 3秒**

```
Close-up of vintage Sony Walkman cassette player, finger pressing play button, visible tape beginning to rotate forward not rewinding to start but continuing from current position, moving forward not looking back, music resuming, structural callback to opening, warm mechanical glow, symbolic forward motion, hope in continuation --ar 16:9 --v 6 --style raw --s 250
```

---

### Shot 049
**Beat 30 | 全景 | 固定 | 8秒**

```
Wide shot of Japanese high school girl with long straight black hair standing up from desk, gathering belongings, morning sunlight streaming in through window, or alternatively airport scene with airplane visible taking off through window, girl's back to camera facing window facing forward facing light, posture forward-looking, music playing to completion creating structural loop with opening, emotional resolution, warm bright high key lighting, gentle hopeful farewell, cinematic ending composition --ar 16:9 --v 6 --style raw --s 350
```

---

## 附录：参数说明

### 统一参数
| 参数 | 值 | 说明 |
|------|-----|------|
| --ar | 16:9 | 电影宽屏比例 |
| --v | 6 | Midjourney v6 模型 |
| --style | raw | 原始风格，减少AI美化 |
| --s | 150-350 | 风格化程度，按情感强度调整 |

### 色温对照
| 段落 | 色温 | 提示词关键词 |
|------|------|-------------|
| 序幕 | 5500K | cool tones, cold lighting, blue-gray |
| 第一幕 | 3800K→5000K | warm natural light transitioning cool |
| 第二幕 | 3200K | warm golden hour, soft glow, nostalgic |
| 第三幕 | 交替 | high contrast, alternating cool warm |
| 终章 | 6000K | bright clean lighting, high key |

### 角色构图规则
| 场景 | 霙位置 | 希美位置 |
|------|--------|---------|
| 同框 | 后景/右侧/跟随 | 前景/左侧/领先 |
| 独处 | 中心或边缘（孤立感） | - |
| 终章 | 中心，面向前方 | - |

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1 | 2026-01-26 | 初始版本，基于分镜表v1生成49个Midjourney提示词 |

---

**生成说明**:  
本提示词文档严格遵循分镜表结构，共生成49个Midjourney格式提示词。所有角色描述参照资产指南v2，确保视觉一致性。色温和情绪关键词按段落设定，参数根据情感强度调整。

