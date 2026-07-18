# Artifact: Workflow Audit
- id: A-20260718-201
- version: v1
- upstream: []
- locks:
  - must_keep:
    - GitHub 仓库根目录就是新项目根目录
    - 创作产物直接进入根目录 `deliverables/`
    - 稳定生产层级为 `Scene -> Shot Row -> Prompt Envelope`
    - 默认闭环停在中文 HTML；图片与视频生成需单独授权
  - must_avoid:
    - 不为新项目再建立 `main/` 与 `test/` 两层
    - 不把测试用 generator 或 fixture 当成 Skill 工作流
    - 不引入与某个剧本绑定的角色、对白对象或字段
  - budget_notes:
    - 本次不重建 98 个历史 Scene 包

---

## 审计结论

- 日期：2026-07-18
- 结果：`pass`
- 未解决 P0：0
- 未解决 P1：0
- 发布判断：允许提交并直接推送 GitHub `main`

当前仓库已经可以作为项目模板直接克隆。克隆后的仓库根目录包含 Registry、Agents、Skills、校验脚本、依赖锁文件，以及 `deliverables/10_story`、`deliverables/20_assets`、`deliverables/30_shotlist` 和 `archives` 的中性起始目录。旧开发环境中的外层 `main/test` 只是本地工作区安排，不是 GitHub 项目结构。

## 当前工作流

```text
输入故事/剧本
  -> script.primary 写入剧本
  -> story.mckee_router 审核
  -> 同版本审核无未解决 P0/P1
  -> guides.primary（需要资产/风格资料时）
  -> 轻量 Scene 索引
  -> shotlist.breakdown 一次处理一个 Scene
  -> Breakdown QA
  -> shotlist.primary 生成 Shot Row / Prompt Envelope / 中文 HTML / manifest
  -> Scene HTML QA
  -> 下一 Scene
  -> 图片或视频生成（仅用户另行授权）
```

长剧本不会一次把全文交给分镜或 Prompt 阶段。系统先读取 Scene 标题、编号和行范围，然后只加载选中 Scene 与前后边界。一个 Scene 建议每批审查 4–8 个 Prompt Envelope；超过 10 个时在同一 Scene 内分批 QA，最终仍写入同一个 Scene 文件夹。

## 契约与引用审计

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 核心路径 | 通过 | 14 个仓库入口和起始目录全部存在 |
| Skill Registry | 通过 | 9 个 slot 均指向存在的 Skill 与 Owner Agent |
| Agent 配置 | 通过 | 5 个 TOML；名称、slot、默认 Skill 均可解析 |
| Skills | 通过 | 17 个 `SKILL.md`；frontmatter、名称、相对资源引用全部有效 |
| 脚本 | 通过 | 4 个 Node 脚本存在、可解析，package script 无悬空引用 |
| 文档链接 | 通过 | 60 个 Markdown 文件的相对链接无缺失目标 |
| 根目录快捷链接 | 通过 | `skills -> .agents/skills`、`codex-agents -> .codex/agents` 已纳入 Git |
| 旧路径/测试生成器引用 | 通过 | 主仓库没有 `test/tools`、旧 `scenes/` 中间层或 generator 依赖 |
| 项目泛化 | 通过 | 主工作流没有写入当前剧本角色、场景数量或“泛化听者”等专用字段 |

## 依赖审计

| 依赖 | 声明 | 验证结果 |
| --- | --- | --- |
| Node.js | `>=18` | 本机 Node `v24.14.0` 通过 |
| pnpm | `>=9`，当前锁定工具版本 `11.9.0` | 本机 pnpm `11.9.0` 通过 |
| `docx` | `package.json` 为 `^9.7.1`，`pnpm-lock.yaml` 锁定 `9.7.1` | 隔离安装、运行时 import、真实 DOCX 导出和 ZIP 完整性检查通过 |
| PyYAML | 非仓库运行依赖 | 本机已安装 `6.0.3`；仓库校验不再依赖它 |
| 全局 `skill-creator` | 非仓库运行依赖 | 当前未安装，但主仓库不存在对它的引用；不会影响克隆与校验 |

仓库只声明一个第三方运行依赖 `docx`。其余校验、Scene 索引和 Shotlist 检查脚本只使用 Node 内置模块。`pnpm install --frozen-lockfile` 会拒绝与锁文件不一致的安装状态。

## 实际执行证据

1. `pnpm validate`：通过 14 个核心路径、9 个 Registry slot、5 个 Agent、17 个 Skill、60 个 Markdown 文件、2 个软链接、1 个依赖和 4 个 Node 脚本。
2. Scene 索引脚本：临时双 Scene 剧本正确识别 `scene-001`、`scene-002`、行范围与前后关系。
3. DOCX 导出：临时剧本成功生成 `.docx`，压缩包结构检查无错误。
4. 隔离克隆模拟：把待提交 Git 树解包到全新 `/tmp` 目录，执行 `pnpm install --frozen-lockfile`、`pnpm validate`、`require('docx')` 和 DOCX 导出，全部通过。
5. Git 检查：`git diff --check` 通过；没有断裂软链接。
6. 对白对象回归：Skill 与独立 Shotlist validator 已改为从当前 Scene 动作、相邻对白、视线和 blocking 取证；证据不足时报告歧义，不发明“泛化听者”参数。历史 98 Scene 包未重建，符合本次只修 Skill 兜底的范围。

## 本轮发现并修复的问题

| 优先级 | 问题 | 修复 |
| --- | --- | --- |
| P1 | 仓库曾没有自包含的 `pnpm validate`，外部快速校验会依赖 PyYAML/全局工具 | 新增纯 Node 仓库校验器和 package script，不再依赖全局 Skill |
| P1 | `skills`、`codex-agents` 软链接受共享 worktree exclude 影响，可能不会进入 GitHub 克隆 | 用仓库级 negation 纳入 Git，并加入校验器 |
| P1 | 对白对象可能被通用占位词掩盖，且多句对白可能错误复用 lip-sync Row | Breakdown、Prompt、HTML 与独立 validator 统一为逐原文对白、逐 Row 检查 |
| P1 | HTML 筛选曾可能按内部 Shot Row 隐藏整个 Prompt Envelope | 筛选契约改为 Envelope 分组显示，保留 Envelope 内完整内部镜头 |
| P2 | Git 不保存空目录，全新克隆可能没有 `10_story/20_assets/30_shotlist/archives` 起始结构 | 每个目录增加项目中性的 `README.md` |
| P2 | 新项目结构仍可能被旧的外层 `main/test` 习惯误导 | README、Quick Start 与 Admin 说明明确改为仓库根目录直接创作 |

## 仍需区分的证明边界

- 本报告证明仓库结构、引用、依赖安装、脚本执行与克隆起始状态。
- 本报告不声称 98 个旧 HTML 已迁移到新对白规则；用户明确要求不批量重建。
- 本报告不等于浏览器视觉 QA。具体 Scene HTML 生成后仍需检查筛选、复制、排版和可见状态。
- 本报告不等于图片或视频生成证明。只有保存了指定 `P###`、参考状态和实际输出，才可报告生成通过。

## 新项目使用方式

```bash
git clone https://github.com/Leduc10492/my-ai-video-agent.git my-film-project
cd my-film-project
pnpm install --frozen-lockfile
pnpm validate
```

之后把当前项目剧本放进 `deliverables/10_story/`，直接从仓库根目录开始生产。生产产物默认被 `.gitignore` 留在项目本地；若某个新项目需要把剧本、图片或生成资产提交到自己的仓库，应在该项目副本中按团队的版本管理策略调整忽略规则，并把 remote 改成该项目自己的仓库。
