import Link from "next/link";

import { NewProjectDialog } from "@/components/new-project-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listProjects } from "@/lib/workspace";

export default function HomePage() {
  const projects = listProjects();
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">项目</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            一部片子下面是集，一集下面是场。剧本、审核、资产和分镜都以文件为准。示例数据只放在 workbench/example。
          </p>
        </div>
        <NewProjectDialog />
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{project.title}</CardTitle>
                {project.example ? <Badge variant="secondary">示例数据</Badge> : <Badge variant="outline">仓库</Badge>}
              </div>
              <CardDescription>{project.logline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{project.episodeCount} 集</p>
              <Button render={<Link href={project.href} />}>打开</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
