"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { routeRequest } from "@/lib/router";
import type { RouteContext, RouteGate } from "@/lib/types";

const SAMPLES = [
  "把第二场拆成分镜",
  "审核最新剧本有没有未解决的 P0",
  "给林夏写资产和风格指南",
  "根据第二场的 Breakdown 生成中文分镜表",
  "检查第二场的镜头行和提示词包",
  "把第二场生成视频",
];

const GATE_VARIANT: Record<RouteGate["level"], "destructive" | "secondary" | "outline"> = {
  block: "destructive",
  warn: "secondary",
  info: "outline",
};

const GATE_LABEL: Record<RouteGate["level"], string> = {
  block: "阻断",
  warn: "需要确认",
  info: "说明",
};

export function RouterDesk({ context, initialQuery }: { context: RouteContext; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const result = useMemo(
    () => (submitted.trim() ? routeRequest(submitted, context) : null),
    [submitted, context],
  );

  async function copyPrompt() {
    if (!result) return;
    await navigator.clipboard.writeText(result.prompt);
    toast.success("已复制 Codex 提示词");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>请求</CardTitle>
          <CardDescription>
            用制作时会说的话写。路由只看关键词和阶段规则，不把这句话发给模型。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如：把第二场拆成分镜"
            className="min-h-40"
            aria-label="制作请求"
          />
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <Button
                key={sample}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery(sample);
                  setSubmitted(sample);
                }}
              >
                {sample}
              </Button>
            ))}
          </div>
          <Button type="button" onClick={() => setSubmitted(query)}>
            路由
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>路由结果</CardTitle>
          <CardDescription>数据源：{context.sourceLabel}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{result.stageLabel}</h2>
                {result.stageStatus ? <StatusBadge status={result.stageStatus} /> : null}
                <Badge variant="outline">{result.slot}</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>项</TableHead>
                    <TableHead>路由</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>主 Skill</TableCell>
                    <TableCell className="font-mono text-xs">{result.skill}</TableCell>
                  </TableRow>
                  {result.pluginSlot ? (
                    <TableRow>
                      <TableCell>调用 Slot</TableCell>
                      <TableCell>
                        {result.pluginSlot}
                        {result.pluginSkill ? ` · ${result.pluginSkill}` : ""}
                      </TableCell>
                    </TableRow>
                  ) : null}
                  <TableRow>
                    <TableCell>子代理</TableCell>
                    <TableCell>{result.owner}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>场次</TableCell>
                    <TableCell>{result.sceneLabel ? `${result.sceneLabel}（${result.sceneMention}）` : "请求里没有场次"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>执行</TableCell>
                    <TableCell>{result.subAgentNote}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div>
                <h3 className="mb-1 text-sm font-medium">为什么</h3>
                <p className="text-sm leading-6 text-muted-foreground">{result.why}</p>
                {result.stageDetail ? <p className="mt-1 text-sm leading-6">{result.stageDetail}</p> : null}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">门禁</h3>
                {result.gates.map((gate) => (
                  <div key={`${gate.level}-${gate.title}`} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant={GATE_VARIANT[gate.level]}>{GATE_LABEL[gate.level]}</Badge>
                      <span className="text-sm font-medium">{gate.title}</span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{gate.text}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium">需要读取</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {result.inputs.map((item) => (
                    <li key={item} className="font-mono text-xs leading-5">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium">预期产物</h3>
                <p className="font-mono text-xs leading-5 whitespace-pre-wrap">{result.outputPath}</p>
                {result.registryOutput ? (
                  <p className="mt-1 text-xs text-muted-foreground">注册表 Output：{result.registryOutput}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Codex 提示词</h3>
                  <Button type="button" size="sm" variant="outline" onClick={copyPrompt}>
                    复制提示词
                  </Button>
                </div>
                <Textarea readOnly value={result.prompt} className="min-h-64 font-mono text-xs" aria-label="可复制的 Codex 提示词" />
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              写一句请求后点「路由」。这里会给出阶段、slot、主 Skill、子代理归属、读取清单、产物路径，以及一段可以直接交给 Codex 的提示词。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
