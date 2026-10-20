# 本地剧本工作流：阶段 0 / 1 实施结果

2026-09-13。本地代码、规则和针对性验证已完成。真实 Notion 读取及真实 Scene 产物尚未验收；本报告中的行为结果来自临时合成数据和实际文件操作。

## 基线与工作区

| 项目 | 实际核对结果 |
| --- | --- |
| 原工程目录 | `/Users/miniled/Developer/my-ai-video-agent/main` |
| 原分支 / HEAD | `agent/tighten-workflow-boundaries` / `9029f83146ce97314b291e07069a27a629f00c72` |
| 原工程状态 | 开工前干净；实施后仍干净，未切换分支、未改动文件 |
| 远端 | `origin` → `https://github.com/Leduc10492/my-ai-video-agent.git` |
| fetch 后工作流远端分支 | `origin/agent/tighten-workflow-boundaries` → `62f95d2689c2555da70e1116c3ae81169ccbdcd3` |
| fetch 后远端 main | `34a96644f6b06c0f5755112e105c6a6686d2d045`，比工作流分支少 3 个提交 |
| 实施工作树 | `/Users/miniled/Developer/my-ai-video-agent/local-script-workflow` |
| 实施分支 | `codex/local-script-workflow` |
| 实施基线 | `62f95d2`，已核对包含 `6d51688`；直接从该提交建工作树 |

`AGENTS.md` 与 `.agents/production-contract.md` 均来自已有基线，没有重复 cherry-pick 或手动搬运。基线 `pnpm validate` 通过：18 个 Skill、4 个 Node 脚本。没有搬影片素材、剧本、制作产物或制作目录中的删除项。

本次新增实现保留为该独立工作树里的未提交改动；没有 GitHub 推送、合并、影片生成或发布。

## 已实现

- 本地状态入口：工作稿和生产选择分别保存精确 ID、版本、路径及哈希，生产选择另绑定同版审计与实际接受／自主范围。不会因为出现更大的版本号而改变选择。
- 首次导入接收当前连接器已完整读取的 capture，保留正文原始字节、来源身份、属性、附件缺口及不可变快照；继续和直接编辑仅使用本地数据。工具本身没有网络或 Notion 写入能力。
- 明确局部刷新比较对应范围的上次采用基线、本地正文、此次来源，只替换指定范围；连续更新不同 Scene 不推进其他 Scene 的基线。全量更新保留旧稿；无变化刷新不创建剧本版本或下游复核范围。
- 安全保存使用临时文件、读回哈希验证、刷盘、不覆盖新版本落盘及状态原子切换。保留前一状态；中断候选不自动提升。首次导入中断也不会误走自动旧项目迁移。
- 剧本／审计归档先复制并验证、更新引用，再保留原路径兼容链接。旧生产选择、旧 manifest 路径及接受记录仍可解析；原路径选择也能回到同一已登记引用。
- Scene 索引区分身份与显示顺序，支持稳定来源编号与顺序编号的持久映射。插入不重命名旧 Scene；无法唯一匹配的范围返回候选；非目标来源歧义不会改动目标之外的本地正文。
- project-director 独占状态写入，script-writer 返回内容／差异／基础哈希。同步调整相关 Agent、Skill、归档与 QA 输入规则；普通导入／台词修改不被扩大为全剧创作审核。

入口与请求 JSON 示例见 [本地剧本协议](../../../.agents/skills/version-management/references/local-script-workflow.md)，机器结构见 [状态 schema](../../../.agents/skills/version-management/references/workflow-state.schema.json)。

```bash
pnpm workflow status
pnpm workflow <command> --request /absolute/path/request.json
pnpm test:workflow
```

本工程模板仍未初始化项目状态，`status` 返回 `initialized: false` 和空候选。实际使用时在项目克隆中首次导入，或明确登记现有本地稿。

## 验证证据

