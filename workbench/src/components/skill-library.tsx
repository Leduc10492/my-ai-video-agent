"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENT_BLURBS, SKILL_BLURBS } from "@/lib/stages";
import { parseSource, withSource } from "@/lib/source";

type SkillItem = {
  name: string;
  description: string;
  slots: string[];
  referenceCount: number;
};

type AgentItem = {
  name: string;
  description: string;
  slots: string[];
  skills: string[];
};

export function SkillLibrary({ skills, agents }: { skills: SkillItem[]; agents: AgentItem[] }) {
  const params = useSearchParams();
  const source = parseSource(params.get("source"));
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const visibleSkills = useMemo(
    () =>
      skills.filter((skill) => {
        const blob = `${skill.name} ${skill.slots.join(" ")} ${skill.description} ${SKILL_BLURBS[skill.name] ?? ""}`.toLowerCase();
        return blob.includes(needle);
      }),
    [skills, needle],
  );
  const visibleAgents = useMemo(
    () =>
      agents.filter((agent) => {
        const blob = `${agent.name} ${agent.slots.join(" ")} ${agent.skills.join(" ")} ${agent.description} ${AGENT_BLURBS[agent.name] ?? ""}`.toLowerCase();
        return blob.includes(needle);
      }),
    [agents, needle],
  );

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索名称、slot 或职责"
        aria-label="搜索技能库"
      />
      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">Skills（{visibleSkills.length}）</TabsTrigger>
          <TabsTrigger value="agents">子代理（{visibleAgents.length}）</TabsTrigger>
        </TabsList>
        <TabsContent value="skills" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2">
            {visibleSkills.map((skill) => (
              <Link key={skill.name} href={withSource(`/skills/${skill.name}`, source)} className="block">
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardTitle className="font-mono text-sm">{skill.name}</CardTitle>
                    <CardDescription>{SKILL_BLURBS[skill.name] ?? "仓库里的 Skill。"}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {skill.slots.length ? skill.slots.map((slot) => <Badge key={slot}>{slot}</Badge>) : <Badge variant="outline">插件</Badge>}
                    <Badge variant="outline">{skill.referenceCount} 个参考文件</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="agents" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2">
            {visibleAgents.map((agent) => (
              <Link key={agent.name} href={withSource(`/agents/${agent.name}`, source)} className="block">
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardTitle className="font-mono text-sm">{agent.name}</CardTitle>
                    <CardDescription>{AGENT_BLURBS[agent.name] ?? agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {agent.slots.map((slot) => (
                      <Badge key={slot} variant="outline">
                        {slot}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
