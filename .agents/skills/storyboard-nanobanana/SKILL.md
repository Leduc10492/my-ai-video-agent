---
name: storyboard-nanobanana
description: 生成线稿分镜故事板提示词（Nano Banana Pro）。将分镜表转化为铅笔素描风格的分镜纸版式，用于确认故事节奏。当用户说"生成分镜提示词"、"生成故事板"、"storyboard prompts"或分镜表已完成需要视觉化时使用。
---

# 线稿分镜故事板提示词生成

将分镜表转化为 Nano Banana Pro 线稿提示词，生成铅笔素描风格的分镜纸版式。

这是 `.agents/skill_registry.md` 中 `storyboard.prompt_adapter` 槽位的当前默认实现。后续可以替换为其他分镜提示词 skill，但替换实现必须保留 `04_storyboard_prompts_v{N}.md` 输出、shot ID 覆盖、batch range、角色 DNA 和 reference mode 规则。

## 快速开始

### 输入/输出

| 类型 | 文件路径 | 必需 |
|------|----------|------|
| 输入 | `deliverables/30_breakdown/03_storyboard_v*.md` | ✅ |
| 输入 | `deliverables/20_guides/02_asset_guide_v*.md` | ✅ |
| 输出 | `deliverables/40_boards/04_storyboard_prompts_v{N}.md` | — |

### 工作流程

复制此检查清单并跟踪进度：

```
任务进度：
- [ ] 1. 读取分镜表和资产指南
- [ ] 2. 提取角色DNA
- [ ] 3. 按序列分批生成提示词
- [ ] 4. 每批等待用户确认
- [ ] 5. 输出完整提示词文件
```

---

## 步骤1：提取角色DNA

从最新 `02_asset_guide_v{N}.md` 中提取每个角色的不可变视觉特征：

```
角色DNA = [发型颜色] + [具体发型] + [面部特征] + [标志性服装]
```

**DNA变体规则**：根据场景选择对应变体（如 `<character>_school` vs `<character>_adult`）。

**详细规则**：见 [references/character-dna-guide.md](references/character-dna-guide.md)

---

## 步骤2：Grid 布局规则

**每批生成一张包含多个Panel的分镜纸**，布局自适应：

| 每批Shot数 | Grid布局 | 说明 |
|-----------|----------|------|
| 3 | 3x1 | 单行 |
| 6 | 3x2 | 两行 |
| 9 | 3x3 | 三行（最大单批） |

**超过9个时的分批规则**：
- 以3为列数，每批最多9个（3x3）
- 尽量平衡分配，每批接近3的倍数
- 示例：10个 = 6 + 4（3x2 + 2x2）
- 示例：12个 = 6 + 6（两个3x2）
- 示例：15个 = 9 + 6（3x3 + 3x2）

---

## 步骤3：构建Prompt

### 公式

```
prompt_text = 
  "Black and white storyboard sketch. " +
  "[Grid布局，如 3x2 grid layout]. " +
  "Panel [序号]: [景别], [机位]. " +
  "[场景描述]. " +
  "[角色DNA（完整）], [动作/姿态]. " +
  "[环境/道具细节]. " +
  "[情绪/氛围]. " +
  "Graphite texture with [色调点缀]. " +
  "Technical notes written horizontally below the frame: 'Shot XXX – [描述]'. " +
  "'Shot_XXX' label in top-left. No vertical text. " +
  "--ar 16:9"
```

### 关键规则

| 规则 | 说明 |
|------|------|
| ❌ 禁止泛指 | 不用 "a girl"、"a woman"、"a student" |
| ✅ 使用完整DNA | 必须嵌入角色的完整视觉特征 |
| ✅ 笔记在底部 | `Technical notes written horizontally below the frame` |
| ✅ 标签在左上 | `'Shot_XXX' label in top-left. No vertical text.` |

### 色调选择

| 情绪 | 色调关键词 |
|------|-----------|
| 冷/疏离 | `cold blue accents`, `cool gray highlights` |
| 暖/温馨 | `warm lighting accents`, `golden hour glow` |
| 中性 | `neutral gray tones`, `soft ambient light` |

### Global Prompt（每批开头）

每批生成时，先定义全局风格：

