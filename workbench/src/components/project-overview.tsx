"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { EpisodeSummary } from "@/lib/workspace";

export function ProjectOverview({
  projectId,
  title,
  logline,
  style,
  example,
  episodes,
  estimate,
  actual,
}: {
  projectId: string;
  title: string;
  logline: string;
  style: string;
  example: boolean;
  episodes: EpisodeSummary[];
  estimate: number;
  actual: number;
}) {
  const storageKey = `workbench-episode-order:${projectId}`;
  const styleKey = `workbench-style:${projectId}`;
  const [order, setOrder] = useState(episodes.map((episode) => episode.id));
  const [styleDraft, setStyleDraft] = useState(style);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const ids = saved.split(",").filter((id) => episodes.some((episode) => episode.id === id));
      const missing = episodes.map((episode) => episode.id).filter((id) => !ids.includes(id));
      if (ids.length) setOrder([...ids, ...missing]);
    }
    const savedStyle = window.localStorage.getItem(styleKey);
    if (savedStyle) setStyleDraft(savedStyle);
  }, [episodes, storageKey, styleKey]);

  function persist(next: string[]) {
    setOrder(next);
    window.localStorage.setItem(storageKey, next.join(","));
  }

  function move(id: string, direction: -1 | 1) {
    const index = order.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    const next = [...order];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    persist(next);
  }

  const sorted = order
    .map((id) => episodes.find((episode) => episode.id === id))
    .filter((episode): episode is EpisodeSummary => Boolean(episode));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {example ? <Badge variant="secondary">示例数据</Badge> : <Badge variant="outline">当前仓库</Badge>}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{logline}</p>
        <p className="text-sm">
          估价合计 {estimate.toFixed(2)} 美元 · 实际花费 {actual.toFixed(2)} 美元
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>风格</CardTitle>
          <CardDescription>改动只留在这台浏览器，不写进风格指南。</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={styleDraft}
            onChange={(event) => {
              setStyleDraft(event.target.value);
              window.localStorage.setItem(styleKey, event.target.value);
            }}
          />
        </CardContent>
      </Card>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">集</h2>
          <p className="text-xs text-muted-foreground">上下移动只改变显示顺序。</p>
        </div>
        <div className="grid gap-3">
          {sorted.map((episode, index) => (
            <Card key={episode.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>
                      第 {episode.number} 集 · {episode.title}
                    </CardTitle>
                    <CardDescription>{episode.detail}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" aria-label="上移" disabled={index === 0} onClick={() => move(episode.id, -1)}>
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="下移"
                      disabled={index === sorted.length - 1}
                      onClick={() => move(episode.id, 1)}
                    >
                      <ArrowDownIcon />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Badge variant={episode.gateOpen ? "outline" : "destructive"}>{episode.gateOpen ? "审核已通过" : episode.audit}</Badge>
                {episode.stale ? <Badge variant="secondary">下游已过期</Badge> : null}
                <Button render={<Link href={episode.href} />} size="sm">
                  打开剧本
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
