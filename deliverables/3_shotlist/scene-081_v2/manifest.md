# Artifact: Scene Shotlist Package
- id: A-20260719-005
- version: v2
- upstream: [A-20260530-004, A-20260719-001, A-20260719-002, A-20260719-003, A-20260719-004, A-20260719-007]
- locks:
  - must_keep:
    - scene-081 / L1834-L1849 / three Shot Rows / two Prompt Envelopes / 5s each / 21:9
    - Preserve both source dialogue lines and their speaker/addressee order.
    - Preserve approved assets, camera side, blocking and cart-front-wheel endpoint.
  - must_avoid:
    - No image/video generation; no overwrite of v1; no automatic production acceptance.

---

# Scene 081 · CINEDANCE 重跑 v2

- source_script: `../../../../test/deliverables/1_story/01_script_v10.md`
- source_audit: `../../../../test/deliverables/1_story/01_audit_report_v10.md`
- source_sha256: bdab7109d8cd66837a405c8b655ba4260671bebb3ee49549ffc2cb454602f3e4
- source_lines: L1834–L1849
- source_selection: 用户指定的旧 Scene 081，未登记的既有来源；经哈希和同版审计复核，不按最大版本号推断。
- breakdown: `03_shotlist_breakdown_scene-081_v2.md`
- html: `Shotlist_scene-081_ZH_v2.html`
- html_sha256: 564dc2af9f38227d555eec695ac7a9f9eb796089419f8fd296cc972a0a598ea4
- comparison_html: `Prompt_comparison_scene-081_ZH_v2.html`
- compiled_prompt_set: `compiled_prompts.json`
- previous_html: `../../../../test/deliverables/3_shotlist/scene-081_v1/Shotlist_scene-081_ZH_v1.html`
- previous_html_sha256: 39c4973aa7e296ab156ce9b0bbaa9f3ae8dda21edf99cdca7f867228c8751b6b
- asset_manifest: `../../../../test/deliverables/2_assets/generated_ref_v1/manifest.md`
- spatial_blocking: `../../../../test/deliverables/3_shotlist/scene-081_v1/spatial_blocking.md`
- prompt_compiler_slot: shotlist.prompt_compiler
- prompt_compiler: cinedance
- prompt_compiler_skill: `../../../.agents/skills/cinedance/SKILL.md`
- prompt_compiler_skill_sha256: 2172a63b3a4143ceb19caccf3a21255b2dd29930a96b3f436a1fd94e30f83fb2
- html_assembler: shotlist-html-assembler
- asset_origin: generated_from_text
- reference_binding: none
- reference_approval: locked
- output_status: prompt_only
- preview_generation: not_authorized
- video_generation: not_authorized
- interaction_mode: interactive
- shot_row_count: 3
- prompt_envelope_count: 2
- prompt_ids: P001, P002
- source_dialogue_count: 2

## 映射

| Prompt | Source Rows | 标签 | 时长 | 台词 |
| --- | --- | --- | --- | --- |
| P001 | scene-081-R01, scene-081-R02 | @image1 @image2 @image3 @image4 @image5 | 5s | OFFICER → DAICHI；DAICHI → OFFICER |
| P002 | scene-081-R03 | @image1 @image2 @image3 @image4 | 5s | 无对白 |

## 范围、来源与限制

- 本次从原剧本L1834–L1849、同版审计、已批准Breakdown、资产及风格指南重新编译，不复用旧Prompt作为新编译结果。
- 旧版整个Scene目录、剧本、审核、指南和五张参考在本次前后进行SHA-256对照；原文件保留原位，没有搬运素材。
- 参考图已实际查看：人物裁切不含双手；Officer图提供身份和红色棒状道具外形，燃烧由剧本指定；老人图包含不同座位，当前驾驶位/货斗位置由已批准调度指定；外套图只作材质辅助。
- 继承2026-07-19的素材职责、站位与两段拆分批准。本次仅本地编译，没有平台上传，因此不沿用旧包的images_attached声明；标签顺序仍保留为后续上传映射。
- 两句对白保留原文、对象、顺序与口型镜头；无新增台词。未把旧compiler自行附加的环境音清单当作授权。
- P002仍是5秒内完成判断、放行、起步的紧凑段落；文字检查不证明实际模型能可靠执行。实际时长、口型、手部与车辆连续性需另行生成验证。
- 未初始化模板项目的workflow_state.json，也未改写既有生产版本选择；此包为用户指定历史场景的对比重跑。

## 编译结果哈希

- P001: f5d37eb90fdb16d4cca0fa3df6ca40b14bf9babbe91c3b0a00aba6f00c2c5279 (997 chars)
- P002: 3276cb16a3e94667d9f065d38c879b9e4b65761861b447e2e21700e9f8547d51 (756 chars)

## 既有输入保留校验

