import { notFound } from "next/navigation";

import { ProjectOverview } from "@/components/project-overview";
import { loadProjectView } from "@/lib/workspace";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = loadProjectView(id);
  if (!project) notFound();
  return (
    <ProjectOverview
      projectId={project.id}
      title={project.title}
      logline={project.logline}
      style={project.style}
      example={project.example}
      episodes={project.episodes}
    />
  );
}
