"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { needsSecondConfirm } from "@/lib/jobs/policy";

export type JobView = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  estCost: number;
  actualCost: number;
  projectId: string;
  episodeId: string | null;
  result: string | null;
};

export function RunsTable({
  jobs,
  files,
  media,
}: {
  jobs: JobView[];
  files: number;
  media: number;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<JobView | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("示例数据：补一张站台侧面");
  const [estCost, setEstCost] = useState("3");

  async function post(body: Record<string, unknown>) {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(payload.error ?? "没有完成");
      return false;
    }
    return true;
  }

  async function approve() {
    if (!target) return;
    if (step === 1 && needsSecondConfirm(target.estCost)) {
      setStep(2);
      return;
    }
    setPending(true);
    try {
      const ok = await post({ action: "approve", jobId: target.id, confirmedOverCap: step === 2 });
      if (!ok) return;
      toast.success("已批准。实际花费 0，没有调用付费接口。");
      setTarget(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function reject(id: string) {
    const ok = await post({ action: "reject", jobId: id });
    if (ok) {
      toast.success("已拒绝，没有扣费。");
      router.refresh();
    }
  }

  async function create() {
    const cost = Number(estCost);
    const ok = await post({
      action: "create",
      projectId: "moban",
      episodeId: "ep-01",
      title,
      estCost: cost,
    });
    if (ok) {
      toast.success("已建立申请。还没花钱。");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">任务与批准</h1>
          <Badge variant="secondary">示例数据</Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          生成先看估价，再由人批准。批准只记账，实际花费保持 0。超过 10 美元要再确认一次。工作台不调用付费接口。
        </p>
        <p className="text-xs text-muted-foreground">
          文件索引 {files} 条，媒体版本 {media} 条。删掉本地数据库后，索引和媒体可以从文件重建；日志和花费不会回来。
        </p>
      </header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>任务</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>估价</TableHead>
            <TableHead>实际</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-muted-foreground">
                  {job.projectId} / {job.episodeId ?? "—"}
                </p>
                {job.result ? <p className="mt-1 text-xs leading-5">{job.result}</p> : null}
              </TableCell>
              <TableCell>{job.statusLabel}</TableCell>
              <TableCell>{job.estCost.toFixed(2)} 美元</TableCell>
              <TableCell>{job.actualCost.toFixed(2)} 美元</TableCell>
              <TableCell>
                {job.status === "awaiting_approval" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setTarget(job);
                        setStep(1);
                      }}
                    >
                      批准
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject(job.id)}>
                      拒绝
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">无</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <section className="space-y-3 rounded-xl border p-4">
        <h2 className="text-sm font-medium">新建生成申请</h2>
        <p className="text-xs leading-5 text-muted-foreground">写进《末班》第 1 集。提交以后仍是待批准。</p>
        <div className="flex flex-wrap gap-2">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} className="max-w-md" />
          <Input value={estCost} onChange={(event) => setEstCost(event.target.value)} className="w-28" inputMode="decimal" />
          <Button variant="outline" onClick={create}>
            提交申请
          </Button>
        </div>
      </section>
      <AlertDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{step === 1 ? "批准这次生成？" : "估价超过 10 美元"}</AlertDialogTitle>
            <AlertDialogDescription>
              {target ? `${target.title}。估价 ${target.estCost.toFixed(2)} 美元。` : ""}
              {step === 1
                ? "确认后只把实际花费记成 0，不会向任何接口付款。"
                : "需要再确认一次。确认之后仍然不扣费，只是不让高估价悄悄通过。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>返回</AlertDialogCancel>
            <Button disabled={pending} onClick={approve}>
              {step === 1 && target && needsSecondConfirm(target.estCost) ? "继续" : "批准且不扣费"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
