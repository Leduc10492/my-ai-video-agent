import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownView } from "@/components/markdown-view";
import { Badge } from "@/components/ui/badge";
import { getAgent } from "@/lib/repo";
import { AGENT_BLURBS } from "@/lib/stages";
import { parseSource, withSource } from "@/lib/source";

export default async function AgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { name } = await params;
  const source = parseSource((await searchParams).source);
  const agent = getAgent(name);
  if (!agent) notFound();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <header className="space-y-2">
        <Link href={withSource("/skills", source)} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          返回 Skills 库
        </Link>
        <h1 className="font-mono text-2xl font-semibold">{agent.name}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{AGENT_BLURBS[agent.name] ?? agent.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.slots.map((slot) => (
            <Badge key={slot} variant="outline">
              {slot}
            </Badge>
          ))}
        </div>
      </header>
      <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <p className="mb-4 font-mono text-xs text-muted-foreground">.codex/agents/{agent.file}</p>
        <MarkdownView source={agent.instructions} />
      </section>
    </main>
  );
}
