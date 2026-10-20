import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  CircleAlert,
  Download,
  ExternalLink,
} from "lucide-react";
import { Badge, Button, Dialog, Input, Textarea } from "./components/ui";
import { post, pretty, time } from "./lib/api";
import BatchReview from "./BatchReview";
const labels: Record<string, string> = {
  queued: "排队中",
  starting: "启动中",
  running: "执行中",
  submitted: "生成中",
  submitting: "正在提交",
  submission_unknown: "提交结果待核对",
  generated: "已生成",
  downloading: "回收中",
  checked: "媒体检查通过",
  completed: "已完成",
  awaiting_choice: "需选择用量方式",
  awaiting_approval: "待确认",
  failed: "失败",
  download_failed: "下载失败",
  needs_attention: "需要处理",
  interrupted: "已中断",
  rejected: "未提交",
  awaiting_review: "待审阅",
  applied: "已保存",
};
function PlanPreview({ value }: { value: any }) {
  if (!value) return null;
  return (
    <div className="space-y-3">
      {value.assets?.map((a: any) => (
        <div key={a.asset_name} className="rounded-xl border p-3 text-sm">
          <div className="font-medium">
            {a.display_name}{" "}
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {a.asset_name}
            </span>
          </div>
          <p className="mt-2 leading-6">{a.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {a.scenes?.join(" · ")} · tag：{a.tag || "未提供"}
          </p>
        </div>
      ))}
      {Object.entries(value.scene_plans || {}).map(
        ([scene, p]: [string, any]) => (
          <details key={scene} className="rounded-xl border p-3" open>
            <summary className="cursor-pointer text-sm font-medium">
              {scene} · 空间与连续性设计
            </summary>
            <p className="mt-2 text-sm leading-6">{p.synopsis}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {p.blocking}
            </p>
            {p.continuity_notes?.map((n: string, i: number) => (
              <p key={i} className="mt-2 text-xs text-muted-foreground">
                {n}
              </p>
            ))}
          </details>
        ),
      )}
      {value.shots?.map((s: any) => (
        <details key={s.id} className="rounded-xl border p-3">
          <summary className="cursor-pointer text-sm font-medium">
            {s.id} · {s.title}{" "}
            <span className="text-muted-foreground">{s.duration_seconds}s</span>
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-6">
            <p>{s.description}</p>
            <p>{s.camera}</p>
            <p>{s.sound}</p>
            {s.dialogue?.map((d: any, i: number) => (
              <p key={i}>
                {d.speaker_cue.replace(/[：:]$/, "")}：{d.text}
              </p>
            ))}
            {s.risks?.map((r: string, i: number) => (
              <p key={i} className="text-muted-foreground">
                待确认：{r}
              </p>
            ))}
          </div>
        </details>
      ))}
      {value.envelopes?.length > 0 && (
        <details className="rounded-xl border p-3">
          <summary className="cursor-pointer text-sm font-medium">
            生成片段编组 · {value.envelopes.length} 个 Envelope
          </summary>
          <div className="mt-3 space-y-3">
            {value.envelopes.map((e: any) => (
              <div key={e.id} className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="break-all font-mono text-xs">{e.asset_name}</p>
                <p className="mt-2">
                  {e.source_rows.join(" → ")} · {e.duration_seconds}s
                </p>
                <p className="mt-1 leading-6 text-muted-foreground">
                  {e.grouping_reason}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
export default function JobsPanel({ base, data, open, setOpen, run }: any) {
  const [selected, setSelected] = useState<any>(null),
    [remote, setRemote] = useState(""),
    [answer, setAnswer] = useState("");
  useEffect(() => {
    if (selected?.type === "job") {
      const updated = data.jobs.find((j: any) => j.job_id === selected.job_id);
      if (updated) setSelected({ ...updated, type: "job" });
    }
    if (selected?.type === "skill_batch") {
      const updated = data.skill_batches?.find(
        (b: any) => b.batch_id === selected.batch_id,
      );
      if (updated) setSelected({ ...updated, type: "skill_batch" });
    }
  }, [data.jobs, data.skill_batches]);
  const pending = data.batches.filter(
      (b: any) => b.status === "awaiting_approval",
    ),
    working = data.jobs.filter((j: any) =>
      [
        "queued",
        "starting",
        "running",
        "submitted",
        "submitting",
        "downloading",
      ].includes(j.status),
    );
  return (
    <div className="jobs-panel shrink-0 border-t bg-background">
      <button
        aria-expanded={open}
        aria-controls="workbench-jobs"
        className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm"
        onClick={() => setOpen(!open)}
      >
        {working.length ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Check size={14} />
        )}
        <span className="shrink-0 font-medium">任务</span>
        <span className="text-xs text-muted-foreground">
          {working.length} 进行中 · {data.jobs.length} 条记录
          {pending.length ? ` · ${pending.length} 批待确认` : ""}
        </span>
        {open ? (
          <ChevronDown className="ml-auto" size={15} />
        ) : (
          <ChevronUp className="ml-auto" size={15} />
        )}
      </button>
      {open && (
        <div id="workbench-jobs" className="max-h-[min(240px,35dvh)] overflow-auto border-t">
          <div className="divide-y">
            {(data.skill_batches || []).map((batch: any) => (
              <div
                key={batch.batch_id}
                className="flex items-center gap-3 px-5 py-3 text-sm"
              >
                <Badge>{labels[batch.status] || batch.status}</Badge>
                <span>
                  分镜批次 ·{" "}
                  {
                    batch.items.filter((i: any) =>
                      ["completed", "applied"].includes(i.status),
                    ).length
                  }
                  /{batch.items.length} 场完成
                </span>
                <Button
                  className="ml-auto"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected({ ...batch, type: "skill_batch" })}
                >
                  查看整批
                </Button>
              </div>
            ))}
            {data.pending?.map((r: any) => (
              <div
                key={r.request_id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <CircleAlert size={14} />
                <span className="text-sm">Codex 等待你的决定 · {r.method}</span>
                <Button
                  className="ml-auto"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelected({ type: "request", ...r });
                    setAnswer("");
                  }}
                >
                  查看请求
                </Button>
              </div>
            ))}
            {pending.map((b: any) => (
              <div
                key={b.batch_id}
                className="flex items-center gap-3 px-5 py-3 text-sm"
              >
                <Badge>待确认</Badge>
                <span>{b.request.items.length} 项生成批次</span>
                <span className="text-xs text-muted-foreground">
                  {time(b.created_at)}
                </span>
                <Button
                  className="ml-auto"
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected({ type: "batch", ...b })}
                >
                  审阅整批
                </Button>
              </div>
            ))}
            {[...data.jobs].reverse().map((job: any) => (
              <div
                key={job.job_id}
                className="flex items-center gap-3 px-5 py-3 text-sm"
              >
                <Badge>{labels[job.status] || job.status}</Badge>
                <span className="truncate">
                  {job.request?.asset_name ||
                    (
                      {
                        skill: "Skill · " + job.stage,
                        render: `导出时间轴 v${job.revision}`,
                      } as any
                    )[job.kind]}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {time(job.updated_at)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelected({ type: "job", ...job });
                    setRemote("");
                  }}
                >
                  详情
                </Button>
                {job.kind === "render" && job.status === "completed" && (
                  <a
                    className="inline-flex items-center gap-1 text-xs underline"
                    href={`/api${base}/exports/${job.job_id}/mp4`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={13} />
                    MP4
                  </a>
                )}
              </div>
            ))}
            {!data.jobs.length && !pending.length && (
              <p className="px-5 py-5 text-sm text-muted-foreground">
                这里记录
                Skills、生成、素材回收和导出进度。关闭面板或刷新页面不会取消后台生成。
              </p>
            )}
          </div>
        </div>
      )}
      <Dialog
        wide
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={
          selected?.type === "batch"
            ? "审阅生成批次"
            : selected?.type === "skill_batch"
              ? "审阅分镜批次"
              : selected?.type === "request"
                ? "Codex 请求"
                : "任务详情"
        }
        description={
          selected?.type === "batch"
            ? "核对文件名、Prompt 与用量方式，确认后提交整批。"
            : "保留执行状态与实际返回记录。"
        }
      >
        <div className="space-y-4">
          {selected?.type === "batch" ? (
            <>
              <BatchReview request={selected.request} />
              <Button
                onClick={() =>
                  run(async () => {
                    await post(`${base}/batches/${selected.batch_id}/approve`, {
                      sha256: selected.sha256,
                    });
                    setSelected(null);
                  }, "整批已确认")
                }
              >
                确认名称、Prompt 与用量方式并提交
              </Button>
            </>
          ) : selected?.type === "skill_batch" ? (
            <>
              <p className="text-sm text-muted-foreground">
                每场的设计与风险保留在下方。保存时只合并本批
                Scene；若目标场有新的手动编辑，会先提示冲突。
              </p>
              {selected.items.map((item: any) => {
                const job = data.jobs.find(
                  (j: any) => j.job_id === item.job_id,
                );
                return (
                  <details key={item.scene} className="rounded-xl border p-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      {item.scene} · {labels[item.status] || item.status} ·{" "}
                      {job?.result?.structured?.shots?.length || 0} 镜
                    </summary>
                    {item.error && (
                      <p className="my-3 text-sm text-destructive">
                        {item.error}
                      </p>
                    )}
                    <p className="my-3 text-sm leading-6">
                      {job?.result?.summary || "等待本场完成…"}
                    </p>
                    <PlanPreview value={job?.result?.structured} />
                  </details>
                );
              })}
              {selected.status === "needs_attention" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    run(async () => {
                      await post(
                        `${base}/skill-batches/${selected.batch_id}/continue`,
                      );
                    }, "已核对原任务并继续未完成场次")
                  }
                >
                  恢复未完成场次
                </Button>
              )}
              <Button
                disabled={!["awaiting_review"].includes(selected.status)}
                onClick={() =>
                  run(async () => {
                    await post(
                      `${base}/skill-batches/${selected.batch_id}/apply`,
                      { sha256: selected.result_sha256 },
                    );
                    setSelected(null);
                  }, "整批已保存并载入分镜")
                }
              >
                {selected.status === "applied"
                  ? "整批已保存"
                  : "审阅完成，保存并载入整批"}
              </Button>
            </>
          ) : selected?.type === "request" ? (
            <>
              <pre className="max-h-72 overflow-auto rounded-md border p-3 text-xs">
                {pretty(selected.params)}
              </pre>
              {selected.method.includes("requestApproval") ||
              ["execCommandApproval", "applyPatchApproval"].includes(
                selected.method,
              ) ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      run(async () => {
                        await post(`/requests/${selected.request_id}/answer`, {
                          decision: "decline",
                        });
                        setSelected(null);
                      })
                    }
                  >
                    拒绝
                  </Button>
                  <Button
                    onClick={() =>
                      run(async () => {
                        await post(`/requests/${selected.request_id}/answer`, {
                          decision: "accept",
                        });
                        setSelected(null);
                      })
                    }
                  >
                    允许这次操作
                  </Button>
                </div>
              ) : (
                <>
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="填写回答；多个问题按顺序，每题一行"
                  />
                  <Button
                    onClick={() =>
                      run(async () => {
                        const response =
                          selected.method === "item/tool/requestUserInput"
                            ? {
                                answers: Object.fromEntries(
                                  (selected.params.questions || []).map(
                                    (q: any, i: number) => [
                                      q.id,
                                      {
                                        answers: [
                                          answer.split("\n")[i] || answer,
                                        ],
                                      },
                                    ],
                                  ),
                                ),
                              }
                            : {
                                action: "accept",
                                content: JSON.parse(answer),
                                _meta: null,
                              };
                        await post(
                          `/requests/${selected.request_id}/answer`,
                          response,
                        );
                        setSelected(null);
                      })
                    }
                  >
                    提交回答
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      run(async () => {
                        await post(`/requests/${selected.request_id}/answer`, {
                          action: "decline",
                          content: null,
                          _meta: null,
                        });
                        setSelected(null);
                      })
                    }
                  >
                    取消请求
                  </Button>
                </>
              )}
            </>
          ) : (
            selected && (
              <>
                {selected.error && (
                  <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
                    {selected.error}
                  </p>
                )}
                {selected.kind === "skill" && (
                  <pre className="max-h-72 overflow-auto rounded-md border p-4 text-sm leading-6">
                    {selected.result?.summary ||
                      (selected.protocol === "workbench-plan-v1"
                        ? "正在整理设计，完成后会显示可审阅的镜头与编组。"
                        : selected.output || "等待返回…")}
                  </pre>
                )}
                {selected.metrics && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>
                      {selected.actual_model ||
                        selected.model ||
                        "沿用 Codex 模型"}{" "}
                      · {selected.effort || "默认"}
                    </span>
                    {selected.metrics.elapsed_ms != null && (
                      <span>
                        执行 {(selected.metrics.elapsed_ms / 1000).toFixed(1)}{" "}
                        秒
                      </span>
                    )}
                    {selected.metrics.token_usage?.last && (
                      <span>
                        最近上下文{" "}
                        {selected.metrics.token_usage.last.inputTokens.toLocaleString()}{" "}
                        token
                      </span>
                    )}
                    {selected.metrics.token_usage?.total && (
                      <span>
                        累计输出{" "}
                        {selected.metrics.token_usage.total.outputTokens.toLocaleString()}{" "}
                        token
                      </span>
                    )}
                  </div>
                )}
                <PlanPreview value={selected.result?.structured} />
                {selected.result?.artifacts?.map((a: any) => (
                  <details key={a.path} className="rounded-md border p-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      {a.path}
                    </summary>
                    <pre className="mt-3 max-h-72 overflow-auto text-xs leading-6">
                      {a.content}
                    </pre>
                  </details>
                ))}
                {selected.result?.artifacts && (
                  <Button
                    disabled={!!selected.applied_at}
                    onClick={() =>
                      run(
                        async () => {
                          await post(
                            `${base}/skills/${selected.job_id}/apply`,
                            {
                              sha256: selected.result_sha256,
                            },
                          );
                          setSelected(null);
                        },
                        selected.protocol === "workbench-plan-v1"
                          ? "产物已保存并载入工作台"
                          : "已保存审阅后的产物",
                      )
                    }
                  >
                    {selected.applied_at
                      ? "已保存产物"
                      : "审阅完成，保存这些产物"}
                  </Button>
                )}
                {["submission_unknown", "needs_attention"].includes(
                  selected.status,
                ) &&
                  selected.kind === "generation" && (
                    <div className="space-y-2">
                      <p className="text-sm">
                        先在 Higgsfield 核对生成记录，再绑定实际 job ID。
                      </p>
                      <Input
                        value={remote}
                        onChange={(e) => setRemote(e.target.value)}
                        placeholder="远端任务 UUID"
                      />
                      <Button
                        onClick={() =>
                          run(async () => {
                            await post(
                              `${base}/jobs/${selected.job_id}/reconcile`,
                              {
                                remote_id: remote,
                                evidence: "用户在任务详情中手动核对并绑定",
                              },
                            );
                            setSelected(null);
                          })
                        }
                      >
                        绑定并继续查询
                      </Button>
                    </div>
                  )}
                {selected.status === "awaiting_choice" && (
                  <>
                    <pre className="text-xs">{pretty(selected.choice)}</pre>
                    <div className="flex gap-2">
                      {[true, false].map((choice) => (
                        <Button
                          key={String(choice)}
                          variant={choice ? "default" : "outline"}
                          onClick={() =>
                            run(async () => {
                              await post(
                                `${base}/jobs/${selected.job_id}/choice`,
                                { use_unlim: choice },
                              );
                              setSelected(null);
                            })
                          }
                        >
                          {choice ? "使用 Unlim" : "使用 credits"}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
                {selected.status === "download_failed" && (
                  <Button
                    onClick={() =>
                      run(async () => {
                        await post(
                          `${base}/jobs/${selected.job_id}/retry-download`,
                        );
                        setSelected(null);
                      })
                    }
                  >
                    重试下载（不重新生成）
                  </Button>
                )}
                {selected.kind === "skill" &&
                  ["interrupted", "needs_attention"].includes(
                    selected.status,
                  ) && (
                    <>
                      <Textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="继续本阶段的要求；先核对已有输出"
                      />
                      <Button
                        onClick={() =>
                          run(async () => {
                            await post(
                              `${base}/skills/${selected.job_id}/continue`,
                              {
                                instruction:
                                  answer ||
                                  "恢复本阶段，先核对已有输出，避免重复工作。",
                              },
                            );
                            setSelected(null);
                          })
                        }
                      >
                        恢复原会话
                      </Button>
                    </>
                  )}
                {selected.kind === "render" &&
                  selected.status === "completed" && (
                    <div className="flex gap-4">
                      {[
                        ["mp4", "MP4"],
                        ["json", "可编辑工程 JSON"],
                        ["manifest", "媒体引用清单"],
                      ].map(([format, label]) => (
                        <a
                          key={format}
                          className="text-sm underline"
                          href={`/api${base}/exports/${selected.job_id}/${format}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {label}
                        </a>
                      ))}
                    </div>
                  )}
                <details>
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    完整任务记录
                  </summary>
                  <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {pretty(selected)}
                  </pre>
                </details>
              </>
            )
          )}
        </div>
      </Dialog>
    </div>
  );
}
