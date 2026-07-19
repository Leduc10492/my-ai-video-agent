# Prompt Patterns

Every Chinese Seedance 2.0 prompt follows the same structural order. Hit every section in sequence; don't skip; don't reorder.

Project provenance, approval, execution mode, and output status never belong in this structure. They remain in the Scene HTML header and manifests.

## Structural order

1. **Handle declarations** (`@image1`, `@image2`, ...)
2. **Universal warnings** (`⚠️空间布局`, `⚠️对白规则`, `⚠️本视频严格只有N个镜头`)
3. **Camera/frame lock** (camera position, viewing direction, first-frame composition)
4. **Per-shot blocks** (`【镜头1】` `【镜头2】` ...) OR a single-shot block
5. **Style block** (`风格：...`)
6. **Background activity** (`环境活动：...`)
7. **Shot-specific failure-mode lock**
8. **Closing footer** (`<实际时长>秒。21:9。`)

## Section 1 — Handle declarations

Every prompt opens by declaring its handles. Handles renumber per-prompt (not per-scene, per-prompt — sometimes scenes contain prompts with different asset subsets). Format:

```
@image1 (CharacterA) — [身高、体型、发型、脸部识别点、完整服装、随身道具、当前干湿/污损状态、最可能混淆的细节]。
@image2 (LocationA) — [主视角、入口、背景层、实际光源、关键表面、空间轴线、最可能误判的布局]。
@image3 (PropA) — [尺寸、形状、材质、颜色、可读文字、当前状态、正确放置位置]。
```

Rules:
- Character handles always describe height, build, hair, distinctive face marks, full wardrobe head-to-toe, props on the body
- For wet/dry/blood/dust state changes between scenes, **explicitly note the state** in the handle (`湿发贴额`, `溅血渍`, `面部薄水雾`)
- Location handles describe the reference image layout in detail (multi-view → say which view is which: `上图=`, `下图=`, `中图=`)
- Prop handles include exact dimensions when relevant (`11cm×8.5cm`), text on props verbatim, color/material specs
- Handles are not labels. They must be mini visual-fact tables. The outer Scene metadata decides whether a reference is approved; inside the prompt, include only visible facts and model-facing role limits that affect generation.
- Every handle should include at least one likely confusion risk when relevant: wardrobe contamination, wrong scale, wrong light inheritance, wrong prop placement, or pose-reference contamination.
- For static-pose-reference handles (used for body posing only, not full image generation), use `@imageN` style with explicit warnings:
  ```
  @image7 — ❌NOT A VIDEO FRAME❌ 此图仅用于提取@imageN的身体姿势角度数据。⚠️@image7是静态姿势参考——禁止将@image7渲染/复制/再现为视频的任何一帧。
  ```

### Project metadata exclusion

Never write a project-status paragraph inside a Seedance prompt. Exclude `⚠️参考状态`, `⚠️参考图状态`, `asset_origin`, `reference_binding`, `reference_approval`, `output_status`, `prompt_only`, `production_approved`, `text_dna_draft`, `image_reference_bound`, `文本DNA`, `未附图`, `不得声称身份锁定`, and `未获用户站位锁定` from handles and all other prompt sections.

Keep generation-relevant reference limits. For example, `@image2 仅参考服装和体型，不参考背景` is useful model direction; `@image2 reference_approval=draft` is project bookkeeping and stays outside the prompt.

## Section 2 — Universal warnings (top of prompt)

Always declare the shot count and dialogue rules at the top, before the shot blocks:

```
⚠️空间布局 / 人物位置：[reference top-down schema, see SPATIAL_BLOCKING.md]
⚠️对白规则：一句台词=一个镜头——每个角色的台词严格只出现在该角色的特写镜头内。
⚠️本视频严格只有N个镜头——禁止添加额外镜头。
```

The shot-count warning prevents the model from adding spurious cuts.

## Section 2.5 — Camera/frame lock

Every prompt needs a camera/frame lock immediately before the shot block. This is where author-style specificity lives: not only what lens, but where the camera is planted and what the first frame must contain.

Required:
- **Camera position:** physical placement and viewing direction (`摄影机放在厨房深处冰箱右侧1米，朝客厅窗户方向拍摄`)
- **Frame composition:** foreground/midground/background or left/right/top/bottom relationships (`画面最右侧只露出冰箱门一条窄边；画面主体是公寓内部`)
- **Shot action boundary:** what this prompt does and what adjacent prompts must not leak into it
- **Frame-edge or occlusion lock** when relevant (`frame right sliver`, `left foreground shoulder`, `top edge of prop visible`)

