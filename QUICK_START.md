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

阶段目录固定为 `0_admin/`、`1_story/`、`2_assets/`、`3_shotlist/`；只有文件名继续使用 `01_`、`02_`、`03_` 前缀。

直接告诉主控 Agent 当前目标和场景范围即可。默认进入交互式模式：每个阶段先给你看审核结果和缺口，再等待确认。

```text
把这份故事整理成短片剧本。
```

要让主控 Agent 不逐阶段询问、而是自行修复问题并完成范围内设计，请显式写：

```text
自主执行完整项目前期工作流。每个阶段发现的问题自行修复并复审，缺少生产参考时自行生成、筛选并锁定参考资产；范围结束于中文 HTML，不生成最终视频。
```

如果希望连视频测试也自主执行，必须把它写进范围：

```text
自主执行到视频生成测试，包含参考资产补齐、分镜、Prompt、HTML、指定批次生成和生成 QA。
```

```text
读取最新剧本及同版本审核；确认没有未解决 P0/P1 后，只扫描 Scene 标题/编号和行范围来确认顺序，再只加载 scene-081 正文及前后边界做分镜拆解；把 Breakdown 保存到 scene-081 文件夹，保留完整 Shot Row，不生成图片或视频。
```

```text
根据 scene-081 文件夹内已确认的 Breakdown，先调用 `shotlist.prompt_compiler` 生成每个 Prompt Envelope 的中文 Prompt，再调用 `shotlist.html_assembler` 将全部中间产物汇总成同一文件夹内的 HTML 和 manifest。
```

Prompt 内容由 `.agents/skill_registry.md` 的 `shotlist.prompt_compiler` 独立生成；`shotlist.html_assembler` 只负责 HTML 汇总。替换 Prompt Skill 时，Scene 目录、Shot Row、Prompt Envelope、资产标签和 HTML 契约保持不变。

```text
检查 scene-081：原台词覆盖、切镜理由、Prompt 打包、实际时长和 HTML 映射。
```

未显式请求自主生成或视频范围时，主流程停在 HTML。交互式模式在剧本审核、资产缺口、第一个 Scene 与每个 Scene / 批次 QA 后等待确认；自主模式在这些门点自行修复并复审后继续。
