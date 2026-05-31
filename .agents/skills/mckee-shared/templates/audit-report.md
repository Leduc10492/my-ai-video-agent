# 审计报告模板

Default rendered report language: Simplified Chinese unless the user explicitly requests another language. Keep `P0/P1/P2/P3`, file paths, artifact IDs, and exact source quotes unchanged when needed.

## Format

```
标题:
媒介/格式:
幕结构模型:
Logline:

核心问题（按优先级）:
1) 问题:
   证据:
   影响:
   Severity: P0/P1/P2/P3
   修复建议:
2) 问题:
   证据:
   影响:
   Severity: P0/P1/P2/P3
   修复建议:

故事脊柱检查:
- 激励事件:
- 欲望对象:
- 必有场景:
- 危机选择:
- 高潮:
- 结局/新平衡:

幕/段落转折图:
- 第1幕/段落转折:
- 第2幕/段落转折:
- 第3幕/段落转折:
- 第4段转折（如使用8段结构）:
- 第5段转折（如使用8段结构）:
- 第6段转折（如使用8段结构）:
- 第7段转折（如使用8段结构）:
- 第8段转折（如使用8段结构）:

重点问题场景（最严重3个）:
- 场景:
  问题:
  修复:
```

## Severity Scale

- **P0**: 故事脊柱断裂（缺少激励事件、危机或高潮）
- **P1**: 幕/段落转折薄弱或缺失
- **P2**: 场景转折薄弱，价值变化不清楚
- **P3**: 信息铺陈、对白或润色问题

## Usage

Fill out each section based on the audit findings. Focus on structural issues first (P0/P1), then scene-level issues (P2), then polish concerns (P3). Render the filled report in Chinese by default.
