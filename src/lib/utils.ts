import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getDifficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    advanced: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    expert: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };
  return map[difficulty] ?? map.beginner;
}

export function getLevelColor(level: number): string {
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-cyan-500 to-teal-500",
    "from-teal-500 to-emerald-500",
    "from-emerald-500 to-green-500",
    "from-green-500 to-lime-500",
    "from-lime-500 to-yellow-500",
    "from-yellow-500 to-amber-500",
    "from-amber-500 to-orange-500",
    "from-orange-500 to-red-500",
    "from-red-500 to-rose-500",
    "from-rose-500 to-pink-500",
    "from-pink-500 to-fuchsia-500",
    "from-fuchsia-500 to-purple-500",
    "from-purple-500 to-violet-500",
    "from-violet-500 to-indigo-500",
    "from-indigo-500 to-blue-500",
    "from-blue-600 to-cyan-600",
    "from-cyan-600 to-teal-600",
    "from-teal-600 to-emerald-600",
    "from-emerald-600 to-green-600",
    "from-green-600 to-lime-600",
    "from-lime-600 to-yellow-600",
  ];
  return colors[(level - 1) % colors.length];
}
