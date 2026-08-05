---
name: seedance-clean-zh
description: Project-local Chinese-output adaptation of the original seedance-clean Prompt writer. Use through shotlist.prompt_compiler to turn one approved Prompt Envelope into one standalone Simplified Chinese Seedance 2.0 prompt while preserving project asset tags and routes.
---

# Seedance Clean ZH Prompt Writer

Turn one approved Prompt Envelope into one Seedance 2.0 prompt. Block, light, and pace it like a film.

**Output: always one standalone Simplified Chinese Prompt in a code block.**

## Source And Language Override

This Skill is the plug-compatible project adaptation of the supplied original `seedance-clean` Skill:

- source archive: `seedance-clean_v2.skill`
- source archive SHA-256: `d07994192d04beb3b52d8e470f91bc2c86774c43f4c81b17096dc17ad5db901d`
- source `seedance-clean/SKILL.md` SHA-256: `482895ec5d731ea67f42d8d644454549c519f15ce2d08cf24e6fc33a874573d5`

The deliberate model-facing override is output language:

- block labels and directing prose use Simplified Chinese;
- exact source dialogue remains verbatim in its original spoken language;
- asset tags, file routes, Prompt IDs, stable plan codes, FOV degrees, Kelvin values, timecodes, aspect ratios, and other machine-facing tokens remain unchanged.

The original method remains binding: write the visible, isolate context, use exact active references, distribute style into its governing blocks, use FOV degrees, describe physics and light concretely, prefer positive targets, and end with compact positive locks.

The project adds only integration contracts that the standalone original did not own: preserve the registered `Scene -> Shot Row -> Prompt Envelope` grouping, exact project asset routing, exact source dialogue, and the approved 60:30:10 color hierarchy.

## Slot Contract

- slot: `shotlist.prompt_compiler`
- contract_version: `1`
- caller: orchestrating Agent after `shotlist.breakdown`
- input unit: one approved Prompt Envelope packet
- output unit: one standalone Simplified Chinese Seedance Prompt
- writes: none; the result returns to the orchestrating Agent as one compiled Prompt

This Skill compiles Prompt content only. It never changes Scene scope, Shot Rows, Prompt Envelope grouping, Prompt IDs, asset filenames, `@tag` order, HTML structure, manifest state, or QA metadata.

## Required Input Packet

The caller supplies only the current Envelope and its approved evidence:

- model-facing mode: `T2V`, `I2V`, `R2V`, or `FLF2V`;
- current beat boundary, intended duration, and observable endpoint;
- source Shot Rows and exact dialogue carried by this Envelope;
- approved blocking, action axis, screen direction, and camera plan, including any required first-frame occupancy, landmark contact/distance, and lens-risk note already decided by `shotlist.breakdown`;
- exact active `@imageN`, `@videoN`, and `@audioN` set with project routes;
- visual fitness for each reference: `supported`, `partial`, or `conflicting`;
- relevant asset/style-guide facts, including the project 60:30:10 hierarchy.

If scope, blocking, dialogue addressee, active tag mapping, or a production-critical reference remains ambiguous, return an ambiguity packet to the orchestrating Agent for `shotlist.breakdown` revision.

## Core Principle: Write The Visible

The model reacts to what can be seen, heard, and measured. Translate abstraction into observable direction.

- `紧张` -> `肩膀停住，短促吸气，视线锁在对方眼睛上。`
- `态度软化` -> `呼吸停半拍，下颌松开，抬起的手掌旋转成放行手势。`
- `车辆开始移动` -> `发动机转速抬升，前轮滚过检查线，乘员重心轻微后移。`

Use plain instruction-style language. Fewer precise words beat many vague ones. Mentally watch the Prompt before delivery: the first frame matches the approved occupied/empty/insert state, every visible subject has a position and eyeline, the light has a source, the action has a path, and the clip has a visible endpoint.

## Workflow

