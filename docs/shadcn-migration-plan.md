# AI 导演工作台 shadcn/ui 迁移计划

## 目标

把 shadcn/ui 引入为 Renderer 的基础组件、可访问交互和主题系统，同时保留当前产品的
深绿、暖金、编辑台密度、中文排版和影视工作流结构。

这不是一次视觉重做，也不会把产品改成默认 SaaS Dashboard。剧本编辑器、Shot Row、
Prompt Envelope、Agent 审批和 Skill 管理仍由产品组件负责。

## 当前基线

- React 19 + TypeScript + Electron Vite。
- `styles.css` 约 2,500 行。
- 已有 Button、IconButton、Badge、Modal、Field、Toggle、Segmented、Meter 等自定义基础件。
- Dashboard、Script、Assets、Breakdown、Storyboard、Tasks、QA、Skills 七个主要界面。
- 使用 Phosphor Icons，已有深绿与暖金视觉语言。
- Renderer 受 Electron sandbox、CSP、Preload 和 IPC 安全边界约束。

## 已锁定的技术方向

1. 在现有 Vite Renderer 中渐进接入，不创建新的 Web App，也不重写 Electron Main。
2. 使用 Tailwind CSS v4 与 `@tailwindcss/vite`，插件只挂到 Renderer 构建。
3. 使用 shadcn CLI v4、TypeScript、CSS Variables、`rsc: false`。
4. 默认采用 `radix-mira`：Radix 作为交互原语，Mira 适合高密度工作台。
5. 品牌颜色使用 OKLCH 语义 Token，不在业务组件散落具体颜色值。
6. 继续使用 Phosphor 作为产品图标语言；CLI 生成的内部图标逐项归一，不并行维护两套视觉语言。
7. 首轮组件保留在 `apps/desktop`。只有出现第二个前端消费者时才抽取 `packages/ui`。
8. shadcn 代码进入仓库后由项目所有，不直接修改 `node_modules`。

## 推荐目录

```text
apps/desktop/
  components.json
  src/renderer/src/
    components/
      ui/                 # shadcn 基础组件
      product/            # 剧本、分镜、Agent 等产品组件
    lib/
      utils.ts            # cn()
    styles/
      globals.css         # Tailwind 与 shadcn 基础层
      tokens.css          # AI 导演语义 Token
      legacy.css          # 迁移期间保留的旧样式
```

现有 `components.tsx` 在迁移期作为兼容适配层，避免一次改动所有业务界面。

## 组件映射

| 当前能力 | shadcn 基础 | 产品层处理 |
| --- | --- | --- |
| Button / IconButton | Button、Tooltip | 保留导演工作台尺寸和 Phosphor 图标 |
| Badge | Badge | P0–P3、状态和过期标记使用语义 Variant |
| Modal | Dialog / Alert Dialog | 新建项目、导入、删除和计费确认分开 |
| Field | Field、Label、Input、Textarea、Select | 保留中文错误与帮助文本 |
| Toggle | Switch | Skill 启停和设置状态 |
| Segmented | Tabs / Toggle Group | 阶段切换、资产筛选和视图模式 |
| Meter | Progress | 项目进度与 Agent 运行进度 |
| 自定义滚动区 | Scroll Area | 项目树、剧本、Agent 面板 |
| 自定义菜单 | Dropdown Menu / Context Menu | 项目动作、镜头动作和版本动作 |
| 自定义侧栏 | Resizable / Collapsible / Tooltip | 保留 macOS 拖拽区与三栏布局 |
| 自定义提示 | Alert / Sonner | 保存、失败、过期和恢复反馈 |
| 表格布局 | Table，必要时再接 Data Table | Shot Row 和 Envelope 仍是业务组件 |

## 分阶段实施

### 0. 规则与基线（已完成）

- 补齐根目录与桌面 App 的 `AGENTS.md`。
- 增加新手开发、预览、测试、打包和数据隔离说明。
- 保存当前 Dashboard、项目工作台、设置页的视觉基线。

退出条件：新开发者能分清源码、开发预览、安装版、项目数据和 `release/`。

### 1. shadcn 基础设施（0.5–1 天）

- 新建独立功能分支和迁移前 Git 检查点。
- 为现有 `apps/desktop` 配置 Tailwind v4、alias、`components.json` 和 `cn()`。
- 用 CLI `--dry-run` 检查将写入的依赖与文件。
- 建立 `tokens.css`，映射当前背景、前景、边框、强调色、状态色、圆角和阴影。
- 先安装 Button、Badge、Separator、Tooltip、Skeleton。

