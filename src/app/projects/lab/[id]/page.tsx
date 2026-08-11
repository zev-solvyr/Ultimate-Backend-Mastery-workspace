"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { useEngineeringLabs } from "@/hooks/use-engineering-labs";
import { EngineeringLabView } from "@/components/projects/engineering-lab-view";
import { logUserActivity } from "@/hooks/use-activity";

export default function EngineeringLabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { loaded, getLabById } = useEngineeringLabs();

  const lab = getLabById(id);

  useEffect(() => {
    if (lab) {
      logUserActivity({
        type: "project",
        title: lab.title,
        subtitle: `Engineering Lab: ${lab.shortDescription}`,
        href: `/projects/lab/${lab.id}`,
      });
    }
  }, [lab]);

  if (!loaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading Engineering Lab...</div>;
  }

  if (!lab) {
    notFound();
  }

  return <EngineeringLabView lab={lab} />;
}
