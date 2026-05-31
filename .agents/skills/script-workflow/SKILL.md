---
name: script-workflow
description: Legacy script-stage workflow kept for compatibility with older project docs. Prefer screenwriter-workflow as script.primary; use this only to interpret older references to the previous McKee-first script flow.
---

# 剧本创作工作流程

这是旧版 `script-writer` 剧本流程说明。当前默认剧本阶段总控是 `screenwriter-workflow`。

旧文档或历史记录提到 `script-workflow` 时，按兼容层理解：

- 入口职责迁移到 `screenwriter-workflow`。
- McKee 技能组保留为结构插件。
- 生产输出仍遵守 `deliverables/10_story/01_script_v{N}.md` 和 `01_audit_report_v{N}.md` 的 artifact 契约。

除非用户明确要求查看或恢复旧流程，不要把本文件当作默认剧本创作入口。

## 流程步骤

### 1. 接收输入

检查用户提供的内容类型:
- **简短概念/IDEA**: 需要扩写剧本 → 进入创作流程
- **完整剧本**: 直接进入审核或分镜流程 → 跳转到步骤3

### 2. 创作流程 (针对概念)

当用户提供简短描述时:

#### 2.1 询问创作需求
```
"请提供以下信息以便创作剧本:
1. 目标时长: __分钟
2. 类型: 剧情/动画/纪录/科幻/其他__
3. 风格偏好: 写实/艺术/商业/其他__
4. 特殊要求: __(如有)"
```

#### 2.2 调用mckee-create扩写剧本
- logline → beat outline → scene outline → first draft
- 遵循McKee故事原则
- 确保三幕结构完整

#### 2.3 保存剧本
调用 `artifact-formatter` skill:
- 路径: `deliverables/10_story/01_script_v{N}.md`
- 包含完整的artifact元数据
- 版本号: v1

#### 2.4 询问用户
```
"剧本已完成! 📖
是否需要进行McKee原则审核? (推荐)
- 是 → 进行结构审核
- 否 → 进入资产/风格指南流程"
```

### 3. 审核流程

如果用户选择审核:

#### 3.1 调用mckee-audit审核剧本
检查项目:
- Inciting Incident是否存在且明确
- Crisis是否存在且有力
- Climax是否解决核心冲突
- 角色欲望和动机是否一致
- 因果关系是否清晰

#### 3.2 生成审核报告
调用 `artifact-formatter` skill:
- 路径: `deliverables/10_story/01_audit_report_v{N}.md`
- 包含问题清单(P0-P3分级)
- 包含修复建议

#### 3.3 询问用户下一步
```
"审核报告已生成! ✅

发现的问题:
- P0 (必须修复): X个
- P1 (应该修复): X个  
- P2 (建议修复): X个
- P3 (可选优化): X个

请选择下一步操作:
1. 进行改稿 (生成修复计划)
2. 创意发散 (生成故事变体)
3. 节奏扩展 (优化节奏和信息流)
4. 场景修复 (修复特定场景)
5. 进入资产/风格指南流程 (不修改)"
```

### 4. 改稿流程

根据用户选择调用对应的McKee skill:

#### 选项1: 改稿计划
- 调用 `mckee-rewrite-plan`
- 生成结构化修复计划
- 按优先级组织修复任务

#### 选项2: 创意发散
- 调用 `mckee-variations`
- 生成不同的故事路径
- 探索替代方案

#### 选项3: 节奏扩展  
- 调用 `mckee-expand-pace`
- 优化节奏和信息流
- 调整exposition

#### 选项4: 场景修复
- 调用 `mckee-scene-doctor`
- 修复特定场景的问题
- 确保每场有desire/opposition/turning point

#### 改稿完成后
调用 `version-management` skill:
- 将旧版本移到archives
- 保存新版本到deliverables
- 更新changelog

询问: "是否需要继续修改?"

### 5. 完成确认

所有修改完成后:

```
"剧本工作已完成! 🎉

输出文件:
- 01_script_v{N}.md
- 01_audit_report_v{N}.md (如有)

下一步:
1. 继续修改剧本
2. 创建资产和风格指南 (guide-director)
3. 进入分镜构建流程 (storyboard-director)

请选择:"
```

## 流程图

```
用户输入
   ↓
[概念?] ─是→ 询问需求 → mckee-create → 保存
   ↓否                                       ↓
   ↓                                    询问审核?
保存剧本                                     ↓
   ↓                                    [是] [否]
   └────────────────┬───────────────────┘     ↓
                    ↓                      进入分镜
              mckee-audit
                    ↓
              生成报告
                    ↓
              询问下一步
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
 改稿计划      场景修复        创意发散...
    ↓               ↓               ↓
    └───────────────┴───────────────┘
                    ↓
              版本管理
                    ↓
            继续修改? ─否→ 完成交接
                ↑是
                └──────────┘
```

## 关键原则

1. **明确询问**: 每个决策点都询问用户确认
2. **渐进式**: 从简单到复杂,逐步完善
3. **基于文件**: 所有工作基于deliverables文件
4. **版本追踪**: 每次修改都记录版本
5. **质量优先**: 推荐但不强制审核

## 依赖的Skills

- `mckee-create`: 创作剧本
- `mckee-audit`: 审核剧本
- `mckee-rewrite-plan`: 改稿计划
- `mckee-scene-doctor`: 场景修复
- `mckee-expand-pace`: 节奏扩展
- `mckee-variations`: 创意变体
- `guide-workflow`: 资产和风格指南
- `artifact-formatter`: 输出格式化
- `version-management`: 版本管理
