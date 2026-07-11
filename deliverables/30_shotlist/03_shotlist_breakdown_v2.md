# Artifact: Shotlist Breakdown
- id: A-20260628-001
- version: v2
- upstream: [A-20260530-004, A-20260530-005]
- locks:
  - must_keep:
    - Use v10 screenplay scene labels and preserve exact source dialogue.
    - Keep the archived v1 package and retained P389 generation test as history only.
  - must_avoid:
    - Do not reuse P377-P428 for new prompt envelopes.
    - Do not treat generated-from-text references as locked production identity.
  - budget_notes:
    - Regression scope: scenes 078-085 and 096-098.
    - Prompt envelope duration: 15 seconds, 21:9.

---

- source_script: deliverables/10_story/01_script_v10.md
- source_audit: deliverables/10_story/01_audit_report_v10.md
- workflow_slot: shotlist.breakdown
- workflow_skill: shotlist-breakdown-workflow
- execution_mode: draft
- asset_origin: generated_from_text
- reference_binding: images_attached
- reference_approval: draft
- output_status: prompt_only
- blocking_approval: approved_for_test

## Phase 1 - 剧本拆解

### 场景清单

| Scene | Header | Characters | Location | Emotional Register |
| --- | --- | --- | --- | --- |
| `scene-078` | `EXT. SCHOOL GYM - NIGHT` | Hana, Teacher, children | 体育馆南门到北墙 | 临时行动转成秩序 |
| `scene-079` | `INT. SCHOOL GYM - NIGHT` | Asa, Sora, children | 体育馆垫区与门口 | 物理门锁转为共同承担 |
| `scene-080` | `EXT. NAGI BRIDGE - NIGHT` | Daichi, elders, drivers | 夜雨桥面与堵车轴线 | 焦急转成强行动 |
| `scene-081` | `EXT. BRIDGE CHECKPOINT - NIGHT` | Daichi, Officer, elders | 桥东检查点到上坡出口 | 权威由阻拦转为放行 |
| `scene-082` | `EXT. NAGI STREET - NIGHT` | Hana, old vendor, crowd | 祭典街与学校上坡 | 嘲笑转成跟随 |
| `scene-083` | `INT. TOWN HALL - NIGHT` | Yuna, Mayor, aides | 门口、办公桌、紧急电话 | 否认转成官方命令 |
| `scene-084` | `EXT. NAGI - NIGHT` | townspeople, responders | 镇街到学校上坡 | 私人恐慌转为公共移动 |
| `scene-085` | `EXT. SCHOOL HILL - NIGHT` | Yuna, evacuees | 山丘前景与镇盆地 | 抵达安全区后直面冲击 |
| `scene-096` | `INT. SUBWAY - MORNING` | Adult Ren, Adult Yuna | 平行列车门 | 无名识别被列车切断 |
| `scene-097` | `EXT. TOKYO STREETS - CONTINUOUS` | Adult Ren, Adult Yuna | 站口、楼梯、公交遮挡 | 追逐转成身体记忆 |
| `scene-098` | `EXT. SHRINE STAIRS - LATE AFTERNOON` | Adult Ren, Adult Yuna | 湿石阶中央轴线 | 身体先认出，语言后追上 |

### 动作 / 对白 Beat Map

