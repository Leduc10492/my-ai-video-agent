# AI 视频工作台

本地只读原型。它把仓库里的 Skills、slot 路由和交付物放到一个界面里，不调用外部模型，也不写回 `deliverables/`。

界面分四块：

- 工作台：剧本 → 审核通过 → 资产 → 按 Scene 分镜拆解 → 镜头行与提示词包 → 中文分镜表 → QA
- 路由台：按 `skill_registry.md` 和 `AGENTS.md` 做确定性路由，并给出可复制的 Codex 提示词
- Skills 库：搜索 `.agents/skills` 和 `.codex/agents`
- 交付物：浏览真实 `deliverables/`，或浏览本目录里的示例项目

示例项目《末班》在 `example/`。顶栏可以在「示例数据」和「当前仓库」之间切换。

## 启动

需要 Node.js 22 或更高版本。仓库根目录的 `pnpm@11.9.0` 在 Node 20 上会出问题，请先切到 Node 22。

在仓库根目录执行：

```bash
pnpm --dir workbench install
pnpm --dir workbench dev
```

浏览器打开 <http://localhost:3000>。默认深色，默认看示例数据。

生产构建：

```bash
pnpm --dir workbench build
pnpm --dir workbench start
```

路由回归：

```bash
node --experimental-strip-types --test workbench/src/lib/router.test.ts
```

这条命令在仓库根目录执行。工作台目录里则去掉前面的 `workbench/`。
