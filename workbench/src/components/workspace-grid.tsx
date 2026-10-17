"use client";

import { useState } from "react";
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";
import { toast } from "sonner";

import { StageStepper } from "@/components/stage-stepper";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RailStep } from "@/lib/workspace";

export type TaskPreview = {
  id: string;
  title: string;
  status: string;
  estimate: string;
};

export function WorkspaceGrid({
  steps,
  active,
  packet,
  tasks,
  children,
}: {
  steps: RailStep[];
  active: string;
  packet: string;
  tasks: TaskPreview[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  async function copyPacket() {
    await navigator.clipboard.writeText(packet);
    toast.success("已复制 Codex 提示词");
  }

  return (
    <div className={`grid h-[calc(100vh-3.5rem)] ${open ? "grid-cols-[232px_minmax(0,1fr)_320px]" : "grid-cols-[232px_minmax(0,1fr)]"}`}>
      <StageStepper steps={steps} active={active} />
      <div className="relative min-w-0 overflow-auto">
        <div className="sticky top-0 z-10 flex justify-end border-b bg-background/90 px-3 py-1.5 backdrop-blur">
          <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
            {open ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
            {open ? "收起 Codex" : "Codex 与任务"}
          </Button>
        </div>
        {children}
      </div>
      {open ? (
        <aside className="flex min-h-0 flex-col border-l bg-background">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div>
              <p className="text-sm font-medium">Codex 提示词</p>
              <p className="text-[11px] text-muted-foreground">默认只组包，不在这里执行。</p>
            </div>
            <Button size="sm" variant="outline" onClick={copyPacket}>
              复制
            </Button>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <pre className="px-3 py-3 font-mono text-[11px] leading-5 whitespace-pre-wrap">{packet}</pre>
          </ScrollArea>
          <div className="max-h-48 overflow-auto border-t px-3 py-2">
            <p className="text-sm font-medium">任务</p>
            {tasks.length === 0 ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">还没有任务。生成要先看估价再批准，工作台不扣费。</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="rounded-lg border px-2 py-1.5 text-xs">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-muted-foreground">
                      {task.status} · 估价 {task.estimate}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
