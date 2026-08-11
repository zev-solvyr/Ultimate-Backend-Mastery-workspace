import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchActivityFromCloud, syncActivityToCloud } from "@/lib/supabase/sync-engine";

export interface ActivityItem {
  id: string;
  type: "roadmap" | "project" | "question" | "resource" | "note";
  title: string;
  subtitle: string;
  href: string;
  timestamp: string;
}

const STORAGE_KEY = "backend-interview-activity";

export function logUserActivity(item: Omit<ActivityItem, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const current: ActivityItem[] = raw ? JSON.parse(raw) : [];
    const newEntry: ActivityItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    // Deduplicate by href or title to keep recent activity list clean
    const filtered = current.filter((x) => x.href !== item.href && x.title !== item.title);
    const updated = [newEntry, ...filtered].slice(0, 20);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
}

export function useActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setActivities(JSON.parse(raw));
      }
    } catch {
      setActivities([]);
    } finally {
      setLoaded(true);
    }

    if (user?.id) {
      fetchActivityFromCloud(user.id).then((cloudAct) => {
        if (cloudAct && cloudAct.length > 0) {
          setActivities(cloudAct);
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudAct));
          } catch {}
        }
      });
    }
  }, [user?.id]);

  const clearActivity = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setActivities([]);
  }, []);

  return {
    activities,
    loaded,
    clearActivity,
    logActivity: logUserActivity,
  };
}
