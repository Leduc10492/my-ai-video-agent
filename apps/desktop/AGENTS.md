# AI 导演工作台桌面工程规则

本目录是 Electron + React + TypeScript 的 macOS 桌面应用。它把仓库根目录的影视
生产原则实现为可编辑、可追溯、由用户确认后写入的本地产品。

## 技术边界

- Electron Main 负责项目文件、SQLite、凭证、Codex 进程和系统权限。
- Preload 只暴露固定、类型化的 IPC 方法。
- Renderer 必须保持 sandbox、context isolation，并关闭 Node integration。
- Renderer 不得直接读取文件系统、API Key、Codex 凭证或数据库。
- 所有 Renderer 输入在 Main 再次经过 Schema 校验。
- Agent 只能返回候选 Draft；用户接受后才能写正式 Revision。

## 产品不变量

- 剧本是上游事实源，下游产物必须可追溯到具体 Revision。
- Shot Row 与 Prompt Envelope 是独立实体；重新编组只能修改 Link。
- 上游变化只标记下游需要检查，不静默覆盖或自动生成。
- 图片生成必须由用户主动确认数量和计费通道。
- 用户 Skill 在 OS 读取隔离完成前不能执行。
- 不能把创作判断硬编码成 fixture 或脚本规则。

## 前端与 shadcn

- shadcn/ui 是目标组件基础，不是新的视觉品牌。
- 保留现有深绿、暖金、编辑台密度、中文排版和 Phosphor 图标语言。
- 迁移必须逐个工作流进行，不能一次性重写 `App.tsx`、`views.tsx` 或全局 CSS。
- 优先替换 Button、Dialog、Field、Select、Tabs、Switch、Tooltip、Scroll Area 等基础件；
  剧本编辑器、Shot Row、Envelope 编组和 Agent 审批仍是产品组件。
- 运行 shadcn CLI 前先提交 Git，并优先使用 `--dry-run` 或 `--diff` 检查写入范围。
- shadcn 生成的组件代码属于本仓库，可以修改；不要直接改 `node_modules`。
- 主题必须通过语义化 CSS 变量表达，不在业务组件中散落品牌颜色。

## 日常开发

```bash
pnpm dev
pnpm typecheck
pnpm test:run
pnpm build
pnpm verify
```

- `pnpm dev` 打开独立开发窗口，数据位于
  `~/Library/Application Support/@ai-director/desktop-dev`。
- 开发窗口可以热刷新，但 Main、Preload、权限和文件行为仍需重启验证。
- 不直接修改 `out/`、`release/` 或 `/Applications` 中的 `.app`。
- 不同时让两个写入者修改同一组件或同一业务范围。

## 完成标准

每次功能改动至少满足：

1. 类型检查通过；
2. 相关自动测试通过；
3. 正式构建通过；
4. 在真实 Electron 窗口完成核心路径手动检查；
5. 没有破坏 Renderer/Main 安全边界；
6. 说明修改内容、测试结果和仍需人工检查的项目；
7. 稳定后创建 Git 提交。

公开发行前还必须验证签名、公证、DMG、升级、数据库迁移与崩溃恢复。
