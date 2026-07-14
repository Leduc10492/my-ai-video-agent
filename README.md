# My AI Video Agent

一个以主控 Agent、Skills 和少量可选 Sub Agents 组成的 AI 影片前期生产工作流。

```text
剧本 -> 分镜拆解 -> Shot Row -> Prompt Envelope -> 中文 HTML
```

需要人物、地点或风格参考时，在分镜前补充 `deliverables/20_assets/`。图片和视频生成不属于默认最小闭环，必须由用户单独授权。

## 核心入口

- `AGENTS.md`：主控 Agent 的生产规则
- `.agents/skill_registry.md`：Skill slot 映射
- `.agents/skills/`：实际生产能力
- `.codex/agents/`：用户明确委派时使用的 Sub Agent 边界
- `deliverables/`：当前项目产物

## 核心原则

- 分镜先服务观众体验，再考虑 AI 打包。
- Shot Row 与 Prompt Envelope 分离。
- 15 秒是生成上限，不是填充目标。
- 不使用硬编码 fixture 代替 Skill 运行。
- QA 检查真实产物，不用结构通过冒充创作质量。
