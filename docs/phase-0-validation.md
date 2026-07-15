# 阶段 0：技术、Skill 与发行验证

验证日期：2026-07-15

## 结论

阶段 0 的工程样机已经跑通：桌面主进程可以发现本机 Codex、读取 ChatGPT
登录、列出模型和 Skill、启动隔离线程、接收流式事件，并用严格 JSON Schema
得到结构化候选修改。SQLite、Skill 插件契约、旧 Agent TOML 迁移以及独立
BYOK profile 均已实现。

公开商业发行仍有两个外部门槛：第三方客户端复用 ChatGPT/Codex 登录的品牌、
计费与合规确认；以及所有故事理论衍生内容的独立版权审核。这些门槛不会阻挡
本地工程验证，但会阻挡公开 DMG 发布。闭测前还必须完成用户 Skill 的操作系统级
读取隔离与图像生成的计费前授权；当前技术预览明确禁用这两类运行。

## 本机 Codex 实测

- Codex CLI：`0.144.2`，来源为 ChatGPT macOS App。
- 账户：ChatGPT 登录可由 `account/read` 正确读取。
- 默认文本运行：`gpt-5.6-sol`、Medium reasoning、default service tier。
- 可列出 5 个当前模型项。
- 可列出 51 个 App Server Skill；设置额外 Skill Root 后无加载错误。
- stdio 使用 JSONL；客户端同时兼容 Content-Length frame。
- 初始化已显式协商 `experimentalApi`，以支持运行时 workspace roots。
- 文本输入包含当前协议要求的 `text_elements: []`。
- 结构化测试真实返回：`{"summary":"Runtime ready","operations":[]}`。
- 最终 JSON 位于完成的 `agentMessage` item；Job Manager 会与
  `turn/completed` 状态合并后再创建候选 Draft。

每次正式运行显式指定模型、推理档位和 default tier，不继承用户全局可能存在的
高推理或 Priority 设置。

## BYOK 验证

- 只支持 OpenAI API Key，不支持自定义 Base URL。
- API Key 由 Electron Main 接收后使用 macOS `safeStorage` 加密；Renderer
  不能读取已保存密钥。
- BYOK 使用独立绝对路径 `CODEX_HOME`，不会覆盖用户现有 ChatGPT 登录。
- 启动时强制 `cli_auth_credentials_store="keyring"`；无 Key 的隔离启动没有生成
  明文 `auth.json`。
- 登录调用使用 App Server `account/login/start` 的 `apiKey` 模式，诊断、异常和
  启动配置均会遮蔽敏感值。
- 没有在仓库或测试中放入真实 Key，因此真实计费请求需要由用户在设置页主动
  输入 Key 后执行“测试连接”。这是刻意保留的非自动化验收项。

## Skill 兼容扫描

当前 `.agents/skills` 扫描结果：

- 17 个 Skill 目录。
- 9 个应用原生 Manifest；8 个兼容模式 Manifest 会由运行时合成。
- 0 个重复 ID。
- 0 个无效 Skill 包。
- 0 个 Responses 不兼容的结构化输出 Schema。

应用原生 Skill 增加 `director-skill.json` 与严格 Draft Operation Schema。普通
Codex Skill 可以校验、导入和绑定，但在用户选择工作流 Slot 前保持“未分类”；
导入时会拒绝不符合 Responses 严格结构化输出约束的 Schema。
由于 Codex 的 `readOnly` 不是文件读取白名单，用户 Skill 当前不会被执行。核心 Skill
只读；复制编辑会创建用户版本，项目绑定保存可移植定位符、版本和 SHA-256 内容哈希。
当前发行核心 Skill 为 `1.1.0`，已加入桌面 Candidate Runtime 契约；每次运行只物化
项目固定的精确 Skill 以及满足 SemVer 范围的审核依赖。

`.codex/agents/*.toml` 已从旧 `instructions` 字段迁移为
`developer_instructions`。导入器也会对旧文件执行同样迁移，并返回非阻断提示。

## 运行边界

- 每个项目阶段与范围只有一个写入锁。
- Agent 运行前把数据库内容物化为 `.ai-director/runs/<id>/context.json`。
- App Server 的工作目录与写入策略限制在运行目录，approval policy 固定为
  `never`。这能阻止候选直接写正式项目，但不能证明进程无法读取目录外文件。
- 因此当前只执行随应用审核分发的核心 Skill；用户 Skill 与图片生成在真正的
  OS 读取沙箱、精确依赖物化及计费前授权完成前保持禁用。
- Context 按选中项目范围裁剪；候选操作超出范围会在保存前被拒绝。
- Agent 结果只保存为 `DraftProposal`。接受前不修改正式实体。
- 接受 Draft 前创建数据库快照；全部上游 Revision 与 `baseRevision` 会在同一事务
  重新校验，任一漂移都会回滚。
- Scene 等上游改变会沿 `DependencyEdge` 标记下游 stale，不自动重生成。
- 应用重启会把 queued/running/awaiting-approval 的未完成 Run 标记为 interrupted。

## 版权与分发清单

- `.agents/skills/mckee-source` 含受版权保护的完整书籍文本，明确禁止进入安装包。
- 默认安装包也暂不包含其他 `mckee-*` Skill，等待独立版权与授权审计。
- Electron Builder 采用显式核心 Skill allowlist，不会把整个 `.agents/skills`
  目录打包。
- 用户自行导入的本地 Skill 留在用户资料目录，不会回写应用包。
- 公开发布前需生成完整第三方依赖许可证清单，并完成 ChatGPT/Codex 第三方客户端
  的品牌、计费和商业条款确认。

## 自动化结果

- Domain：5 项测试。
- Storage：10 项测试。
- Skill Runtime：13 项测试。
- Agent Runtime：7 项测试。
- Import/Export：2 项测试。
- Desktop integration：5 项测试。

当前总计 42 项自动化测试。类型检查、Electron 生产构建和本机 Codex 结构化
调用均列入每次 Beta 构建的回归门槛。

Apple Silicon DMG 已通过 `hdiutil verify`、深度代码签名校验、Fuse 读取与从只读
磁盘映像实际启动；Intel x64 应用目录也通过深度签名与架构检查。本地包采用
ad-hoc hardened runtime 签名，构建脚本先在系统临时目录完成签名，避免工作区
扩展属性污染。它只能用于工程闭测，不替代公开发行所需的 Developer ID 与公证。

## 尚未关闭的 Beta 门槛

- Agent Job Manager 目前仍在 Electron Main 内编排；App Server 是子进程，但
  Beta 硬化前仍应把队列、协议解析和候选校验迁到 Utility Process。
- 本地素材路径不会发送给 Renderer；参考图通过 Main 校验、限定在项目 `assets/`
  目录内的 `aidirector-asset://` 协议读取，不使用 `file://`。
- 已配置 Electron fuses、ASAR integrity、最小 Info.plist 权限和显式 Skill
  allowlist；签名、公证、正式应用图标与 CI 协议兼容矩阵仍未完成。
