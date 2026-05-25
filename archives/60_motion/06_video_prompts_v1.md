# Artifact: Video Prompts (Runway Gen-3)
- id: A-20260202-001
- version: v1
- upstream: [A-20260122-004]
- locks:
  - must_keep:
    - 倒叙为主 + 现在时框架结构
    - 霙第一人称内心独白视角
    - 随身听 + 升学调查表道具系统
    - 烟火之约作为情感锚点
    - 3分10秒时长（序幕+第一幕共70秒）
    - 角色视觉一致性（按资产指南v2）
    - 色温演进（冷→暖转冷）
  - must_avoid:
    - 希美被呈现为恶意角色
    - 霙大哭大闹的崩溃场面
    - 过于直白的情感表达
    - 角色面部特征偏离资产指南
  - budget_notes:
    - Platform: Runway Gen-3 Alpha
    - Input Type: Text-to-Video
    - Scope: 序幕（9镜）+ 第一幕（10镜）
    - Total shots: 19
    - Total duration: 70 seconds
    - Aspect ratio: 16:9
    - Resolution: 1080p

---

# BIPOLAR MV Runway Gen-3 视频提示词

**生成平台**: Runway Gen-3 Alpha  
**输入类型**: 文生视频 (Text-to-Video)  
**总镜头数**: 19（序幕9镜 + 第一幕10镜）  
**总时长**: 70秒  
**宽高比**: 16:9  
**分辨率**: 1080p

---

## 使用说明

### Runway Gen-3 参数设置
- **Mode**: Text-to-Video
- **Duration**: 按每个镜头指定（2-5秒）
- **Aspect Ratio**: 16:9
- **Resolution**: 1080p
- **Style**: Cinematic quality, natural language prompts

### 提示词结构
每个提示词包含：
1. **场景描述** - 环境、角色、道具
2. **镜头运动** - 相机运动类型和速度
3. **主体动作** - 角色或物体的运动
4. **氛围风格** - 光线、色调、情绪

---

## 序幕：机场现在时 + 随身听开关（Shot 001-009）

**段落时长**: 30秒  
**色调**: 冷色调 5500K，颗粒胶片质感  
**情绪**: 疏离、平行时空、情感真空

---

### Shot 001
**Beat 1 | 全景 | 固定仰角 | 4秒**

**Runway Prompt:**
```
Static shot from low angle looking up at Kansai International Airport's iconic curved steel ceiling structure, 
floor-to-ceiling glass curtain wall framing overcast lead-gray sky outside, 
fine snowflakes drifting silently past terminal lights like white dust particles, 
camera holds steady capturing architectural grandeur, 
cold winter morning atmosphere with muted cool tones 5500K, 
film grain texture, melancholic and distant mood, 
cinematic quality, 4s duration
```

**技术参数:**
- Duration: 4s
- Camera: Static, low angle
- Movement: None (establishing shot)
- Color: Cool tones 5500K
- Style: Architectural photography, film grain

---

### Shot 002
**Beat 1 | 中景 | 跟拍平移 | 3秒**

**Runway Prompt:**
```
Tracking shot following alongside a Japanese young adult woman walking on airport moving walkway, 
camera moving parallel to her path, 
woman wearing elegant tailored black wool coat with gray scarf covering half her face, 
carrying black Chanel 19 quilted bag with chain strap, 
crowds of travelers flowing past her in soft focus, 
sense of isolation amid busy terminal, 
cool lighting 5500K, shallow depth of field, 
cinematic tracking movement, film grain texture, 3s duration
```

**技术参数:**
- Duration: 3s
- Camera: Tracking shot, parallel movement
- Movement: Smooth horizontal tracking
- Subject: Woman walking forward
- Color: Cool tones 5500K
- Style: Cinematic depth, isolation

---

### Shot 003
**Beat 2 | 特写 | 固定 | 2秒**

**Runway Prompt:**
```
Static close-up of Japanese woman's ear in side profile, 
white over-ear noise-canceling headphones covering ear, 
sleek modern design, soft skin texture visible, 
black hair partially visible, 
sense of isolation and blocking out the world, 
camera holds completely still, 
cool blue-gray lighting, shallow depth of field, 
minimalist composition, film grain, 2s duration
```

**技术参数:**
- Duration: 2s
- Camera: Static, close-up
- Movement: None
- Subject: Headphones (symbolic isolation)
- Color: Cool blue-gray
- Style: Minimalist, shallow DOF

---

### Shot 004
**Beat 2 | 特写 | 固定 | 2秒**

**Runway Prompt:**
```
Static close-up of woman's shoulder carrying black Chanel 19 handbag, 
quilted leather texture catching cold light, 
metallic chain strap gently swaying with subtle movement, 
elegant sophisticated style symbolizing adult world, 
cool lighting reflecting on leather surface, 
camera holds steady, shallow depth of field, 
fashion photography style, 2s duration
```

