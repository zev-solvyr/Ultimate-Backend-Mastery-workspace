"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/lib/data";
import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Landmark, Server, ChevronRight, Layers } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  ShoppingCart,
  Landmark,
  Server,
};

export default function ProjectsPage() {
  const { state } = useProgress();

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold gradient-text">Enterprise Projects</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Build production-grade systems that map directly to every roadmap topic.
          Each project follows real engineering team workflows.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {projects.map((project, i) => {
          const Icon = iconMap[project.icon] ?? Layers;
          const completed = state.completedMilestones.filter((m) =>
            project.milestones.some((pm) => pm.id === m)
          ).length;
          const progress = (completed / project.milestones.length) * 100;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/projects/${project.id}`}>
                <Card className="h-full hover:border-primary/30 transition-all cursor-pointer" style={{ borderTopColor: project.color, borderTopWidth: 3 }}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2" style={{ backgroundColor: `${project.color}20` }}>
                        <Icon className="h-6 w-6" style={{ color: project.color }} />
                      </div>
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{project.domain}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{project.tagline}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 5).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                      {project.techStack.length > 5 && (
                        <Badge variant="outline" className="text-[10px]">+{project.techStack.length - 5}</Badge>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{completed}/{project.milestones.length} milestones</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{project.microservices.length} microservices</span>
                      <span className="flex items-center gap-1 text-primary">Explore <ChevronRight className="h-3 w-3" /></span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
