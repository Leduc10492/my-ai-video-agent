import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

import { contentType, deliverablesRoot, resolveInside } from "@/lib/paths";
import { parseSource } from "@/lib/source";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const source = parseSource(request.nextUrl.searchParams.get("source"));
  const relativePath = request.nextUrl.searchParams.get("path") ?? "";
  try {
    const full = resolveInside(deliverablesRoot(source), relativePath);
    const body = await readFile(full);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType(full),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
        "Content-Disposition": path.extname(full).toLowerCase() === ".html" ? "inline" : "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: "找不到文件" }, { status: 404 });
  }
}