**技术参数:**
- Duration: 2s
- Camera: Static, close-up
- Movement: Subtle chain sway (natural motion)
- Subject: Handbag detail
- Color: Cool lighting on leather
- Style: Fashion detail shot

---

### Shot 005
**Beat 3 | 特写 | 慢动作固定 | 5秒**

**Runway Prompt:**
```
Slow motion close-up of Japanese young adult woman turning back at airplane boarding gate doorway, 
black hair in low ponytail, wispy bangs, 
amber brown eyes with transparent gaze, 
mature sophisticated face showing neither longing nor struggle, 
only calm confirmation of farewell, 
gray scarf draped over shoulder, subtle polite arc on lips, 
movement slowed to 0.5x speed, 
soft backlighting from boarding bridge, 
cool tones 5500K, emotional turning point, 
cinematic portrait, film grain, 5s duration
```

**技术参数:**
- Duration: 5s (slow motion)
- Camera: Static, close-up
- Movement: Slow motion (0.5x speed)
- Subject: Woman turning head slowly
- Color: Cool tones 5500K, backlit
- Style: Emotional portrait, slow motion

---

### Shot 006
**Beat 4 | 中景 | 固定窗外视角 | 3秒**

**Runway Prompt:**
```
Static shot from inside airplane cabin looking out window, 
Japanese woman sitting by window in soft focus, 
airplane wing extending into frame, 
heavy snow falling outside creating diagonal white streaks on glass, 
ground lights below blurred and distant, 
claustrophobic enclosed space feeling, 
muted engine hum atmosphere, 
cool blue interior lighting, 
sense of departure and compression, 
camera holds steady, cinematic framing, film grain texture, 3s duration
```

**技术参数:**
- Duration: 3s
- Camera: Static, interior POV
- Movement: Snow falling outside (natural)
- Subject: Window view, snow
- Color: Cool blue interior
- Style: Claustrophobic, compressed space

---

### Shot 007
**Beat 4 | 特写 | 微距俯视 | 3秒**

**Runway Prompt:**
```
Extreme close-up overhead shot of smartphone screen in woman's hands, 
music player interface displayed, 
song title "Gone by Ofelia K" clearly visible on screen, 
woman's lap slightly visible in soft focus, 
airplane interior background blurred, 
cool blue lighting from screen, 
shallow depth of field, 
digital device detail, narrative symbol, 
camera holds steady above, cinematic macro photography, 3s duration
```

**技术参数:**
- Duration: 3s
- Camera: Static, overhead macro
- Movement: None (text visible)
- Subject: Phone screen
- Color: Cool blue screen light
- Style: Macro detail, narrative symbol

---

### Shot 008
**Beat 5 | 极特写 | 固定 | 3秒**

**Runway Prompt:**
```
Static extreme close-up of vintage Sony Walkman cassette player, 
silver metallic body, visible cassette tape slowly rotating through window, 
subtle mechanical movement of tape, 
early 2000s nostalgia, contrast with modern iPhone, 
warm orange-brown tint on device, 
transition element between time periods, 
camera holds completely still, macro photography, 
shallow depth of field, film grain, 3s duration
```

**技术参数:**
- Duration: 3s
- Camera: Static, extreme close-up
- Movement: Tape rotating (mechanical)
- Subject: Walkman, tape rotation
- Color: Warm orange-brown tint
- Style: Macro, nostalgic transition

---

### Shot 009
**Beat 5-6 | 全景 | 缓慢后拉 | 5秒**

**Runway Prompt:**
```
Camera slowly pulls back in smooth dolly out movement, 
revealing wide shot of dimly lit empty classroom, 
Japanese high school girl with long straight black hair and blunt bangs 
resting by window, head pillowed on her arms, eyes closed, breathing evenly, 
wearing white sailor uniform with light blue trim, 
snow falling silently outside accumulating on window frame, 
single streak of cold light falling on her hair, 
like a specimen frozen in time, 
camera movement gradual and steady, 
melancholic isolation, contrast with airport scene, 
cool blue tones, cinematic composition, film grain texture, 5s duration
```

**技术参数:**
- Duration: 5s
- Camera: Dolly out (slow pull back)
- Movement: Smooth backward camera movement
- Subject: Girl sleeping (static)
- Color: Cool blue tones
- Style: Reveal shot, temporal transition

---

## 第一幕：学校得知消息（Shot 010-019）

**段落时长**: 40秒  
**色调**: 暖色逐渐转冷 3800K→5000K  
**情绪**: 从日常到失重，克制的内部崩塌

---

### Shot 010
**Beat 7 | 中景 | 固定平视 | 4秒**

