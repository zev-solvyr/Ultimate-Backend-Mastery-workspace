"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { skillMappings, roadmap } from "@/lib/data";
import { getDifficultyColor } from "@/lib/utils";
import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link2, Search, Filter } from "lucide-react";

export default function SkillMappingPage() {
  const { state } = useProgress();
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState<string>("all");

  const filtered = skillMappings.filter((m) => {
    const matchesSearch = m.topicTitle.toLowerCase().includes(search.toLowerCase());
    const matchesProject = filterProject === "all" || m.projects.some((p) => p.projectId === filterProject);
    return matchesSearch && matchesProject;
  });

  const mappedCount = skillMappings.filter((m) => m.projects.length > 0).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold gradient-text">Skill → Project Mapping</h1>
        <p className="text-muted-foreground mt-2">
          See exactly where every roadmap topic is implemented across CommerceX, FinFlow, and Platform Engineering.
        </p>
        <div className="flex gap-4 mt-3 text-sm">
          <Badge variant="secondary">{mappedCount}/{skillMappings.length} topics mapped</Badge>
          <Badge variant="outline">3 projects</Badge>
        </div>
      </motion.div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-lg bg-secondary/50 border border-border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {["all", "commercex", "finflow", "platform"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterProject(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterProject === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "all" ? "All Projects" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((mapping, i) => {
          const progress = state.topicProgress[mapping.topicId] ?? 0;
          const level = roadmap.levels.find((l) => l.level === mapping.level);
          const topic = level?.topics.find((t) => t.id === mapping.topicId);

          return (
            <motion.div key={mapping.topicId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-primary" />
                        <Link href={`/roadmap/topic/${mapping.topicId}`} className="font-semibold hover:text-primary">
                          {mapping.topicTitle}
                        </Link>
                        <Badge variant="outline" className="text-[10px]">L{mapping.level}</Badge>
                        {topic && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getDifficultyColor(topic.difficulty)}`}>
                            {topic.difficulty}
                          </span>
                        )}
                      </div>
                      {mapping.projects.length === 0 ? (
                        <p className="text-xs text-muted-foreground mt-2">Theory-only topic (no direct project implementation)</p>
                      ) : (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {mapping.projects.map((p) => (
                            <Link key={p.projectId} href={`/projects/${p.projectId}`}>
                              <div className="rounded-lg border border-border/50 p-3 hover:border-primary/30 transition-all h-full">
                                <p className="text-sm font-medium">{p.projectName}</p>
                                <Badge variant="secondary" className="text-[10px] mt-1">{p.phase}</Badge>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.implementation}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {p.files.slice(0, 2).map((f) => (
                                    <span key={f} className="text-[10px] font-mono text-primary/70">{f}</span>
                                  ))}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                      <Progress value={progress} className="mt-1 w-16" />
                    </div>
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