退出条件：正式界面视觉不变；开发热刷新、生产 CSP、类型检查和正式构建通过。

### 2. 基础组件兼容层（1–2 天）

- 让现有 Button、IconButton、Badge、Meter 逐步转为 shadcn 封装。
- 保持旧 Props，先减少业务文件改动。
- 为主要 Variant、尺寸、禁用、焦点和键盘状态增加组件测试。

退出条件：Dashboard 和顶栏无视觉回退，旧调用点无需一次性重写。

### 3. 对话框、表单与反馈（1.5–2.5 天）

- 迁移 Dialog、Alert Dialog、Input、Textarea、Select、Switch、Tabs、Popover。
- 增加 Sonner，统一成功、失败和可恢复错误反馈。
- 检查焦点锁、Esc、回车提交、表单错误、危险动作二次确认。

退出条件：新建项目、导入剧本、Skill 设置和 API Key 设置完整可操作。

### 4. 桌面工作台外壳（1.5–2.5 天）

- 迁移 Scroll Area、Collapsible、Tooltip 和 Resizable Panels。
- 保留 macOS traffic lights、窗口拖拽区、最小宽度和三栏布局。
- 为窄窗口、侧栏折叠和 Agent 面板状态做手动回归。

退出条件：项目树、主编辑区和 AI 导演面板在常用窗口尺寸下稳定。

### 5. 业务工作区迁移（3–5 天）

按风险从低到高迁移：

1. Assets、Tasks、QA；
2. Breakdown、Skills；
3. Script；
4. Storyboard、Shot–Envelope 编组和 Prompt Inspector。

业务组件不直接依赖品牌色值，只组合语义化 shadcn 组件和产品 Token。

退出条件：Shot Row 数量、Envelope 映射、原文追溯和 Agent 候选审批均未改变。

### 6. 清理与发行回归（1–2 天）

- 删除无引用的旧 CSS，把保留样式按 token、基础层和产品组件拆分。
- 运行全部类型检查、测试、正式构建、DMG 校验和真实窗口回归。
- 检查开发版与正式版数据隔离、键盘导航、对比度和屏幕阅读器标签。
- 更新组件清单与后续添加组件的 CLI 规则。

退出条件：没有双套基础组件、没有未使用样式、正式安装版核心流程通过。

## 总体排期

单人连续实施约 8–13 个工程日。建议按阶段提交，每一阶段都保持 App 可运行，避免
建立一条持续数周、无法体验的“大迁移分支”。

## 主要风险

- Tailwind Preflight 会影响现有 2,500 行 CSS：必须以视觉基线逐屏回归。
- shadcn CLI 写入的是源码，升级可能覆盖本地改动：运行前提交，升级时使用 `--diff`。
- Electron 的窗口拖拽区与 Radix Portal 容易发生点击冲突：Overlay 必须处于 `no-drag` 区域。
- Dialog、Popover、Select 的 Portal 需要在 CSP 和打包后的 `file://` 环境验证。
- 不能为了组件统一而重写剧本、分镜或 Agent 状态逻辑。
- 迁移期间两套组件共存时间要短，并通过兼容层控制范围。

## 验收清单

- Dashboard、新建项目、导入、剧本、资产、拆解、分镜、QA、任务和设置可用。
- 键盘 Tab、Shift+Tab、Esc、Enter 与焦点恢复正确。
- 深色主题、品牌色、中文字体和 macOS 窗口行为与基线一致。
- Renderer 仍无 Node 权限，IPC 与 CSP 没有因组件库放宽。
- `pnpm verify` 通过，开发预览与正式构建均经过真实窗口检查。
- Shot Row 与 Prompt Envelope 重新编组不改变镜头内容。

## 官方依据

- [shadcn/ui Vite 安装](https://ui.shadcn.com/docs/installation/vite)
- [shadcn/ui Monorepo](https://ui.shadcn.com/docs/monorepo)
- [components.json](https://ui.shadcn.com/docs/components-json)
- [shadcn CLI](https://ui.shadcn.com/docs/cli)
- [Tailwind CSS v4](https://ui.shadcn.com/docs/tailwind-v4)
- [Vite Dark Mode](https://ui.shadcn.com/docs/dark-mode/vite)
- [Tailwind Vite 安装](https://tailwindcss.com/docs/installation/using-vite)
