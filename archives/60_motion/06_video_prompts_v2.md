# Artifact: Video Prompts (Runway Gen-3)
- id: A-20260202-001
- version: v2
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

# BIPOLAR MV Runway Gen-3 视频提示词 (v2 Optimized)

**生成平台**: Runway Gen-3 Alpha  
**输入类型**: 文生视频 (Text-to-Video)  
**版本**: v2 (优化版)
**总镜头数**: 19（序幕9镜 + 第一幕10镜）  
**总时长**: 70秒  
**宽高比**: 16:9

---

## v2 优化说明
- **光影增强**: 加入了更多关于光线散射、体积雾和材质反光的细节描述。
- **运动流体化**: 使用了更精确的相机运动修饰符（如 *gradually*, *steadily*, *smoothly*）以提升生成的稳定性。
- **情感氛围**: 强化了叙事氛围的关键词，如 *ethereal*, *moody shadows*, *melancholic intimacy*。
- **材质模拟**: 增加了对雪花颗粒、皮革纹理和老式金属机械感的微观描述。

---

## 序幕：机场现在时 + 随身听开关（Shot 001-009）

**段落时长**: 30秒  
**色调**: 极冷色调 5500K，高对比胶片质感  
**情绪**: 疏离、静谧、情感真空

---

### Shot 001
**Beat 1 | 全景 | 固定仰角 | 4秒**

**Runway Prompt:**
```
Cinematic static low-angle shot of the modern steel ceiling structure of Kansai International Airport terminal. 
The lead-gray sky is visible through a massive glass curtain wall, where fine snowflakes drift like tiny crystals in the cold air. 
The terminal lights create soft volumetric glows amidst the dim winter daylight. 
Hyper-realistic architectural photography style, muted cool tones 5500K, 
a sense of vastness and profound silence, film grain texture, 4s duration.
```

---

### Shot 002
**Beat 1 | 中景 | 跟拍平移 | 3秒**

**Runway Prompt:**
```
Smooth tracking shot moving parallel to a Japanese young adult woman as she glides on an airport moving walkway. 
She wears a sophisticated tailored black wool coat, a gray scarf partially obscuring her face. 
From her side profile, we see the bustling terminal crowds blurred in the background, creating a stark contrast between her stillness and the environment's motion. 
Cool, crisp lighting, eyes reflecting the terminal lights, cinematic depth of field, 3s duration.
```

---

### Shot 003
**Beat 2 | 特写 | 固定 | 2秒**

**Runway Prompt:**
```
Static macro close-up of a Japanese woman's side profile. 
She wears sleek white noise-canceling headphones, the matte plastic texture contrasting with her dark hair. 
The camera focus is sharp on the headphones, symbolizing her absolute isolation from the surrounding airport noise. 
Minimalist aesthetic, cold blue-gray color grading, soft bokeh, 2s duration.
```

---

### Shot 004
**Beat 2 | 特写 | 固定 | 2秒**

**Runway Prompt:**
```
Close-up of a black Chanel 19 quilted leather handbag resting on a woman's shoulder. 
The metallic chain strap glints under the cold terminal lights, swaying subtly with her measured footsteps. 
The camera captures the fine grain and sheen of the premium leather. 
High-end fashion cinematography, moody shadows, shallow depth of field, 2s duration.
```

---

### Shot 005
**Beat 3 | 特写 | 慢动作固定 | 5秒**

**Runway Prompt:**
```
Dreamlike slow-motion close-up as a mature Japanese woman turns her head at the airplane boarding gate. 
Her black hair in a low ponytail sways gently. Her amber eyes hold a transparent, resigned gaze, reflecting a quiet farewell without longing. 
A subtle, stoic smile lingers on her lips. Soft volumetric backlighting from the boarding bridge creates a rim light around her silhouette. 
Ethereal and melancholic atmosphere, 5s duration at 0.5x speed.
```

---

### Shot 006
**Beat 4 | 中景 | 固定窗外视角 | 3秒**

**Runway Prompt:**
```
Static shot from a window seat inside an airplane cabin. 
A Japanese woman is partially visible in the foreground, blurred. 
The focus is on the airplane wing outside, where heavy snow creates white streaks against the glass. 
Below, the runway lights are faint, shimmering through the blizzard. 
A feeling of claustrophobic departure and emotional weight. 
Cool blue moody interior lighting, hyper-realistic textures, 3s duration.
```

---

### Shot 007
**Beat 4 | 特写 | 微距俯视 | 3秒**

**Runway Prompt:**
```
Overhead macro shot of a smartphone screen held in elegant hands. 
The screen is the primary light source, illuminating the fingers. 
The music player displays the track title "Gone by Ofelia K". 
The background is the dark, moody interior of an airplane cabin. 
Digital crispness on the screen versus organic textures of the skin. 
Narrative close-up, cinematic focus on the text, 3s duration.
```

---

### Shot 008
**Beat 5 | 极特写 | 固定 | 3秒**

**Runway Prompt:**
```
Extreme close-up of a vintage silver Sony Walkman. 
The camera focuses on the mechanical rotation of the cassette tape reels behind the small window. 
Subtle metallic reflections and fine scratches on the device's surface tell a story of time. 
Warm, nostalgic orange-tinted lighting, contrasting with the previous cool scenes. 
Macro mechanical beauty, a bridge between two eras, 3s duration.
```

---

### Shot 009
**Beat 5-6 | 全景 | 缓慢后拉 | 5秒**