| Scene Group | Prompt | 动作来源与边界 | 对白来源 | Prompt Envelope 建议 |
| --- | --- | --- | --- | --- |
| `scene-078` | `P429` | 体育馆南门打开，第一批避难者进入，Teacher用夹板挡住门。 → Teacher指向北墙，说 "North wall. Keep them away from glass." | "This is not an authorized shelter order." / "Then authorize catching." / "North wall. Keep them away from glass." | 多镜头连续因果/情绪单元 |
| `scene-079` | `P430` | Asa把红绳绕过门把手并收紧，Sora看门在风里震动。 → Sora问 "Will they hold?"，Asa回答 "Doors do not hold. People do." 并把最后一根红绳交给他。 | "Will they hold?" / "Doors do not hold. People do." | 多镜头连续因果/情绪单元 |
| `scene-080` | `P431` | Daichi驾驶载老人农用车卡在夜雨桥堵车中，车灯和雨水把桥面切成湿亮线条。 → 后视镜被折回，老人抓紧车斗栏杆，Daichi喊 "If you love your car, move it uphill!" | "If you love your car, move it uphill!" | 多镜头连续因果/情绪单元 |
| `scene-080` | `P432` | 司机们迟疑后让出一条上坡通道，农用车从中心线慢慢挤出桥面。 → 司机们迟疑后让出一条上坡通道，农用车从中心线慢慢挤出桥面。 | 无 | 独立机位或表演边界 |
| `scene-081` | `P433` | 红色路障挡住农用车，Officer举着交通棒站在东侧，直视Daichi说 "This road is closed." → 红色路障挡住农用车，Officer举着交通棒站在东侧，直视Daichi说 "This road is closed." | "This road is closed." | 独立机位或表演边界 |
| `scene-081` | `P434` | Daichi指向车斗老人并划向上坡，说 "Then arrest me uphill."；Officer随后看向天空碎片，交通棒降到腰侧。 → Officer手指松开，交通棒从胸口高度降到腰侧，路障前出现放行缝隙。 | "Then arrest me uphill." | 多镜头连续因果/情绪单元 |
| `scene-081` | `P435` | Officer侧身让开半步，农用车从他身边慢慢通过，老人仍在车斗中。 → Officer侧身让开半步，农用车从他身边慢慢通过，老人仍在车斗中。 | 无 | 独立机位或表演边界 |
| `scene-081` | `P436` | 农用车越过红色路障，向上坡方向离开，Officer留在雨里看着尾灯。 → 农用车越过红色路障，向上坡方向离开，Officer留在雨里看着尾灯。 | 无 | 独立机位或表演边界 |
| `scene-082` | `P437` | Hana拿着应急广播跑过祭典街，人群对第一条警告发笑，摊位仍在营业。 → Old man喊 "Thief!"，Hana边跑边回头喊 "Yes! Follow me!"，他的脚终于离开摊位。 | "Thief!" / "Yes! Follow me!" | 多镜头连续因果/情绪单元 |
| `scene-082` | `P438` | 现金盒变成方向源，摊位人群从笑闹转成跟随，湿街上的移动全部指向学校上坡。 → 现金盒变成方向源，摊位人群从笑闹转成跟随，湿街上的移动全部指向学校上坡。 | 无 | 独立机位或表演边界 |
| `scene-083` | `P439` | 镇公所办公室里 aides 围桌争论，Mayor坐在桌后，紧急电话在右前方没有被拿起。 → 镇公所办公室里 aides 围桌争论，Mayor坐在桌后，紧急电话在右前方没有被拿起。 | 无 | 独立机位或表演边界 |
| `scene-083` | `P440` | Yuna冲进门，直视Mayor说 "Mom knew, didn&#x27;t she?"，房间声音瞬间停住。 → Yuna冲进门，直视Mayor说 "Mom knew, didn&#x27;t she?"，房间声音瞬间停住。 | "Mom knew, didn&#x27;t she?" | 独立机位或表演边界 |
| `scene-083` | `P441` | Mayor压住脸部裂缝说 "Leave."，Yuna没有后退，说 "She left cords for days she could not reach." → Mayor压住脸部裂缝说 "Leave."，Yuna没有后退，说 "She left cords for days she could not reach." | "Leave." / "She left cords for days she could not reach." | 独立机位或表演边界 |
| `scene-083` | `P442` | Yuna说 "You heard her once and chose being mayor instead of being believed."，眼睛不躲，呼吸变低。 → Yuna说 "You heard her once and chose being mayor instead of being believed."，眼睛不躲，呼吸变低。 | "You heard her once and chose being mayor instead of being believed." | 独立机位或表演边界 |
| `scene-083` | `P443` | Mayor的手抬起又停在半空，外面第一声警报开始，监控屏里的 comet 形状让他回头。 → Mayor拿起紧急电话，说 "Open the school shelter."，手指压住听筒边缘。 | "Open the school shelter." | 多镜头连续因果/情绪单元 |
| `scene-084` | `P444` | 镇广播喇叭亮起，祭典街的人同时抬头，声音从高处落到湿路上。 → Daichi让备用发电机咳动亮起，Hana拖着老摊主穿过学校门口。 | 无 | 多镜头连续因果/情绪单元 |
| `scene-084` | `P445` | Yuna站在街心，天上的 comet fragment 撕开云层，撤离人流从她身后继续上坡。 → Yuna站在街心，天上的 comet fragment 撕开云层，撤离人流从她身后继续上坡。 | 无 | 独立机位或表演边界 |
| `scene-085` | `P446` | Yuna到达学校山丘，身后下方人流还在上坡，她和人群保持25米以上距离。 → 红绳在Yuna手中被爆风拉直，衣角同向抖动，画面进入黑前停一秒。 | 无 | 多镜头连续因果/情绪单元 |
| `scene-096` | `P447` | Ren在拥挤车厢，Yuna在对面经过的列车门边，两人隔玻璃看见一秒。 → Ren的普通通勤表情被切开，眼球先追，身体半秒后才转向车门。 | 无 | 多镜头连续因果/情绪单元 |
| `scene-097` | `P448` | Ren冲出站口，Yuna从另一条楼梯跑下，两人都在找一个刚刚错过的人。 → 雨开始，Ren摸手腕红绳，Yuna摸包带红绳，动作相隔0.4秒但方向相同。 | 无 | 多镜头连续因果/情绪单元 |
| `scene-098-pass` | `P449` | Ren从下方街口往上爬，Yuna从上方街口往下走，湿石阶中央轴线清楚。 → 两人转身，Ren说 "I know this sounds strange."，Yuna回答 "It does." | "I know this sounds strange." / "It does." | 多镜头连续因果/情绪单元 |
| `scene-098-recognition` | `P450` | Ren轻笑后问 "Have we met?"，Yuna没有立刻回答，只看向他手腕红绳。 → Yuna下一级台阶说 "But I have been looking."，Ren上一级台阶说 "Me too."，两人仍保持距离。 | "Have we met?" / "I don&#x27;t know." / "But I have been looking." / "Me too." | 多镜头连续因果/情绪单元 |
| `scene-098-recognition` | `P451` | Yuna说 "Then before we forget again..."，Ren点头，清晰说出 "Your name?"，停在Yuna开口前。 → Yuna说 "Then before we forget again..."，Ren点头，清晰说出 "Your name?"，停在Yuna开口前。 | "Then before we forget again..." / "Your name?" | 独立机位或表演边界 |

