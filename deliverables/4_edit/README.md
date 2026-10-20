# 剪辑工程与导出

影视工作台将时间轴保存为 `timeline_v{N}.json`，每次手动保存和自动装配都生成独立版本。SQLite 中的版本与这里的 JSON 对应；历史版本不会被新 take 或新装配覆盖。

`exports/<job_id>/` 包含 `film.mp4`、`project.json`、`media-manifest.json`。媒体清单保留具体 `take_id`、标准文件名、路径、SHA-256 与素材入出点。缺失素材的时间轴不允许正式导出。

实际媒体、工程和导出默认留在本机，不提交 Git。参见 [工作台说明](../../workbench/README.md)。
