# Third-party notices

工作台移植了下面这些文件里的一小段实现。每个移植文件开头都有来源说明。ArcReel（AGPL）、huobao-drama、waoowaoo、dramaclaw 只停留在产品想法，没有复制代码。ViMax 和 shuohao-skills 同样没有搬代码：分镜按场存放、角色锚点要人确认，这两点写在我们自己的文件里。

| 来源 | 许可证 | 移植到 |
| --- | --- | --- |
| [LingyiChen-AI/AIComicBuilder](https://github.com/LingyiChen-AI/AIComicBuilder) | Apache-2.0 | `src/lib/staleness.ts`（剧本哈希）、`src/lib/jobs/queue.ts`（原子领取） |
| [xuanyustudio/LocalMiniDrama](https://github.com/xuanyustudio/LocalMiniDrama) | MIT | `src/lib/skills-scan.ts` |
| [bo961386926/manga-studio](https://github.com/bo961386926/manga-studio) | MIT | `src/lib/export/pack.ts` |
| [alibaba/lumenx](https://github.com/alibaba/lumenx) | MIT | 未搬代码。阶段轨的 ready / warn / idle / gated 只采用状态名。 |
| [HKUDS/ViMax](https://github.com/HKUDS/ViMax) | MIT | 未搬代码。 |
| [eternityspring/shuohao-skills](https://github.com/eternityspring/shuohao-skills) | Apache-2.0 | 未搬代码。 |
