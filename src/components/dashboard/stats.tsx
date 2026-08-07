"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/hooks/use-progress";
import { Zap, Flame, Trophy, Target, TrendingUp } from "lucide-react";

export function StatsCards() {
  const { state, getOverallProgress } = useProgress();
  const progress = getOverallProgress();

  const stats = [
    { label: "Total XP", value: state.stats.totalXp.toLocaleString(), icon: Zap, color: "text-yellow-400" },
    { label: "Level", value: state.stats.level, icon: TrendingUp, color: "text-primary" },
    { label: "Streak", value: `${state.stats.streak} days`, icon: Flame, color: "text-orange-400" },
    { label: "Completion", value: `${Math.round(progress)}%`, icon: Target, color: "text-emerald-400" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg bg-secondary p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function CompanyReadiness() {
  const { state } = useProgress();
  const companies = [
    { name: "Amazon", score: state.stats.companyReadiness.amazon, color: "from-orange-500 to-yellow-500" },
    { name: "Google", score: state.stats.companyReadiness.google, color: "from-blue-500 to-green-500" },
    { name: "Microsoft", score: state.stats.companyReadiness.microsoft, color: "from-blue-600 to-cyan-500" },
    { name: "Netflix", score: state.stats.companyReadiness.netflix, color: "from-red-500 to-red-600" },
    { name: "Stripe", score: state.stats.companyReadiness.stripe, color: "from-purple-500 to-indigo-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-gold" />
          Company Readiness Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {companies.map((c) => (
          <div key={c.name} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>{c.name}</span>
              <span className="font-semibold">{Math.round(c.score)}%</span>
            </div>
            <Progress value={c.score} />
          </div>
        ))}
        <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3 text-center">
          <p className="text-sm text-muted-foreground">Overall Readiness</p>
          <p className="text-3xl font-bold gradient-text">{Math.round(state.stats.companyReadiness.overall)}%</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AchievementsGrid() {
  const { state } = useProgress();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {state.stats.achievements.map((a) => (
            <motion.div
              key={a.id}
              whileHover={{ scale: 1.05 }}
              className={`rounded-lg border p-3 text-center transition-all ${
                a.unlocked
                  ? "border-gold/30 bg-gold/5"
                  : "border-border/50 opacity-40 grayscale"
              }`}
            >
              <div className="text-2xl mb-1">{a.icon}</div>
              <p className="text-xs font-semibold">{a.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{a.description}</p>
              {a.unlocked && <p className="text-[10px] text-gold mt-1">+{a.xpBonus} XP</p>}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityHeatmap() {
  const { state } = useProgress();
  const weeks = 26;
  const days = weeks * 7;
  const today = new Date();

  const cells = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    const key = date.toISOString().split("T")[0];
    const count = state.stats.heatmap[key] ?? 0;
    return { key, count, date };
  });

  const maxCount = Math.max(1, ...cells.map((c) => c.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-[3px] flex-wrap">
          {cells.map((cell) => (
            <div
              key={cell.key}
              title={`${cell.key}: ${cell.count} sessions`}
              className="h-3 w-3 rounded-sm transition-colors"
              style={{
                backgroundColor:
                  cell.count === 0
                    ? "hsl(var(--muted))"
                    : `hsl(142 76% ${45 - (cell.count / maxCount) * 25}%)`,
              }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
            <div
              key={intensity}
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor:
                  intensity === 0 ? "hsl(var(--muted))" : `hsl(142 76% ${45 - intensity * 25}%)`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
