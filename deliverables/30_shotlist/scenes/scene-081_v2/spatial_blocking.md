# Artifact: Spatial Blocking
- id: A-20260714-103
- version: v2
- upstream: [A-20260530-004, A-20260714-101]
- locks:
  - must_keep:
    - Preserve the west-to-east road axis and keep C1-C5 on the southwest side.
    - Keep the cart west of the barricade and the uphill exit behind Officer to frame right.
  - must_avoid:
    - Do not cross to Officer's east side or mirror the uphill exit.
    - Do not treat this prompt-only review layout as production approval.
  - budget_notes: []

---

- scene: scene-081
- status: baseline_reused_pending_user_review
- basis: same source scene, same four reference images, and same west-to-east layout as the selected quality baseline
- diagram: `spatial_blocking.svg`

## 俯视站位

| Element | Position | Facing / eyeline | Distance / occlusion |
| --- | --- | --- | --- |
| Farm cart | 道路西侧中央，车头朝东 | 面向路障和上坡 | 车头距路障约 5m |
| Daichi | 车头西南侧 | 先看 Officer；R02 先指老人再指右后上坡 | 距 Officer 约 4m；老人被车头/栏杆部分遮挡 |
| Officer | 路障东侧偏南 | 先看 Daichi，R03 转向东南天空，R05 向右后上坡挥手 | 交通棒始终在右手 |
| Elders | 农用车后部车斗 | 朝前或侧前，动作错峰 | 始终留在车斗内 |
| Barricade | 道路东侧横向 | 横切道路主轴 | R05 只打开一处可读缝隙 |
| Uphill exit | Officer 身后右侧 | 所有指向和放行手势的终点 | 不与西侧来路镜像混淆 |

## 机位

| Camera | Shot | Position | Direction | Frame lock |
| --- | --- | --- | --- | --- |
| C1 | P455 / R01 | 农用车前左约 3m，离地 1.35m | 东北 | 左前景护栏窄边、下方路障横线、左中 Daichi/车头、右中 Officer、后景老人和上坡 |
| C2 | P455 / R02 | Daichi 右前约 1.8m，离地 1.5m | 东北 | Officer 肩部右前景窄边；Daichi 居中；老人和上坡落在手势两端 |
| C3 | P456 / R03 | Daichi 左肩后约 2.2m，离地 1.55m | 东 | Daichi 肩线左前景窄边；Officer 双眼中右；碎片只作视线上方小亮点 |
| C4 | P456 / R04 | Officer 右腰外约 0.7m，离地 1.05m | 东北 | 只锁右手、握柄和虚化路障横线 |
| C5 | P456 / R05 | 农用车前左约 3m，离地 1.4m | 东北 | Officer 在右、Daichi/车头在左、老人左后、上坡右后形成开放通道 |
