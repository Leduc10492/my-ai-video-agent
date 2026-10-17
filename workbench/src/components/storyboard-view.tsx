"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { BoardShot, SceneBoard } from "@/lib/production";
import type { Envelope } from "@/lib/shot-parse";

const COLUMNS = ["事实", "提示词包", "已生成", "已通过"] as const;

export function Storyboard({
  title,
  example,
  gateOpen,
  stale,
  auditDetail,
  scenes,
  envelopes,
  initialView,
  initialShot,
}: {
  title: string;
  example: boolean;
  gateOpen: boolean;
  stale: boolean;
  auditDetail: string;
  scenes: SceneBoard[];
  envelopes: Envelope[];
  initialView: "board" | "table" | "prompt";
  initialShot: string | null;
}) {
  const [view, setView] = useState(initialView);
  const [sceneId, setSceneId] = useState(scenes[0]?.id ?? "");
  const [shotId, setShotId] = useState<string | null>(initialShot);
  const [envelopeId, setEnvelopeId] = useState(envelopes[0]?.id ?? "");
  const scene = scenes.find((item) => item.id === sceneId) ?? scenes[0];
  const shots = scene?.shots ?? [];
  const shot = shots.find((item) => item.id === shotId) ?? shots.find((item) => item.id === initialShot) ?? null;
  const envelope = envelopes.find((item) => item.id === (view === "prompt" ? envelopeId : shot?.envelope));

  const ordered = shots;

  function openShot(id: string) {
    setShotId(id);
    setView((current) => (current === "prompt" ? "board" : current));
  }

  function step(direction: -1 | 1) {
    if (!shot) return;
    const index = ordered.findIndex((item) => item.id === shot.id);
    const next = ordered[index + direction];
    if (next) setShotId(next.id);
  }

  async function copyPrompt(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("已复制提示词包");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {example ? <Badge variant="secondary">示例数据</Badge> : <Badge variant="outline">当前仓库</Badge>}
          {stale ? <Badge variant="secondary">已过期</Badge> : null}
          {!gateOpen ? <Badge variant="destructive">未解锁</Badge> : null}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{auditDetail}</p>
      </header>
      {!gateOpen ? (
        <div className="rounded-lg border border-dashed px-3 py-2 text-sm leading-6">审核没通过。分镜保持锁定，这一页只说明原因。</div>
      ) : null}
      {stale ? (
        <div className="rounded-lg border px-3 py-2 text-sm leading-6">这份拆解对应的剧本哈希已经变了。标为已过期，不会自动重拆，也不会改提示词。</div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={scene?.id} onValueChange={(value) => setSceneId(String(value))}>
          <TabsList>
            {scenes.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.id}
                {item.shots.length === 0 ? " · 未拆" : ""}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ToggleGroup
          variant="outline"
          value={[view === "prompt" ? "prompt" : view]}
          onValueChange={(value) => {
            const next = value.at(-1);
            if (next === "board" || next === "table" || next === "prompt") setView(next);
          }}
        >
          <ToggleGroupItem value="board">看板</ToggleGroupItem>
          <ToggleGroupItem value="table">表格</ToggleGroupItem>
          <ToggleGroupItem value="prompt">提示词包</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {view === "prompt" ? (
        <PromptPane
          envelopes={envelopes}
          shots={scenes.flatMap((item) => item.shots)}
          envelopeId={envelopeId}
          onPick={setEnvelopeId}
          onCopy={copyPrompt}
        />
      ) : shots.length === 0 ? (
        <p className="text-sm text-muted-foreground">这一场还没有镜头行。一次只拆一个 Scene。</p>
      ) : view === "table" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>镜头行</TableHead>
              <TableHead>景别 / 机位</TableHead>
              <TableHead>动作</TableHead>
              <TableHead>提示词包</TableHead>
              <TableHead>列</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shots.map((item) => (
              <TableRow key={item.id} className="cursor-pointer" onClick={() => openShot(item.id)}>
                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                <TableCell>{item.scale}</TableCell>
                <TableCell>{item.action}</TableCell>
                <TableCell className="font-mono text-xs">{item.envelope || "—"}</TableCell>
                <TableCell>{item.column}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid gap-3 md:grid-cols-4">
          {COLUMNS.map((column) => (
            <section key={column} className="rounded-xl border bg-muted/20 p-2">
              <h2 className="px-1 py-2 text-sm font-medium">{column}</h2>
              <div className="space-y-2">
                {shots.filter((item) => item.column === column).map((item) => (
                  <button key={item.id} type="button" className="w-full rounded-lg border bg-background p-3 text-left" onClick={() => openShot(item.id)}>
                    <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                    <p className="mt-1 text-sm leading-6">{item.action}</p>
                  </button>
                ))}
                {shots.every((item) => item.column !== column) ? (
                  <p className="px-1 text-xs leading-5 text-muted-foreground">
                    {column === "已生成" || column === "已通过" ? "还没有成片。生成要先批准，这里不扣费。" : "这一列是空的。"}
                  </p>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      )}
      <Sheet open={Boolean(shot) && view !== "prompt"} onOpenChange={(open) => !open && setShotId(null)}>
        <SheetContent style={{ maxWidth: 760, width: "min(760px, 100%)" }}>
          {shot ? (
            <>
              <SheetHeader>
                <SheetTitle>
                  {shot.id} · {shot.scene}
                </SheetTitle>
                <SheetDescription>{shot.scale}</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 overflow-auto px-4 md:grid-cols-2">
                <div className="space-y-2 text-sm leading-6">
                  <h3 className="font-medium">镜头事实</h3>
                  <p>{shot.action}</p>
                  <p>
                    <span className="text-muted-foreground">台词 </span>
                    {shot.line}
                  </p>
                  <p>
                    <span className="text-muted-foreground">切镜理由 </span>
                    {shot.reason}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">提示词包 {shot.envelope || "还没有"}</h3>
                  {envelope ? (
                    <>
                      <pre className="rounded-lg border p-3 font-sans text-sm leading-6 whitespace-pre-wrap">{envelope.prompt}</pre>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {envelope.checklist.map((item) => (
                          <li key={item}>核对：{item}</li>
                        ))}
                      </ul>
                      <Button size="sm" variant="outline" onClick={() => copyPrompt(envelope.prompt)}>
                        复制提示词
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">这一镜还没有 cinedance-clean 写入的提示词。</p>
                  )}
                </div>
              </div>
              <div className="mt-auto flex gap-2 p-4">
                <Button variant="outline" onClick={() => step(-1)}>
                  上一镜
                </Button>
                <Button variant="outline" onClick={() => step(1)}>
                  下一镜
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PromptPane({
  envelopes,
  shots,
  envelopeId,
  onPick,
  onCopy,
}: {
  envelopes: Envelope[];
  shots: BoardShot[];
  envelopeId: string;
  onPick: (id: string) => void;
  onCopy: (text: string) => void;
}) {
  const envelope = envelopes.find((item) => item.id === envelopeId) ?? envelopes[0];
  if (!envelope) return <p className="text-sm text-muted-foreground">还没有 prompts.md。最终提示词只由 cinedance-clean 写入。</p>;
  const related = shots.filter((shot) => envelope.shots.includes(shot.id));
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-2">
        {envelopes.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${item.id === envelope.id ? "bg-muted" : ""}`}
            onClick={() => onPick(item.id)}
          >
            {item.id}
            <span className="mt-1 block text-xs text-muted-foreground">{item.seconds} 秒</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-medium">镜头事实（只读）</h2>
          {related.map((shot) => (
            <article key={shot.id} className="rounded-lg border p-3 text-sm leading-6">
              <p className="font-mono text-xs text-muted-foreground">{shot.id}</p>
              <p>{shot.action}</p>
              <p className="text-muted-foreground">{shot.line}</p>
            </article>
          ))}
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-medium">cinedance-clean 已写入</h2>
          <pre className="rounded-lg border p-3 text-sm leading-6 whitespace-pre-wrap">{envelope.prompt}</pre>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {envelope.checklist.map((item) => (
              <li key={item}>核对：{item}</li>
            ))}
          </ul>
          <Button variant="outline" onClick={() => onCopy(envelope.prompt)}>
            复制提示词
          </Button>
          <p className="text-xs leading-5 text-muted-foreground">工作台不改写这段文字，也没有「写提示词」。</p>
        </div>
      </div>
    </div>
  );
}