- `../../../../test/deliverables/3_shotlist/scene-081_v1/03_shotlist_breakdown_scene-081_v1.md`: 6c9ae1b677118d6d4b33c4f510a953a3e597e1481a9f424107679652c536f675
- `../../../../test/deliverables/3_shotlist/scene-081_v1/Prompt_comparison_scene-081_ZH_v1.html`: 0769ce95466864314e8b79937275623720c3b9007864ce50cf502b63290cbed2
- `../../../../test/deliverables/3_shotlist/scene-081_v1/Shotlist_scene-081_ZH_v1.html`: 39c4973aa7e296ab156ce9b0bbaa9f3ae8dda21edf99cdca7f867228c8751b6b
- `../../../../test/deliverables/3_shotlist/scene-081_v1/spatial_blocking.png`: 3cc53b7e18e63aeebd85d4883b4d3d2dccef003ed8b32b45dadc73a78b9a77b0
- `../../../../test/deliverables/3_shotlist/scene-081_v1/manifest.md`: 39b81e269674c62bfd98af27a2aed1837eb53638fa83403a3c7211a25801e4c6
- `../../../../test/deliverables/3_shotlist/scene-081_v1/spatial_blocking.md`: 5c3d73659a1039d599160380d5c870659f265bdab1e751c4b8ed0e189c4f0b7f
- `../../../../test/deliverables/3_shotlist/scene-081_v1/spatial_blocking.svg`: 85a34be1692e377e7d24d476eae055c0dfa50c81e985e21d369397881a93cd28
- `../../../../test/deliverables/3_shotlist/scene-081_v1/attempts/t2v_invalidated/Shotlist_scene-081_ZH_v1.html`: 2fd39e80b504dce2aa6a81184427236d808c5acf8cb536f1c4071b83d6d1e754
- `../../../../test/deliverables/1_story/01_script_v10.md`: bdab7109d8cd66837a405c8b655ba4260671bebb3ee49549ffc2cb454602f3e4
- `../../../../test/deliverables/1_story/01_audit_report_v10.md`: 7782a9d5419fd78d9d238cf6cbc34fe24d0bde7cde41d915a036191737764d56
- `../../../../test/deliverables/2_assets/02_asset_guide_v1.md`: ab70ca1733a187b1e6e473c730dbd2af2a8c659d11c73b17bebefd8717a5e5a6
- `../../../../test/deliverables/2_assets/02_style_guide_v1.md`: 82df42d99b993f6e3a95577b5a880175de348ff11f58e64ca4089b48844b0934
- `../../../../test/deliverables/2_assets/generated_ref_v1/daichi_identity_crop.png`: cc04a003e6422b063a50b12d088656d0b601588e6f506151930bd2f89d503151
- `../../../../test/deliverables/2_assets/generated_ref_v1/police_officer.png`: ef887020caf29ea9fa9c5a56d399cd3554b362924a3c6d0be13a15465a09b56e
- `../../../../test/deliverables/2_assets/generated_ref_v1/elders_cart.png`: 73411404ec21311836e94fbbc479369ce7be3da11216ac6d85b9384939caf5a3
- `../../../../test/deliverables/2_assets/generated_ref_v1/nagi_bridge.png`: 085e0f888f6cdda9e391fd510d77b652331b25c4117d9acbf4c729d357d29475
- `../../../../test/deliverables/2_assets/generated_ref_v1/daichi_jacket_hand_state.png`: 56a2aa9cda9662508030b51d9040a2c5c6e74cdfbbd39fd5c8d63be46c8677c2

## 本轮已执行验证（2026-10-11）

- 项目验证：`pnpm validate` 通过，18 Skills / 7 Node scripts；`git diff --check` 通过。
- 独立源稿检查：98场中本次只打包Scene 081，3 Rows / 2 Prompts / 2句源对白，0 error；1条范围warning对应其余97场未纳入本次任务。
- 负向验证：临时副本删改第二句Prompt对白时，独立校验器以`dialogue-prompt-missing`正确拒绝；临时副本已清理。
- 原文件保留：上述17个旧Scene文件、剧本、审计、指南与参考图的SHA-256均未变化。
- 中间结果一致性：`compiled_prompts.json` → HTML显示文字 → 对比页新版文字逐字一致；对比页旧版文字与原v1逐字一致。相对链接存在，HTML无占位符，内联JavaScript语法通过。
- 真实浏览器：通过本机HTTP打开新版和对比页，检查可见排版。搜索第二句对白时R01/R02整组保留；选择MCU时仅R03可见；重置恢复。两个复制按钮的实际剪贴板文字与对应Prompt显示文字完全一致（997 / 756字符）。
- 浏览器截图：`../../../output/browser/scene-081-comparison-v2.jpg`，仅为页面检查截图，不是分镜图生成。
- 尚未验证：打印/PDF交互、窄屏适配、实际生成的口型/空间/连续性以及用户对新版的接受。本次未调用图片或视频生成。
