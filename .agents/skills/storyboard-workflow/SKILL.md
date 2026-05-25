---
name: storyboard-workflow
description: 分镜构建工作流程。从剧本拆解到结构化分镜表，并通过可替换的 storyboard.prompt_adapter 槽位生成分镜提示词。
---

# 分镜构建工作流程

`storyboard-director` agent的核心工作流程。

## 流程步骤

### 1. 接收输入并读取文件

#### 必需文件
- `deliverables/10_story/01_script_v*.md` - 剧本（最新版本）

#### 可选文件  
- `deliverables/20_guides/02_asset_guide_v*.md` - 资产指南
- `deliverables/20_guides/02_style_guide_v*.md` - 风格指南

如果缺少必需文件:
```
❌ 错误: 未找到剧本文件
请先完成剧本创作,或提供剧本文件路径
```

如果缺少可选文件:
```
⚠️ 提示: 未找到资产/风格指南
可继续生成分镜表，但分镜提示词、最终美术和视频阶段会缺少连续性依据。
建议先用 `guide-workflow` 创建指南；如用户明确要求，也可先产出结构分镜草案。
```

### 2. 生成分镜表

#### 2.1 分析剧本结构

调用 `storyboard-analysis` skill:
- 识别幕、序列、场景
- 提取叙事功能
- 确定镜头切分点

#### 2.2 生成结构化分镜表

使用本 workflow 的分镜表格式要求，并调用 `artifact-formatter` 校验输出包含:
- 镜头编号
- 景别(远景/全景/中景/近景/特写)
- 机位运动(固定/推拉/摇移/跟随)
- 时长估算
- 画面描述
- 对白/旁白
- 叙事功能
- 视觉重点

##### 分镜输出模板

每个镜头使用同一结构，避免下游 prompt 生成时缺字段：

```markdown
### Shot 001
**对应Beat**: Beat X
**景别**: <Wide / Medium / Close-Up / ECU / Montage>
**机位**: <Static / Tracking / Dolly In / Dolly Out / Pan / Tilt / Handheld>
**时长**: <seconds>

**画面描述**:
<只写画面可见内容，避免抽象心理独白>

**角色/场景**: <角色 + 场景>
**道具/视觉锚点**: <关键道具、屏幕、乐器、文件、光源等>
**对白/旁白**: <台词/VO/无>
**视觉重点**: <观众必须看到的信息>
**叙事功能**: <这一镜推进了什么>
**连续性备注**: <角色位置、视线方向、道具状态、色温>
```

##### Shot 计数规则

- 分镜统计表里的镜头数必须等于正文 `### Shot` 数量。
- 段落时长累计必须等于总时长预算，允许 5% 内浮动，超出需解释。
- 如果一个 Beat 被拆成多个 shot，写清楚每个 shot 的不同叙事功能。
- 如果多个 Beat 合并成一个 shot，写清楚为什么合并不会损失信息。
- 蒙太奇段落可用更短镜头，但必须保留视觉关联规则。

#### 2.3 保存分镜表

- 路径: `deliverables/30_breakdown/03_storyboard_v{N}.md`
- 包含完整artifact元数据
- 版本: 按当前最高版本递增

#### 2.4 询问用户

```
"分镜表已生成! 🎬

统计信息:
- 总镜头数: X个
- 估算时长: X分X秒
- 场景数: X个

是否需要修改分镜表?"
```

### 3. 修改流程

如果用户要求修改:

#### 3.1 理解修改需求
```
"请描述需要修改的内容:
- 镜号X的景别改为Y
- 增加Z场景的镜头
- 删除镜号A-B
- 调整时长
- 其他: ____"
```

#### 3.2 应用修改
- 更新分镜表内容
- 重新计算镜头统计
- 更新时长估算

#### 3.3 版本管理
调用 `version-management` skill:
- 归档旧版本
- 保存新版本
- 更新changelog

#### 3.4 再次询问
```
"修改已完成! ✅
是否需要继续修改?"
```

循环直到用户确认

### 4. 生成分镜提示词

用户确认分镜表后:

```
"分镜表已确认! 
现在根据 `.agents/skill_registry.md` 选择分镜提示词适配器..."
```

#### 4.1 选择提示词适配器

读取 `.agents/skill_registry.md` 的 `storyboard.prompt_adapter` 槽位:
- 默认实现: `storyboard-nanobanana`
- 替换实现必须输出 `deliverables/40_boards/04_storyboard_prompts_v{N}.md`
- 替换实现必须保留 shot ID、shot count、batch range、角色 DNA 和 reference mode 标记

#### 4.2 生成提示词

调用槽位当前实现:
- 适配用户选择或默认的平台
- 引用asset_guides中的角色描述
- 引用style_guides中的风格描述
- 每个镜头生成独立的prompt对象或平台要求的等价结构

#### 4.3 保存提示词

- 路径: `deliverables/40_boards/04_storyboard_prompts_v{N}.md`
- 格式: Markdown artifact，可内含 JSON、表格或平台特定代码块

#### 4.4 提示用户

```
"分镜提示词已生成! 📋

输出文件:
- 04_storyboard_prompts_v{N}.md (含X个镜头提示词)

使用方法:
1. 按批次复制对应提示词块
2. 导入当前适配器对应的平台或工具
3. 根据预览效果微调seed、参考图或参数

生成的图像保存到: deliverables/40_boards/generated/"
```

### 5. 完成确认

询问用户下一步:

```
"分镜工作已完成! 🎉

输出文件:
- 03_storyboard_v{N}.md
- 04_storyboard_prompts_v{N}.md

下一步选择:
1. 继续修改分镜
2. 进入美术设计流程 (artist-director)
3. 进入动画设计流程 (animation-director)
4. 返回修改剧本 (script-writer)

请选择:"
```

## 流程图

```
读取剧本
   ↓
分析结构 → 生成分镜表 → 保存
                ↓
           询问修改?
           ↙     ↘
         是       否
         ↓        ↓
    应用修改   生成提示词
         ↓        ↓
    版本管理    保存
         ↓        ↓
    再次询问    完成确认
         ↓
    [循环] ──────┘
```

## 特殊场景处理

### 四宫格序列扩展

如果用户要求"将镜头X扩展为四宫格":

使用本 workflow 的四宫格扩展规则:
1. 分析选中镜头的动作/情绪
2. 扩展为4个连贯镜头 (X-A, X-B, X-C, X-D)
3. 更新分镜表
4. 生成对应的连续提示词

### 蒙太奇序列

如果包含蒙太奇:
1. 标注蒙太奇段落
2. 确保视觉关联性
3. 控制节奏(1-2秒/镜)
4. 明确叙事功能

## 关键原则

1. **忠实剧本**: 分镜服务于剧本叙事
2. **视觉语言**: 每个镜头有明确的视觉目的
3. **时长控制**: 总时长符合预算
4. **一致性**: 引用资产和风格指南
5. **迭代优化**: 支持多轮修改

## 依赖的Skills

- `storyboard-analysis`: 剧本结构分析
- `storyboard.prompt_adapter`: 分镜提示词适配槽位，当前默认 `storyboard-nanobanana`
- `artifact-formatter`: 分镜表和提示词输出格式
- `version-management`: 版本管理
- `qa-checklists`: 分镜质量检查