For multi-shot prompts, distinguish the outer prompt boundary from internal shot boundaries. The outer boundary says what the envelope covers and what stays outside it; each `【镜头N】` block then carries its own internal beat and timing. Do not split short adjacent cause-effect beats into separate prompt envelopes just because they have internal boundaries.

Template:
```
⚠️机位锁定：摄影机固定在[exact physical place]，镜头朝向[direction / target]，距[subject]约[X]米；禁切到[wrong side]，禁变成[wrong shot type]。
⚠️画面构图锁定：第一帧[foreground] / [midground] / [background]；[object/person]只占画面[edge/portion]；主体必须是[action subject]。
⚠️动作边界：本prompt只拍[exact beat]，禁止提前出现[next beat]，禁止回到[previous beat]。
```

## Section 3 — Per-shot blocks (multi-shot prompts)

When a prompt contains multiple internal cuts, each one is a `【镜头N】` block with its own internal structure:

```
【镜头1】
机位：35mm广角，全景wide shot。⚠️持续时间⚠️严格约0.3-0.5秒（split-second flash establishing shot）。
背景：[location detail].
动作：[step-by-step].
⚠️0.3-0.5秒后⚠️立刻硬切（hard cut）到镜头2——无过渡、无淡出、无停留。

【镜头2】（紧接镜头1硬切而来）
机位：⚠️85mm长焦，⚠️F1.4极浅景深，⚠️@image1侧面紧凑特写。
摄影机运动：[handheld / dolly / static + camera-emotion sync clause from CAMERA_EMOTION.md].
背景：[detail].
动作：[step-by-step].
⚠️⚠️⚠️微表演细节（actor performance micro-beats）：
- ① ...
- ② ...
- ③ ...
```

Each shot block always has:
- **机位** — lens + aperture + shot type (wide / mid / close / ECU) + handheld/static/dolly modifier
- **摄影机运动** (when relevant) — camera move synchronized to emotion
- **摄影机位置** (when relevant) — east/west/south/north of the character
- **背景** — what's in the background (or "blurred to soft color blocks" for tight close-ups)
- **动作** — step-by-step action with numbered beats (① ② ③ ...) when there's an arc
- **微表演细节** — performance micro-beats, see MICRO_BEATS.md

For a single-shot prompt (one continuous take, no internal cuts), skip the `【镜头N】` headers and write the same structure as a single block. Prepend with `单镜头（one-shot，无剪辑）。`

Never let `动作：` be a summary. It must be a physical path. Bad: `动作：Character A 很愤怒。` Good: `0-2秒右脚向前半步；2-4秒右手抬到胸口并指向目标；4-6秒视线沿手臂移动；6-8秒手臂落回身侧并停在明确终态。`

## Section 4 — Spatial blocking

For any prompt with 2+ characters in frame, declare the spatial relationship explicitly using the approved top-down schema (see [SPATIAL_BLOCKING.md](SPATIAL_BLOCKING.md)):

```
⚠️空间布局（MAIN VIEW=从入口看向背景墙）：
位置A：@image1站在入口内侧偏左，面朝空间中央。
位置B：@image2站在中央轴线，距@image1约3米，面朝@image1。
位置C：@image3位于@image2后方1.5米，部分被@image2遮挡。
```

Use precise distances in meters. Use cardinal directions or "north/south/east/west" relative to the main view axis. Note who occludes whom, who faces which direction, and any heights/eyelines the model might get wrong.

## Section 5 — Camera/move direction

Every shot block declares lens + camera move + emotion sync. See [CAMERA_EMOTION.md](CAMERA_EMOTION.md) for the full mapping.

Always specify:
- Lens (in mm)
- Aperture if shallow DOF matters (`F1.4极浅景深`)
- Camera move (handheld呼吸 / dolly / crane / static / push-in / pull-out)
- For handheld, specify the breathing rhythm based on the focal character's emotion
- For multi-shot, name the cut type (`hard cut` / `dissolve`) and forbid the others

Forbidden moves are explicit:
- `禁zoom变焦` (no zoom — physical movement only)
- `禁稳定器` (no stabilizer — handheld means handheld)
- `禁焦点漂移` (no focus drift on locked inserts)

## Section 6 — Performance direction

