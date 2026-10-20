# 本地影视工作台

React / TypeScript / Vite、shadcn neutral 风格、Fastify、SQLite、Codex App Server、Higgsfield MCP、Twick 0.15.31。项目文件留在本机；Skills 推理、模型目录、上传与生成需要联网。

## 运行

需要 Node.js 24、pnpm 11、FFmpeg、FFprobe，以及已登录的 Codex CLI。依赖安装一次后，剧本编辑、媒体预览和剪辑可离线运行。

```sh
cd /Users/miniled/Developer/my-ai-video-agent/local-script-workflow
pnpm --dir workbench install
pnpm workbench:build
pnpm workbench:start
```

打开 <http://127.0.0.1:4310>，可使用普通浏览器或 Codex 内置浏览器。开发使用 `pnpm workbench:dev`，前端端口 5173，API 端口 4310。前端支持热更新；后端默认不随文件修改重启，避免中断长任务，改动后需手动重启。明确需要后端热重启时设置 `WORKBENCH_WATCH_SERVER=1`。服务只绑定回环地址，拒绝外站 Origin；写请求需要本地工作台请求头。

可选环境变量：`PORT`、`CODEX_BIN`、`HIGGSFIELD_BIN`、`FFMPEG_PATH`、`FFPROBE_PATH`、`TWICK_BROWSER`。后两项媒体工具建议使用绝对路径。渲染自动查找 `~/.cache/puppeteer` 中已有的 Chrome Headless Shell；其他安装位置用 `TWICK_BROWSER` 指定。不要把密钥写入前端或提交到 Git。

```sh
# 没有渲染浏览器时，在 workbench 中安装官方 Puppeteer 浏览器：
pnpm dlx puppeteer@23.11.1 browsers install chrome-headless-shell
```

## 使用

1. 左侧新建视频项目，默认保存到工作区 `projects/<作品名>/`，也可指定其他目录；已有文件夹不会被覆盖。「打开已有项目」可登记含 `project.json` 或 `.agents/skill_registry.md` 的目录。新项目复制平台默认 Skills，独立保存媒体、状态与数据库。
2. 在「剧本」粘贴 / 导入 Markdown 或文本，或从 idea 启动创作。每次保存新版本；历史版本可比较，Scene 导航定位正文。Skills 使用 Registry 的精确文件路径，返回待审阅产物，用户保存后再登记工作稿。
3. 同版本审核完成后，审阅报告并确认生产输入。进入资产、分镜和 Prompt 阶段时核对这份版本；普通工作稿保存不会自动提升生产版本。
4. 「资产库」导入本地图片、视频、音频；同名新结果需明确选“添加 take”。生成前展示整批名称、Prompt、模型、参考角色及用量方式，确认后提交。真实 tag 在详情中手动填写，逐字保留。
5. 比较 take，观看实际媒体后记录视觉检查并采用。媒体解码检查不等于用户采用。重新生成保留所有旧 take。
6. 在「剧本 → 可视化分镜」查看按 Scene 分组的镜头卡片，搜索、筛选状态；「载入分镜」可选择已保存的 Skill 产物，或导入 JSON 后预览并确认。「添加镜头」支持手动填写新镜头与标准文件名。
7. 点击镜头卡片、关联的资产卡片或时间轴中的「镜头详情」，进入同一详情面板：编辑画面、摄影机、声音、参考素材及整个 Envelope 的 Prompt；预览与采用 take。保存产生新的分镜文件，后台刷新保留草稿，关闭或刷新页面后重新打开该镜头可恢复浏览器草稿。冲突保存会拒绝覆盖其他更新。
8. 从镜头详情定位时间轴，或在「时间轴」装配新粗剪。可拖动、裁切、播放头分割、音量 / 静音、替换 take、撤销 / 重做。每次保存是独立时间轴版本；「导入工程」可把同项目的工程 JSON 恢复为新版本。
9. 保存后导出 MP4。任务面板提供 MP4、可编辑工程 JSON 和媒体引用清单。缺失占位或超出素材时长时拒绝导出。

界面默认使用亮色 shadcn neutral 配色、圆角面板与镜头卡片；左下角仍可切换深色。项目信息、Skill 路径和本地产物收在顶部信息按钮中。镜头详情的「准备生成」进入既有批次审阅流程，保存镜头不会提交生成任务。

### 工作区、视频项目与 Codex 创作