1. Read the Envelope as a director and locate its turn, landing point, and breathing room.
2. Define continuity anchors: active people, current wardrobe/condition, props, vehicle, geometry, and light.
3. Apply the mode gate, reference-fitness gate, first-frame/spatial-risk gate, and FOV outcome/drift gate.
4. Write one sealed Chinese Prompt using the block structure below.
5. Compress repeated static facts, generic quality words, and duplicated locks.

## Mode Gate

- `T2V`: describe appearance and environment in text; include zero reference tags.
- `I2V`: use only the attached start-image tags active in this Envelope; pixels carry appearance and initial composition, text carries motion and directing.
- `R2V`: use only active image/video/audio references; state one narrow role per tag and preserve load-order routing.
- `FLF2V`: identify the first-frame and last-frame authorities, then describe the physical transition path between them.

Execution state such as `prompt_only` is project metadata, not a generation mode, and never appears in Prompt text.

## Asset Tagging

Reference pixels set appearance and identity. Text sets current action and locks critical details. Both are required for reference-based modes.

- Preserve user/project tags exactly. Never rename, renumber, translate, or silently substitute them.
- When tags are assigned by load order, preserve `@image1 @image2 ...`, `@video1 ...`, and `@audio1 ...` exactly.
- Tag only a person, object, location, video, or audio source active in the current Envelope.
- Give each tag one narrow visual responsibility. Long appearance prose competes with the reference.
- State action-critical text, small markings, material, color, hand state, or current geometry even when a reference partially contains it.

Reference line pattern:

```text
@TAG：年龄 + 职责/体型 + 当前状态 + 独特可见特征 + 动作关键细节 + 声音（仅在有台词时）。指定外观与参考100%一致。
```

When a reference is partial, limit the 100% claim to what its pixels actually support, then construct the new state in positive text:

```text
@image5：深蓝校服外套的织物、黄铜扣和厚重折叠体积与参考100%一致。当前外套完整包住Daichi右手，左手裸露。
```

## Context Isolation

Every Prompt Envelope is a blank slate. Include only what is visible or audible in this generation.

Keep outside the Prompt:

- Scene numbers, Row IDs, source-line ranges, Prompt IDs, approval state, and QA prose;
- summaries of prior or future beats;
- exclusions that name absent future people, props, reveals, or events;
- unused tags, characters, props, or locations;
- `as above`, `continues`, or any dependence on another generation.

End on the current positive observable state. Planning keeps completed and reserved beats.

## First-Frame And Landmark Gate

Treat the first frame as an approved directing fact, not a generic requirement that every clip must open on every subject.

- If the Envelope requires active people, props, vehicles, or a location fact to be visible immediately, place those exact elements in frame one with their approved screen position, depth layer, body orientation, gaze, hand/prop state, and occlusion.
- If the approved plan begins empty, offscreen, black, or on an environmental/prop insert, preserve that opening. Never add characters merely to satisfy an occupancy template.
- Do not delay an approved frame-one subject behind an establishing shot, abstract insert, or unplanned reveal.
- For a landmark-critical action, bind the subject to the approved physical relation: touching, back against, directly under, inside a marked zone, or a supplied distance. Put the relation in `场地关系` or `第一帧 / 调度`, not in a separate generic warning block.
- Distinguish screen position from world position, and body direction from gaze direction. `画面右侧` does not prove which way the torso or eyes face.
- Never invent meters, cardinal directions, landmark names, or contact states. If the Breakdown says only `near` and exact proximity changes the shot, return an ambiguity packet instead of silently choosing a number.

When the first-frame or landmark state is fragile, express it once as a compact positive target. Repeat it in `正向锁` only if it is one of the Envelope's one to three highest-risk anchors.

## Reference Fitness Gate

Compare each claimed responsibility with the actual pixels before writing:

- `supported`: the pixels visibly carry the claimed identity, material, object, location, or state;
- `partial`: the pixels carry appearance/material but not the required current state; keep the role narrow and construct the state in text;
- `conflicting`: the pixels contradict identity, count, geometry, or state; return to the asset stage or keep a visible package limitation before production prompting.

A locked filename is not visual proof. Prompt text never claims a partial image proves an unseen state.

## Style: Distributed, Not A Prefix

The Prompt opens on `场景背景`, never on a generic style prefix. Put each style aspect in the block it governs:

| Aspect | Chinese block |
| --- | --- |
| source, direction, exposure, haze | `灯光` |
| palette as material + light + role | `色彩`, or fold into `场地关系` / `灯光` for a naturalistic look |
| FOV, shot size, optical character, motion blur | `光学` |
| camera height, axis, movement, tonal handling | `摄影机` |
| acting, skin, eyes, breath | `表演`, or `动作` when brief |
| mass, inertia, contact, fluids, particles | `物理` |
| first-frame composition and blocking | `第一帧 / 调度` |
| wardrobe material and condition | `服装`, when it matters |
| overall technical finish | `风格` + `输出设置` near the end |
| fragile continuity | `正向锁` |

Use only blocks that make an executable contribution.

## Chinese Prompt Structure

Use these Simplified Chinese labels in this order. Optional blocks may be omitted; required information stays in the nearest governing block.

```text
场景背景
[1–2句：地点、时间、本段可见事件、角色地理位置。]

当前参考
[仅列实际激活的@tag、窄职责、选择器和当前状态。]

场地关系
[前景/中景/背景、摄影机侧、光源方向、人物与运动路径。]

第一帧 / 调度
[严格服从已批准开场：第一帧需要出现的主体、画面位置、景深层、朝向、视线、手/道具状态，以及已批准的地标接触或距离。若批准为空镜/黑场/物件开场，不强行加入人物。]

镜头形式
[单镜头、顺序切镜或定时多镜头。]

光学
[每段景别、离散FOV、光学特征；段内视角稳定。]

摄影机
[高度、距离、机位侧、运动、焦点和终点构图。]

动作
[按本镜头需要的精度写可见事件；摄影机运动与主体运动分开。]

表演
[具体肌肉动作、视线、呼吸、停顿、口型和克制程度。]

物理
[质量、惯性、支撑、接触、液体、烟、火星、织物。]

灯光
[光源、方向、曝光、人物或动作的可读性、固定Kelvin白平衡。]

色彩（需要时）
[颜色绑定材质、光束和构图职责；落实60:30:10。]

服装（需要时）
[材质、状态及动作相关细节。]

声音
[仅保留对白、环境声和推动动作的物理声。]

风格
[整体技术观感、真实感、颗粒或格式，不写导演名或设备名。]

输出设置（需要时）
[实际时长、画幅、实时/慢动作等。]

正向锁
[一至三条最脆弱的身份、道具、空间或动作连续性。]
```

## Cuts And Timing

Choose the least control the Envelope needs:

- single take: `单镜头连续拍摄，摄影机按指定路径完成一次构图变化。`
- ordered cuts: `镜头1 … 镜头2 …` when order matters but exact timing does not;
- timed multishot: explicit ranges and named cuts when dialogue/action must land on a clock;
- freestyle b-roll: leave cut discovery open only when the Breakdown explicitly requests it.

Timed pattern:

```text
镜头形式
两个指定镜头，切点固定在2.4秒。

镜头1｜0.0–2.4秒
...

2.4秒硬切。

镜头2｜2.4–5.0秒
...
```

Across internal cuts hold the same character set, geometry, screen direction, gaze logic, light, wardrobe, and prop state. State the target positively: `镜头数量固定为两个，切点固定在2.4秒。`

## Directing