This is the cinematographer's main creative output. Direct emotion as physical micro-events. See [MICRO_BEATS.md](MICRO_BEATS.md) for the full catalog by emotion.

Tactics:
- Eyeline shifts ("目光从@image4方向微微移开向下")
- Breath ("胸腔深深起伏——一次漫长的吸气，然后缓慢呼出")
- Throat/jaw micro-tells ("一次喉结上下吞咽", "颧骨处咬肌慢慢收缩")
- Suppressed emotion as physical resistance ("他在试图忍住——每一块面部肌肉都在对抗涌上来的情绪")
- Eye state ("眼睛逐渐湿润，眼眶积聚泪水使眼球开始泛光")
- Posture/weight ("肩膀低沉下塌", "双臂无力挂在身侧")
- Staged emotional arcs with numbered beats (① ② ③ ④ ⑤ ⑥ ⑦) for complex reaction shots

Every dialogue line gets a pre-line beat, mid-line emphasis cues, and a post-line beat (see MICRO_BEATS.md §4).

## Section 7 — Dialogue rules

### Base rule
```
⚠️对白规则：一句台词=一个镜头——每个角色的台词严格只出现在该角色的特写镜头内。
```

### Source dialogue preservation

Keep source dialogue in its original spoken language inside quotes. Write the prompt direction in Chinese around that exact line.

For every dialogue line, bind all of these:
- **Speaker:** who says the line
- **Addressee:** who the line is directed at
- **Lip-sync frame:** the shot where the mouth movement is visible
- **Pre-line micro-beat:** breath, eyeline, jaw, throat, shoulder, or weight shift before speech
- **Line delivery:** the exact quoted source line, represented here as `"<exact source dialogue>"`
- **Post-line micro-beat:** the physical reaction after the last word
- **Envelope boundary:** what this prompt covers and what later dialogue/reveal stays in the next prompt

Template:
```
⚠️对白保留：@image1严格朝向@image2说出原文台词："<exact source dialogue>"。中文只描述表演和镜头，不翻译这句对白。
台词前：@image1先停顿半秒，喉结轻吞咽，视线从@image2胸口抬到眼睛。
台词中：口型清晰绑定原文每个词，声音方向只朝向@image2。
台词后：下颌轻收，眼睛保持不眨，等待回答。
⚠️动作边界：本prompt只拍提问，不提前出现姓名揭示或后续回答。
```

### Interruption (one character cuts another off)
If character A interrupts character B mid-word:
```
⚠️例外（对白打断）：第N镜头中[A]说"[start of A's line]——[word at break]"⚠️被第N+1镜头中[B]的台词强行打断——硬切发生在[A]说"[word]"中间，[A]的声音被[B]的台词覆盖切断。⚠️这是有意的对白打断（interruption），制造紧张冲突感。
```

Then in shot N+1's description: `镜头第一帧时[B]通过鼻孔大幅度急吸气（sharp inhale）——抓取空气准备打断。`

### Line addressing
Every line must explicitly state **whom it's directed at**:
```
严格朝向 [character X] 说（视线、声音方向都明确指向 [X]，不是对其他人说的）。
```

### Lines from bokeh
If a character in bokeh speaks — sound is allowed, but the silhouette must match: head angled toward the speech direction, breath before words readable even through blur.

## Section 8 — Background activity

For any scene with extras or environmental movement, callout what's happening in the background. Forbid empty backgrounds:

```
环境活动（匹配地点参考）：⚠️人口密集场景禁止空旷背景。背景人物按场景功能执行不同动作：行走、交接物品、停下观察、避让主体；动作错开0.3-0.5秒，禁止整齐同步。
```

For empty or quiet scenes, still call out the absence: what is not moving and what kind of silence remains.

```
完全寂静——禁背景音乐、禁画外人声。仅环境SFX：远处城市低频嗡鸣、暖气管道轻响、湿靴踩在拼花地板上的回响。
```

## Section 9 — Lighting overrides per shot

The default style block forbids fill light, but each scene may need additional lighting overrides specific to that location. See [STYLE_BLOCK.md](STYLE_BLOCK.md) for variants.

Be specific about:
- What lights are ON (windows, screens, practicals)
- What lights are OFF (with explicit `禁` for each forbidden source)
- Direction of key light
- Whether contre-jour or side-lit
- Spill rules ("禁止蓝色色溢打在人物皮肤上")

## Section 10 — Failure-mode warnings (`⚠️` markers)