### 情绪与镜头倾向

- 避难段以清楚空间轴线和实际行动为先，不用抽象灾难蒙太奇替代因果动作。
- 检查点、镇公所和神社台阶保留对白原文，并将提问、回答、决定放在明确口型镜头中。
- 短连续动作合并为15秒 multi-shot；独立表演或揭示边界保留单独 envelope。

### 导演拆分备注

- v1 的52条 Prompt 把多处短动作拆得过细；v2 保留52条镜头行，但合并为23条 Prompt Envelope。
- 每条镜头行使用 scene-native `RNN`；新 Prompt 使用预留的 P429-P451。
- 任何分组变化都必须保留源行映射，不得以减少 Prompt 为目的删除动作。

## Phase 2 - 资产请求

### 人物

- 使用 `deliverables/20_assets/generated_ref_v1/` 中现有角色参考；均由文本生成，审批状态为 draft。

### 地点

- 体育馆、夜雨桥、祭典街、镇公所、学校山丘、东京地铁/雨街、神社台阶参考均已存在。

### 道具

- 红绳、载老人农用车、交通棒/路障、现金盒、紧急电话是连续性关键道具。

### 风格参考

- 沿用自然主义实际光源、阴影侧摄影、真实重量与克制表演；不使用具体摄影师姓名作为风格捷径。

## Phase 3 - 范围与空间调度

### 范围锁定

- Scope: `scenes-078-085_096-098_v2`
- Execution mode: `draft`
- Blocking approval: `approved_for_test`

### 图片到资产映射

- Common asset root: `deliverables/20_assets/generated_ref_v1/`
- Asset count: 22
- Ambiguous filenames: none
- `asset_origin: generated_from_text`
- `reference_binding: images_attached`
- `reference_approval: draft`
- `output_status: prompt_only`

### 空间 Blocking 队列

- 所有12个场景段均在 `spatial_blocking.md` 中记录主视轴、人物/道具位置、距离和机位族。
- 测试批准只证明夹具可运行，不代表用户对最终生产站位的审批。

### 俯视图 / 站位图需求

- 本轮使用可审计的 Markdown 坐标/站位表；生产模式应根据最终资产重新确认或渲染图示。

## Phase 4 - HTML 分镜生成计划

### Shot Row Plan