**Runway Prompt:**
```
Static medium shot of Japanese high school classroom interior, 
teacher standing at podium making announcement, 
students seated at desks reacting naturally, 
some nodding some whispering, 
warm natural daylight streaming through windows, 
typical school day atmosphere, 
focus on teacher speaking, Japanese classroom details, 
camera holds steady at eye level, 
warm tones 3800K transitioning cooler, 
slice of life documentary style, cinematic framing, 4s duration
```

**技术参数:**
- Duration: 4s
- Camera: Static, medium shot, eye level
- Movement: None (establishing classroom)
- Subject: Teacher, students reacting
- Color: Warm 3800K → cooler transition
- Style: Documentary, slice of life

---

### Shot 011
**Beat 7 | 特写 | 固定 | 3秒**

**Runway Prompt:**
```
Static close-up of Japanese high school girl's face, 
long straight black hair with blunt bangs, hazel gray eyes, 
moment of shock freezing on face, 
restrained stunned expression, 
hand unconsciously gripping pen tightly visible in foreground, 
pale complexion, controlled internal reaction, 
camera holds steady, shallow depth of field on eyes, 
warm light shifting cooler, emotional weight, 
subtle acting, cinematic portrait, 3s duration
```

**技术参数:**
- Duration: 3s
- Camera: Static, close-up
- Movement: None (emotional reaction)
- Subject: Girl's face, micro-expression
- Color: Warm → cooler transition
- Style: Emotional portrait, shallow DOF

---

### Shot 012
**Beat 8 | 中景 | 主观镜头 | 2秒**

**Runway Prompt:**
```
Subjective POV shot from seated student perspective, 
looking across classroom at another desk, 
either empty seat or girl with high ponytail busy packing belongings not looking back, 
sense of searching for connection and finding none, 
classroom interior with other students in soft focus, 
natural school lighting, feeling of disconnection, 
camera movement subtle as if from person's head turn, 
soft focus edges, transitional cool tones, 2s duration
```

**技术参数:**
- Duration: 2s
- Camera: Subjective POV, slight head turn
- Movement: Subtle camera movement (head turn)
- Subject: Empty seat / busy girl
- Color: Transitional cool tones
- Style: Subjective, disconnection

---

### Shot 013
**Beat 9 | 特写 | 俯视微距 | 4秒**

**Runway Prompt:**
```
Overhead close-up macro shot of smartphone screen showing messaging app, 
Japanese text being typed "烟火那天你会来吗？" (Will you come to the fireworks that day?), 
finger hovering over send button, 
then entire message being deleted in slow motion, 
hesitation and retreat captured, 
cool blue phone screen light, 
emotional weight of unsent message, 
subtle finger movement, intimate documentary style, 
camera holds steady above, 4s duration
```

**技术参数:**
- Duration: 4s
- Camera: Static, overhead macro
- Movement: Finger typing → deleting
- Subject: Phone screen, text deletion
- Color: Cool blue screen light
- Style: Intimate detail, emotional weight

---

### Shot 014
**Beat 10 | 特写 | 固定 | 3秒**

**Runway Prompt:**
```
Static close-up of hands pulling folded paper from school bag compartment, 
A4 white form paper - Japanese career survey form, 
blank unfilled, multiple visible fold creases on edges showing repeated handling, 
paper texture detail, sense of avoidance and directionlessness, 
hands moving slowly, camera holds steady, 
shallow depth of field, cool lighting, 
documentary intimacy, 3s duration
```

**技术参数:**
- Duration: 3s
- Camera: Static, close-up
- Movement: Hands pulling paper
- Subject: Blank form, creases
- Color: Cool lighting
- Style: Documentary detail, avoidance

---

### Shot 015
**Beat 10 | 中景 | 固定 | 2秒**

**Runway Prompt:**
```
Static medium shot of Japanese high school girl with long straight black hair, 
hazel gray eyes, wearing sailor uniform, 
sitting at classroom desk, 
pushing folded paper back deep into school bag, 
avoidance body language, choosing not to face the future, 
classroom background soft focus, 
natural light shifting cooler, 
restrained emotion, slice of life framing, 
camera holds steady, 2s duration
```

**技术参数:**
- Duration: 2s
- Camera: Static, medium shot
- Movement: Pushing paper into bag
- Subject: Girl, avoidance gesture
- Color: Natural light → cooler
- Style: Slice of life, avoidance

---

### Shot 016
**Beat 11 | 全景 | 跟拍 | 4秒**

**Runway Prompt:**
```
Tracking shot following through Japanese high school corridor, 
girl with long straight black hair trying to catch up with girl with high ponytail ahead, 
ponytail girl being stopped by teacher or surrounded by classmates, 
long-hair girl stopping in place as stream of students flows past her, 
physical distance symbolizing emotional distance, 
camera moves forward then slows as girl stops, 
natural school lighting, sense of isolation in crowd, 
cinematic tracking movement, 4s duration
```

