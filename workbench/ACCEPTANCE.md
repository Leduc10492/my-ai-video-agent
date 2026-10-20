# 本地验收记录 · 2026-10-17

工作台已实现并在 `http://127.0.0.1:4310` 本机运行。验收使用独立测试项目，原有工作流未提交修改保留。真实 Higgsfield 生成与参考上传尚未执行，等待用户指定并确认首批素材。

## 已验证

| 范围                | 实际结果                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 前端                | TypeScript 检查、Vite production build 通过；剧本、资产、Twick 时间轴可在 Codex 内置浏览器打开                                   |
| 现有工作流          | `pnpm test:workflow` 26/26；`pnpm validate` 通过，生产目录契约含 `4_edit`                                                        |
| 工作台              | `pnpm test` 12/12；覆盖名称与 tag 保真、同名冲突、路径隔离、重复提交、部分失败、未知提交恢复、Unlim 选择、版本保护和产物保存恢复 |
| Codex App Server    | 实际执行一次只读 `script` 阶段，精确加载项目内 `screenwriter-workflow`，返回完整结构化结果。没有生成、发布或外部写入             |
| Higgsfield MCP      | 实时发现 57 个视频模型，并读取 Seedance 2.5 参数；浏览器中的 2 秒请求在创建批次前被当前 4 秒下限拦截，没有提交生成               |
| 文件名 / tag        | 实际媒体保存为 `@char_Exact-Name_A.mp4`；手动 tag `@My_Manual-TAG` 保留；take 分目录存放                                         |
| 保存重开            | 在 UI 将第一段裁为入点 `1.25s`、时长 `0.75s`，保存 v3，刷新后两值保持；继续保存 / 导出为独立 v4 / v5                             |
| Twick 本地渲染      | `test:media` 实际输出 H.264 + AAC，320×180、24fps、48 帧、2 秒；两个源音调顺序与时长通过解码检查                                 |
| UI 导出             | 点击「导出 MP4」后，v5 任务完成。输出帧在片段时间 0.25s 显示源时间 1.50s，与入点 1.25s 一致；人工裁切保留的 0.25s 空隙保持静音   |
| 交付文件            | MP4、可编辑工程 JSON、含 clip/take/路径/SHA-256 的媒体引用清单均落盘；工程 JSON 可在同项目导入为新版本                           |
| 工程导入 / 编辑保护 | 在 UI 导入上述 JSON 为 v6，原入点与时长保持；未保存的入点修改会阻止再次装配，撤销恢复原值与已保存状态                            |
| 主题                | 浅色、深色切换和黑白灰编辑器已在浏览器查看                                                                                       |

工作台单元 / API 验收中的供应商故障使用注入适配器模拟；真实媒体解码与 Twick 渲染使用 FFmpeg 合成测试卡和声音。二者均不等同于真实 Higgsfield 生成验收。

## 可打开的证据

- [媒体测试报告](test-results/2026-10-17T07-57-06.249Z/report.json)
- [UI 导出与音轨检查报告](test-results/acceptance/ui-export.json)
- [UI 导出 MP4](test-results/2026-10-17T07-57-06.249Z/project/deliverables/4_edit/exports/b29549fc-4455-46c5-ad16-5767b46ec6ac/film.mp4)
- [可编辑工程 JSON](test-results/2026-10-17T07-57-06.249Z/project/deliverables/4_edit/exports/b29549fc-4455-46c5-ad16-5767b46ec6ac/project.json)
- [媒体引用清单](test-results/2026-10-17T07-57-06.249Z/project/deliverables/4_edit/exports/b29549fc-4455-46c5-ad16-5767b46ec6ac/media-manifest.json)
- [导出帧](test-results/acceptance/export-frame.png)
- [工作台截图](test-results/acceptance/workbench-dark.jpg)

测试产物位于 `.gitignore` 排除的本地目录，不会作为源代码提交。若需要移机，备份测试项目完整目录和 SQLite，而不是只复制 MP4。

## 尚待真实素材验收

用户确认素材 / 题材、名称、Prompt、参考角色、模型参数与用量方式后，运行一小批真实生成，验证供应商实际返回、参考上传返回格式、下载归档、选择 take、粗剪及导出。当前没有把模型目录连通、只读 Skill 执行或合成媒体渲染标记为这一步完成。

默认生产规格为 1920×1080 / 24fps，可修改；本次有声渲染验收规格是 320×180 / 24fps。Twick 首次进入时间轴需要加载约 3.9 MB 的独立编辑器 bundle。ChatGPT 原生侧边栏入口仍是后续范围。
