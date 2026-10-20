import { useEffect, useState } from "react";
import { Copy, FolderOpen, Loader2, MessageSquare, RefreshCw, Terminal } from "lucide-react";
import { Button, Dialog, Field, Input, Textarea, cn } from "./components/ui";
import { api, post } from "./lib/api";

export function ProjectDialog({ open, onOpenChange, workspace, onCreated }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: any;
  onCreated: (project: any) => Promise<void>;
}) {
  const [mode, setMode] = useState<"create" | "open">("create");
  const [name, setName] = useState(""), [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    if (open) { setName(""); setLocation(""); setError(""); }
  }, [open]);
  const suggested = name.trim() && workspace?.projects_root
    ? `${workspace.projects_root}/${name.trim()}` : "";
  return <Dialog open={open} onOpenChange={value => { if (!busy) onOpenChange(value); }}
    title="视频项目">
    <div className="space-y-5">
      <div className="flex gap-1 rounded-xl bg-muted p-1" role="tablist" aria-label="项目打开方式">
        {(["create", "open"] as const).map(value => <button key={value} role="tab"
          aria-selected={mode === value} disabled={busy}
          className={cn("flex-1 rounded-lg px-4 py-2 text-sm", mode === value && "bg-background shadow-sm")}
          onClick={() => { setMode(value); setLocation(""); setError(""); }}>
          {value === "create" ? "新建视频项目" : "打开已有项目"}
        </button>)}
      </div>
      {mode === "create" && <Field label="项目名称">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="这部作品的名称" disabled={busy} />
      </Field>}
      <Field label={mode === "create" ? "项目文件夹" : "已有项目文件夹"}
        hint={mode === "create"
          ? "可留空；已有文件夹不会覆盖。"
          : "填写作品根目录，沿用素材与 Skills。"}>
        <Input aria-label={mode === "create" ? "项目文件夹" : "已有项目文件夹"}
          value={location} onChange={e => setLocation(e.target.value)}
          placeholder={suggested || (mode === "create" ? `${workspace?.projects_root || ""}/作品名` : "/Users/…/我的视频项目")}
          disabled={busy} />
      </Field>
      {mode === "create" && <p className="break-all rounded-xl bg-muted/50 p-3 text-xs leading-6 text-muted-foreground">
        保存到：{location.trim() || suggested || "填写项目名称后确定"}
      </p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end border-t pt-4">
        <Button disabled={busy || (mode === "create" ? !name.trim() : !location.trim())}
          onClick={async () => {
            setBusy(true); setError("");
            try {
              const project = await post("/projects", { mode, name: name.trim(), root: location.trim() || undefined });
              await onCreated(project);
              onOpenChange(false);
            } catch (e) { setError((e as Error).message); }
            finally { setBusy(false); }
          }}>
          {busy ? <Loader2 className="animate-spin" /> : <FolderOpen />}
          {mode === "create" ? "创建并打开" : "打开项目"}
        </Button>
      </div>
    </div>
  </Dialog>;
}

export function CreationContext({ base }: { base: string }) {
  const [context, setContext] = useState<any>(null), [error, setError] = useState("");
  const [loading, setLoading] = useState(false), [copied, setCopied] = useState("");
  const reload = async () => {
    setLoading(true); setError(""); setCopied("");
    try { setContext(await api(`${base}/context`)); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let cancelled = false;
    setContext(null); setLoading(true); setError("");
    api(`${base}/context`).then(value => { if (!cancelled) setContext(value); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [base]);
  const copy = async (kind: "prompt" | "command") => {
    setError("");
    try {
      // Resolve the saved Registry again at the moment the user takes the handoff.
      const latest = await api(`${base}/context`);
      setContext(latest);
      await navigator.clipboard.writeText(latest[kind]);
      setCopied(kind === "prompt" ? "创作指令已复制" : "启动命令已复制。");
    } catch (e) { setError((e as Error).message); }
  };
  return <div className="space-y-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-semibold">在 Codex 中继续</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">打开项目目录，或复制创作指令。</p>
      </div>
      <Button size="sm" variant="outline" disabled={loading} onClick={reload} aria-label="刷新项目创作配置">
        <RefreshCw className={loading ? "animate-spin" : ""} />刷新
      </Button>
    </div>
    {loading && !context && <p className="text-sm text-muted-foreground">正在读取项目配置…</p>}
    {context && <>
      <section className="rounded-2xl border p-4">
        <div className="mb-2 flex items-center gap-2"><FolderOpen size={16} /><strong className="text-sm">{context.name}</strong></div>
        <p className="break-all font-mono text-xs leading-6 text-muted-foreground">{context.root}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" disabled={loading} onClick={() => copy("prompt")}><MessageSquare />复制创作指令</Button>
          <Button size="sm" variant="outline" disabled={loading} onClick={() => copy("command")}><Terminal />复制启动命令</Button>
        </div>
      </section>
      <section className="rounded-2xl border p-4">
        <h4 className="mb-3 text-sm font-medium">当前阶段 Skill</h4>
        <div className="divide-y">
          {context.skills.filter((skill: any) => ["script.primary", "story.mckee_router", "guides.primary", "shotlist.breakdown", "shotlist.prompt_compiler", "shotlist.html_assembler"].includes(skill.slot))
            .map((skill: any) => <div key={skill.slot} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs">
              <span className="text-muted-foreground">{skill.label}</span>
              <span className={cn("break-all", skill.error && "text-destructive")}>{skill.error || skill.name}</span>
            </div>)}
        </div>
      </section>
      <details className="rounded-xl bg-muted/40 p-3 text-xs">
        <summary className="cursor-pointer">查看完整创作指令</summary>
        <Textarea aria-label="完整创作指令" className="mt-3 min-h-52 text-xs leading-6" value={context.prompt} readOnly />
        <p className="mt-2 break-all font-mono">{context.command}</p>
      </details>

    </>}
    {copied && <p role="status" className="flex items-center gap-2 text-sm"><Copy size={14} />{copied}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