| Scene | Row | Lens / Plan Code | Action Beat | Scene Text Source | Asset / Reference Need | Blocking Note |
| --- | --- | --- | --- | --- | --- | --- |
| `scene-078` | `scene-078-R01` | `WS` / 35mm南门远景 | 体育馆南门打开，第一批避难者进入，Teacher用夹板挡住门。 | v10 `scene-078` | generated_ref_v1 | 见空间 Blocking |
| `scene-078` | `scene-078-R02` | `MS` / 50mm对峙中景 | Teacher说 "This is not an authorized shelter order."，Hana举起应急广播回应 "Then authorize catching." | v10 `scene-078` | generated_ref_v1 | 见空间 Blocking |
| `scene-078` | `scene-078-R03` | `WS` / 35mm横移远景 | 孩子们没有父母陪同抵达，Teacher的夹板从胸口降到腰间。 | v10 `scene-078` | generated_ref_v1 | 见空间 Blocking |
| `scene-078` | `scene-078-R04` | `MS` / 50mm指令中景 | Teacher指向北墙，说 "North wall. Keep them away from glass." | v10 `scene-078` | generated_ref_v1 | 见空间 Blocking |
| `scene-079` | `scene-079-R01` | `ECU` / 85mm红绳插入 | Asa把红绳绕过门把手并收紧，Sora看门在风里震动。 | v10 `scene-079` | generated_ref_v1 | 见空间 Blocking |
| `scene-079` | `scene-079-R02` | `CU` / 85mm低声反应 | Sora问 "Will they hold?"，Asa回答 "Doors do not hold. People do." 并把最后一根红绳交给他。 | v10 `scene-079` | generated_ref_v1 | 见空间 Blocking |
| `scene-080` | `scene-080-R01` | `WS` / 35mm桥面远景 | Daichi驾驶载老人农用车卡在夜雨桥堵车中，车灯和雨水把桥面切成湿亮线条。 | v10 `scene-080` | generated_ref_v1 | 见空间 Blocking |
| `scene-080` | `scene-080-R02` | `ECU` / 85mm仪表插入 | Daichi低头看农用车仪表台上的时间 7:18，手指在方向盘上收紧。 | v10 `scene-080` | generated_ref_v1 | 见空间 Blocking |
| `scene-080` | `scene-080-R03` | `MS` / 50mm手持动作 | Daichi跳下车，肩膀擦过车门，开始用手折第一辆车的后视镜。 | v10 `scene-080` | generated_ref_v1 | 见空间 Blocking |
| `scene-080` | `scene-080-R04` | `CU` / 85mm手部特写 | 后视镜被折回，老人抓紧车斗栏杆，Daichi喊 "If you love your car, move it uphill!" | v10 `scene-080` | generated_ref_v1 | 见空间 Blocking |
| `scene-080` | `scene-080-R05` | `WS` / 35mm前方引导 | 司机们迟疑后让出一条上坡通道，农用车从中心线慢慢挤出桥面。 | v10 `scene-080` | generated_ref_v1 | 见空间 Blocking |
| `scene-081` | `scene-081-R01` | `WS` / 35mm检查点远景 | 红色路障挡住农用车，Officer举着交通棒站在东侧，直视Daichi说 "This road is closed." | v10 `scene-081` | generated_ref_v1 | 见空间 Blocking |
| `scene-081` | `scene-081-R02` | `MS` / 50mm + 100mm + 85mm 三镜头 | Daichi指向车斗老人并划向上坡，说 "Then arrest me uphill."；Officer随后看向天空碎片，交通棒降到腰侧。 | v10 `scene-081` | generated_ref_v1 | 见空间 Blocking |
| `scene-081` | `scene-081-R03` | `CU` / 100mm Officer特写 | Officer从Daichi的手势移开视线，看向东南天空的 comet fragment，权威冻结。 | v10 `scene-081` | generated_ref_v1 | 见空间 Blocking |
| `scene-081` | `scene-081-R04` | `ECU` / 85mm交通棒插入 | Officer手指松开，交通棒从胸口高度降到腰侧，路障前出现放行缝隙。 | v10 `scene-081` | generated_ref_v1 | 见空间 Blocking |
| `scene-081` | `scene-081-R05` | `MS` / 50mm车头通过 | Officer侧身让开半步，农用车从他身边慢慢通过，老人仍在车斗中。 | v10 `scene-081` | generated_ref_v1 | 见空间 Blocking |
| `scene-081` | `scene-081-R06` | `WS` / 35mm上坡出口远景 | 农用车越过红色路障，向上坡方向离开，Officer留在雨里看着尾灯。 | v10 `scene-081` | generated_ref_v1 | 见空间 Blocking |
| `scene-082` | `scene-082-R01` | `WS` / 35mm祭典街远景 | Hana拿着应急广播跑过祭典街，人群对第一条警告发笑，摊位仍在营业。 | v10 `scene-082` | generated_ref_v1 | 见空间 Blocking |
| `scene-082` | `scene-082-R02` | `MS` / 50mm摊位中景 | 老摊主低头继续烤东西，拒绝离开摊位，Hana停在摊位前判断他的固执。 | v10 `scene-082` | generated_ref_v1 | 见空间 Blocking |
| `scene-082` | `scene-082-R03` | `ECU` / 85mm现金盒插入 | Hana的手抓起现金盒，盒底离开湿木台面，硬币在里面短促撞响。 | v10 `scene-082` | generated_ref_v1 | 见空间 Blocking |
| `scene-082` | `scene-082-R04` | `MS` / 50mm追逐中景 | Old man喊 "Thief!"，Hana边跑边回头喊 "Yes! Follow me!"，他的脚终于离开摊位。 | v10 `scene-082` | generated_ref_v1 | 见空间 Blocking |
| `scene-082` | `scene-082-R05` | `WS` / 35mm上坡路线 | 现金盒变成方向源，摊位人群从笑闹转成跟随，湿街上的移动全部指向学校上坡。 | v10 `scene-082` | generated_ref_v1 | 见空间 Blocking |
| `scene-083` | `scene-083-R01` | `WS` / 35mm办公室建立 | 镇公所办公室里 aides 围桌争论，Mayor坐在桌后，紧急电话在右前方没有被拿起。 | v10 `scene-083` | generated_ref_v1 | 见空间 Blocking |
| `scene-083` | `scene-083-R02` | `MS` / 50mm门口中景 | Yuna冲进门，直视Mayor说 "Mom knew, didn&#x27;t she?"，房间声音瞬间停住。 | v10 `scene-083` | generated_ref_v1 | 见空间 Blocking |
| `scene-083` | `scene-083-R03` | `CU` / 85mm Mayor反应 | Mayor压住脸部裂缝说 "Leave."，Yuna没有后退，说 "She left cords for days she could not reach." | v10 `scene-083` | generated_ref_v1 | 见空间 Blocking |
| `scene-083` | `scene-083-R04` | `CU` / 100mm Yuna特写 | Yuna说 "You heard her once and chose being mayor instead of being believed."，眼睛不躲，呼吸变低。 | v10 `scene-083` | generated_ref_v1 | 见空间 Blocking |
| `scene-083` | `scene-083-R05` | `MS` / 50mm停手中景 | Mayor的手抬起又停在半空，外面第一声警报开始，监控屏里的 comet 形状让他回头。 | v10 `scene-083` | generated_ref_v1 | 见空间 Blocking |
| `scene-083` | `scene-083-R06` | `ECU` / 85mm电话插入 | Mayor拿起紧急电话，说 "Open the school shelter."，手指压住听筒边缘。 | v10 `scene-083` | generated_ref_v1 | 见空间 Blocking |
| `scene-084` | `scene-084-R01` | `WS` / 35mm镇街广播 | 镇广播喇叭亮起，祭典街的人同时抬头，声音从高处落到湿路上。 | v10 `scene-084` | generated_ref_v1 | 见空间 Blocking |
| `scene-084` | `scene-084-R02` | `MS` / 50mm消防员挥车 | 消防员站在车流侧边挥手，车辆一台一台转向上坡，不同步，不整齐。 | v10 `scene-084` | generated_ref_v1 | 见空间 Blocking |
| `scene-084` | `scene-084-R03` | `WS` / 35mm灯笼队远景 | 孩子们提着灯笼朝学校方向走，成人从迟疑变成跟随，学校方向成为唯一明亮轴线。 | v10 `scene-084` | generated_ref_v1 | 见空间 Blocking |
| `scene-084` | `scene-084-R04` | `MS` / 50mm发电机与校门 | Daichi让备用发电机咳动亮起，Hana拖着老摊主穿过学校门口。 | v10 `scene-084` | generated_ref_v1 | 见空间 Blocking |
| `scene-084` | `scene-084-R05` | `WS` / 35mm街心仰视 | Yuna站在街心，天上的 comet fragment 撕开云层，撤离人流从她身后继续上坡。 | v10 `scene-084` | generated_ref_v1 | 见空间 Blocking |
| `scene-085` | `scene-085-R01` | `WS` / 35mm山丘远景 | Yuna到达学校山丘，身后下方人流还在上坡，她和人群保持25米以上距离。 | v10 `scene-085` | generated_ref_v1 | 见空间 Blocking |
| `scene-085` | `scene-085-R02` | `CU` / 100mm脸部冲击光 | 南侧白光照亮Yuna的脸，她停止奔跑，眼睛锁住下方镇盆地。 | v10 `scene-085` | generated_ref_v1 | 见空间 Blocking |
| `scene-085` | `scene-085-R03` | `WS` / 35mm镇盆地远景 | 山丘前景仍可辨认，下方镇盆地被白光吞没，光源从南侧下方扩散。 | v10 `scene-085` | generated_ref_v1 | 见空间 Blocking |
| `scene-085` | `scene-085-R04` | `CU` / 85mm听觉抽离 | Yuna的脸没有哭，声音像被抽空，耳边只剩低频风压，嘴唇微张但不出声。 | v10 `scene-085` | generated_ref_v1 | 见空间 Blocking |
| `scene-085` | `scene-085-R05` | `ECU` / 45mm红绳尾拍 | 红绳在Yuna手中被爆风拉直，衣角同向抖动，画面进入黑前停一秒。 | v10 `scene-085` | generated_ref_v1 | 见空间 Blocking |
| `scene-096` | `scene-096-R01` | `WS` / 35mm平行列车 | Ren在拥挤车厢，Yuna在对面经过的列车门边，两人隔玻璃看见一秒。 | v10 `scene-096` | generated_ref_v1 | 见空间 Blocking |
| `scene-096` | `scene-096-R02` | `CU` / 100mm Ren反应 | Ren的普通通勤表情被切开，眼球先追，身体半秒后才转向车门。 | v10 `scene-096` | generated_ref_v1 | 见空间 Blocking |
| `scene-097` | `scene-097-R01` | `MS` / 50mm雨街追逐 | Ren冲出站口，Yuna从另一条楼梯跑下，两人都在找一个刚刚错过的人。 | v10 `scene-097` | generated_ref_v1 | 见空间 Blocking |
| `scene-097` | `scene-097-R02` | `WS` / 35mm公交遮挡 | 公交车东西向横穿，两人相隔一车身错过，Ren在西侧，Yuna在东侧。 | v10 `scene-097` | generated_ref_v1 | 见空间 Blocking |
| `scene-097` | `scene-097-R03` | `ECU` / 85mm红绳记忆 | 雨开始，Ren摸手腕红绳，Yuna摸包带红绳，动作相隔0.4秒但方向相同。 | v10 `scene-097` | generated_ref_v1 | 见空间 Blocking |
| `scene-098-pass` | `scene-098-pass-R01` | `WS` / 35mm台阶建立 | Ren从下方街口往上爬，Yuna从上方街口往下走，湿石阶中央轴线清楚。 | v10 `scene-098-pass` | generated_ref_v1 | 见空间 Blocking |
| `scene-098-pass` | `scene-098-pass-R02` | `MS` / 50mm擦肩二人景 | 两人在中央轴线擦肩，伞收起不挡脸，肩膀之间只隔半臂宽。 | v10 `scene-098-pass` | generated_ref_v1 | 见空间 Blocking |
| `scene-098-pass` | `scene-098-pass-R03` | `ECU` / 85mm脚步停住 | Ren的脚在下一阶停住，Yuna的脚在上一阶停住，水从鞋边向下流。 | v10 `scene-098-pass` | generated_ref_v1 | 见空间 Blocking |
| `scene-098-pass` | `scene-098-pass-R04` | `CU` / 85mm肩背反应 | 两人背对背都不先转身，Ren呼出一口气，Yuna的伞柄在手里轻响。 | v10 `scene-098-pass` | generated_ref_v1 | 见空间 Blocking |
| `scene-098-pass` | `scene-098-pass-R05` | `MS` / 50mm转身对话 | 两人转身，Ren说 "I know this sounds strange."，Yuna回答 "It does." | v10 `scene-098-pass` | generated_ref_v1 | 见空间 Blocking |
| `scene-098-recognition` | `scene-098-recognition-R01` | `CU` / 100mm Ren提问 | Ren轻笑后问 "Have we met?"，Yuna没有立刻回答，只看向他手腕红绳。 | v10 `scene-098-recognition` | generated_ref_v1 | 见空间 Blocking |
| `scene-098-recognition` | `scene-098-recognition-R02` | `ECU` / 85mm红绳对应 | Yuna打开包，匹配的红绳从包带边缘垂下，她说 "I don&#x27;t know." | v10 `scene-098-recognition` | generated_ref_v1 | 见空间 Blocking |
| `scene-098-recognition` | `scene-098-recognition-R03` | `MS` / 50mm台阶靠近 | Yuna下一级台阶说 "But I have been looking."，Ren上一级台阶说 "Me too."，两人仍保持距离。 | v10 `scene-098-recognition` | generated_ref_v1 | 见空间 Blocking |
| `scene-098-recognition` | `scene-098-recognition-R04` | `CU` / 100mm Ren口型特写 | Yuna说 "Then before we forget again..."，Ren点头，清晰说出 "Your name?"，停在Yuna开口前。 | v10 `scene-098-recognition` | generated_ref_v1 | 见空间 Blocking |

