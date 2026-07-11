# Artifact: QA Report
- id: A-20260711-004
- version: v1
- upstream: [A-20260530-004, A-20260628-001, A-20260711-001, A-20260711-002, A-20260711-003]
- locks:
  - must_keep:
    - Preserve the selected v10 scene order and all 23 source dialogue lines.
    - Keep Shot Row IDs distinct from Prompt Envelope IDs.
    - Keep the v2 package at `prompt_only` until media is actually generated and reviewed.
  - must_avoid:
    - Do not promote generated-from-text references to locked production identity.
    - Do not reuse P377-P428 for active v2 prompts.
  - budget_notes:
    - Regression scope: scenes 078-085 and 096-098.
    - Prompt Envelope duration: 15 seconds, 21:9.

---

# QA 报告: Shotlist Workflow v2 回归
- 日期: 2026-07-11
- 范围: `03_shotlist_breakdown_v2.md`、`scenes-078-085_096-098_v2/`、P429-P451
- 结果: pass-with-warnings

## 问题清单

| 优先级 | 文件 / ID | 问题 | 证据 | 建议修复 | 状态 |
| --- | --- | --- | --- | --- | --- |
| P1 | `scene-081` / P433-P434 | 初次重跑漏掉 Officer 封路台词，拆解表也未登记 Daichi 回应 | 源剧本保真检查首次报 4 个错误 | 已修复生成器并增加 Shot Row、Breakdown、Prompt 三层对白断言 | 已解决 |
| P1 | scene hierarchy | 初次重跑把 078/079、096/097 合并为 HTML section，弱化源场景追踪 | 11 个源场景只有 10 个 section | 已恢复独立场景段；仅允许 scene-098 因动作阶段过载拆为两个子段；验证器拒绝 section 少于源场景 | 已解决 |
| P1 | reusable shotlist Skill | 旧规则含项目专名、摄影师姓名捷径和重复微表演模板 | 复用合同扫描与 Prompt 内容检查 | 已改为项目无关规则，并让验证器拒绝同类回归 | 已解决 |
| P2 | `generated_ref_v1/` | 22 张参考图均由文本生成，人物身份未达到生产锁定级 | `reference_approval: draft` | 生产前由资产指南审核并提升为 `locked` | 待生产阶段处理 |
| P2 | A-20260711-002 | 本轮没有生成线稿预览或新视频 | `output_status: prompt_only` | 选定 5-8 条 Prompt 小批量生成，通过视觉 QA 后再扩大 | 待生产阶段处理 |
| P3 | HTML 移动端 | 宽表格在 390px 视口需要容器内横向滚动 | 页面无全局溢出，`.table-wrap` 保持内部滚动 | 当前可接受；若移动端成为主审阅端，可另做折叠详情视图 | 接受 |

## 分类结论

| 分类 | 结论 |
| --- | --- |
| 结构 | 通过。11 个源场景映射到 12 个 HTML 场景段（scene-098 按动作阶段拆为两个子段）、52 条 Shot Row、23 条 Prompt Envelope；Row ID 唯一且使用所属场景前缀，Prompt 预留为 P429-P451。 |
| 源剧本保真 | 通过。选定场景 23/23 句对白均进入唯一 Shot Row、Breakdown 和唯一执行 Prompt。 |
| 空间连续性 | 通过回归级检查。12 个场景段均有主视轴、人物/道具位置、距离和机位族；`blocking_approval` 仅为 `approved_for_test`。 |
| Prompt 可执行性 | 通过。每条声明 15 秒与 21:9；multi-shot 为 2-5 个有时长的内部镜头，时长区间可解为 15 秒；边界和下一 beat 明确。 |
| Reference Status | 通过。四字段状态一致：`generated_from_text` / `images_attached` / `draft` / `prompt_only`。 |
| HTML 行为 | 通过。搜索、镜头筛选、重置、复制、空状态均有效；桌面和 390×844 视口无页面级横向溢出；控制台无 warning/error。 |
| 平台生产风险 | 尚未验证实际 Seedance 输出，因此不能判断身份漂移、物理动作、口型或转场的最终视觉质量。 |
| 创作口味建议 | 先生成 P429-P433 或另一组连续 5 条作为小批量样本；通过后再扩大，避免一次性提交 23 条。 |

## 验证证据

```text
node .agents/skills/qa-workflow/scripts/validate-workflow.js --repo .
=> 0 errors, 0 warnings

node .agents/skills/qa-workflow/scripts/validate-workflow.js --repo . --slot shotlist.primary --candidate .agents/skills/sketch-shotlist-workflow
=> 0 errors, 0 warnings

node .agents/skills/qa-workflow/scripts/validate-workflow.js --repo . --project ../test --package deliverables/30_shotlist/scenes/scenes-078-085_096-098_v2
=> 0 errors, 0 warnings

node ../test/tools/verify_shotlist_regression_v2.js
=> 0 errors, 0 warnings

pnpm test
=> clean rebuild + package validation + source-fidelity validation passed

clean fixture replay (no v1, archives, or v2 output)
=> initial build passed; unsafe overwrite was refused; --refresh passed
```

## 下游影响

| 变更 artifact | 受影响 artifact | 必要动作 |
| --- | --- | --- |
| A-20260628-001 v2 | A-20260711-001 | 任何 Row 分组或对白变更后重新运行 build + validate + fidelity check |
| A-20260711-001 | A-20260711-002 | 真正生成预览后更新 manifest 路径与 `output_status` |
| `generated_ref_v1/` | 后续视频生成 | 生产前完成身份/服装/道具审核并决定是否提升为 `locked` |
