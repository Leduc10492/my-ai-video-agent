import { buildExport, type ExportParts } from "@/lib/export/handoff";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    projectId?: string;
    episodeId?: string;
    scope?: "episode" | "project";
    parts?: Partial<ExportParts>;
  } | null;
  if (!body?.projectId || !body.episodeId) {
    return Response.json({ error: "缺少项目或集。" }, { status: 400 });
  }
  const packed = await buildExport({
    projectId: body.projectId,
    episodeId: body.episodeId,
    scope: body.scope === "project" ? "project" : "episode",
    parts: {
      script: Boolean(body.parts?.script),
      html: Boolean(body.parts?.html),
      prompts: Boolean(body.parts?.prompts),
      media: Boolean(body.parts?.media),
      docx: Boolean(body.parts?.docx),
    },
  });
  if (!packed) return Response.json({ error: "找不到项目。" }, { status: 404 });
  return new Response(new Uint8Array(packed.buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${packed.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