Anticipate what Seedance will get wrong. Add ⚠️-marked rules to prevent it. Use single `⚠️` for important, triple `⚠️⚠️⚠️` for critical-critical.

What to mark with `⚠️`:
- Any distance ("距G约2米")
- Position of any object (`放在后景桌面左侧边缘，距墙约20厘米`)
- Forbiddens ("禁止", "不允许")
- Key blocking (where each character stands)
- Eyeline lock ("目光始终锁定在 X 上")
- Timing of any line or action
- Any exception to a general rule

### Standard forbid block (drop into every prompt)
```
禁3D渲染。
禁游戏引擎、禁游戏CG过场质感。
禁正面光、禁侧面补光、禁反光板、禁柔光箱。
禁LED灯带、禁霓虹。
禁屏幕蓝光溢出。
禁可见光束（god rays）。
禁光学畸变、禁桶形畸变、禁鱼眼。
禁漂浮道具。
禁身份漂移。
禁抖动（除手持呼吸感外）。
禁音乐。禁字幕。
```

### Common failure modes to counter

- **Handle contamination** — model uses one character's wardrobe on another. Counter: re-state each character's exact wardrobe in the handle.
- **Identity drift across cuts** — counter: `连续性：角色、道具、环境每个镜头完全一致。禁身份漂移。`
- **Pose-reference contamination** — counter: explicit `❌NOT A VIDEO FRAME❌` rules
- **Light spill on skin** — counter: `禁止蓝色色溢打在人物皮肤和服装上`
- **Wide-angle distortion** — counter: `禁光学畸变——禁桶形畸变、禁枕形畸变、禁鱼眼效果、禁广角变形`
- **Floating props** — counter: `禁漂浮道具`
- **God rays / volumetric beams** — counter: `禁止可见光束（god rays）`
- **Empty background** — counter: explicit background activity callouts (Section 8)
- **Hand chaos** — for shots with hand close-ups, specify finger count and exact action
- **Scale mismatch** — for shots with multiple characters, restate heights
- **Camera pass-through** — for handheld, note "禁稳定器" but also "画面带有机呼吸感微晃" so it doesn't go wild
- **Spurious cuts** — counter: `⚠️本视频严格只有N个镜头——禁止添加额外镜头`
- **Focus drift on inserts** — counter: `⚠️焦平面严格锁定在 [object]——绝对禁止焦点漂移、绝对禁止 rack focus、绝对禁止 autofocus 跳变`
- **Adjacent beat leakage** — model performs the next prompt early. Counter: `本prompt只拍[X]，禁提前出现[Y]`.
- **Generic motion** — model waves vaguely instead of performing the action path. Counter: split the motion into target, hand/body path, eyeline, and final pose.
- **Camera ambiguity** — model changes viewpoint or drifts to a generic wide. Counter: repeat camera placement and first-frame composition once before the shot block and once in the failure-mode lock.

## Section 10.5 — Prompt rejection rules

Reject and rewrite the prompt before HTML if any of these appear:

- A shot action is shorter than one concrete sentence and has no timed or numbered physical steps.
- The same micro-beat sentence appears in multiple prompt envelopes without shot-specific changes.
- The prompt has a lens but no physical camera position.
- The prompt has a spatial layout but no frame composition.
- The failure block only lists generic forbiddens and does not name this shot's likely failure modes.
- A reference handle is just a filename plus one-line description.
- The prompt includes a future beat from the next envelope or a previous beat already completed.

### Rule-replacement hierarchy

If a new rule contradicts an earlier one — **the new rule replaces the old**. Don't silently delete the old one; write the replacement explicitly:
```
⚠️替换规则：原规则[X]替换为新规则[Y]——[reason if non-obvious]。
```

## Section 11 — Closing footer

Always end with:
```
<实际时长>秒。21:9。
```

For multi-shot prompts, sum the internal shot durations and use that actual total in the footer. Do not pad to the generator cap.

## Length

Don't be precious about prompt length. Prompts in production range from ~150 Chinese characters (simple inserts) to ~2000+ characters (complex reaction shots with 7-step emotional arcs). The complex reaction shots ARE that long because they need to be — micromanaging the performance is what makes them work. Don't truncate to be neat.

## Tone

Write as an experienced cinematographer and stage director: think in shadows, lenses, blocking, physical contact, and controlled performance. Do not write generic AI-video prose such as `a beautiful shot of...`. Write measurable blocking notes, for example: `Character A stands 2m from the table, back to camera, weight on left foot, right hand holding the prop at thigh height`.
