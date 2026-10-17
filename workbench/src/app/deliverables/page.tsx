import { DeliverableTree } from "@/components/deliverable-tree";
import { MarkdownView } from "@/components/markdown-view";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { loadDeliverables, readDeliverable } from "@/lib/repo";
import { parseSource, sourceLabel } from "@/lib/source";

export default async function DeliverablesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; file?: string }>;
}) {
  const params = await searchParams;
  const source = parseSource(params.source);
  const library = loadDeliverables(source);
  const selected = params.file && library.files.includes(params.file) ? params.file : library.preferred;
  const file = selected ? readDeliverable(source, selected) : null;
  const previewUrl = file?.extension === ".html" ? `/api/raw?source=${source}&path=${encodeURIComponent(selected ?? "")}` : null;

  return (
    <main className="grid h-[calc(100svh-3.5rem)] grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="border-b lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-sm font-semibold">交付物</h1>
          <Badge variant={source === "example" ? "secondary" : "outline"}>{sourceLabel(source)}</Badge>
        </div>
        <ScrollArea className="h-[calc(100svh-7.5rem)]">
          <DeliverableTree nodes={library.tree} source={source} selected={selected} />
        </ScrollArea>
      </aside>
      <section className="min-w-0">
        {file && selected ? (
          <div className="flex h-full flex-col">
            <div className="border-b px-4 py-3">
              <p className="font-mono text-xs text-muted-foreground">
                {source === "example" ? "workbench/example/deliverables" : "deliverables"}/{selected}
              </p>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="p-4">
                {previewUrl ? (
                  <iframe title={selected} src={previewUrl} className="h-[720px] w-full rounded-lg border bg-background" />
                ) : file.text ? (
                  <MarkdownView source={file.text} />
                ) : (
                  <p className="text-sm text-muted-foreground">这个文件不是文本，工作台不做预览。</p>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <p className="p-6 text-sm text-muted-foreground">没有可预览的文件。</p>
        )}
      </section>
    </main>
  );
}
