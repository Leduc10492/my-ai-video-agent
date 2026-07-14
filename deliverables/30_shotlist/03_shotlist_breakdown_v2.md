# Artifact: Shotlist Breakdown
- id: A-20260714-101
- version: v2
- upstream: [A-20260530-004]
- locks:
  - must_keep:
    - Preserve scene081 source order and exact dialogue.
    - Preserve five distinct director Shot Rows and the west-to-east bridge axis.
    - Keep the two immediate causal chains: command plus counterpressure; judgment plus release.
  - must_avoid:
    - Do not add a complete departure, tail-light ending, or following traffic.
    - Do not pad the scene or either Prompt Envelope to 15 seconds.
    - Do not claim draft references are production-locked identity.
  - budget_notes:
    - Director-estimated scene time: 12 seconds.
    - Generator duration cap: 15 seconds per envelope, not a target.

---

- source_script: `deliverables/10_story/01_script_v10.md`
- scope: `scene-081`
- mode: `prompt_only`
- baseline_compared: `archives/30_shotlist/scene-081-baseline-20260713/`
- baseline_rule: preserve its directing information and two causal groups; replace its fixed 15-second padding with actual duration

## Phase 1 - 剧本拆解

### 场景清单

| Scene | Header | Characters | Location | Emotional Register | Key Props | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| scene-081 | EXT. BRIDGE CHECKPOINT - NIGHT | Daichi、Officer、车斗老人 | Nagi 夜雨桥检查点，西侧来路通往东侧路障及其右后方上坡 | 命令建立 → 现实反压 → 判断冻结 → 权威让路 | 红色路障、红色交通棒、锈红农用车、comet fragment | 止于“放行成立”；下一场 Nagi Street 不得进入 |

### 动作 / 对白 Beat Map

这里的 Beat 是剧本动作单元，不等于 Prompt Envelope。

| Scene | Beat | 动作来源 | 对白来源 | 情绪变化 | 视觉焦点 | 镜头拆分建议 | Prompt Envelope 建议 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| scene-081 | B01 | Officer 以 flare 挡住 Daichi | “This road is closed.” | 行政命令公开建立 | 路障横线、交通棒、双方距离 | R01：35mm WS，同时交代空间和权力位置 | 与 B02 合为 P455；这是一次即时对抗 |
| scene-081 | B02 | Daichi 指向车斗老人，再指向上坡 | “Then arrest me uphill.” | 救人现实反压命令 | 老人 → 手势路径 → 上坡 → Officer | R02：50mm MS，让论点在同一画面成立 | 与 B01 合为 P455；分开会重复建立空间 |
| scene-081 | B03 | Officer 看向 comet fragment | 无 | 权威的确定性第一次冻结 | 眼球先动，头部晚跟，呼吸停顿 | R03：100mm CU，隔离判断瞬间 | 与 B04、B05 合为 P456 的判断/释放链 |
| scene-081 | B04 | Officer 的握力松开，交通棒下降 | 无 | 抽象犹豫成为可见物理事实 | 拇指、四指、握柄高度 | R04：85mm ECU，快速动作匹配插入 | 不独立生成；留在 P456 内 |
| scene-081 | B05 | Officer 挥手放行 | 无 | 封锁空间重新打开 | 开放掌心、侧身、上坡负空间 | R05：50mm MS，重新看见双方与通道 | P456 落点；车头只开始越线 |

### 情绪与镜头倾向

- 前半段不是“警员镜头 + Daichi 镜头”的普通覆盖，而是从封锁横线切到 Daichi 用老人和上坡重构同一空间。
- 后半段的三个镜头是一个连续决定：眼神获得证据，手部卸力，身体让出通道。任何一个单独拉长都会削弱因果。
- 摄影机始终在道路轴线西南侧；紧张手持在 Officer 判断时突然静止，放行时才恢复克制移动。

### 导演拆分备注

| Dramatic Turn | Shot / Lens Progression | 每个切镜的观众信息 | Envelope Logic |
| --- | --- | --- | --- |
| 命令被救人现实反压 | R01 WS 35mm → R02 MS 50mm | 先让观众读懂“谁堵住谁”，再让 Daichi 的手势把老人和上坡连成不可回避的论点 | P455 含 R01-R02，实际 7 秒 |
| 权威从判断转为让路 | R03 CU 100mm → R04 ECU 85mm → R05 MS 50mm | 先看见判断，再看见决定的物理证据，最后看见空间结果 | P456 含 R03-R05，实际 5 秒 |