`workbench/` 是平台程序，`projects/` 中每部视频有自己的根目录。平台索引与当前选择保存在根目录 `.workbench/`，不再把新项目放进程序的隐藏运行目录。空工作区显示新建入口，平台自身不再自动作为一个视频项目。

每个项目保存可迁移的 `project.json`，项目 ID 不随目录变化。项目内 `AGENTS.md` 指示 Codex 每个阶段读取自己的最新 Registry，并读取绑定 Skill 的完整 source。平台根目录的 `.agents/` 是新项目模板；现有项目不跟随模板或全局 Skill 自动更新。

切换项目同时更新 `.workbench/active-project.json`，它只用于尚未绑定的对话选择入口；已启动任务和已绑定对话始终保留自己的项目 ID、目录与输入快照。侧栏「在 Codex 中创作」和「项目设置 → 项目与创作」显示项目目录、当前阶段 Skill、可复制的创作指令与 `codex --cd` 命令。复制前会重新读取已保存配置，不自动新建对话或开始生成。

平台目录中的 Codex 可运行 `pnpm workspace:context` 读取当前项目，之后使用 `node workbench/scripts/project-context.mjs --project <ID或绝对路径>` 保持绑定。该命令只读，不要求本地服务在线。直接打开视频项目目录的 Codex 则读取该项目自己的 `AGENTS.md`。普通对话产物仍需按契约保存、载入，不能将聊天输出视为已登记的资产。

旧项目迁移：停止服务，先运行 `pnpm workspace:migrate` 查看目录计划，再运行 `pnpm workspace:migrate --apply`。迁移保持项目、take、job、clip ID，逐文件核对哈希及数据库记录，保存备份后切换索引。旧独立项目路径保留兼容符号链接，避免旧任务引用失效；历史平台根项目单独复制其生产目录，根目录保留回归材料。迁移备份位于 `.workbench/migrations/`。

### 项目设置 → Skills

设置使用固定尺寸的窗口，左侧切换「项目与创作 / 项目规格 / Skills」，Skills 页内的阶段导航为第二级。内容在窗口内部滚动，底部保存操作固定；切换分类会保留尚未保存的输入和 Skill 选择。

打开顶部「项目设置」的「Skills」页，选择剧本创作、剧本审核、资产拆分、分镜设计、视频 Prompt 或生产 HTML 阶段，再从已发现的本地 Skill 中选择。支持按名称、用途和来源筛选；同名 Skill 按实际路径区分。可以一次调整多个阶段，点击「检查兼容性」后查看问题和阶段接口，再「保存到当前项目」。未保存的选择不会影响任务。

列表来自 Codex App Server 的实际发现结果，包含当前项目、个人安装、已安装插件和系统 Skill，排除其他项目的专属 Skill。静态检查核对入口、资源、依赖、文件哈希与阶段适配边界；无法证明创作质量或外部工具已登录。用途不匹配会提示，缺少必要文件、被禁用或无法固定的依赖会阻止保存。

外部 Skill 连同可解析的本地依赖复制到当前项目 `.agents/skills/`，保留原文件，另加阶段接口适配，更新当前项目 Registry；全局安装和其他项目不变。已存在的原生项目 Skill 沿用其项目路径。配置历史保存在 `deliverables/0_admin/skill-config/`。固定版本不会随全局安装自动更新；要采用新版，重新选择「本地安装」或「已安装插件」中的来源，检查后保存。「来源与阶段接口」可以查看路径和固定版本的来源哈希。

检查后文件或 Registry 有变化时必须重新检查。存在运行中的 Skill 任务或未结束的阶段批次时，暂时禁止切换，避免同一批混用版本。新任务按保存后的精确路径执行，已有产物和媒体不重写。剧本编辑器的「对话修改」仍使用独立的局部编辑助手，不受这些阶段选择影响。

### 资产与分镜执行

点击「提取资产 / 制作分镜」后，先明确选择「规划草案」或「正式生产」。规划草案使用当前工作稿和同版本已保存的审核；正式生产使用已确认的生产版本。按钮旁显示当前输入版本及未满足的条件，并提供保存工作稿、审核或审阅确认的入口。资产、分镜、审核、Prompt 和 HTML 阶段的补充要求可以留空；系统按所选阶段与场景提交明确任务。创作 / 改写仍需填写故事 idea 或修改要求。分镜的「全部可处理场景」仅包含所选生产版本已授权的场景；成功启动后展开任务面板。