| 检查 | 结果与边界 |
| --- | --- |
| `pnpm validate` | 18 个 Skill、7 个 Node 脚本通过；registry、Agent、引用、目录、compiler/HTML 边界、状态结构入口和运行文件忽略规则通过 |
| `pnpm test:workflow` | 26 个测试全部通过；临时项目执行真实文件保存、路径解析、引用切换与归档操作，未使用影片数据 |
| `quick_validate.py` | 7 个实际修改的 Skill 均通过 |
| `codex debug prompt-input` | 7 个 Skill 均从实施工作树的 `.agents/skills` 被实际发现；已解析 Skill roots 别名核对路径 |
| JSON Schema | Draft 2020-12 schema 通过独立校验器；校验了导入、生产选择、编辑、归档、更换来源 5 份实际保存的合成项目状态 |
| TOML | 5 份 Agent 配置通过独立 TOML 解析 |
| 差异检查 | `git diff --check` 通过；临时验证依赖和合成项目已清理 |
| 原工程与 compiler | 原工程仍干净且 HEAD 未变；registry、`seedance-clean-zh`、HTML 模板没有改动 |

[行为测试](../../../.agents/skills/version-management/tests/local-script-workflow.test.mjs) 对应计划 A1–A9：

| 验收 | 已观察的本地行为 |
| --- | --- |
| A1 | 原始 CRLF、台词、tag、LUT / Style Prefix 属性与无法获取的附件记录均保留；来源和正文哈希可查 |
| A2 / A3 | 继续、解析、直接改词不调用远端；远端读取不可用的测试条件下本地编辑成功 |
| A4 | 连续两次刷新不同场景，其他本地正文不变，各范围各自保留正确来源基线；无关来源歧义不阻塞明确目标 |
| A5 | 全量导入保存新稿、旧稿可恢复；回退后分配版本会检查归档中的更大版本，避免撞号 |
| A6 | 精确台词修改仅改目标；相同刷新和相同编辑不增加剧本版本；模糊目标和过期哈希拒绝保存 |
| A7 | 不完整读取凭据不改变有效状态；快照后、新稿后、状态切换前后故障保持完整引用；真实子进程退出后可恢复死锁；首次导入遗留候选不自动晋升；损坏状态可显式恢复前一状态 |
| A8 | 接受 v7 后编辑到 v8，生产仍引用 v7；要求生产 v8 会报告缺少该版本决定；归档 v7 及审计后旧路径仍可读；错误哈希或审核结论不能选择生产，未授权范围不能解析为生产输入 |
| A9 | 无编号／顺序编号剧本插入场景后保留旧身份；重复标题有歧义时列出候选；精确台词修改和完全相同快照可保留原有映射 |

程序测试证明文件与范围逻辑，不证明审核文字合理或用户已经接受合成例子。结构验证器已移除对执行模式整句文案的依赖；文档覆盖检查明确标为文档检查，实际行为证据来自上述测试。

## 尚未验证与后续范围

- 本轮没有新的真实 Notion 页面链接，因此未验证真实连接器的分页、子块、字段和附件读取。`complete` 与 `read_evidence` 是主线程对真实读取的记录；代码只能拒绝缺失／不完整凭据，不能代替连接器完整性审阅。
- 没有采用真实 Scene 或参考素材，未验证真实剧本到 Breakdown、Prompt、HTML 的端到端产物、浏览器复制载荷、空间／创作／视觉质量或用户接受。
- 文件故障测试覆盖异常注入及真实进程退出；未进行整机断电、损坏磁盘或不同文件系统的实测。符号链接归档在当前 macOS 本地文件系统验证通过；不支持符号链接时须保留原文件副本并报告归档收尾未完成。
- 刷新范围使用已登记 Scene 及明确的正文前部／尾部／无 Scene 全文单元；目标删除、拆并或更细边界无法唯一确定时需给出具体范围映射，不自动扩大刷新范围。程序不做剧情语义匹配。
- 完整断点续跑、Skill 版本锁定、依赖调度／自动局部重跑、Scene 包完整事务及视频生成属于阶段 2 / 3。现有 `Scene → Shot Row → Prompt Envelope`、compiler 及 manifest 职责保持不变。
