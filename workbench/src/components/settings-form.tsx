"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SlotDef } from "@/lib/slots";

type Row = SlotDef & { registrySkill: string | null; options: string[] };

const STORAGE_KEY = "workbench-slot-bindings";

export function SettingsForm({
  rows,
  repoSkills,
}: {
  rows: Row[];
  repoSkills: { name: string; description: string }[];
}) {
  const [bindings, setBindings] = useState<Record<string, string>>({});
  const [cap, setCap] = useState("10");
  const [mode, setMode] = useState("packet");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { bindings?: Record<string, string>; cap?: string; mode?: string };
      setBindings(parsed.bindings ?? {});
      if (parsed.cap) setCap(parsed.cap);
      if (parsed.mode) setMode(parsed.mode);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function save(next: { bindings?: Record<string, string>; cap?: string; mode?: string }) {
    const payload = {
      bindings: next.bindings ?? bindings,
      cap: next.cap ?? cap,
      mode: next.mode ?? mode,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">阶段技能</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          默认值来自 .agents/skill_registry.md。下拉里另外列出盒子技能名，那些名字不在本仓库里。选择只保存在这台浏览器，不改注册表，也不改 Skill 文件。
        </p>
      </header>
      <ul className="space-y-3">
        {rows.map((row) => {
          const selected = row.lockedSkill ?? bindings[row.slot] ?? row.registrySkill ?? row.box[0] ?? "";
          return (
            <li key={row.slot} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{row.label}</p>
                  <span className="font-mono text-[11px] text-muted-foreground">{row.slot}</span>
                  {row.optional ? <Badge variant="outline">可选</Badge> : null}
                  {row.lockedSkill ? <Badge variant="secondary">只读</Badge> : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{row.output}</p>
              </div>
              <Select
                value={selected}
                disabled={Boolean(row.lockedSkill)}
                onValueChange={(value) => {
                  if (!value) return;
                  const next = { ...bindings, [row.slot]: value };
                  setBindings(next);
                  save({ bindings: next });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {row.options.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                      {name === row.registrySkill ? " · 注册表" : row.box.includes(name) ? " · 盒子" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </li>
          );
        })}
      </ul>
      <section className="space-y-3 rounded-lg border p-3">
        <h2 className="text-sm font-medium">生成</h2>
        <label className="flex items-center justify-between gap-3 text-sm">
          超过这个估价要再确认一次（美元）
          <input
            className="h-8 w-24 rounded-lg border bg-background px-2"
            inputMode="decimal"
            value={cap}
            onChange={(event) => {
              setCap(event.target.value);
              save({ cap: event.target.value });
            }}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          Codex 运行
          <select
            className="h-8 rounded-lg border bg-background px-2"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value);
              save({ mode: event.target.value });
            }}
          >
            <option value="packet">只复制提示词（默认）</option>
            <option value="exec" disabled>
              本地 codex exec（关闭）
            </option>
          </select>
        </label>
        <p className="text-xs leading-5 text-muted-foreground">模式 B 默认关闭。就算打开，也只允许文本阶段，生成仍然不调用付费接口。</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-medium">仓库里扫到的技能</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {repoSkills.map((skill) => (
            <li key={skill.name} className="rounded-lg border px-3 py-2">
              <p className="font-mono text-xs">{skill.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{skill.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
