"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/data";
import { ProjectBlueprintView } from "@/components/projects/project-blueprint-view";
import { useEngineeringLabs } from "@/hooks/use-engineering-labs";
import { EngineeringLabView } from "@/components/projects/engineering-lab-view";
import { logUserActivity } from "@/hooks/use-activity";

export default function ProjectGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = getProjectById(id);
  const { loaded, getLabById } = useEngineeringLabs();
  const lab = getLabById(id);

  useEffect(() => {
    if (project) {
      logUserActivity({
        type: "project",
        title: project.name,
        subtitle: project.tagline,
        href: `/projects/${project.id}`,
      });
    } else if (lab) {
      logUserActivity({
        type: "project",
        title: lab.title,
        subtitle: `Engineering Lab: ${lab.shortDescription}`,
        href: `/projects/lab/${lab.id}`,
      });
    }
  }, [project, lab]);

  if (project) {
    return <ProjectBlueprintView project={project} />;
  }

  if (!loaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading project...</div>;
  }

  if (lab) {
    return <EngineeringLabView lab={lab} />;
  }

  notFound();
}