**Runway Prompt:**
```
Camera slowly and steadily pulls back in a grand dolly out movement. 
It starts from a close-up and reveals a vast, dimly lit school classroom. 
A high school girl (Mizore) sleeps peacefully by the window, head on her arms. 
The blue moonlight and falling snow outside the window create a surreal, frozen-in-time atmosphere. 
The classroom is filled with long, moody shadows. 
Ethereal, specimen-like stillness, cinematic quality, 5s duration.
```

---

## 第一幕：学校得知消息（Shot 010-019）

**段落时长**: 40秒  
**色调**: 柔和暖色逐渐转为压抑冷色 3800K→5000K  
**情绪**: 内部崩塌、失重感、克制的痛楚

---

### Shot 010
**Beat 7 | 中景 | 固定平视 | 4秒**

**Runway Prompt:**
```
Static medium shot of a high school classroom during a class meeting. 
A teacher stands at the podium, their mouth moving as they deliver news. 
In the background, students react with subtle whispers and nods. 
The afternoon sun casts long, warm shadows through the windows, 
but the light feels thin and fading. 
Cinematic slice-of-life, documentary-style framing, 4s duration.
```

---

### Shot 011
**Beat 7 | 特写 | 固定 | 3秒**

**Runway Prompt:**
```
Close-up of a high school girl's face (Mizore). 
Her hazel gray eyes widen slightly, then become vacant as the shock sets in. 
Her grip on a mechanical pencil tightens until her knuckles turn pale. 
The warm sunlight on her face gradually shifts into a colder, harsher tone. 
Micro-expression of internal devastation, shallow depth of field, 3s duration.
```

---

### Shot 012
**Beat 8 | 中景 | 主观镜头 | 2秒**

**Runway Prompt:**
```
Subjective POV camera pan as Mizore looks toward the seat usually occupied by Nozomi. 
The seat is either empty or Nozomi is seen from the back, 
already packing her things with an air of finality, disconnected from the classroom. 
The camera movement is slightly unstable, reflecting Mizore's internal vertigo. 
Natural school lighting turning desaturated, 2s duration.
```

---

### Shot 013
**Beat 9 | 特写 | 俯视微距 | 4秒**

**Runway Prompt:**
```
Overhead macro shot of a smartphone screen. 
Mizore's thumb hovers over the 'send' button after typing "Will you come to the fireworks?". 
The cursor blinks steadily. Then, the characters are deleted one by one, 
leaving a blank input field. The screen's cool light reflects on her fingertips. 
A moment of intense hesitation and silent retreat. 4s duration.
```

---

### Shot 014
**Beat 10 | 特写 | 固定 | 3秒**

**Runway Prompt:**
```
Close-up of hands pulling a crumpled career survey form from a school bag. 
The paper is worn at the edges with multiple fold marks, 
emphasizing how many times it has been handled in secret. 
The form remains completely blank. 
Tactile paper texture, soft melancholic lighting, 3s duration.
```

---

### Shot 015
**Beat 10 | 中景 | 固定 | 2秒**

**Runway Prompt:**
```
Medium shot of Mizore sitting at her desk, 
stuffing the folded career form back into the darkest corner of her bag. 
Her shoulders are slightly hunched, her movements deliberate and heavy. 
The classroom light is now a stark, flat 5000K white. 
A portrait of avoidance and silent despair, 2s duration.
```

---

### Shot 016
**Beat 11 | 全景 | 跟拍 | 4秒**

**Runway Prompt:**
```
Steadicam tracking shot following Mizore as she moves through a crowded school corridor. 
She tries to reach toward Nozomi, who is surrounded by a group of laughing students. 
Mizore stops as the distance between them feels insurmountable. 
The flow of other students creates a blurred barrier between the two girls. 
Isolation in a crowd, cinematic depth, 4s duration.
```

---

### Shot 017
**Beat 12 | 中景 | 跟拍 | 3秒**

**Runway Prompt:**
```
Side-profile tracking shot of Mizore walking half a step behind Nozomi in the corridor. 
Nozomi walks with a brisk, forward-looking pace. 
Mizore's lips part as if to call her name, but she remains silent. 
The physical gap between them is small, but the emotional chasm is vast. 
Cool, dim lighting, focus shifting between the two girls, 3s duration.
```

---

### Shot 018
**Beat 13 | 中景 | 固定 | 3秒**

**Runway Prompt:**
```
Static shot of Mizore back at her desk, 
pressing wired earbuds into her ears with a sense of urgency. 
She is building a wall of sound to escape the reality of the classroom. 
Her face is partially hidden by her hair. 
Moody school interior, natural light fading into evening, 3s duration.
```

---

### Shot 019
**Beat 13 | 特写 | 固定 | 2秒**

**Runway Prompt:**
```
Extreme close-up of a finger pressing the play button on a vintage Walkman. 
The metallic click is almost felt. As the tape begins to spin, 
a subtle visual shimmer of warm colors begins to bleed into the frame, 
transitioning the scene from the cold present into the warm, nostalgic past. 
Cinematic transition, macro detail, 2s duration.
```

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1 | 2026-02-02 | 初始生成，基础镜头描述。 |
| v2 | 2026-02-02 | **优化版本**: 增强了光影细节、相机运动稳定性描述，并强化了角色情感微表情。归档了 v1。 |

---

**生成说明**:  
本提示词文件 (v2) 旨在为 Runway Gen-3 引擎提供更具描述性和叙事深度的指令。通过引入材质感、动态光影和精确的运动控制词汇，期望获得更高质量的视频输出。
