"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CharacterCard, PlaceCard, PropCard } from "@/lib/production";

export function AssetLibrary({
  projectId,
  example,
  source,
  gateOpen,
  stale,
  characters,
  scenes,
  props,
}: {
  projectId: string;
  example: boolean;
  source: "example" | "repo";
  gateOpen: boolean;
  stale: boolean;
  characters: CharacterCard[];
  scenes: PlaceCard[];
  props: PropCard[];
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<CharacterCard | null>(null);
  const [pending, setPending] = useState(false);

  async function confirm() {
    if (!current) return;
    setPending(true);
    try {
      const response = await fetch("/api/anchors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, characterId: current.id }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(payload.error ?? "没有锁定");
        return;
      }
      toast.success("锚点已锁定");
      setCurrent(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">资产库</h1>
          {example ? <Badge variant="secondary">示例数据</Badge> : <Badge variant="outline">当前仓库</Badge>}
          {stale ? <Badge variant="secondary">已过期</Badge> : null}
          {!gateOpen ? <Badge variant="destructive">本集未解锁</Badge> : null}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">角色锚点要人确认之后才算锁定。这里不生成图，也不写最终提示词。</p>
      </header>
      {!gateOpen ? (
        <div className="rounded-lg border border-dashed px-3 py-2 text-sm leading-6">这一集的审核还没通过。资产文件可以看，不能当作本集已解锁。</div>
      ) : null}
      {stale ? (
        <div className="rounded-lg border px-3 py-2 text-sm leading-6">剧本哈希变了。这些资产标为已过期，不会自动重出锚点。</div>
      ) : null}
      <Tabs defaultValue="characters">
        <TabsList>
          <TabsTrigger value="characters">角色</TabsTrigger>
          <TabsTrigger value="scenes">场景</TabsTrigger>
          <TabsTrigger value="props">道具</TabsTrigger>
        </TabsList>
        <TabsContent value="characters" className="mt-4">
          {characters.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有角色锚点。锁定文件放在 2_assets/refs/&lt;角色&gt;/lock.json。</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {characters.map((character) => (
                <li key={character.id}>
                  <button
                    type="button"
                    className="w-full overflow-hidden rounded-xl border text-left hover:bg-muted/40"
                    onClick={() => setCurrent(character)}
                  >
                    <div className="flex h-40 items-center justify-center bg-muted">
                      {character.imagePath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/raw?source=${source}&path=${encodeURIComponent(character.imagePath)}`}
                          alt={`${character.name}的锚点`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">未出图</span>
                      )}
                    </div>
                    <div className="space-y-1 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{character.name}</span>
                        <Badge variant={character.anchor === "已锁定" ? "outline" : character.anchor === "待确认" ? "secondary" : "destructive"}>
                          {character.anchor}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{character.fingerprint}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="scenes" className="mt-4 grid gap-3 md:grid-cols-2">
          {scenes.length === 0 ? <p className="text-sm text-muted-foreground">还没有场景卡。</p> : null}
          {scenes.map((scene) => (
            <article key={scene.id} className="rounded-xl border p-4">
              <h2 className="font-medium">{scene.name}</h2>
              <p className="mt-2 text-sm leading-6">{scene.facts}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{scene.note}</p>
            </article>
          ))}
        </TabsContent>
        <TabsContent value="props" className="mt-4 grid gap-3 md:grid-cols-2">
          {props.length === 0 ? <p className="text-sm text-muted-foreground">还没有道具卡。</p> : null}
          {props.map((prop) => (
            <article key={prop.id} className="rounded-xl border p-4">
              <h2 className="font-medium">{prop.name}</h2>
              <p className="mt-2 text-sm leading-6">{prop.facts}</p>
              <p className="mt-2 text-xs text-muted-foreground">归属 {prop.owner}</p>
            </article>
          ))}
        </TabsContent>
      </Tabs>
      <Sheet open={Boolean(current)} onOpenChange={(open) => !open && setCurrent(null)}>
        <SheetContent style={{ maxWidth: 420, width: "min(420px, 100%)" }}>
          {current ? (
            <>
              <SheetHeader>
                <SheetTitle>{current.name}</SheetTitle>
                <SheetDescription>{current.role}</SheetDescription>
              </SheetHeader>
              <div className="space-y-3 px-4 text-sm leading-6">
                <p>
                  <span className="text-muted-foreground">身份事实 </span>
                  {current.facts}
                </p>
                <p>
                  <span className="text-muted-foreground">造型 </span>
                  {current.costume}
                </p>
                <p>
                  <span className="text-muted-foreground">指纹 </span>
                  {current.fingerprint}
                </p>
                <p className="break-all">
                  <span className="text-muted-foreground">锚点 sha256 </span>
                  <span className="font-mono text-xs">{current.sha256 ?? "没有图"}</span>
                </p>
                <Badge variant="outline">{current.anchor}</Badge>
              </div>
              <div className="mt-auto p-4">
                <Button disabled={pending || current.anchor !== "待确认"} onClick={confirm}>
                  确认锁定
                </Button>
                {current.anchor === "未出图" ? <p className="mt-2 text-xs text-muted-foreground">还没有锚点图，不能锁定。</p> : null}
                {current.anchor === "已锁定" ? <p className="mt-2 text-xs text-muted-foreground">已经锁定。要换图就换文件，不在这里重画。</p> : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
