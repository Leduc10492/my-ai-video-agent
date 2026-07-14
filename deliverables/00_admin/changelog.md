# Changelog

## 2026-07-14 — 精简工作流

- 移除硬编码 layered fixture、回归 builder、validator 和 contract tests。
- 移除固定 `3 Beat / 5 Shot Row / 5s+7s+3s` 测试合同。
- 保留真实剧本、DOCX、共享参考图和旧分镜 HTML，供 scene081 质量比较。
- 当前生产目标恢复为主控 Agent 调用原有 shotlist Skills 生成中文 HTML。
- 用真实 scene081 重新运行最小闭环：保留 5 条导演 Shot Row，生成 P455（7秒）和 P456（5秒）两个因果 Prompt Envelope，总时长 12 秒。
- 新输出停在 prompt-only HTML；结构核对完成，创意质量等待用户对照旧版确认。
- 清除旧 Seedance 归档中的一次性请求、返回和等待日志，只保留成片、实际提示词、修订提示词与说明。