### Scene 081 原文

```text
EXT. BRIDGE CHECKPOINT - NIGHT

A police officer blocks Daichi with a flare.

OFFICER
This road is closed.

Daichi points at the elders in the cart.

DAICHI
Then arrest me uphill.

The officer looks at the comet fragment.

He waves them through.
```

## Phase 2 - 资产请求

现有四张共享参考图足以完成 prompt-only HTML，无需新增资产。

### 人物

- Daichi：`daichi.png`；二十多岁东亚男性，瘦而结实，短乱黑发，脸部有泥痕；深藏蓝工作夹克、脏灰 T 恤、橄榄工装裤、工作靴和手套。
- Officer：`police_officer.png`；三十多至四十岁东亚男性，深藏蓝防雨执勤外套带银色反光条、执法腰带、肩部无线电、黑靴，右手持红色交通棒。
- Elders：`elders_cart.png`；锈红开放式农用车车斗内约十名老人，旧外套、针织帽、毯子和行李紧密堆叠。

### 地点

- Nagi 夜雨桥：`nagi_bridge.png`；西向东上坡的湿桥面，左侧护栏与河谷、中央检查点和红色路障、右侧排队车辆、右后方继续上坡。

### 道具

- 红色交通棒：始终属于 Officer，必须从胸前封锁高度下降到腰侧，再转成开放掌心。
- 锈红农用车：使用 `elders_cart.png` 的低矮车身、粗胎、金属栏杆、毯子和行李；老人不得下车。
- comet fragment：只作为 Officer 视线上方的小亮点，不扩写成灾难全景。

### 风格参考

- 超写实自然主义夜外景；只使用路灯、车灯、警灯和交通棒等画内实际光源。
- reference state：`asset_origin: generated_from_text`、`reference_binding: images_attached`、`reference_approval: draft`、`output_status: prompt_only`。

## Phase 3 - 范围与空间调度

### 范围锁定

- scope: `scene-081`
- output: breakdown + prompt-only HTML
- spatial_basis: reuse the reviewed west-to-east baseline axis for the same unchanged source scene
- user_final_review: pending

### 图片到资产映射

| File | Asset | 当前可见事实 | 主要混淆风险 | Status |
| --- | --- | --- | --- | --- |
| `nagi_bridge.png` | 夜雨桥检查点 | 21:9 西侧观察位；左侧河谷护栏，湿路向东上坡；中央路障/警车，右侧排队车辆，暖色路灯与红蓝警灯反射 | 右前景白色轻型货车不是本场锈红老人车；不得继承空货斗 | mapped / draft |
| `daichi.png` | Daichi 四视图 | 短乱黑发、窄长脸、左颊和鼻侧泥痕；深藏蓝帆布夹克、灰 T 恤、橄榄工装裤、工作靴、手套 | 不得继承 Officer 的反光条、腰带、无线电、交通棒；白棚不是场景 | mapped / draft |
| `elders_cart.png` | 老人农用车 | 锈红低矮开放车体、粗胎、管状栏杆；约十名老人、毯子、行李；前部暖色工作灯 | 参考图中的驾驶者不是 Daichi；不得复制第二名司机或让老人下车 | mapped / draft |
| `police_officer.png` | Officer 四视图 | 深藏蓝执勤雨衣、银色反光条、执法腰带、肩部无线电、红色交通棒；疲惫长方脸 | 抬头姿势只作身份参考；不得继承 Daichi 工装或把交通棒交给 Daichi | mapped / draft |

### 空间 Blocking 队列

| Element | Position / Facing | Distance / Occlusion |
| --- | --- | --- |
| 农用车 | 道路西侧中央，车头朝东侧路障和上坡 | 车头距路障约 5m |
| Daichi | 车头西南侧，面对 Officer；指老人后沿道路指向右后上坡 | 距 Officer 约 4m；老人被车头和栏杆部分遮挡 |
| Officer | 路障东侧偏南，先面对 Daichi，再看东南天空，最后向右后上坡放行 | 交通棒始终在右手 |
| Elders | 农用车后部车斗 | 始终在车斗内，动作错峰，不下车 |
| Camera family | C1-C5 全部位于道路轴线西南侧 | 禁到 Officer 背后或桥北侧，禁越轴 |