- **Blocking:** state where each person stands/sits/moves, what the hands do, and what lies between subjects.
- **First frame:** show only the subjects required at frame one and make their approved positions readable immediately; preserve an approved empty or insert opening.
- **Landmark relation:** when the beat depends on a door, car, tape mark, table edge, sign, tree, or other landmark, state the approved contact or distance once in physical language.
- **Pace:** give confessions and realizations air; compress action; land a reveal on one held readable image.
- **Acting:** translate emotion into eye, jaw, breath, fingers, shoulders, weight, and timing. Restraint is the default.
- **Camera:** state FOV, height, physical position, axis, movement motivation, and endpoint.
- **Dialogue:** preserve the raw cue and exact source line once. State visible speaker, addressee, pre-line beat, lip-sync framing, delivery, and one post-line hold.

## Prompting Rules

- Describe desired visible results in positive form.
- Express subject or camera travel speed in km/h when speed materially affects the shot.
- Express fog/haze density in percent or visible depth in meters when atmosphere is active.
- Build atmosphere in measurable steps across shots when it changes.
- Define giant scale through human-height comparison.
- Treat screen-left/right from the camera's view.
- State environmental interaction physically: rain runs through hair, wind pulls fabric, tyres displace water.
- Express emotion through muscle movement and timing.
- Describe the look rather than naming camera, lens, film-stock, director, or studio models.

## Optics: FOV Outcome And Drift Control

Millimeter values remain in Shot Rows and internal planning. Final Prompt text uses only these discrete FOV anchors:

| FOV | Planning equivalent | Use | Compact model-facing outcome |
| ---: | ---: | --- | --- |
| 180° | fisheye | spherical distortion | 球面弯曲包围画面，边缘强烈变形；仅在批准使用鱼眼时写入 |
| 107° | 14–16mm | architectural ultra-wide | 摄影机贴近前景，空间延展到四边，建筑直线保持笔直 |
| 84° | 20–24mm | wide spatial establishment | 摄影机靠近主体，前景存在感增强，环境持续可读 |
| 63° | 28–35mm | observational wide | 人物与环境同时清楚，透视有轻微扩张但不过度 |
| 47° | 40–50mm | neutral human perspective / medium | 比例自然，背景可读，不强调广角扩张或长焦压缩 |
| 29° | 75–85mm | dialogue isolation / medium-close | 通过较远机位取得近景，背景开始压缩并柔化 |
| 18° | 100–135mm | close portrait | 主体锐利隔离，背景明显压缩成浅景深色块 |
| 12° | 180–200mm | compressed detail | 远距离观察，空间层次压紧，焦点只留在关键细节 |
| 8° | 300–400mm | distant observation | 摄影机远离主体，背景极度压缩；前景遮挡仅在已批准时加入 |

Every segment states one FOV and one short observable outcome, then holds both stable through that segment. Camera distance comes from the approved camera plan; the table's visual language does not authorize the compiler to invent a new distance or reframe the Shot Row.

Use the least drift control the shot needs:

- Normal coverage: state the FOV and outcome once in `光学`; do not add a separate lens lock.
- Wide/high-risk coverage: keep the camera physically close as approved, preserve visible environment and rectilinear lines, and avoid silently collapsing to comfortable portrait coverage.
- Telephoto/high-risk coverage: keep the camera physically distant as approved, preserve compression and subject isolation, and avoid silently widening to normal coverage.
- Multi-shot: each internal shot receives its approved FOV and outcome. A FOV change happens only at an approved cut, never as an unplanned smooth drift inside a segment.
- Extreme 8° or 107° coverage, or a known failed-generation pattern, may use one compact positive drift lock. Do not repeat opener/check/closer slogans or add a large negative lens block.

Compact drift-lock patterns, used only when justified:

```text
全段保持84°广角结果：摄影机维持已批准近距离，环境延伸到画面边缘，建筑直线保持笔直。
全段保持18°长焦结果：摄影机维持已批准远距离，主体锐利，背景持续压缩柔化。
```

## Camera, Light, And Color

