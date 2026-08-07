"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getLevelByNumber } from "@/lib/data";
import { getLevelColor, getDifficultyColor } from "@/lib/utils";
import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

export default function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level: levelStr } = use(params);
  const levelNum = parseInt(levelStr);
  const level = getLevelByNumber(levelNum);
  const { state, updateTopicProgress } = useProgress();

  if (!level) notFound();

  const topicProgress = level.topics.map((t) => state.topicProgress[t.id] ?? 0);
  const avg = topicProgress.reduce((a, b) => a + b, 0) / topicProgress.length;

  return (
    <div className="space-y-6">
      <Link href="/roadmap" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Roadmap
      </Link>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${getLevelColor(level.level)} text-xl font-bold text-white`}>
            {level.level}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{level.title}</h1>
            <p className="text-muted-foreground">{level.description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Progress value={avg} className="flex-1 max-w-xs" />
          <span className="text-sm font-semibold">{Math.round(avg)}% complete</span>
          <Badge>+{level.xpReward} XP reward</Badge>
        </div>
      </motion.div>

      <div className="grid gap-4">
        {level.topics.map((topic, i) => {
          const progress = state.topicProgress[topic.id] ?? 0;
          return (
            <motion.div key={topic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {topic.title}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(topic.difficulty)}`}>{topic.difficulty}</span>
                        <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{topic.estimatedLearningTime}</Badge>
                      </div>
                    </div>
                    <span className="text-lg font-bold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{topic.overview}</p>
                  <div className="flex gap-2">
                    <Link href={`/roadmap/topic/${topic.id}`}>
                      <Button size="sm">Study Topic</Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => updateTopicProgress(topic.id, Math.min(100, progress + 25))}>
                      +25% Progress
                    </Button>
                    {topic.usedInProjects.length > 0 && (
                      <Badge variant="secondary">
                        Used in: {topic.usedInProjects.join(", ")}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
