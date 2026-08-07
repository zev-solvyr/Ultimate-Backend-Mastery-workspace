"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { roadmap } from "@/lib/data";
import { getLevelColor, getDifficultyColor } from "@/lib/utils";
import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, BookOpen, Search, Filter } from "lucide-react";

export default function RoadmapPage() {
  const { state } = useProgress();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredLevels = useMemo(() => {
    return roadmap.levels
      .map((level) => ({
        ...level,
        topics: level.topics.filter((topic) => {
          const matchesSearch =
            search === "" ||
            topic.title.toLowerCase().includes(search.toLowerCase()) ||
            level.title.toLowerCase().includes(search.toLowerCase());
          const matchesDifficulty = difficultyFilter === "all" || topic.difficulty === difficultyFilter;
          return matchesSearch && matchesDifficulty;
        }),
      }))
      .filter((level) => level.topics.length > 0);
  }, [search, difficultyFilter]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold gradient-text">{roadmap.title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{roadmap.description}</p>
        <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
          <span>{roadmap.totalLevels} Levels</span>
          <span>{roadmap.levels.reduce((s, l) => s + l.topics.length, 0)} Topics</span>
          <span>Version {roadmap.version}</span>
        </div>
      </motion.div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-lg bg-secondary/50 border border-border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search levels or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {["all", "beginner", "intermediate", "advanced", "expert"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                difficultyFilter === d ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {d === "all" ? "All" : d}
            </button>
          ))}
        </div>
      </div>

      {filteredLevels.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No topics match your search.</p>
      )}

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-cyan-400 to-emerald-400 opacity-30 hidden sm:block" />
        <div className="space-y-6">
          {filteredLevels.map((level, i) => {
            const topicProgress = level.topics.map((t) => state.topicProgress[t.id] ?? 0);
            const avg = topicProgress.reduce((a, b) => a + b, 0) / topicProgress.length;

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-0 sm:pl-16"
              >
                <div className={`absolute left-4 top-6 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${getLevelColor(level.level)} text-sm font-bold text-white shadow-lg z-10`}>
                  {level.level}
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/roadmap/level/${level.level}`}>
                          <h2 className="text-xl font-semibold hover:text-primary transition-colors">
                            Level {level.level}: {level.title}
                          </h2>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{level.topics.length} topics</Badge>
                          <Badge variant="outline">+{level.xpReward} XP</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">{Math.round(avg)}%</span>
                        <Progress value={avg} className="mt-1 w-24" />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {level.topics.map((topic) => {
                        const progress = state.topicProgress[topic.id] ?? 0;
                        return (
                          <Link key={topic.id} href={`/roadmap/topic/${topic.id}`}>
                            <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
                              <BookOpen className="h-4 w-4 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{topic.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getDifficultyColor(topic.difficulty)}`}>
                                    {topic.difficulty}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">{topic.estimatedLearningTime}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs">{Math.round(progress)}%</span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
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
