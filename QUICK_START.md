# Quick Start

首次从 GitHub 创建项目：

先准备 Node.js 18+ 与 pnpm 9+，然后执行：

```bash
git clone https://github.com/Leduc10492/my-ai-video-agent.git my-film-project
cd my-film-project
pnpm install --frozen-lockfile
pnpm validate
```

仓库根目录就是创作项目根目录。不要再拆成 `main/` 和 `test/`；剧本、资产、分镜和 HTML 直接写入根目录下的 `deliverables/`。

直接告诉主控 Agent 当前目标和场景范围即可。

```text
把这份故事整理成短片剧本。
```

```text
读取最新剧本及同版本审核；确认没有未解决 P0/P1 后，只扫描 Scene 标题/编号和行范围来确认顺序，再只加载 scene-081 正文及前后边界做分镜拆解；把 Breakdown 保存到 scene-081 文件夹，保留完整 Shot Row，不生成图片或视频。
```

```text
根据 scene-081 文件夹内已确认的 Breakdown，在同一文件夹生成中文 Prompt、HTML 和 manifest。
```

```text
检查 scene-081：原台词覆盖、切镜理由、Prompt 打包、实际时长和 HTML 映射。
```

主流程默认停在 HTML。需要预演图或视频时，再明确指定 Prompt ID 和生成范围。
