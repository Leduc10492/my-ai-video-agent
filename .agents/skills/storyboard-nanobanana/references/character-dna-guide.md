# 角色DNA提取规则

角色DNA是从资产指南和参考图中提取的不可变视觉特征，用于确保线稿分镜、关键帧和后续视频提示词保持角色一致。

## DNA组成公式

```text
角色DNA = 发型/发色 + 面部特征 + 体态/年龄段 + 标志性服装 + 标志性道具
```

## 从02_asset_guide_v{N}.md提取

在最新资产指南中找到每个角色的提示词关键词、参考图路径和变体说明。

示例：

```markdown
### Character A

**Reference image**: `refs/character_a_school.png`

**Hair keywords**
short black hair, straight bangs, neat silhouette

**Face keywords**
oval face, dark brown eyes, reserved expression

**Costume keywords**
school uniform, navy jacket, white shirt, red ribbon
```

合并为 DNA：

```text
character_a_school: short black hair, straight bangs, neat silhouette, oval face, dark brown eyes, reserved expression, school uniform, navy jacket, white shirt, red ribbon
```

## DNA使用规则

每个包含命名角色的 `prompt_text` 必须显式包含对应 DNA。不要用泛指词替代。

正确：

```json
{
  "prompt_text": "Black and white storyboard sketch. Panel 3: Medium Shot, eye-level. Short black hair, straight bangs, oval face, dark brown eyes, reserved expression, school uniform with navy jacket and red ribbon. Character A stands by the classroom window, hands still, restrained posture. Technical notes written horizontally below the frame: 'Shot 003 - Window pause'. No vertical text. --ar 16:9"
}
```

错误：

```json
{
  "prompt_text": "Black and white storyboard sketch. A girl stands by the classroom window, sad expression. --ar 16:9"
}
```

问题：`a girl` 会让图像模型随机生成角色，无法保持连续性。

## 场景变体

同一角色在不同时间、年龄或服装状态下可以有不同 DNA 变体。

| 场景 | DNA变体示例 |
| --- | --- |
| 学校时期 | `character_a_school` |
| 成年时期 | `character_a_adult` |
| 工作制服 | `character_a_work_uniform` |
| 节日服装 | `character_a_festival` |

选择 DNA 时以分镜表和资产指南为准。若资产指南没有对应变体，先补资产指南或在输出中明确限制。

## 检查清单

- [ ] 这个镜头是否包含命名角色？
- [ ] 是否选择了正确的 DNA 变体？
- [ ] DNA 是否完整嵌入 prompt？
- [ ] 是否避免了 `a girl`、`a man`、`a student` 等泛称？
- [ ] 如果该图会作为生产连续性锚点，是否加载了本地 reference image？