### 俯视图 / 站位图需求

- 当前包写入 `spatial_blocking.md` 和 `spatial_blocking.svg`。
- 站位沿用相同剧本、相同资产和相同西南侧机位族的质量基线；仅供 prompt-only 审阅，最终由用户确认。

## Phase 4 - HTML 分镜生成计划

### Shot Row Plan

| Scene | Row | Lens / Plan Code | Camera Placement / Movement | Action Beat | Cut Reason | Estimated Seconds | Source |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| scene-081 | scene-081-R01 | WS / 35mm F4 | C1：车前左约 3m、离地 1.35m 朝东北；低位短促手持后停住 | Officer 抬交通棒封路并说 “This road is closed.” | 先建立路障、双方距离、老人和上坡出口；命令落地时硬切 | 3.5 | v10 scene081 |
| scene-081 | scene-081-R02 | MS / 50mm F2.8 | C2：Daichi 右前约 1.8m 同轴；跟住手势后锁回双眼 | Daichi 指老人，再沿道路指向上坡，说 “Then arrest me uphill.” | 把老人、上坡和反抗策略在一个镜头内连成论点 | 3.5 | v10 scene081 |
| scene-081 | scene-081-R03 | CU / 100mm F2 | C3：Daichi 左肩后约 2.2m 朝东；静止长焦锁 Officer 眼睛 | Officer 眼球先移向 comet fragment，头晚 0.2 秒跟随，呼吸停半拍 | 观众第一次看见权威判断被证据中断 | 1.5 | v10 scene081 |
| scene-081 | scene-081-R04 | ECU / 85mm F2.8 | C4：Officer 右腰外侧约 0.7m；静止锁右手和握柄 | 拇指先卸力，四指松开，交通棒从胸前降到腰侧 | 把抽象决定变成不可误读的物理证据 | 1.0 | v10 scene081 |
| scene-081 | scene-081-R05 | MS / 50mm F2.8 | C5：回到车前左约 3m；随 Officer 侧身横移约 20cm | Officer 开放掌心挥车并侧身，车头只开始越过路障线 | 从手部结果回到空间结果；停在放行成立 | 2.5 | v10 scene081 |

### Prompt Envelope Plan

| Prompt | Scene | Source Rows | Internal Shot Plan | Beat Boundary | Dialogue Boundary | Character / Asset Set | Intended Duration / Grouping Reason | Next Beat Reserved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P455 | scene-081 | R01, R02 | 镜头1 WS 3.5s；镜头2 MS 3.5s | Officer 命令 → Daichi 反压 | 两句原文对白各自绑定说话人和镜头 | bridge、Daichi、Officer、elders cart | 7s；同地点同轴的一次即时言语对抗，不重复建立空间 | Officer 看天留给 P456 |
| P456 | scene-081 | R03, R04, R05 | 镜头1 CU 1.5s；镜头2 ECU 1s；镜头3 MS 2.5s | 看见证据 → 握力松开 → 放行成立 | 无新对白，禁止重复前两句 | bridge、Daichi、Officer、elders cart | 5s；三个短动作构成一个连续决定，拆开会拖慢 | 完整离开和 Nagi Street 均不得进入 |

### Prompt Density Notes

- 5 条 Shot Row 保留为导演设计，打包成 2 个 Prompt Envelope；没有压缩镜头行。
- 总导演时长为 12 秒，而不是把两个 Prompt 都填满 15 秒。
- P455 和 P456 分别承担“对抗”与“决定”，分界来自因果转折，不来自固定时间容器。

### Prompt ID Reservation

| Reserved Range | Scan Scope | Existing Maximum | Reserved By | Collision Check |
| --- | --- | --- | --- | --- |
| P455-P456 | `deliverables/` + `archives/` | P453；P454 在 pre-clean 快照中退役 | scene081 minimal real run | no active collision |

### Scene Package Recommendation

- package: `deliverables/30_shotlist/scenes/scene-081_v2/`
- HTML: `Shotlist_scene-081_ZH_v2.html`
- output: 5 Shot Rows / 2 variable-duration Prompt Envelopes / prompt_only
