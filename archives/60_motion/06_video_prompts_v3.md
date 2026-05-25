# Artifact: Video Prompts (Runway / Pika / SVD)
- id: A-20260202-001
- version: v3
- upstream: [A-20260122-004, A-20260121-003, A-20260502-001]
- locks:
  - must_keep:
    - 倒叙为主 + 现在时框架结构
    - 霙第一人称内心独白视角
    - 随身听 + 升学调查表道具系统
    - 烟火之约作为情感锚点
    - 3分10秒时长
    - 角色视觉一致性（按资产指南v3）
    - 色温演进（按风格指南v2）
  - must_avoid:
    - 希美被呈现为恶意角色
    - 霙大哭大闹的崩溃场面
    - 过于直白的情感表达
    - 角色面部特征偏离资产指南
    - 视频运动过度炫技或破坏克制情绪
  - budget_notes:
    - Platform default: Runway Gen-3
    - Compatible notes: Pika / SVD adaptation included
    - Input Type: Text-to-Video by default; Image-to-Video when keyframes exist
    - Scope: Full film, Shot 001-049
    - Total duration: 190 seconds
    - Aspect ratio: 16:9

---

# BIPOLAR MV 全片视频提示词 v3

## 使用说明

默认以 Runway Gen-3 文生视频为主。如果某个镜头已经有关键帧图，可切换为图生视频，并把对应图像路径填入 `Keyframe` 字段。Pika 可使用同一运动描述但增加更明确的 timing cues。SVD 只用于图生视频，动作幅度应更小。

## 全局视频风格

```text
Restrained Japanese school music video, quiet emotional realism, subtle film grain, controlled micro-expressions, no melodrama, no exaggerated crying. Camera movement is minimal and motivated by story. Color temperature follows the section: cold airport present, warm-to-cold classroom realization, warm memory, alternating cold/warm climax, clean high-key final resolve. Keep Mizore and Nozomi visually consistent with the asset guide.
```

## 通用负面约束

```text
Avoid changed identity, changed hairstyle, changed uniform colors, extra main characters, villain-like Nozomi, crying breakdown, exaggerated acting, unstable random camera movement, warped hands, unreadable important props, random text, vertical text, logo, watermark.
```

## 序幕：机场现在时 + 随身听开关（Shot 001-009）

| Shot | Duration | Camera | Subject Motion | Motion Purpose | Prompt Core |
| --- | --- | --- | --- | --- | --- |
| 001 | 4s | static low-angle wide | snow drifts outside airport glass | establish cold present | Cold Kansai airport ceiling and glass wall, fine snow outside, quiet empty distance, minimal movement. |
| 002 | 3s | slow tracking | adult Nozomi walks alone on moving walkway | isolate Nozomi | Adult Nozomi in dark coat and gray scarf walks forward through blurred crowd, detached and calm. |
| 003 | 2s | static close-up | tiny hair and headphone movement | sound isolation | Close-up of white headphones over Nozomi's ear, outside sound visually sealed away. |
| 004 | 2s | static insert | handbag chain sways slightly | adult-world symbol | Black quilted chain bag on dark coat, cold metallic highlights, subtle walking sway. |
| 005 | 5s | static close-up, slow-motion feel | Nozomi turns back once | farewell beat | Nozomi turns her head toward camera, transparent composed farewell, no tears, restrained. |
| 006 | 3s | static medium | snow streaks outside plane window | enclosed departure | Nozomi sits by airplane window, wing outside, snow lines across glass, quiet cabin pressure. |
| 007 | 3s | top-down macro | phone screen glow and thumb movement | music trigger | Smartphone music player interface glows in dim cabin, simple playback UI, song begins the transition. |
| 008 | 3s | static extreme close-up | cassette spools rotate | time-shift symbol | Vintage silver Walkman, cassette wheels rotating, mechanical time bridge. |
| 009 | 5s | slow dolly out | Mizore sleeps still by window | reveal inner world | Mizore asleep at classroom window, snow outside, cold light isolates her like a specimen. |

## 第一幕：学校得知消息（Shot 010-019）

| Shot | Duration | Camera | Subject Motion | Motion Purpose | Prompt Core |
| --- | --- | --- | --- | --- | --- |
| 010 | 4s | static medium | teacher speaks, students react subtly | deliver information | Classroom announcement, teacher at podium, students whisper, warm light starts fading cold. |
| 011 | 3s | static close-up | Mizore grips pencil, eyes freeze | impact | Mizore's restrained shock, fingers tighten on pencil, no outward collapse. |
| 012 | 2s | Mizore POV | Nozomi absent or packing, not looking back | missed connection | Mizore looks toward Nozomi's place; attention does not return to her. |
| 013 | 4s | top-down phone macro | typed message deleted | swallowed question | Mizore deletes the message before sending, hesitation visible in finger pause. |
| 014 | 3s | static insert | survey form pulled from bag | future avoided | Blank survey form with creases, paper edge held tightly. |
| 015 | 2s | static medium | form pushed deep into bag | avoidance | Mizore hides folded survey form, shoulders slightly inward. |
| 016 | 4s | tracking wide | Mizore tries to approach; crowd interrupts | blocked dialogue | Hallway flow separates Mizore from busy Nozomi, people pass between them. |
| 017 | 3s | tracking medium | Mizore follows half-step behind | unsaid question | Mizore's lips move but no words come out; Nozomi keeps walking forward. |
| 018 | 3s | static medium | Mizore pushes earbuds deeper | escape into music | Mizore sits and seals herself into headphones, classroom light cools. |
| 019 | 2s | static close-up | Walkman play button pressed | memory starts | Finger presses play on Walkman, sound becomes transition into warm memory. |

