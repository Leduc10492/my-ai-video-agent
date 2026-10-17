import { Suspense } from "react";

import { SkillLibrary } from "@/components/skill-library";
import { listAgents, listSkillSummaries } from "@/lib/repo";

export default function SkillsPage() {
  const skills = listSkillSummaries();
  const agents = listAgents();
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Skills 库</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          这里是 .agents/skills 和 .codex/agents 的目录。点进去看 Skill 正文和它带的参考文件。按 Ctrl+K 或 ⌘K 也能搜。
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-muted-foreground">正在列技能…</p>}>
        <SkillLibrary
          skills={skills}
          agents={agents.map((agent) => ({
            name: agent.name,
            description: agent.description,
            slots: agent.slots,
            skills: agent.skills,
          }))}
        />
      </Suspense>
    </main>
  );
}
