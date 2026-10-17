"use client";

import Link from "next/link";
import { CheckIcon, LockIcon } from "lucide-react";

import type { RailStep } from "@/lib/workspace";

export function StageStepper({ steps, active }: { steps: RailStep[]; active: string }) {
  return (
    <nav aria-label="阶段" className="flex h-full flex-col gap-1 overflow-auto border-r bg-background p-3">
      <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">本集阶段</p>
      <ol className="space-y-1">
        {steps.map((step, index) => {
          const current = step.id === active;
          return (
            <li key={step.id} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2">
              <div className="flex flex-col items-center">
                <StatusMark rail={step.rail} />
                {index < steps.length - 1 ? <span className="my-1 w-px flex-1 bg-border" /> : null}
              </div>
              <Link
                href={step.href}
                className={`mb-2 block rounded-lg px-2 py-1.5 ${current ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                aria-current={current ? "step" : undefined}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium">
                  {step.label}
                  <span className="text-[11px] font-normal">{step.status}</span>
                </span>
                <span className="mt-1 line-clamp-3 block text-[11px] leading-4">{step.detail}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StatusMark({ rail }: { rail: RailStep["rail"] }) {
  if (rail === "ready") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
        <CheckIcon className="size-3" />
      </span>
    );
  }
  if (rail === "gated") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full border border-dashed text-muted-foreground">
        <LockIcon className="size-3" />
      </span>
    );
  }
  if (rail === "warn") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full border border-foreground">
        <span className="size-2 rounded-full bg-foreground" />
      </span>
    );
  }
  return <span className="size-5 rounded-full border border-muted-foreground/50" />;
}
