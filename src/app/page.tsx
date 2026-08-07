"use client";

import { motion } from "framer-motion";
import { StatsCards, CompanyReadiness, AchievementsGrid, ActivityHeatmap } from "@/components/dashboard/stats";
import { XpProgressChart, LevelCompletionChart, CompanyReadinessRadar } from "@/components/dashboard/charts";
import { RoadmapOverview, ProjectsOverview } from "@/components/dashboard/roadmap-overview";
import { roadmap, projects } from "@/lib/data";

export default function DashboardPage() {
  const totalTopics = roadmap.levels.reduce((s, l) => s + l.topics.length, 0);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="gradient-text">Developer</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your journey from Java fundamentals to enterprise engineering mastery.
            </p>
          </div>
          <div className="hidden sm:flex gap-6 text-center">
            <StatPill label="Levels" value={roadmap.totalLevels} />
            <StatPill label="Topics" value={totalTopics} />
            <StatPill label="Projects" value={projects.length} />
          </div>
        </div>
      </motion.div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LevelCompletionChart />
        </div>
        <XpProgressChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RoadmapOverview />
        <ProjectsOverview />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CompanyReadiness />
        <CompanyReadinessRadar />
        <AchievementsGrid />
      </div>

      <ActivityHeatmap />
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 px-4 py-2">
      <p className="text-2xl font-bold gradient-text">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
