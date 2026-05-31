# 剧本迭代阶梯

Default rendered ladder language: Simplified Chinese unless the user explicitly requests another language. Keep file paths, artifact IDs, version suffixes, and fixed decision tokens unchanged.

Use this template when planning or recording a multi-version screenplay iteration. Each version should advance one layer only. A loose concept must pass `Story Bone` before any full script draft.

## 项目目标

- 剧本路径:
- 目标格式: short / feature / episode / scene block
- 目标时长:
- 当前 source truth:
- Story Bone 状态: missing / inferred_unconfirmed / confirmed
- 主引擎:
- 对比材料状态（如有）:

## 迭代层级

| 层级 | 目的 | 必要证据 | 停止条件 | 下一步可能决策 |
| --- | --- | --- | --- | --- |
| Story Bone | 锁定一句话、主角、欲望、为什么现在、最大阻力、中段不可逆变化、最后代价、结尾状态、不要写成什么、目标时长/类型/语气。 | `story-bone-intake.template.md`，每项标明 user_provided / inferred / missing，主引擎清楚。 | `ready_for_structure: yes`。 | `revise_structure` 或进入 `Structure Draft` |
| Structure Draft | 证明故事脊柱、主角欲望、危机、高潮和结局成立。 | Logline、controlling idea、时长图、主要转折、能动性链。 | P0/P1 脊柱和因果通过。 | `expand_density` |
| Density Draft | 把宽泛功能拆成可表演场景。 | 日常生活、关系积累、配角压力、障碍、动作细节、场景/转场数量。 | 剧本不再像 treatment；密度目标达到或偏差有理由。 | `cut_runtime` 或 `polish_dialogue` |
| Runtime Draft | 在不删除核心转折的前提下回到目标时长。 | 删减清单、受保护节拍、时长变化、危机/高潮/认知/motif payoff 不丢失。 | 时长在目标内或偏差有理由。 | `polish_dialogue` |
| Dialogue/Texture Draft | 改善生活质感、普通反应、沉默、未说出口的话、对白身份、动作行经济性和场景可读性。 | 三条说话约束、弱 cue 清单、过聪明对白、过长动作行、安静节拍、情绪回避方式。 | P0/P1 通过，P2 问题可接受。 | `export_docx` |
| Export Candidate | 只在质量门通过后生成派生交付物。 | 完整 iteration quality gate、当前审计、changelog/archive 状态。 | DOCX 或 handoff artifact 已生成并记录 QA notes。 | `hold_current` |

## 当前诊断

- 当前层级:
- 主要失败点:
- 次要备注:
- 结构漂移风险:
- 禁止改动:
- 受保护节拍:

## 下一版本简报

- 决策: `revise_structure` / `expand_density` / `cut_runtime` / `polish_dialogue` / `export_docx` / `hold_current`
- 新版本目标:
- 要处理的场景或段落:
- 预期时长变化:
- 预期密度变化:
- 是否需要 audit report: yes / no
- 本轮后是否允许 DOCX export: yes / no

## 过往版本备注

| 版本 | 决策 | 主要理由 | 已改内容 | 剩余阻碍 |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
