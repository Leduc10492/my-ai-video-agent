# Deliverables Admin

This directory is the reusable starter state for a new file-based AI video workflow project.

A fresh GitHub clone already contains project-neutral starter directories for `1_story`, `2_assets`, and `3_shotlist`. Create the active project's files directly inside them; no parent `main/test` split is required.

All stage directories use one-digit prefixes: `0_admin`, `1_story`, `2_assets`, and `3_shotlist`. The two-digit prefixes remain only on files inside those directories.

It should stay project-neutral on `main`. Do not store story-specific scripts, reference images, generated previews, video tests, or historical project QA reports here.

## Files

| Path | Purpose |
| --- | --- |
| `workflow_state.json` | Created only when a project registers/imports a local script; explicit working and production references. Not shipped as starter state. |
| `workflow_state.previous.json` | Last verified state before an atomic switch; local recovery only. |
| `script_decisions/` | Actual hash-bound script/audit acceptance or autonomous scope evidence; local only. |
| `locks.md` | Project-specific constraints for the current active production run. Starts empty. |
| `changelog.md` | Version/history log for newly created deliverables. Starts with template guidance only. |
| `qa_reports/README.md` | Explains where persistent QA reports should be saved when a project creates them. |
| `qa_reports/workflow_audit_20260718.md` | Latest reusable workflow audit and clean-clone evidence. |

## Canonical Production Paths

```text
deliverables/
├── 0_admin/
│   ├── README.md
│   ├── locks.md
│   ├── changelog.md
│   └── qa_reports/
├── 1_story/
│   ├── 01_script_v{N}.md
│   └── 01_audit_report_v{N}.md
├── 2_assets/
│   ├── 02_asset_guide_v{N}.md
│   ├── 02_style_guide_v{N}.md
│   ├── refs/
│   └── generated_ref_v{N}/
└── 3_shotlist/
    └── <scene-label>_v{N}/
        ├── 03_shotlist_breakdown_<scene-label>_v{N}.md
        ├── Shotlist_<scene-label>_ZH_v{N}.html
        ├── manifest.md
        ├── spatial_blocking.md
        ├── assets/
        ├── previews/
        └── generated/
```

## Starter Rule

The GitHub `main` branch is a clean workflow starter. After cloning it as a new project directory, concrete project output belongs directly in that clone's `deliverables/` tree.

The production hierarchy is `Scene -> Shot Row -> Prompt Envelope`. Only Scene is a directory level; Shot Rows and Prompt Envelopes remain mappings inside the Scene files.

## 本地剧本入口

首次从 Notion 导入后以本地为准；未明确要求来源更新时不访问 Notion，直接改台词／剧情只修改本地工作稿。全量更新保留旧版，局部更新只推进指定范围基线，不自动回写。

主线程按 [本地剧本协议](../../.agents/skills/version-management/references/local-script-workflow.md) 使用 `pnpm workflow`。旧项目先运行 `status`，指定／核对当前文件后 `init`；多候选不按最高版本选择。工作稿与生产剧本／同版审计／接受记录各自明确，归档保持原路径兼容。

来源快照位于 `archives/1_story/notion_imports/`，失败候选不自动提升；`recover` 只处理本地保存状态。完整断点续跑、Skill 版本锁定、生成服务属于后续阶段。运行文件受 Git 忽略规则保护，通用模板不含实际剧本、Notion 地址或影片素材。
