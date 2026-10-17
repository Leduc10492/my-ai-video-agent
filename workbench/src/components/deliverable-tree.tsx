import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { TreeNode } from "@/lib/repo";
import type { DataSource } from "@/lib/source";
import { withSource } from "@/lib/source";

export function DeliverableTree({
  nodes,
  source,
  selected,
}: {
  nodes: TreeNode[];
  source: DataSource;
  selected?: string;
}) {
  if (!nodes.length) {
    return <p className="p-3 text-sm text-muted-foreground">这个数据源里没有文件。</p>;
  }
  return (
    <ul className="space-y-1 p-2 text-sm">
      {nodes.map((node) => (
        <TreeItem key={node.path} node={node} source={source} selected={selected} />
      ))}
    </ul>
  );
}

function TreeItem({ node, source, selected }: { node: TreeNode; source: DataSource; selected?: string }) {
  if (node.type === "dir") {
    return (
      <li>
        <details open>
          <summary className="cursor-pointer rounded-md px-2 py-1 font-medium hover:bg-muted">{node.name}</summary>
          <div className="ml-3 border-l pl-2">
            <DeliverableTree nodes={node.children ?? []} source={source} selected={selected} />
          </div>
        </details>
      </li>
    );
  }
  const active = node.path === selected;
  const html = node.name.endsWith(".html");
  return (
    <li>
      <Link
        href={withSource("/deliverables", source, { file: node.path })}
        className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-muted ${active ? "bg-muted font-medium" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <span className="truncate">{node.name}</span>
        {html ? <Badge variant="outline">HTML</Badge> : null}
      </Link>
    </li>
  );
}