资产拆分和分镜设计使用 Registry 的原 Skill，模型只返回一份结构化设计。服务生成既有 Markdown/JSON 产物、版本与元数据；原文、标准文件名、真实 tag、Shot Row 与 Envelope 映射继续保留。默认推理投入为 `medium`，模型沿用 Codex 配置；任务详情显示实际模型、运行时间与可获得的 token 统计。

分镜入口可选择一个或全部 Scene，以及同时处理 1–3 场。每个任务只读取本场原文、相关资产、审计摘录和边界信息；需要前场设计才能确定后场时，先单独选择前场，审阅保存后再处理后场。并发数只控制调度，不代表已确认跨场连续性。结果在任务面板中按批次审阅，再一次保存并载入工作台。资产结果保存时也自动载入资产库。

单场结果由服务分配新 ID 并增量合并。目标场被手改、源剧本切换或文件冲突时拒绝覆盖，保留候选供核对。其他 Scene 的字段、媒体 take 和旧时间轴不跟随重生成改变。断开后先查询原 thread/turn，已完成结果直接回收；失败场可单独恢复，批次继续处理其他场。输出片段在内存汇总，每 750ms 最多持久化一次，完成和断开时立即保存。

后台 Skill 会话绑定到 Codex 中已保存的最近上级项目，标题显示工作台项目、阶段和 Scene；执行目录及 Registry 仍使用本项目。每轮结束并保存结果后自动归档会话，避免内部 UUID 和 `skill-plans-*` 测试目录长期堆积在侧栏。归档保留历史、产物和任务数据库；继续任务时先读原结果，确需继续推理才取消归档并恢复原会话。归档失败仅登记清理错误，后续打开项目时重试，不改写结果、不重复推理。

运行实测（复制项目，使用真实 Codex；不会修改源项目或生成媒体）：

```sh
node scripts/benchmark-skill-plans.mjs /absolute/project/path scene-002 scene-004
```

报告保存在 `test-results/skill-plans-<timestamp>/result.json`。其中 `wall_ms` 是整批墙钟时间，`metrics.elapsed_ms` 是单任务执行时间；`first_output_at` 是第一条助手输出片段，可能是进度说明，不应当作最终结构化结果的首 token。实测只验证所选场次，不外推整部片子的耗时或创作质量。

### 剧本编辑器

在「剧本正文」点击「导入 MD」，预览场景与段落数量后导入。中文 `第 N 场`、英文 INT./EXT. 场景和 `**角色**（括注）：对白` 可自动识别；备注、短信、代码、表格保留为原文，含糊的引用用黄色标记提示。导入只载入草稿，原文件不覆盖。

光标所在段落或选中的多段可用底部「场景 / 动作 / 角色 / 对白 / 括注 / 转场 / 镜头」切换类型。Enter 创建下一段，角色后默认接对白、对白后接角色；空段 Enter 回到动作。Shift+Enter 是段内换行。Tab / Shift+Tab 切换类型，⌘⌥1–7 直接选择，⌘Z / ⌘⇧Z 撤销和重做，Esc 离开正文。

「对话修改」通过当前登录的 Codex CLI 读取当前编辑器快照，包括未保存的手改。可以选中段落限制范围；返回前后差异，点击「应用这次修改」才更改草稿。等待期间可以继续手改其他段落；同一段有变化时拒绝覆盖。应用、导入和段落类型修改均可撤销。取消、断连或服务重启不会自动应用结果。

浏览器按项目保存草稿及段落标识，刷新后恢复；「保存新版本」仍写入原有 Markdown 版本库，SHA-256 不匹配时拒绝覆盖，生产版本不自动变化。「导出 Markdown」下载当前草稿，含未保存的内容。输出是普通 UTF-8 Markdown：场景标题、可读的 `**角色：**` / `**对白：**` 等标签和原有备注表格，多行段落使用 Markdown 引用。再次导入可恢复段落类型，文件中没有编辑器 JSON 或内部段落 ID。本期没有 Fountain 文件导入导出或专业分页 PDF。

资产详情上传使用已认证的 `higgsfield upload create <file> --json`；生成与查询走 Codex App Server 的 Higgsfield MCP。上传前自动核对 CLI 和 MCP 的账户显示标签与当前 workspace；不匹配时停止。绑定记录包含 MCP 账户 ID、workspace 和源文件 SHA-256。供应商 ID 是外部绑定，资产主键始终是文件名主干。

