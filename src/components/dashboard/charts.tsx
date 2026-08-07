"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { roadmap } from "@/lib/data";
import { useProgress } from "@/hooks/use-progress";
import { TrendingUp, BarChart3 } from "lucide-react";

export function XpProgressChart() {
  const { state } = useProgress();
  const xpForNextLevel = state.stats.level * 500;
  const xpInCurrentLevel = state.stats.totalXp % 500;
  const progress = (xpInCurrentLevel / 500) * 100;

  const data = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const key = day.toISOString().split("T")[0];
    const sessions = state.stats.heatmap[key] ?? 0;
    return {
      day: day.toLocaleDateString("en", { weekday: "short" }),
      xp: sessions * 50 + Math.floor(state.stats.totalXp / 7),
    };
  });

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          XP Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold gradient-text">{state.stats.totalXp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total XP earned</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Level {state.stats.level}</p>
            <p className="text-xs text-muted-foreground">{xpInCurrentLevel}/{500} to next</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area type="monotone" dataKey="xp" stroke="hsl(217 91% 60%)" fill="url(#xpGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function LevelCompletionChart() {
  const { state } = useProgress();

  const data = roadmap.levels.map((level) => {
    const topicProgress = level.topics.map((t) => state.topicProgress[t.id] ?? 0);
    const avg = topicProgress.reduce((a, b) => a + b, 0) / topicProgress.length;
    return {
      name: `L${level.level}`,
      fullName: level.title,
      progress: Math.round(avg),
      fill: level.color,
    };
  });

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          Level Completion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}%`, "Progress"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
            />
            <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CompanyReadinessRadar() {
  const { state } = useProgress();
  const data = [
    { company: "Amazon", score: state.stats.companyReadiness.amazon },
    { company: "Google", score: state.stats.companyReadiness.google },
    { company: "Microsoft", score: state.stats.companyReadiness.microsoft },
    { company: "Netflix", score: state.stats.companyReadiness.netflix },
    { company: "Stripe", score: state.stats.companyReadiness.stripe },
  ];

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-base">Readiness Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="company" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Radar
              name="Readiness"
              dataKey="score"
              stroke="hsl(217 91% 60%)"
              fill="hsl(217 91% 60%)"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${Math.round(value)}%`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