```
Black and white storyboard sketch, professional graphite line art. 
[情绪色调]. Consistent character DNA: [角色DNA列表]. 
[色调点缀] only. Clean storyboard sheet with visible panel borders, white margins. 
All text horizontal. Handwritten technical notes under each panel. 
No color, no realism, no finished illustration.
```

**版式详解**：见 [references/sheet-layout-guide.md](references/sheet-layout-guide.md)

---

## 步骤4：分批生成

**必须按序列分批，每批生成后等待用户确认**：

| 批次 | 序列 | 操作 |
|------|------|------|
| 1 | 序幕 | 生成 → 展示 → 等待确认 |
| 2 | 第一幕 | 生成 → 展示 → 等待确认 |
| 3 | 第二幕 | 生成 → 展示 → 等待确认 |
| 4 | 第三幕 | 生成 → 展示 → 等待确认 |
| 5 | 终章 | 生成 → 展示 → 等待确认 |

**每批完成后询问**：
> "序幕（Shot 001-009）已生成，是否继续生成第一幕？"

---

## 输出格式

**输出文件**：`deliverables/40_boards/04_storyboard_prompts_v{N}.md`（Markdown 格式）

### 文件结构规则

1. **每个批次独立分隔**：用 Markdown 标题分隔，不合并成一个大 JSON
2. **每批包含生成统计**：标题下方列出关键信息
3. **每批是完整独立的 JSON 代码块**：开头部分（meta、global_prompt、characters_dna）不能省略

### 批次模板

````markdown
---

## 批次 [N]：[序列名]（Shot XXX-YYY）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | [数量] |
| Grid布局 | [如 3x3 grid layout] |
| DNA锚定 | [使用的角色DNA变体] |
| 色调点缀 | [如 cold blue accents] |

```json
{
  "meta": {
    "model": "Nano-Banana-Pro",
    "sequence": "[序列名]",
    "shot_range": "Shot XXX-YYY",
    "shot_count": [数量],
    "layout": "[Grid布局]",
    "reading_order": "Z-Pattern (Left-to-Right, Top-to-Bottom)",
    "aspect_ratio": "--ar 16:9"
  },
  "global_prompt": "Black and white storyboard sketch, professional graphite line art. [情绪色调]. Consistent character DNA: [角色DNA列表]. [色调点缀] only. Clean storyboard sheet with visible panel borders, white margins. All text horizontal. Handwritten technical notes under each panel. No color, no realism, no finished illustration.",
  "characters_dna": {
    "[角色变体名]": "[完整DNA]"
  },
  "shots": [
    {
      "panel_index": 1,
      "prompt_text": "..."
    }
  ]
}
```
````

### 超过9个镜头时的分批处理

当一个序列超过9个镜头时，需要拆分成多个子批次，**每个子批次都是独立的 JSON 代码块**：

````markdown
---

## 批次 2a：第一幕（Shot 010-015）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 6 |
| Grid布局 | 3x2 grid layout |
| ... | ... |

```json
{ ... 完整独立的 JSON ... }
```

---

## 批次 2b：第一幕（Shot 016-019）

**生成统计**：
| 项目 | 值 |
|------|-----|
| 镜头数 | 4 |
| Grid布局 | 2x2 grid layout |
| ... | ... |

```json
{ ... 完整独立的 JSON ... }
```
````

**每批完成后询问**：
> "✅ 序幕（Shot 001-009）已生成，是否继续生成第一幕？"

---

## prompt_text 字段构建规则

详见 [references/prompt-examples.md](references/prompt-examples.md) 中的示例

---

## 详细参考

- **提示词示例**: [references/prompt-examples.md](references/prompt-examples.md)
- **分镜纸版式详解**: [references/sheet-layout-guide.md](references/sheet-layout-guide.md)
- **角色DNA提取规则**: [references/character-dna-guide.md](references/character-dna-guide.md)


## Reference Image Binding

For rough storyboard sheets, text DNA may be enough and outputs should be marked `text_dna_draft`.

For character-critical storyboard sheets or any sheet used as a visual continuity anchor:

- resolve local character reference images from `deliverables/20_guides/02_asset_guide_v{N}.md`
- load or attach the relevant reference images before generation
- label roles such as `<Character> identity reference` and `<Character> costume reference`
- write the generated folder README with `reference_mode: image_reference_bound` or `text_dna_draft`
