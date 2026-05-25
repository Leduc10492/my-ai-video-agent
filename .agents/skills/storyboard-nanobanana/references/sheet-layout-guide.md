# 分镜纸版式设计指南

## 概述

线稿分镜故事板模拟专业分镜师的手绘草稿，用于快速视觉化故事、确认节奏，**不是最终彩色画面**。

---

## 版式结构

### 单Panel布局
```
┌─────────────────────────────────────┐
│  Shot_001                           │  ← 标签在左上
│                                     │
│         画面区域 (80%)               │
│      Scene Visual Area              │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  Shot 001 – Establishing / Cold     │  ← 笔记在底部（水平）
│  Wide Shot, Static, 4s              │
└─────────────────────────────────────┘
```

### 多Panel网格布局（3x3示例）
```
┌───────────┬───────────┬───────────┐
│ Shot_001  │ Shot_002  │ Shot_003  │
│  [画面]   │  [画面]   │  [画面]   │
│ ──────── │ ──────── │ ──────── │
│ Wide/4s   │ Med/3s    │ CU/2s     │
├───────────┼───────────┼───────────┤
│ Shot_004  │ Shot_005  │ Shot_006  │
│  [画面]   │  [画面]   │  [画面]   │
│ ──────── │ ──────── │ ──────── │
│ CU/2s     │ CU/5s     │ Med/3s    │
├───────────┼───────────┼───────────┤
│ Shot_007  │ Shot_008  │ Shot_009  │
│  [画面]   │  [画面]   │  [画面]   │
│ ──────── │ ──────── │ ──────── │
│ CU/3s     │ ECU/3s    │ Wide/5s   │
└───────────┴───────────┴───────────┘
```

**阅读顺序**: Z-Pattern（左到右，上到下）

---

## 视觉风格关键词

### 必须包含的风格锚点

```
Black and white storyboard sketch
professional graphite line art
[NxM] grid layout
visible panel borders
white margins
Technical notes written horizontally below the frame
'Shot_XXX' label in top-left
No vertical text
```

### 可选的风格增强

```
Graphite texture
cross-hatching shading
gestural line quality
cinematic composition
```

---

## Global Prompt（每批开头）

```
Black and white storyboard sketch, professional graphite line art. 
[情绪色调]. Consistent character DNA: [角色DNA列表]. 
[色调点缀] only. Clean storyboard sheet with visible panel borders, white margins. 
All text horizontal. Handwritten technical notes under each panel. 
No color, no realism, no finished illustration.
```

---

## Prompt模板

```
Black and white storyboard sketch. 
[NxM] grid layout. 
Panel [序号]: [景别], [机位]. 
[场景描述]. 
[角色DNA（完整）], [动作/姿态]. 
[环境/道具细节]. 
[情绪/氛围]. 
Graphite texture with [色调点缀]. 
Technical notes written horizontally below the frame: 'Shot XXX – [描述]'. 
'Shot_XXX' label in top-left. No vertical text. 
--ar 16:9
```

---

## 景别表达

| 景别 | 英文关键词 | 描述 |
|------|-----------|------|
| 全景 | wide shot panel, establishing view | 展示环境全貌 |
| 中景 | medium shot panel | 人物膝上或腰上 |
| 近景 | medium close-up panel | 人物胸部以上 |
| 特写 | close-up panel | 面部或物体细节 |
| 大特写 | extreme close-up panel | 眼睛、手指等局部 |

---

## 机位运动表达

| 运动 | 英文关键词 | 视觉暗示 |
|------|-----------|----------|
| 静止 | static frame | 无额外标注 |
| 推进 | dolly in arrows | 画面边缘加箭头指向中心 |
| 拉远 | dolly out arrows | 画面边缘加箭头指向外 |
| 跟拍 | tracking motion lines | 运动方向的速度线 |
| 摇镜 | pan direction arrows | 水平方向箭头 |

---

## 色调点缀

虽然主体是单色铅笔素描，但可以添加微妙的色调点缀以增加层次。

**根据场景情绪选择**：

| 情绪 | 色调关键词 |
|------|-----------|
| 冷/疏离 | `cold blue accents`, `cool gray highlights`, `icy rim light` |
| 暖/温馨 | `warm lighting accents`, `golden hour glow`, `warm highlight touches` |
| 中性 | `neutral gray tones`, `soft ambient light` |
| 紧张 | `harsh contrast`, `dramatic shadows` |
| 回忆 | `soft sepia tones`, `faded warm glow` |

这模拟了分镜师用彩色铅笔在重要区域做标记的习惯。

---

## 示例对比

### ❌ 错误：最终画面风格
```
Beautiful anime girl sitting by window, cherry blossoms, 
vibrant colors, detailed illustration, studio quality
```

### ✅ 正确：线稿分镜风格
```
Black and white storyboard sketch. 3x3 grid layout. 
Panel 5: Medium Shot, eye-level. Classroom interior. 
Long straight black hair, blunt bangs covering eyebrows, 
hazel gray eyes, pale complexion, Japanese sailor uniform, 
girl sitting by window with melancholic pose. 
Afternoon light through glass. Cold and distant atmosphere. 
Graphite texture with cool gray highlights. 
Technical notes written horizontally below the frame: 'Shot 015 – Window melancholy'. 
'Shot_015' label in top-left. No vertical text. 
--ar 16:9
```
