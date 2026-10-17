import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { loadHome } from "@/lib/repo";
import { parseSource } from "@/lib/source";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const source = parseSource((await searchParams).source);
  const home = loadHome(source);
  const pipelineSlots = new Set(home.stages.flatMap((stage) => [stage.slot, stage.pluginSlot].filter(Boolean)));
  const support = home.slots.filter((slot) => !pipelineSlots.has(slot.slot) || slot.slot === "story.mckee_router");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">工作台</h1>
          <Badge variant={source === "example" ? "secondary" : "outline"}>{home.label}</Badge>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {home.title} 的前期链路：剧本、审核通过、资产、按 Scene 分镜拆解、镜头行加提示词包、中文分镜表，然后 QA。
          每一阶的状态只看文件在不在，空的就是未开始。
        </p>
        {source === "example" ? (
          <p className="text-sm leading-6">
            这是工作台自带的示例项目，文件在 <span className="font-mono text-xs">workbench/example</span>，不会写进仓库的 deliverables/。
          </p>
        ) : (
          <p className="text-sm leading-6">正在读取仓库根目录的 deliverables/。只有 README 时，生产阶段保持未开始。</p>
        )}
      </header>

      <ol className="space-y-3">
        {home.stages.map((stage, index) => (
          <li key={stage.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
            <div className="flex flex-col items-center">
              <span className="flex size-8 items-center justify-center rounded-full border bg-card text-xs font-medium">
                {index + 1}
              </span>
              {index < home.stages.length - 1 ? <span className="mt-2 w-px flex-1 bg-border" /> : null}
            </div>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>{stage.label}</CardTitle>
                  <StatusBadge status={stage.status} />
                </div>
                <CardDescription>{stage.summary}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm md:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Slot </span>
                  <span className="font-mono text-xs">{stage.slot}</span>
                  {stage.pluginSlot ? (
                    <>
                      <span className="text-muted-foreground"> 调用 </span>
                      <span className="font-mono text-xs">{stage.pluginSlot}</span>
                    </>
                  ) : null}
                </p>
                <p>
                  <span className="text-muted-foreground">Skill </span>
                  <span className="font-mono text-xs">{stage.skill}</span>
                  {stage.pluginSkill ? <span className="font-mono text-xs"> + {stage.pluginSkill}</span> : null}
                </p>
                <p>
                  <span className="text-muted-foreground">子代理 </span>
                  {stage.owner}
                </p>
                <p className="text-muted-foreground">{stage.detail}</p>
                {stage.evidence.length ? (
                  <ul className="md:col-span-2 space-y-1 font-mono text-xs text-muted-foreground">
                    {stage.evidence.map((file) => (
                      <li key={file}>deliverables/{file}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle>其余 slot</CardTitle>
          <CardDescription>这些技能穿在各阶段里，不单独占一步。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>归属</TableHead>
                <TableHead>产物</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {support.map((slot) => (
                <TableRow key={slot.slot}>
                  <TableCell className="font-mono text-xs">{slot.slot}</TableCell>
                  <TableCell className="font-mono text-xs">{slot.skill}</TableCell>
                  <TableCell>{slot.owner}</TableCell>
                  <TableCell className="max-w-md text-xs text-muted-foreground">{slot.output}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>从 AGENTS.md 摘出的门禁</CardTitle>
          <CardDescription>工作台只引用这些句子，不另造流程。</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
            {home.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          {home.sceneLabels.length ? (
            <p className="mt-4 text-sm text-muted-foreground">剧本场次：{home.sceneLabels.join("、")}</p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