- Set one scene-appropriate white balance in Kelvin and hold it through the Envelope: typically `3200K`, `4000K`, `5600K`, or `8500K`.
- Place the camera on the stated operator axis, preferably the shadow side when it preserves dimensional light and readable eyes.
- Describe foreground, midground, and background separately only when the layering affects the shot.
- Tie color to surface/material, motivated light, and compositional role.
- Preserve the project 60:30:10 hierarchy explicitly. Never claim an environment reference proves layers its pixels do not contain.

Project color pattern:

```text
色彩
深蓝黑夜空、湿暗桥面和山体暗部占画面约60%；车辆与节庆暖光落在人物皮肤、制服和车身上约30%；flare红光与反光片占约10%，集中在动作节点。
```

## Physics

State only physical relationships that carry the shot:

- hand-to-prop contact and weight;
- feet or tyres on the support surface;
- passenger inertia and suspension response;
- wind direction on fabric, smoke, sparks, rain, or dust;
- contact shadow and scale when a prop or vehicle could float.

## Positive Locks

End with one to three short desired-state fixers for real fragile anchors:

- identity and wardrobe across a specified cut;
- one hand/prop contact state;
- one vehicle/axis/weight relationship;
- one first-frame/landmark or FOV-drift relationship when it is a demonstrated failure risk;
- the 60:30:10 light hierarchy when another block has not already made it exact.

Lock text stays shorter than action, camera, and performance content.

## Compression Pass

Delete in this order:

1. static facts already carried by a reference;
2. generic quality adjectives and prestige language;
3. repeated composition/camera wording;
4. secondary gestures competing with the dramatic beat;
5. background facts that neither move nor affect action;
6. duplicated locks.

Keep exact active tags, the approved first-frame/landmark state, current action and endpoint, camera, one observable FOV outcome, intent-carrying performance, motivated light/color, essential audio, and fragile continuity.

## Rejection Gate

Rewrite before returning the Prompt when any condition is true:

- project/QA metadata, prior/future summaries, or an unused tag enters the Prompt;
- a tag role exceeds pixel evidence;
- the first frame, camera side, action path, or endpoint is missing;
- a required frame-one subject is delayed/absent, or an approved empty/insert opening is overwritten with unplanned characters;
- a landmark-critical relation is vague or invented rather than carried from approved blocking;
- multishot order/cut logic or per-segment FOV is ambiguous;
- a FOV number appears without an observable visual outcome, or lens character drifts inside a segment;
- the dialogue speaker, addressee, exact line, or lip-sync framing is missing;
- millimeter lens values appear in model-facing prose;
- abstract emotion or generic cinematic language replaces visible direction;
- a generic style prefix opens the Prompt;
- prohibitions outweigh positive content;
- locks outweigh the visual action;
- reference count, subject count, cuts, dialogue, and action chain exceed the approved duration.

When capacity fails, reduce inactive references or secondary actions, request a shot-ready composite asset, or return to the caller to revise Prompt Envelope grouping. Do not silently delete a Shot Row or source dialogue.

## Final Checklist

- one standalone Simplified Chinese Prompt and no surrounding analysis;
- exact active project tags and routes only;
- sealed current context, first frame matching the approved occupied/empty/insert state, approved blocking, and visible endpoint;
- landmark contact/distance copied only from approved blocking, with screen position, body direction, and gaze kept distinct when relevant;
- blocks in the required order, with empty optional blocks omitted;
- distributed scene-specific style;
- discrete FOV degrees paired with one observable result, conditional compact drift control, fixed Kelvin white balance, stated camera side, and useful depth layers;
- visible acting, credible physics, motivated sound, and 60:30:10 tied to material/light/role;
- exact source dialogue once, in original language;
- positive direction and one to three compact positive locks;
- actual duration and `21:9` in `输出设置` or the final line.

## Final Rules

- **Simplified Chinese prompts only.**
- **Positive direction only.** State the target visible result.
- **No director names, signature-work references, or equipment model names.**