### Prompt Envelope Plan

| Prompt | Scene | Source Rows | Internal Shot Plan | Beat Boundary | Dialogue Boundary | Character / Asset Set | 15s Grouping Reason | Next Beat Reserved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `P429` | `scene-078` | scene-078-R01, scene-078-R02, scene-078-R03, scene-078-R04 | 镜头1:WS/35mm南门远景；镜头2:MS/50mm对峙中景；镜头3:WS/35mm横移远景；镜头4:MS/50mm指令中景 | 体育馆南门打开，第一批避难者进入，Teacher用夹板挡住门。 → Teacher指向北墙，说 "North wall. Keep them away from glass." | "This is not an authorized shelter order." / "Then authorize catching." / "North wall. Keep them away from glass." | nagi_school_gym.png, hana.png, teacher.png, sora.png, asa.png, children_crowd.png, red_cord_prop.png | 同地点、同轴线的一次连续转折；4个内部镜头总计15秒 | `P430` |
| `P430` | `scene-079` | scene-079-R01, scene-079-R02 | 镜头1:ECU/85mm红绳插入；镜头2:CU/85mm低声反应 | Asa把红绳绕过门把手并收紧，Sora看门在风里震动。 → Sora问 "Will they hold?"，Asa回答 "Doors do not hold. People do." 并把最后一根红绳交给他。 | "Will they hold?" / "Doors do not hold. People do." | nagi_school_gym.png, hana.png, teacher.png, sora.png, asa.png, children_crowd.png, red_cord_prop.png | 同地点、同轴线的一次连续转折；2个内部镜头总计15秒 | `P431` |
| `P431` | `scene-080` | scene-080-R01, scene-080-R02, scene-080-R03, scene-080-R04 | 镜头1:WS/35mm桥面远景；镜头2:ECU/85mm仪表插入；镜头3:MS/50mm手持动作；镜头4:CU/85mm手部特写 | Daichi驾驶载老人农用车卡在夜雨桥堵车中，车灯和雨水把桥面切成湿亮线条。 → 后视镜被折回，老人抓紧车斗栏杆，Daichi喊 "If you love your car, move it uphill!" | "If you love your car, move it uphill!" | nagi_bridge.png, daichi.png, elders_cart.png | 同地点、同轴线的一次连续转折；4个内部镜头总计15秒 | `P432` |
| `P432` | `scene-080` | scene-080-R05 | 镜头1:WS/35mm前方引导 | 司机们迟疑后让出一条上坡通道，农用车从中心线慢慢挤出桥面。 → 司机们迟疑后让出一条上坡通道，农用车从中心线慢慢挤出桥面。 | 无 | nagi_bridge.png, daichi.png, elders_cart.png | 独立机位/对白/表演边界 | `P433` |
| `P433` | `scene-081` | scene-081-R01 | 镜头1:WS/35mm检查点远景 | 红色路障挡住农用车，Officer举着交通棒站在东侧，直视Daichi说 "This road is closed." → 红色路障挡住农用车，Officer举着交通棒站在东侧，直视Daichi说 "This road is closed." | "This road is closed." | nagi_bridge.png, daichi.png, elders_cart.png, police_officer.png | 独立机位/对白/表演边界 | `P434` |
| `P434` | `scene-081` | scene-081-R02, scene-081-R03, scene-081-R04 | 镜头1:MS/50mm + 100mm + 85mm 三镜头；镜头2:CU/100mm Officer特写；镜头3:ECU/85mm交通棒插入 | Daichi指向车斗老人并划向上坡，说 "Then arrest me uphill."；Officer随后看向天空碎片，交通棒降到腰侧。 → Officer手指松开，交通棒从胸口高度降到腰侧，路障前出现放行缝隙。 | "Then arrest me uphill." | nagi_bridge.png, daichi.png, elders_cart.png, police_officer.png | 同地点、同轴线的一次连续转折；3个内部镜头总计15秒 | `P435` |
| `P435` | `scene-081` | scene-081-R05 | 镜头1:MS/50mm车头通过 | Officer侧身让开半步，农用车从他身边慢慢通过，老人仍在车斗中。 → Officer侧身让开半步，农用车从他身边慢慢通过，老人仍在车斗中。 | 无 | nagi_bridge.png, daichi.png, elders_cart.png, police_officer.png | 独立机位/对白/表演边界 | `P436` |
| `P436` | `scene-081` | scene-081-R06 | 镜头1:WS/35mm上坡出口远景 | 农用车越过红色路障，向上坡方向离开，Officer留在雨里看着尾灯。 → 农用车越过红色路障，向上坡方向离开，Officer留在雨里看着尾灯。 | 无 | nagi_bridge.png, daichi.png, elders_cart.png, police_officer.png | 独立机位/对白/表演边界 | `P437` |
| `P437` | `scene-082` | scene-082-R01, scene-082-R02, scene-082-R03, scene-082-R04 | 镜头1:WS/35mm祭典街远景；镜头2:MS/50mm摊位中景；镜头3:ECU/85mm现金盒插入；镜头4:MS/50mm追逐中景 | Hana拿着应急广播跑过祭典街，人群对第一条警告发笑，摊位仍在营业。 → Old man喊 "Thief!"，Hana边跑边回头喊 "Yes! Follow me!"，他的脚终于离开摊位。 | "Thief!" / "Yes! Follow me!" | nagi_festival_street.png, hana.png, old_vendor.png, yuna_teen.png | 同地点、同轴线的一次连续转折；4个内部镜头总计15秒 | `P438` |
| `P438` | `scene-082` | scene-082-R05 | 镜头1:WS/35mm上坡路线 | 现金盒变成方向源，摊位人群从笑闹转成跟随，湿街上的移动全部指向学校上坡。 → 现金盒变成方向源，摊位人群从笑闹转成跟随，湿街上的移动全部指向学校上坡。 | 无 | nagi_festival_street.png, hana.png, old_vendor.png, yuna_teen.png | 独立机位/对白/表演边界 | `P439` |
| `P439` | `scene-083` | scene-083-R01 | 镜头1:WS/35mm办公室建立 | 镇公所办公室里 aides 围桌争论，Mayor坐在桌后，紧急电话在右前方没有被拿起。 → 镇公所办公室里 aides 围桌争论，Mayor坐在桌后，紧急电话在右前方没有被拿起。 | 无 | town_hall_office.png, mayor.png, town_hall_aides.png, yuna_teen.png | 独立机位/对白/表演边界 | `P440` |
| `P440` | `scene-083` | scene-083-R02 | 镜头1:MS/50mm门口中景 | Yuna冲进门，直视Mayor说 "Mom knew, didn&#x27;t she?"，房间声音瞬间停住。 → Yuna冲进门，直视Mayor说 "Mom knew, didn&#x27;t she?"，房间声音瞬间停住。 | "Mom knew, didn&#x27;t she?" | town_hall_office.png, mayor.png, town_hall_aides.png, yuna_teen.png | 独立机位/对白/表演边界 | `P441` |
| `P441` | `scene-083` | scene-083-R03 | 镜头1:CU/85mm Mayor反应 | Mayor压住脸部裂缝说 "Leave."，Yuna没有后退，说 "She left cords for days she could not reach." → Mayor压住脸部裂缝说 "Leave."，Yuna没有后退，说 "She left cords for days she could not reach." | "Leave." / "She left cords for days she could not reach." | town_hall_office.png, mayor.png, town_hall_aides.png, yuna_teen.png | 独立机位/对白/表演边界 | `P442` |
| `P442` | `scene-083` | scene-083-R04 | 镜头1:CU/100mm Yuna特写 | Yuna说 "You heard her once and chose being mayor instead of being believed."，眼睛不躲，呼吸变低。 → Yuna说 "You heard her once and chose being mayor instead of being believed."，眼睛不躲，呼吸变低。 | "You heard her once and chose being mayor instead of being believed." | town_hall_office.png, mayor.png, town_hall_aides.png, yuna_teen.png | 独立机位/对白/表演边界 | `P443` |
| `P443` | `scene-083` | scene-083-R05, scene-083-R06 | 镜头1:MS/50mm停手中景；镜头2:ECU/85mm电话插入 | Mayor的手抬起又停在半空，外面第一声警报开始，监控屏里的 comet 形状让他回头。 → Mayor拿起紧急电话，说 "Open the school shelter."，手指压住听筒边缘。 | "Open the school shelter." | town_hall_office.png, mayor.png, town_hall_aides.png, yuna_teen.png | 同地点、同轴线的一次连续转折；2个内部镜头总计15秒 | `P444` |
| `P444` | `scene-084` | scene-084-R01, scene-084-R02, scene-084-R03, scene-084-R04 | 镜头1:WS/35mm镇街广播；镜头2:MS/50mm消防员挥车；镜头3:WS/35mm灯笼队远景；镜头4:MS/50mm发电机与校门 | 镇广播喇叭亮起，祭典街的人同时抬头，声音从高处落到湿路上。 → Daichi让备用发电机咳动亮起，Hana拖着老摊主穿过学校门口。 | 无 | nagi_festival_street.png, children_crowd.png, daichi.png, hana.png, yuna_teen.png | 同地点、同轴线的一次连续转折；4个内部镜头总计15秒 | `P445` |
| `P445` | `scene-084` | scene-084-R05 | 镜头1:WS/35mm街心仰视 | Yuna站在街心，天上的 comet fragment 撕开云层，撤离人流从她身后继续上坡。 → Yuna站在街心，天上的 comet fragment 撕开云层，撤离人流从她身后继续上坡。 | 无 | nagi_festival_street.png, children_crowd.png, daichi.png, hana.png, yuna_teen.png | 独立机位/对白/表演边界 | `P446` |
| `P446` | `scene-085` | scene-085-R01, scene-085-R02, scene-085-R03, scene-085-R04, scene-085-R05 | 镜头1:WS/35mm山丘远景；镜头2:CU/100mm脸部冲击光；镜头3:WS/35mm镇盆地远景；镜头4:CU/85mm听觉抽离；镜头5:ECU/45mm红绳尾拍 | Yuna到达学校山丘，身后下方人流还在上坡，她和人群保持25米以上距离。 → 红绳在Yuna手中被爆风拉直，衣角同向抖动，画面进入黑前停一秒。 | 无 | school_hill_impact.png, yuna_teen.png, red_cord_prop.png | 同地点、同轴线的一次连续转折；5个内部镜头总计15秒 | `P447` |
| `P447` | `scene-096` | scene-096-R01, scene-096-R02 | 镜头1:WS/35mm平行列车；镜头2:CU/100mm Ren反应 | Ren在拥挤车厢，Yuna在对面经过的列车门边，两人隔玻璃看见一秒。 → Ren的普通通勤表情被切开，眼球先追，身体半秒后才转向车门。 | 无 | tokyo_subway_streets.png, adult_ren.png, adult_yuna.png, red_cord_prop.png | 同地点、同轴线的一次连续转折；2个内部镜头总计15秒 | `P448` |
| `P448` | `scene-097` | scene-097-R01, scene-097-R02, scene-097-R03 | 镜头1:MS/50mm雨街追逐；镜头2:WS/35mm公交遮挡；镜头3:ECU/85mm红绳记忆 | Ren冲出站口，Yuna从另一条楼梯跑下，两人都在找一个刚刚错过的人。 → 雨开始，Ren摸手腕红绳，Yuna摸包带红绳，动作相隔0.4秒但方向相同。 | 无 | tokyo_subway_streets.png, adult_ren.png, adult_yuna.png, red_cord_prop.png | 同地点、同轴线的一次连续转折；3个内部镜头总计15秒 | `P449` |
| `P449` | `scene-098-pass` | scene-098-pass-R01, scene-098-pass-R02, scene-098-pass-R03, scene-098-pass-R04, scene-098-pass-R05 | 镜头1:WS/35mm台阶建立；镜头2:MS/50mm擦肩二人景；镜头3:ECU/85mm脚步停住；镜头4:CU/85mm肩背反应；镜头5:MS/50mm转身对话 | Ren从下方街口往上爬，Yuna从上方街口往下走，湿石阶中央轴线清楚。 → 两人转身，Ren说 "I know this sounds strange."，Yuna回答 "It does." | "I know this sounds strange." / "It does." | shrine_stairs.png, adult_ren.png, adult_yuna.png, red_cord_prop.png | 同地点、同轴线的一次连续转折；5个内部镜头总计15秒 | `P450` |
| `P450` | `scene-098-recognition` | scene-098-recognition-R01, scene-098-recognition-R02, scene-098-recognition-R03 | 镜头1:CU/100mm Ren提问；镜头2:ECU/85mm红绳对应；镜头3:MS/50mm台阶靠近 | Ren轻笑后问 "Have we met?"，Yuna没有立刻回答，只看向他手腕红绳。 → Yuna下一级台阶说 "But I have been looking."，Ren上一级台阶说 "Me too."，两人仍保持距离。 | "Have we met?" / "I don&#x27;t know." / "But I have been looking." / "Me too." | shrine_stairs.png, adult_ren.png, adult_yuna.png, red_cord_prop.png | 同地点、同轴线的一次连续转折；3个内部镜头总计15秒 | `P451` |
| `P451` | `scene-098-recognition` | scene-098-recognition-R04 | 镜头1:CU/100mm Ren口型特写 | Yuna说 "Then before we forget again..."，Ren点头，清晰说出 "Your name?"，停在Yuna开口前。 → Yuna说 "Then before we forget again..."，Ren点头，清晰说出 "Your name?"，停在Yuna开口前。 | "Then before we forget again..." / "Your name?" | shrine_stairs.png, adult_ren.png, adult_yuna.png, red_cord_prop.png | 独立机位/对白/表演边界 | `none` |

### Prompt Density Notes

- 52条镜头行合并为23条 Prompt Envelope；最大组为5条快速内部镜头，均在 Prompt 内写明时间分配。
- 合并依据是同地点、同角色集、同空间轴线和一个立即因果/情绪转折；对白揭示与独立表演保持边界。

### Prompt ID Reservation

| Reserved Range | Scan Scope | Existing Maximum | Reserved By | Collision Check |
| --- | --- | --- | --- | --- |
| P429-P451 | active + archived scene packages | P428 | shotlist regression v2 | no collision |

### Scene Package Recommendation

- Package: `deliverables/30_shotlist/scenes/scenes-078-085_096-098_v2/`
- HTML: `Shotlist_scenes-078-085_096-098_ZH_v2.html`
- Shot rows: 52
- Prompt envelopes: 23
- Preview status: `prompt_only`
