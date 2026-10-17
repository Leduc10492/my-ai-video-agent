import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownView } from "@/components/markdown-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSkill, getSkillReference } from "@/lib/repo";
import { SKILL_BLURBS } from "@/lib/stages";
import { parseSource, withSource } from "@/lib/source";

const PREVIEW_LIMIT = 24000;

export default async function SkillPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ source?: string; ref?: string }>;
}) {
  const { name } = await params;
  const query = await searchParams;
  const source = parseSource(query.source);
  const skill = getSkill(name);
  if (!skill) notFound();

  const reference = query.ref ? skill.references.find((item) => item.path === query.ref) : undefined;
  let body = skill.body;
  let truncated = false;
  if (reference) {
    const full = getSkillReference(skill.name, reference.path);
    truncated = full.length > PREVIEW_LIMIT;
    body = truncated ? `${full.slice(0, PREVIEW_LIMIT)}\n\n…（文件较长，这里只预览开头。完整文件仍在 .agents/skills/${skill.name}/${reference.path}）` : full;
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 p-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="space-y-3">
        <div>
          <Link href={withSource("/skills", source)} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
            返回 Skills 库
          </Link>
          <h1 className="mt-2 font-mono text-lg font-semibold">{skill.name}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{SKILL_BLURBS[skill.name] ?? "仓库 Skill。"}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skill.slots.length ? skill.slots.map((slot) => <Badge key={slot}>{slot}</Badge>) : <Badge variant="outline">插件</Badge>}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>文件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <FileLink href={withSource(`/skills/${skill.name}`, source)} active={!reference} label="SKILL.md" />
            {skill.references.map((item) => (
              <FileLink
                key={item.path}
                href={withSource(`/skills/${skill.name}`, source, { ref: item.path })}
                active={reference?.path === item.path}
                label={item.path}
              />
            ))}
            {skill.references.length === 0 ? <p className="text-xs text-muted-foreground">没有附带参考文件。</p> : null}
          </CardContent>
        </Card>
      </aside>
      <section className="min-w-0 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <p className="mb-4 font-mono text-xs text-muted-foreground">
          .agents/skills/{skill.name}/{reference?.path ?? "SKILL.md"}
          {truncated ? " · 预览已截断" : ""}
        </p>
        <MarkdownView source={body} />
      </section>
    </main>
  );
}

function FileLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`block truncate rounded-md px-2 py-1 font-mono text-xs ${active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted"}`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