**技术参数:**
- Duration: 4s
- Camera: Tracking shot, forward movement
- Movement: Camera follows, then slows
- Subject: Girls, distance, crowd flow
- Color: Natural school lighting
- Style: Tracking, isolation in crowd

---

### Shot 017
**Beat 12 | 中景 | 跟拍 | 3秒**

**Runway Prompt:**
```
Tracking shot following two Japanese high school girls walking in corridor, 
girl with high ponytail in foreground walking ahead, 
girl with long straight black hair and blunt bangs half-step behind, 
long-hair girl's lips slightly moving as if about to speak but no words come out, 
ponytail girl continues forward without looking back, 
unspoken words swallowed, communication failure, 
camera moves alongside them, depth composition, 
cool lighting, emotional tension, 3s duration
```

**技术参数:**
- Duration: 3s
- Camera: Tracking shot, parallel movement
- Movement: Camera follows alongside
- Subject: Girls walking, unspoken words
- Color: Cool lighting
- Style: Following shot, communication failure

---

### Shot 018
**Beat 13 | 中景 | 固定 | 3秒**

**Runway Prompt:**
```
Static medium shot of Japanese high school girl with long straight black hair and blunt bangs 
returning to classroom seat, 
pushing wired earbuds deeper into ears, 
wearing sailor uniform, vintage silver Walkman visible, 
escape mechanism activating, self-isolation gesture, 
natural school lighting transitioning cool, 
sense of withdrawal, slice of life composition, 
camera holds steady, 3s duration
```

**技术参数:**
- Duration: 3s
- Camera: Static, medium shot
- Movement: Pushing earbuds deeper
- Subject: Girl, isolation gesture
- Color: Natural → cool transition
- Style: Withdrawal, escape mechanism

---

### Shot 019
**Beat 13 | 特写 | 固定 | 2秒**

**Runway Prompt:**
```
Static close-up of finger pressing play button on vintage Sony Walkman cassette player, 
silver metallic body, visible tape starting to rotate, 
sound wave ripple effect emanating in soft colors transitioning from cool to warm, 
visual transition element, entering memory sequence, 
camera holds steady, macro detail, shallow depth of field, 
music as narrative device, color shift from cool to warm, 2s duration
```

**技术参数:**
- Duration: 2s
- Camera: Static, close-up macro
- Movement: Button press, tape rotation
- Subject: Walkman, play button
- Color: Cool → warm transition
- Style: Transition element, memory entry

---

## 技术参数总结

### 镜头运动分布

| 运动类型 | 镜头数 | 占比 |
|----------|--------|------|
| 固定 (Static) | 13 | 68.4% |
| 跟拍 (Tracking) | 3 | 15.8% |
| 后拉 (Dolly Out) | 1 | 5.3% |
| 慢动作 | 1 | 5.3% |
| 主观镜头 (POV) | 1 | 5.3% |

### 时长分布

| 时长 | 镜头数 | 占比 |
|------|--------|------|
| 2秒 | 4 | 21.1% |
| 3秒 | 7 | 36.8% |
| 4秒 | 5 | 26.3% |
| 5秒 | 3 | 15.8% |

### 色温演进

| 段落 | 色温 | 镜头范围 |
|------|------|----------|
| 序幕 | 5500K 冷色 | Shot 001-009 |
| 第一幕 | 3800K→5000K 暖转冷 | Shot 010-019 |

---

## Runway Gen-3 使用建议

### 提示词优化技巧
1. **自然语言优先**: 使用描述性语言而非技术术语
2. **运动分离**: 明确区分相机运动和主体运动
3. **氛围细节**: 包含光线、色调、情绪描述
4. **时长明确**: 在提示词中指定时长（2-5秒）

### 常见问题避免
- ❌ 避免冲突的运动（同时推进和拉远）
- ❌ 避免短时间内过多动作
- ❌ 避免模糊的方向描述
- ❌ 避免忽略物理规律

### 批量生成建议
1. 按段落顺序生成（序幕 → 第一幕）
2. 保持色温一致性
3. 注意镜头间的运动连贯性
4. 检查时长总和（30秒 + 40秒 = 70秒）

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1 | 2026-02-02 | 初始版本，生成序幕+第一幕共19个Runway Gen-3提示词 |

---

**生成说明**:  
本提示词文档基于分镜表v1生成，共19个Runway Gen-3格式视频提示词（序幕9镜 + 第一幕10镜）。所有提示词使用自然语言描述，包含场景、镜头运动、主体动作和氛围风格。严格遵循色温演进和情绪设定，确保视觉连贯性。
