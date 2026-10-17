import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { exampleRoot } from "@/lib/workspace";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { title?: string } | null;
  const title = body?.title?.trim() ?? "";
  if (!title || title.length > 40) {
    return Response.json({ error: "片名需要 1 到 40 个字。" }, { status: 400 });
  }
  const id = `draft-${Date.now().toString(36)}`;
  const root = path.join(exampleRoot(), "drafts", id);
  mkdirSync(path.join(root, "episodes", "ep-01", "1_story"), { recursive: true });
  const project = {
    id,
    title,
    logline: "示例草稿。还没有剧本。",
    style: "",
    assets: "assets",
    episodes: [{ id: "ep-01", number: 1, title: "第 1 集", dir: "episodes/ep-01" }],
  };
  writeFileSync(path.join(root, "project.json"), `${JSON.stringify(project, null, 2)}\n`, "utf8");
  return Response.json({ id });
}
