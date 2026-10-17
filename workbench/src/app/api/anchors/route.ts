import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { loadProject } from "@/lib/workspace";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { projectId?: string; characterId?: string } | null;
  const projectId = body?.projectId ?? "";
  const characterId = body?.characterId ?? "";
  if (!/^[a-z0-9-]+$/.test(characterId)) {
    return Response.json({ error: "角色编号无效。" }, { status: 400 });
  }
  const project = loadProject(projectId);
  if (!project?.example) {
    return Response.json({ error: "只允许确认示例项目里的锚点。" }, { status: 403 });
  }
  const lockPath = path.resolve(project.assetsDir, "refs", characterId, "lock.json");
  const root = path.resolve(project.assetsDir);
  if (!lockPath.startsWith(root + path.sep)) {
    return Response.json({ error: "路径越界。" }, { status: 400 });
  }
  const lock = JSON.parse(readFileSync(lockPath, "utf8")) as { anchor?: string };
  if (lock.anchor !== "待确认") {
    return Response.json({ error: "只有待确认的锚点可以锁定。" }, { status: 400 });
  }
  lock.anchor = "已锁定";
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
  return Response.json({ ok: true });
}
