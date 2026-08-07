"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buildOrder, getProjectById, getTopicById } from "@/lib/data";
import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, GitBranch, ArrowRight } from "lucide-react";

export default function BuildOrderPage() {
  const { state, completeMilestone } = useProgress();

  const phases = [...new Set(buildOrder.map((s) => s.teamPhase))];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold gradient-text">Project Build Order</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Features are implemented in the same sequence used by real engineering teams.
          Each milestone unlocks new concepts from the roadmap.
        </p>
        <div className="flex gap-3 mt-3">
          {phases.map((phase) => (
            <Badge key={phase} variant="secondary">{phase}</Badge>
          ))}
        </div>
      </motion.div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-cyan-400 to-emerald-400 opacity-30" />
        <div className="space-y-6">
          {buildOrder.map((step, i) => {
            const project = getProjectById(step.projectId);
            const done = state.completedMilestones.includes(step.milestoneId);
            const prevDone = step.dependencies.length === 0 ||
              step.dependencies.every((dep) => {
                const depStep = buildOrder.find((s) => s.order === dep);
                return depStep ? state.completedMilestones.includes(depStep.milestoneId) : true;
              });
            const locked = !prevDone && !done;

            return (
              <motion.div
                key={step.order}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-14"
              >
                <div className={`absolute left-2 top-6 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold z-10 ${
                  done ? "bg-success text-white" : locked ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                }`}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : locked ? <Lock className="h-3 w-3" /> : step.order}
                </div>

                <Card className={locked ? "opacity-50" : done ? "border-success/30" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-primary" />
                          <CardTitle className="text-base">{step.title}</CardTitle>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Link href={`/projects/${step.projectId}`}>
                            <Badge style={{ backgroundColor: `${project?.color}20`, color: project?.color }}>
                              {project?.name}
                            </Badge>
                          </Link>
                          <Badge variant="outline">{step.teamPhase}</Badge>
                        </div>
                      </div>
                      <Badge variant={done ? "default" : "secondary"}>
                        Step {step.order}/{buildOrder.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{step.description}</p>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Unlocks Roadmap Topics</p>
                      <div className="flex flex-wrap gap-1">
                        {step.topicIds.map((tid) => {
                          const topic = getTopicById(tid);
                          return (
                            <Link key={tid} href={`/roadmap/topic/${tid}`}>
                              <Badge variant="outline" className="hover:bg-primary/10 text-[10px]">
                                {topic?.title ?? tid}
                              </Badge>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {!done && !locked && (
                      <Button size="sm" onClick={() => completeMilestone(step.milestoneId)}>
                        Complete Step <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                    {locked && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Complete previous step to unlock
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
