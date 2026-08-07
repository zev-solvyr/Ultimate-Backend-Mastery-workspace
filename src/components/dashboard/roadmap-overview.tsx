"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { roadmap, projects } from "@/lib/data";
import { getLevelColor } from "@/lib/utils";
import { useProgress } from "@/hooks/use-progress";
import { ChevronRight } from "lucide-react";

export function RoadmapOverview() {
  const { state } = useProgress();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>22-Level Roadmap</CardTitle>
        <Link href="/roadmap" className="text-sm text-primary hover:underline flex items-center gap-1">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
          {roadmap.levels.map((level, i) => {
            const topicProgress = level.topics.map(
              (t) => state.topicProgress[t.id] ?? 0
            );
            const avg = topicProgress.length
              ? topicProgress.reduce((a, b) => a + b, 0) / topicProgress.length
              : 0;
            const completed = topicProgress.filter((p) => p >= 100).length;

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/roadmap/level/${level.level}`}>
                  <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${getLevelColor(level.level)} text-xs font-bold text-white`}>
                      {level.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{level.title}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {completed}/{level.topics.length}
                        </Badge>
                      </div>
                      <Progress value={avg} className="mt-1.5 h-1" />
                    </div>
                    <span className="text-xs text-muted-foreground">{Math.round(avg)}%</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectsOverview() {
  const { state } = useProgress();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Projects</CardTitle>
        <Link href="/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project) => {
          const milestoneProgress =
            (state.completedMilestones.filter((m) =>
              project.milestones.some((pm) => pm.id === m)
            ).length / project.milestones.length) * 100;

          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="rounded-lg border border-border/50 p-4 hover:border-primary/30 transition-all" style={{ borderLeftColor: project.color, borderLeftWidth: 3 }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{project.tagline}</p>
                  </div>
                  <Badge>{project.difficulty}</Badge>
                </div>
                <Progress value={milestoneProgress} className="mt-3 h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  {state.completedMilestones.filter((m) => project.milestones.some((pm) => pm.id === m)).length}/{project.milestones.length} milestones
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
