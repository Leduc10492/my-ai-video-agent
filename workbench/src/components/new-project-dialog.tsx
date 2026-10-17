"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewProjectDialog() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);

  async function create() {
    const name = title.trim();
    if (!name) return;
    setPending(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: name }),
      });
      const payload = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !payload.id) {
        toast.error(payload.error ?? "没有建成");
        return;
      }
      toast.success("已在示例草稿里建好空项目");
      router.push(`/p/${payload.id}?source=example`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>新建项目</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建项目</DialogTitle>
          <DialogDescription>只会写到 workbench/example/drafts，不会进仓库的 deliverables/。</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="project-title">片名</Label>
          <Input id="project-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：夜航" />
        </div>
        <Button disabled={pending || !title.trim()} onClick={create}>
          建立空项目
        </Button>
      </DialogContent>
    </Dialog>
  );
}
