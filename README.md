# AI 导演工作台

一个中文优先、Local-first 的 macOS 影视前期工作台。它把原有的文件型
AI Video Agent 工作流产品化，同时继续把 `.agents/skills` 作为创作判断的
唯一核心来源。

```text
剧本 → 结构拆分 → 资产 / 风格 → 分镜拆解
     → Shot Row → Prompt Envelope → 分镜草稿 → QA / 导出
```

当前技术预览已经实现草稿图入口和确认界面，但实际图片调用暂时禁用，等待计费前
授权与文件隔离完成；应用不会自动触发，也不会静默切换计费来源。用户 Skill 可以
导入、复制和绑定，执行则同样等 OS 读取沙箱完成后开放。最终视频生成不在首版范围内。

## 开发运行

需要 Node.js 22.16+ 与 pnpm 11：

```bash
pnpm install
pnpm dev
```

常用检查：

```bash
pnpm typecheck
pnpm test:run
pnpm build
pnpm verify
pnpm package:mac:arm64
```

`pnpm verify` 会依次完成类型检查、自动测试和正式构建。第一次开发 App 请先阅读
[DEVELOPMENT.md](DEVELOPMENT.md)，其中说明了源码、开发预览、安装版、项目数据与
`release/` 的区别。

`pnpm package:mac:arm64` 会先在系统临时目录完成加固与签名，再把 DMG 复制到
`release/`，避免 `Documents` 目录的扩展属性破坏签名。本地默认使用 ad-hoc
签名；公开分发时通过 `AI_DIRECTOR_SIGN_IDENTITY` 指定 Developer ID，并完成
Apple 公证与商业合规材料。

## 工程结构

- `apps/desktop`：Electron Main、受限 Preload、React 工作台和 DMG 配置。
- `packages/domain`：项目、剧本、分镜、Prompt、任务、QA、Revision 契约。
- `packages/storage`：每项目 `.ai-director/project.db`、WAL、快照与失效传播。
- `packages/agent-runtime`：本机 Codex App Server、流式任务、锁与隔离运行。
- `packages/skill-runtime`：Skill Manifest、校验、安全导入、版本固定与迁移。
- `packages/import-export`：剧本导入预览和生产资料导出。
- `.agents/skills`：现有核心 Skill Pack 源。

技术与发行验证记录见 [docs/phase-0-validation.md](docs/phase-0-validation.md)。
前端组件的 shadcn/ui 渐进迁移见
[docs/shadcn-migration-plan.md](docs/shadcn-migration-plan.md)。

## 文件工作流兼容入口

- `AGENTS.md`：主控 Agent 的生产规则
- `apps/desktop/AGENTS.md`：桌面产品开发、安全和 UI 规则
- `DEVELOPMENT.md`：面向初学者的开发、预览、测试和打包说明
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
- Agent 只能写候选操作；用户接受后才创建新 Revision。
- 上游变化只标记下游需要检查，不自动覆盖或重生成。
- 项目绑定精确的 Skill 版本与内容哈希。
