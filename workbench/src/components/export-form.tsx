"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const PARTS = [
  { id: "script", label: "剧本 Markdown" },
  { id: "docx", label: "剧本 DOCX（没有 Screenplay 围栏就跳过）" },
  { id: "html", label: "分镜表 HTML" },
  { id: "prompts", label: "提示词包" },
  { id: "media", label: "锚点图" },
] as const;

export function ExportForm({
  projectId,
  episodeId,
  example,
}: {
  projectId: string;
  episodeId: string;
  example: boolean;
}) {
  const [scope, setScope] = useState<"episode" | "project">("episode");
  const [parts, setParts] = useState<Record<string, boolean>>({
    script: true,
    docx: false,
    html: false,
    prompts: true,
    media: true,
  });
  const [pending, setPending] = useState(false);

  async function download() {
    setPending(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, episodeId, scope, parts }),
      });
      if (!response.ok) {
        toast.error("没有导出");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectId}-${scope}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("已下载交接包。里面没有成片。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">导出交接</h1>
          {example ? <Badge variant="secondary">示例数据</Badge> : <Badge variant="outline">当前仓库</Badge>}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          给制片一份交接单和压缩包。生成不在这里发生。剪映草稿这一版不做。
        </p>
      </header>
      <RadioGroup value={scope} onValueChange={(value) => setScope(value === "project" ? "project" : "episode")}>
        <Label className="font-normal">
          <RadioGroupItem value="episode" /> 本集
        </Label>
        <Label className="font-normal">
          <RadioGroupItem value="project" /> 全剧
        </Label>
      </RadioGroup>
      <ul className="space-y-2">
        {PARTS.map((part) => (
          <li key={part.id}>
            <Label className="font-normal">
              <Checkbox
                checked={Boolean(parts[part.id])}
                onCheckedChange={(checked) => setParts((current) => ({ ...current, [part.id]: checked === true }))}
              />
              {part.label}
            </Label>
          </li>
        ))}
        <li>
          <Label className="font-normal text-muted-foreground">
            <Checkbox disabled checked={false} />
            剪映草稿（延后）
          </Label>
        </li>
      </ul>
      <Button disabled={pending} onClick={download}>
        下载交接包
      </Button>
    </div>
  );
}