## 数据与恢复

- 应用项目索引：`.workbench/projects.json`；当前项目：`.workbench/active-project.json`；新项目默认在 `projects/<作品名>/` 下。
- 剧本状态：`deliverables/0_admin/workflow_state.json`，继续使用原有脚本版本 / SHA-256 / 审核与接受协议。
- 项目数据库：`deliverables/0_admin/workbench.sqlite`（WAL）。关闭服务后备份整个项目目录；运行时备份需一并保留 SQLite 的 `-wal` 文件。
- 共享媒体：`deliverables/2_assets/<标准文件名主干>/<take_id>/<标准文件名>.<扩展名>`。
- Scene 视频：`deliverables/3_shotlist/<scene>/generated/<标准文件名主干>/<take_id>/<标准文件名>.<扩展名>`。
- 工程与导出：`deliverables/4_edit/timeline_v{N}.json`、`exports/<job_id>/`。

生成任务先落库再提交；同一批重复点击不会新增任务。页面刷新不取消任务。服务重启后查询已保存的远端 ID；无远端 ID 的不确定提交进入“待核对”，用户在 Higgsfield 查明后绑定 ID，不自动重发。下载失败只重试下载。内容审核失败不自动重试。Skill 中断后先读取原会话，回收已完成结果或继续原阶段。

已确认的资产名称固定，界面不提供隐式重命名；如要更名，需要显式执行文件与引用迁移，不能在磁盘随意改名。已有时间轴只引用具体 `take_id`，不会跟随“当前采用”自动切换。再次装配生成独立版本；编辑器中的未保存修改需先保存，再加载历史或新装配。

结构化分镜示例：

```json
{
  "shots": [
    {
      "id": "scene-001-R01",
      "scene": "scene-001",
      "title": "开场镜头",
      "description": "已确认的画面与动作",
      "camera": "已确认的景别与摄影机设计",
      "sound": "原台词与声音设计",
      "references": ["@prop_Exact-Name"]
    },
    { "id": "scene-001-R02", "scene": "scene-001", "title": "第二镜" }
  ],
  "envelopes": [
    {
      "id": "P001",
      "scene": "scene-001",
      "asset_name": "scene-001_P001",
      "duration_seconds": 5,
      "source_rows": ["scene-001-R01", "scene-001-R02"],
      "prompt": "已经确认的独立生成 Prompt",
      "markers": [{ "id": "R02", "title": "R02 计划切点", "time": 2.5 }]
    }
  ]
}
```

一个 Envelope 是一个连续 clip。`markers` 是计划切点，不能当作模型已经切好镜头的证据。不足时长只警告，不循环、不拉慢。

`shots` 为向后兼容的镜头详情；旧文件只含 `envelopes` 仍可载入，未提供的画面信息会留空。镜头身份是 Scene 与 Shot Row 的组合；一个 Shot Row 只归属一个 Envelope。写分镜接口支持 `expected_sha256` 做并发校验，前端编辑与导入均携带该字段。手动改动镜头设计后，需重新编译并审阅 Prompt；历史生成批次和已有剪辑不自动改写。

## 验证与边界

```sh
pnpm test                 # 文件名、tag、去重、恢复、take 隔离、时间轴版本、剧本版本
pnpm test:media           # 真 FFmpeg 媒体 + Twick 渲染 + 音轨频率/时长验证
pnpm build
# 仓库根目录：pnpm test:workflow && pnpm validate
```

`test:media` 在 `workbench/test-results/<时间>/` 保留输入媒体、工程、MP4 和 `report.json`。使用两段合成的有声测试卡，不调用真实生成。真实 Higgsfield 小批量生成、供应商返回下载及首批本地参考上传，必须在用户确认具体内容和用量方式后再验收；模型目录连通和 Skill 只读执行不代替真实生成证据。

首版生成适配图片和视频。EXR ZIP 等特殊输出明确标为需要处理，不把输入视频误记成输出。ChatGPT 原生侧边栏入口留待后续接入。

Twick 适配及许可证见 [THIRD_PARTY.md](THIRD_PARTY.md)。

本次实际验证与待完成的真实生成范围见 [ACCEPTANCE.md](ACCEPTANCE.md)。
