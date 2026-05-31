# 项目锁定要素

## 全局锁定

### 必须保留 (Must Keep)
- 当前故事阶段以 `deliverables/10_story/01_script_v10.md` 为基线脚本。
- 当前目标是用 Screenwriter workflow 从公开剧情资料写出一个《你的名字。》功能级长片剧本练习稿，并与用户上传的 `deliverables/10_story/Your-Name-Screenplay.pdf` 做任务级结构/质量对比。
- 上传 PDF 已识别为 fan-made rewritten screenplay，不是已验证官方原版剧本；可用于用户提供的对照分析，但不能当作官方台本证明或台词复制来源。
- 原作/对照稿对比是当前任务级工作，不写入可复用 `screenwriter-workflow` skill。
- 《星之声》用户提供材料已形成任务级源剧本文档摘要：`deliverables/10_story/01_source_script_summary_hoshi-no-koe_v1.md`，以及完整字幕转写剧本文档：`deliverables/10_story/01_source_transcript_hoshi-no-koe_v1.md`。其 DVD VobSub OCR 可用于结构/密度/节奏对照；OCR 文字未经逐字人工校对，不能作为可直接混入原创改写的台词来源。
- `/Users/miniled/Downloads/voices-of-a-distant-star_compress.pdf` 当前只视为英文网页转写辅助材料，不作为已验证官方台本证明。
- 每次新脚本版本必须先有对应审计判断：结构、情感功能、motif payoff、runtime density、copyright distance。
- 标准剧本格式 `.docx` 只能作为 Markdown 剧本通过质量门后的派生输出；当前派生输出为 `deliverables/10_story/01_script_v10_standard_screenplay.docx`。
- 《星之声》练习线的重写稿必须用区分文件名保存；当前分支稿为 `deliverables/10_story/01_script_delayed-blue_v7.md`，不是通用 `01_script_v11.md`。

### 必须避免 (Must Avoid)
- 不修改 `.agents/skills/`、`.agents/skill_registry.md` 或 workflow 规则来完成本次对比任务。
- 不复制、翻译或重构上传 PDF 的台词、精确场景措辞、镜头描述、歌曲 cue 或独特表达。
- 不声称上传 PDF 是官方原版剧本。
- 不把上传 PDF 误判为官方原版剧本；v10 已通过当前结构对照门槛并导出 DOCX，但后续若继续 polish，应以 `01_script_v10.md` 为源文件。
- 不把《星之声》练习线写成通用下一版 `01_script_v11.md`，避免和当前 `Your Name.` 线混淆。

### 预算限制 (Budget Notes)
- 目标时长: 当前基线目标 107 分钟；v10 估算约 107 分钟，约 102 个 scene/transition units，并已通过 `01_audit_report_v10.md` 的 DOCX 导出门槛。
- 《星之声》分支目标时长: 22-24 分钟；`01_script_delayed-blue_v7.md` 估算约 23:35。
- 预算范围: 未指定。
- 技术限制: 原版详细对比受合法来源取得情况限制；当前只允许公开元数据层面的高层 craft comparison。

---

更新时间: 2026-05-31
