import { RouterDesk } from "@/components/router-desk";
import { loadRouteContext } from "@/lib/repo";
import { parseSource } from "@/lib/source";

export default async function RouterPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; q?: string }>;
}) {
  const params = await searchParams;
  const source = parseSource(params.source);
  const context = loadRouteContext(source);
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">路由台</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          把一句制作请求对应到阶段、slot、主 Skill 和子代理。判断来自注册表和主控规则，结果可以复制成 Codex 提示词。
        </p>
      </header>
      <RouterDesk context={context} initialQuery={params.q ?? ""} />
    </main>
  );
}
