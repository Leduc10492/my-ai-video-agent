# AI 视频工作台

本地原型。项目 → 集 → 场。剧本、审核、资产、分镜和提示词包都以仓库文件为准，不调用付费接口。

- 项目：示例短片《末班》和当前仓库
- 剧本与审核：P0 / P1 没清空时，资产和分镜锁定。剧本哈希变了，下游标成已过期，不自动重跑
- 任务：本地 SQLite 只记任务、批准、花费、媒体版本和文件哈希。生成必须先看估价再批准，实际花费保持 0
- 导出：给制片的交接单和 zip。剪映草稿这一版不做
- 设置：阶段槽位读 `.agents/skill_registry.md`，并列出盒子技能名。选择只留在浏览器里
- 链路、路由台、Skills 库、交付物：上一轮的只读视图还在

示例在 `example/`。第 1 集审核已通过但下游已过期；第 2 集还有未解决的 P1。

## 启动

需要 Node.js 22 或更高版本。仓库根目录的 `pnpm@11.9.0` 在 Node 20 上会出问题，请先切到 Node 22。

在仓库根目录执行：

```bash
pnpm --dir workbench install
pnpm --dir workbench dev
```

浏览器打开 <http://localhost:3000>。默认深色。

生产构建：

```bash
pnpm --dir workbench build
pnpm --dir workbench start
```

回归：

```bash
node --experimental-strip-types --test workbench/src/lib/router.test.ts workbench/src/lib/episode-state.test.ts
```

这条命令在仓库根目录执行。工作台目录里则去掉前面的 `workbench/`。
