"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAllTopics } from "@/lib/data";
import type { Achievement, UserStats } from "@/types";

const STORAGE_KEY = "ultimate-java-dev-progress";

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first-steps", title: "First Steps", description: "Complete your first topic", icon: "🎯", unlocked: false, xpBonus: 50 },
  { id: "week-warrior", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", unlocked: false, xpBonus: 200 },
  { id: "level-up", title: "Level Up", description: "Complete an entire roadmap level", icon: "⬆️", unlocked: false, xpBonus: 150 },
  { id: "project-pioneer", title: "Project Pioneer", description: "Start your first project milestone", icon: "🚀", unlocked: false, xpBonus: 100 },
  { id: "halfway-hero", title: "Halfway Hero", description: "Reach 50% roadmap completion", icon: "🏆", unlocked: false, xpBonus: 500 },
  { id: "interview-ready", title: "Interview Ready", description: "Complete all interview prep topics", icon: "💼", unlocked: false, xpBonus: 300 },
  { id: "kafka-master", title: "Event Master", description: "Complete all Kafka topics", icon: "📡", unlocked: false, xpBonus: 250 },
  { id: "cloud-native", title: "Cloud Native", description: "Complete AWS and K8s topics", icon: "☁️", unlocked: false, xpBonus: 350 },
];

interface ProgressState {
  topicProgress: Record<string, number>;
  topicStatus: Record<string, "not_started" | "in_progress" | "completed">;
  timeSpent: Record<string, number>;
  personalNotes: Record<string, string>;
  completedMilestones: string[];
  stats: UserStats;
}

const defaultState = (): ProgressState => ({
  topicProgress: {},
  topicStatus: {},
  timeSpent: {},
  personalNotes: {},
  completedMilestones: [],
  stats: {
    totalXp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
    achievements: DEFAULT_ACHIEVEMENTS,
    heatmap: {},
    companyReadiness: { amazon: 0, google: 0, microsoft: 0, netflix: 0, stripe: 0, overall: 0 },
  },
});

interface ProgressContextType {
  state: ProgressState;
  updateTopicProgress: (topicId: string, percent: number) => void;
  setTopicStatus: (topicId: string, status: "not_started" | "in_progress" | "completed") => void;
  updatePersonalNotes: (topicId: string, notes: string) => void;
  completeMilestone: (milestoneId: string) => void;
  addStudyTime: (topicId: string, minutes: number) => void;
  getOverallProgress: () => number;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

function calculateXp(progress: Record<string, number>): number {
  return Object.values(progress).reduce((sum, p) => sum + Math.floor(p * 10), 0);
}

function calculateCompanyReadiness(progress: Record<string, number>) {
  const topics = getAllTopics();
  const avg = topics.length
    ? topics.reduce((s, t) => s + (progress[t.id] ?? 0), 0) / topics.length
    : 0;
  const weights = { amazon: 1.0, google: 0.95, microsoft: 1.05, netflix: 0.9, stripe: 1.1 };
  return {
    amazon: Math.min(100, avg * weights.amazon),
    google: Math.min(100, avg * weights.google),
    microsoft: Math.min(100, avg * weights.microsoft),
    netflix: Math.min(100, avg * weights.netflix),
    stripe: Math.min(100, avg * weights.stripe),
    overall: Math.min(100, avg),
  };
}

function updateHeatmap(heatmap: Record<string, number>): Record<string, number> {
  const today = new Date().toISOString().split("T")[0];
  return { ...heatmap, [today]: (heatmap[today] ?? 0) + 1 };
}

function updateStreak(lastActive: string, currentStreak: number, longestStreak: number) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (lastActive === today) return { streak: currentStreak, longestStreak, lastActiveDate: today };
  const newStreak = lastActive === yesterday ? currentStreak + 1 : 1;
  return {
    streak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastActiveDate: today,
  };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const updateTopicProgress = useCallback((topicId: string, percent: number) => {
    setState((prev) => {
      const topicProgress = { ...prev.topicProgress, [topicId]: percent };
      const status = percent >= 100 ? "completed" : percent > 0 ? "in_progress" : "not_started";
      const topicStatus = { ...prev.topicStatus, [topicId]: status as "not_started" | "in_progress" | "completed" };
      const totalXp = calculateXp(topicProgress);
      const streakUpdate = updateStreak(prev.stats.lastActiveDate, prev.stats.streak, prev.stats.longestStreak);
      const achievements = [...prev.stats.achievements];
      const completedCount = Object.values(topicProgress).filter((p) => p >= 100).length;
      if (completedCount >= 1) achievements.find((a) => a.id === "first-steps")!.unlocked = true;
      if (streakUpdate.streak >= 7) achievements.find((a) => a.id === "week-warrior")!.unlocked = true;
      const overall = Object.values(topicProgress).reduce((s, p) => s + p, 0) / Math.max(getAllTopics().length, 1);
      if (overall >= 50) achievements.find((a) => a.id === "halfway-hero")!.unlocked = true;
      return {
        ...prev,
        topicProgress,
        topicStatus,
        stats: {
          ...prev.stats,
          totalXp,
          level: Math.floor(totalXp / 500) + 1,
          ...streakUpdate,
          achievements,
          heatmap: updateHeatmap(prev.stats.heatmap),
          companyReadiness: calculateCompanyReadiness(topicProgress),
        },
      };
    });
  }, []);

  const setTopicStatus = useCallback((topicId: string, status: "not_started" | "in_progress" | "completed") => {
    const percent = status === "completed" ? 100 : status === "in_progress" ? 50 : 0;
    updateTopicProgress(topicId, percent);
  }, [updateTopicProgress]);

  const updatePersonalNotes = useCallback((topicId: string, notes: string) => {
    setState((prev) => ({ ...prev, personalNotes: { ...prev.personalNotes, [topicId]: notes } }));
  }, []);

  const completeMilestone = useCallback((milestoneId: string) => {
    setState((prev) => {
      if (prev.completedMilestones.includes(milestoneId)) return prev;
      const achievements = [...prev.stats.achievements];
      achievements.find((a) => a.id === "project-pioneer")!.unlocked = true;
      return {
        ...prev,
        completedMilestones: [...prev.completedMilestones, milestoneId],
        stats: { ...prev.stats, totalXp: prev.stats.totalXp + 100, achievements },
      };
    });
  }, []);

  const addStudyTime = useCallback((topicId: string, minutes: number) => {
    setState((prev) => ({
      ...prev,
      timeSpent: { ...prev.timeSpent, [topicId]: (prev.timeSpent[topicId] ?? 0) + minutes },
    }));
  }, []);

  const getOverallProgress = useCallback(() => {
    const topics = getAllTopics();
    if (!topics.length) return 0;
    return topics.reduce((s, t) => s + (state.topicProgress[t.id] ?? 0), 0) / topics.length;
  }, [state.topicProgress]);

  return (
    <ProgressContext.Provider value={{ state, updateTopicProgress, setTopicStatus, updatePersonalNotes, completeMilestone, addStudyTime, getOverallProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
