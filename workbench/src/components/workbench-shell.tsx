"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClapperboardIcon,
  FolderTreeIcon,
  LibraryIcon,
  MoonIcon,
  RouteIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AGENT_BLURBS, SKILL_BLURBS } from "@/lib/stages";
import { parseSource, sourceLabel, withSource, type DataSource } from "@/lib/source";

type Catalog = {
  skills: { name: string; description: string; slots: string[] }[];
  agents: { name: string; description: string; slots: string[] }[];
};

const NAV = [
  { href: "/", label: "工作台", icon: ClapperboardIcon },
  { href: "/router", label: "路由台", icon: RouteIcon },
  { href: "/skills", label: "Skills 库", icon: LibraryIcon },
  { href: "/deliverables", label: "交付物", icon: FolderTreeIcon },
];

export function WorkbenchShell({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const source = parseSource(params.get("source"));
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function hrefFor(pathnameTarget: string, extra?: Record<string, string | undefined>) {
    return withSource(pathnameTarget, source, extra);
  }

  function go(next: string) {
    setOpen(false);
    router.push(next);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="px-2 py-1.5">
            <div className="text-sm font-semibold tracking-tight">AI 视频工作台</div>
            <p className="mt-1 text-xs text-muted-foreground">本地只读 · 不调用模型</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>生产</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton isActive={active} render={<Link href={hrefFor(item.href)} />}>
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="px-2 text-xs leading-5 text-muted-foreground">
            路由来自 skill_registry.md 和 AGENTS.md。示例文件只放在 workbench/example。
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">数据源</span>
            <Badge variant={source === "example" ? "secondary" : "outline"}>{sourceLabel(source)}</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <SourceSwitch source={source} />
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <SearchIcon />
              搜索技能
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="切换深浅色"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {mounted && resolvedTheme === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
      <CommandDialog open={open} onOpenChange={setOpen} title="搜索技能或子代理" description="按名称或 slot 查找">
        <Command>
          <CommandInput placeholder="搜索技能、slot 或子代理" />
          <CommandList>
            <CommandEmpty>没有匹配项</CommandEmpty>
            <CommandGroup heading="页面">
              {NAV.map((item) => (
                <CommandItem key={item.href} value={item.label} onSelect={() => go(hrefFor(item.href))}>
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Skills">
              {catalog.skills.map((skill) => (
                <CommandItem
                  key={skill.name}
                  value={`${skill.name} ${skill.slots.join(" ")} ${SKILL_BLURBS[skill.name] ?? ""} ${skill.description}`}
                  onSelect={() => go(hrefFor(`/skills/${skill.name}`))}
                >
                  <span className="font-medium">{skill.name}</span>
                  <span className="truncate text-muted-foreground">{SKILL_BLURBS[skill.name] ?? skill.slots[0] ?? "插件"}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="子代理">
              {catalog.agents.map((agent) => (
                <CommandItem
                  key={agent.name}
                  value={`${agent.name} ${agent.slots.join(" ")} ${AGENT_BLURBS[agent.name] ?? ""}`}
                  onSelect={() => go(hrefFor(`/agents/${agent.name}`))}
                >
                  <span className="font-medium">{agent.name}</span>
                  <span className="truncate text-muted-foreground">{AGENT_BLURBS[agent.name]}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </SidebarProvider>
  );
}

function SourceSwitch({ source }: { source: DataSource }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const options: { id: DataSource; label: string }[] = [
    { id: "example", label: "示例数据" },
    { id: "repo", label: "当前仓库" },
  ];
  return (
    <div className="flex rounded-lg bg-muted p-0.5">
      {options.map((option) => {
        const query = Object.fromEntries(params.entries());
        delete query.source;
        const href = withSource(pathname, option.id, query);
        const active = source === option.id;
        return (
          <Link
            key={option.id}
            href={href}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            aria-current={active ? "page" : undefined}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