## 第二幕：初识与美好（Shot 020-029）

| Shot | Duration | Camera | Subject Motion | Motion Purpose | Prompt Core |
| --- | --- | --- | --- | --- | --- |
| 020 | 3s | static wide | Nozomi initiates contact | relationship origin | School hallway, Nozomi in front initiates, Mizore follows from behind. |
| 021 | 5s | soft tracking montage | repeated half-step walking | pattern of following | Multiple warm memory spaces, Nozomi always half-step ahead, Mizore follows. |
| 022 | 3s | static close-up | shared earbud connection | intimacy | One earbud shared between Mizore and Nozomi, warm soft light, fragile connection. |
| 023 | 5s | static medium | Mizore begins to speak; phone interrupts | priority crack | Mizore starts "Nozomi, later..." but Nozomi answers phone, Mizore remains unheard. |
| 024 | 3s | static wide | Nozomi leaves quickly | unfinished words | Nozomi exits casually, Mizore still seated with one earbud, words unfinished. |
| 025 | 4s | static medium | Nozomi casually offers fireworks | promise mismatch | Practice-room doorway, Nozomi casually mentions fireworks while packing sheet music. |
| 026 | 2s | static close-up | Mizore nods solemnly | unequal weight | Mizore answers "yes" with serious small nod, warm but fragile. |
| 027 | 3s | static wide | Nozomi leaves without turning | left behind again | Nozomi moves out of practice room, Mizore alone in warm empty space. |
| 028 | 4s | top-down insert | Mizore circles calendar twice | promise internalized | Phone calendar, fireworks date circled twice, delicate hand movement. |
| 029 | 3s | static medium | Nozomi glances back; Mizore smiles | misread confirmation | Nozomi's casual check-back becomes Mizore's hopeful interpretation. |

## 第三幕：分岔与平行（Shot 030-045）

| Shot | Duration | Camera | Subject Motion | Motion Purpose | Prompt Core |
| --- | --- | --- | --- | --- | --- |
| 030 | 4s | fast insert montage | schedules fill differently | worlds diverge | Split rhythm: Nozomi's schedule expands outward, Mizore's notes orbit Nozomi. |
| 031 | 5s | static/montage | Mizore waits in repeated places | alignment effort | Mizore waits at classroom, practice room, hallway, checking watch more often. |
| 032 | 4s | tracking wide | Nozomi speeds ahead | distance grows | Nozomi's back recedes, Mizore follows but cannot keep pace. |
| 033 | 3s | static close-up | Mizore writes fireworks details | preparation | Paper with time/place, Mizore carefully confirms details. |
| 034 | 4s | phone macro | message sent | active choice | Mizore sends "still meeting for fireworks?", tiny breath before send. |
| 035 | 3s | quick montage | Mizore checks phone repeatedly | waiting tension | Class, lunch, walking; phone checking repeats in tighter cuts. |
| 036 | 3s | static close-up | reply appears; smile fails | warning sign | Nozomi's vague reply arrives, Mizore's mouth tries to lift but stops. |
| 037 | 4s | static wide | Mizore arrives alone | isolated anticipation | Fireworks crowd, pairs and groups around Mizore, she stands alone. |
| 038 | 3s | static insert | phone and watch checked | time pressure | Empty screen, wristwatch, night deepening. |
| 039 | 4s | static medium | Walkman volume raised | music as buffer | Mizore turns up Walkman to fill the wait, crowd flows around her. |
| 040 | 5s | static low-angle wide | fireworks bloom; Mizore still waits | emotional peak | Fireworks light Mizore's blank face, beauty contrasts absence. |
| 041 | 3s | static wide | crowd leaves, Mizore exits alone | waiting collapses | Fireworks end, emptying ground, Mizore's small solitary back. |
| 042 | 4s | static medium | Mizore overhears Nozomi explain | priority revealed | Next day school, Nozomi speaks to classmates; Mizore understands without anger. |
| 043 | 3s | tracking wide | Mizore walks home alone | aftermath | Quiet street, Mizore walks with contained emptiness. |
| 044 | 3s | static close-up | Walkman stop/eject action | rupture | Mizore presses stop or ejects cassette, physical quiet break. |
| 045 | 5s | static wide | survey form placed on desk | digestion | Mizore sits alone, takes creased blank survey form out and finally faces it. |

## 终章：和解与选择（Shot 046-049）

| Shot | Duration | Camera | Subject Motion | Motion Purpose | Prompt Core |
| --- | --- | --- | --- | --- | --- |
| 046 | 5s | static medium | Mizore lifts pen over form | decision point | High-key morning light, Mizore centered, pen pauses over survey form. |
| 047 | 4s | macro insert | pen writes, form folded cleanly | active future | Pen touches paper, writing appears, no crossing out, form folded with care. |
| 048 | 3s | static close-up | Walkman plays forward | time moves | Walkman play pressed, cassette moves forward, no rewind. |
| 049 | 8s | static wide | Mizore stands toward light | resolution | Mizore faces window or distant plane light, back to camera, quiet forward posture. |

## Platform Adaptation Notes

| Platform | Use |
| --- | --- |
| Runway Gen-3 | Use table prompt core with camera, subject motion, and avoid list. |
| Pika | Add stronger timing phrases such as "over 3 seconds", "then", "ending on". |
| SVD | Use only with a keyframe; reduce motion to subtle breathing, hair movement, small camera drift. |

## Version History

| Version | Date | Change |
| --- | --- | --- |
| v1 | 2026-02-02 | Initial first-section video prompts |
| v2 | 2026-02-02 | Optimized Shot 001-019 |
| v3 | 2026-05-02 | Full workflow rerun; expanded to Shot 001-049 |
