# AI 导演工作台开发入门

这份说明面向第一次开发 App 的人。日常情况下，你只需要描述想修改的功能、在开发
窗口里体验结果，并告诉 Codex 哪里不符合预期。

## 先理解五样东西

| 名称 | 作用 | 是否是源码 |
| --- | --- | --- |
| `apps/desktop/`、`packages/` | 真正需要修改的程序代码 | 是 |
| 开发预览窗口 | 从源码临时运行的 App，方便边改边看 | 否 |
| `out/` | 编译产生的临时文件 | 否，可重新生成 |
| `release/` | DMG、ZIP 等安装包 | 否，可重新生成 |
| `/Applications/AI 导演工作台.app` | 当前安装使用的固定版本 | 否 |

不要直接修改 `.app`、`out/` 或 `release/`。所有正式改动都从源码开始。

## 第一次准备

需要 Node.js 22.16+ 和 pnpm 11。依赖只需在首次下载或依赖变化后安装：

```bash
cd "/Users/ridichan/Documents/AI Agent Test"
pnpm install
```

## 打开开发预览

```bash
cd "/Users/ridichan/Documents/AI Agent Test"
pnpm dev
```

几秒后会出现一个独立的 Electron App 窗口。终端要保持打开；停止时在终端按
`Control + C`，或者让 Codex“关闭开发预览”。

开发预览使用独立数据目录：

```text
~/Library/Application Support/@ai-director/desktop-dev
```

正式安装版继续使用：

```text
~/Library/Application Support/@ai-director/desktop
```

因此开发项目列表为空是正常的。开发版只使用测试项目，不导入唯一一份重要项目。

## 什么会自动刷新

- React 界面、文字、样式等多数 Renderer 修改会自动刷新。
- Electron Main、Preload、数据库、权限、菜单和系统文件操作应重启开发预览验证。
- 自动刷新失败、窗口全黑或状态异常时，停止后重新运行 `pnpm dev`。

即时预览不等于测试通过。它只让你快速看到当前修改。

## 推荐的每轮开发节奏

```text
描述一个明确修改
→ Codex 修改源码
→ 开发窗口刷新或重启
→ 你实际点击体验
→ 修复发现的问题
→ 自动检查
→ Git 提交
→ 阶段稳定后重新打包
```

一次尽量只完成一个可验证目标，例如“把新建项目对话框换成统一表单组件”，不要在
同一轮同时重做项目结构、视觉主题和 Agent Runtime。

## 检查命令

只检查类型：

```bash
pnpm typecheck
```

运行自动测试：

```bash
pnpm test:run
```

验证正式构建：

```bash
pnpm build
```

一次完成以上检查：

```bash
pnpm verify
```

自动检查之后仍要手动确认：窗口尺寸、点击路径、键盘焦点、拖拽、文件选择、项目恢复
以及错误提示是否符合人的预期。

## 生成最新版安装包

Apple Silicon Mac 使用：

```bash
pnpm package:mac:arm64
```

产物会出现在 `release/`。打包不会自动替换 `/Applications` 中正在使用的版本。
确认开发预览、自动检查和手动体验都通过后，再退出旧版并安装新 DMG。

本地闭测包使用 ad-hoc 签名。发给其他用户之前，还需要 Developer ID、Apple 公证、
正式图标、升级测试与发行合规检查。

## 项目数据与备份

每个创作项目的结构化数据位于项目目录中的：

```text
.ai-director/project.db
```

素材位于项目自己的 `assets/`，已批准导出位于 `deliverables/`。升级 App 不应删除
这些内容，但数据库结构变化必须先备份并提供迁移。

## Git 是恢复点

稳定修改应提交到当前功能分支。Git 提交记录源码，不记录 `out/`、`release/`、
开发数据或创作项目数据库。

如果一次改动影响大量组件，先创建提交，再运行会覆盖组件文件的 CLI。不要为了回退
一个界面问题删除整个项目目录。

## 常见问题

### 窗口全黑

通常代表 Renderer 没有成功渲染。先查看开发终端错误，再检查 DevTools 控制台、
Vite 地址和开发 CSP；不要通过关闭正式版安全策略来绕过。

### 为什么菜单栏显示 Electron

这是开发运行时的宿主名称，不代表安装了另一个产品。后续会增加明确的“开发版”标记。

### 为什么开发版没有正式项目

开发数据已经与正式数据隔离，这是为了防止测试代码破坏真实项目。

### `release/` 被删除了怎么办

它是生成目录，重新运行 `pnpm package:mac:arm64` 即可恢复。源码不在这里。

### Codex 侧边栏能不能直接显示 App

不能。Codex 可以修改、运行和检查应用，但你体验的是独立的真实 Electron 窗口。
