# 项目管理目录

这是项目产出文件的管理目录，包含项目级别的配置和日志。

## 📁 本目录文件

| 文件 | 用途 |
|------|------|
| `changelog.md` | 项目变更日志 |
| `locks.md` | 全局约束条件 |
| `qa_reports/` | 持久化 QA 报告目录 |

## 📁 Deliverables结构

```
deliverables/
├── 00_admin/          # 管理目录（本目录）
├── 10_story/          # 剧本和审核报告
├── 20_guides/         # 资产和风格指南
├── 30_breakdown/      # 分镜表
├── 40_boards/         # 分镜提示词和图像
├── 50_art/            # 美术提示词和参考
└── 60_motion/         # 视频提示词和关键帧

archives/              # 历史版本归档
```

## 📋 标准文件路径

| 阶段 | 文件路径 |
|------|----------|
| 剧本 | `10_story/01_script_v{N}.md` |
| 审核 | `10_story/01_audit_report_v{N}.md` |
| 资产 | `20_guides/02_asset_guide_v{N}.md` |
| 风格 | `20_guides/02_style_guide_v{N}.md` |
| 分镜 | `30_breakdown/03_storyboard_v{N}.md` |
| 分镜提示词 | `40_boards/04_storyboard_prompts_v{N}.md` |
| 美术提示词 | `50_art/05_art_prompts_v{N}.md` |
| 视频提示词 | `60_motion/06_video_prompts_v{N}.md` |

## 🔄 版本管理

- 当前版本保存在 `deliverables/`，文件名也带版本后缀
- 旧版本归档到 `archives/` 对应子目录
- 归档命名: `<文件名>_v<版本号>.md`
