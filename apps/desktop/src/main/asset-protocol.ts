import { readFile, realpath, stat } from "node:fs/promises";
import { extname, isAbsolute, join, resolve } from "node:path";
import { protocol } from "electron";
import type { WorkspaceService } from "./workspace-service";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function isInside(parent: string, child: string): boolean {
  const prefix = parent.endsWith("/") ? parent : `${parent}/`;
  return child === parent || child.startsWith(prefix);
}

function notFound(): Response {
  return new Response("Asset not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
}

export function assetUrl(kind: "reference" | "draft", projectId: string, entityId: string): string {
  return `aidirector-asset://${kind}/${encodeURIComponent(projectId)}/${encodeURIComponent(entityId)}`;
}

export function installAssetProtocol(workspace: WorkspaceService): void {
  protocol.handle("aidirector-asset", async (request) => {
    try {
      const url = new URL(request.url);
      const kind = url.hostname;
      const [projectId, entityId] = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
      if ((kind !== "reference" && kind !== "draft") || !projectId || !entityId) return notFound();
      const summary = await workspace.catalog.get(projectId);
      const store = await workspace.getStore(projectId);
      const entity = kind === "reference" ? store.references.get(entityId) : store.draftImages.get(entityId);
      if (!entity || entity.projectId !== projectId) return notFound();
      const candidate = isAbsolute(entity.filePath) ? entity.filePath : resolve(summary.rootPath, entity.filePath);
      const [assetRoot, canonicalPath] = await Promise.all([
        realpath(join(summary.rootPath, "assets")),
        realpath(candidate)
      ]);
      if (!isInside(assetRoot, canonicalPath)) return notFound();
      const info = await stat(canonicalPath);
      const mime = MIME_BY_EXTENSION[extname(canonicalPath).toLowerCase()];
      if (!info.isFile() || !mime || info.size > 50 * 1024 * 1024) return notFound();
      return new Response(await readFile(canonicalPath), {
        status: 200,
        headers: {
          "content-type": mime,
          "cache-control": "private, max-age=60",
          "x-content-type-options": "nosniff"
        }
      });
    } catch {
      return notFound();
    }
  });
}
