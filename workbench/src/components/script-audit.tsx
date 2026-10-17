"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Finding } from "@/lib/findings";
import type { ScriptFile } from "@/lib/workspace";

const LEVELS = ["P0", "P1", "P2", "P3"] as const;

export function ScriptAudit({
  title,
  example,
  gateOpen,
  stale,
  scriptHash,
  baselineHash,
  auditDetail,
  scripts,
  currentVersion,
  auditVersion,
  findings,
  initialStep,
}: {
  title: string;
  example: boolean;
  gateOpen: boolean;
  stale: boolean;
  scriptHash: string;
  baselineHash: string | null;
  auditDetail: string;
  scripts: ScriptFile[];
  currentVersion: number | null;
  auditVersion: number | null;
  findings: Finding[];
  initialStep: "script" | "audit";
}) {
  const router = useRouter();
  const [step, setStep] = useState<"script" | "audit">(initialStep);
  const [version, setVersion] = useState(currentVersion ?? scripts[0]?.version ?? 0);
  const saved = scripts.find((item) => item.version === version)?.text ?? "";
  const [draft, setDraft] = useState(saved);
  const [compareOpen, setCompareOpen] = useState(false);
  const [leftVersion, setLeftVersion] = useState(scripts[0]?.version ?? 0);
  const [rightVersion, setRightVersion] = useState(currentVersion ?? 0);
  const dirty = draft !== saved;

  const grouped = useMemo(() => {
    return Object.fromEntries(LEVELS.map((level) => [level, findings.filter((item) => item.level === level)])) as Record<
      (typeof LEVELS)[number],
      Finding[]
    >;
  }, [findings]);

  function onVersion(next: number) {
    setVersion(next);
    setDraft(scripts.find((item) => item.version === next)?.text ?? "");
  }

  function passAudit() {
    toast.success("审核是否通过只看报告文件。当前 P0 / P1 已经清空。");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {example ? <Badge variant="secondary">示例数据</Badge> : <Badge variant="outline">当前仓库</Badge>}
          <Badge variant={gateOpen ? "outline" : "destructive"}>{gateOpen ? "审核已通过" : "审核未通过"}</Badge>
          {stale ? <Badge variant="secondary">下游已过期</Badge> : null}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{auditDetail}</p>
      </header>

      {!gateOpen ? (
        <div className="rounded-lg border border-dashed px-3 py-2 text-sm leading-6">
          资产、分镜、提示词和生成已锁定。这些步骤仍可点开，用来看为什么进不去。要先修订剧本或复审，直到未解决的 P0 / P1 写成无。工作台不会自动改稿。
        </div>
      ) : null}
      {stale ? (
        <div className="rounded-lg border px-3 py-2 text-sm leading-6">
          当前剧本哈希 <span className="font-mono text-xs">{scriptHash}</span>
          {baselineHash ? (
            <>
              {" "}
              与基线 <span className="font-mono text-xs">{baselineHash}</span> 不同。
            </>
          ) : null}
          下游标为已过期，不会自动重跑。
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">剧本哈希 {scriptHash}</p>
      )}

      <Tabs
        value={step}
        onValueChange={(value) => {
          const next = value === "audit" ? "audit" : "script";
          setStep(next);
          const url = new URL(window.location.href);
          if (next === "audit") url.searchParams.set("step", "audit");
          else url.searchParams.delete("step");
          router.replace(`${url.pathname}?${url.searchParams.toString()}`);
        }}
      >
        <TabsList>
          <TabsTrigger value="script">剧本</TabsTrigger>
          <TabsTrigger value="audit">审核</TabsTrigger>
        </TabsList>
        <TabsContent value="script" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="script-version">
              版本
            </label>
            <select
              id="script-version"
              className="h-8 rounded-lg border bg-background px-2 text-sm"
              value={version}
              onChange={(event) => onVersion(Number(event.target.value))}
            >
              {scripts.map((item) => (
                <option key={item.version} value={item.version}>
                  v{item.version}
                  {item.version === currentVersion ? " · 当前" : ""}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" disabled={scripts.length < 2} onClick={() => setCompareOpen(true)}>
              对比版本
            </Button>
            {auditVersion ? <span className="text-xs text-muted-foreground">审核 v{auditVersion}</span> : null}
          </div>
          <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="min-h-[420px] font-mono text-xs leading-5" />
          <p className="text-xs leading-5 text-muted-foreground">
            {dirty
              ? "这段修改只在浏览器里。落盘并改变哈希之后，下游才会标成已过期，而且不会自动重跑。"
              : "编辑不写回文件。交付物目录仍是事实来源。"}
          </p>
        </TabsContent>
        <TabsContent value="audit" className="mt-4 space-y-4">
          <Tabs defaultValue="P1">
            <TabsList>
              {LEVELS.map((level) => (
                <TabsTrigger key={level} value={level}>
                  {level}
                  {grouped[level].some((item) => item.open) ? " · 未清" : ""}
                </TabsTrigger>
              ))}
            </TabsList>
            {LEVELS.map((level) => (
              <TabsContent key={level} value={level} className="mt-3">
                {grouped[level].length === 0 ? (
                  <p className="text-sm text-muted-foreground">这一级没有未关闭的条目。</p>
                ) : (
                  <ul className="space-y-2">
                    {grouped[level].map((item) => (
                      <li key={item.text} className="rounded-lg border px-3 py-2 text-sm leading-6">
                        <Badge variant={item.open ? "destructive" : "outline"} className="mr-2">
                          {item.open ? "未解决" : "已关闭"}
                        </Badge>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            ))}
          </Tabs>
          <Button disabled={!gateOpen} onClick={passAudit}>
            审核通过
          </Button>
          {!gateOpen ? <p className="text-xs text-muted-foreground">P0 或 P1 还没清空，不能通过。</p> : null}
        </TabsContent>
      </Tabs>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>剧本版本对比</DialogTitle>
            <DialogDescription>左右各选一个已落盘的版本。工作台不做自动合并。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: "左", value: leftVersion, set: setLeftVersion },
              { label: "右", value: rightVersion, set: setRightVersion },
            ].map((side) => (
              <div key={side.label} className="space-y-2">
                <select
                  className="h-8 rounded-lg border bg-background px-2 text-sm"
                  value={side.value}
                  onChange={(event) => side.set(Number(event.target.value))}
                  aria-label={`${side.label}侧版本`}
                >
                  {scripts.map((item) => (
                    <option key={item.version} value={item.version}>
                      v{item.version}
                    </option>
                  ))}
                </select>
                <pre className="max-h-96 overflow-auto rounded-lg border p-3 font-mono text-[11px] leading-5 whitespace-pre-wrap">
                  {scripts.find((item) => item.version === side.value)?.text ?? ""}
                </pre>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
