"use client";

import { useCallback, useEffect, useState } from "react";
import type { EngineeringLab } from "@/types";
import { defaultEngineeringLabs } from "@/data/engineering-labs-seed";
import { logUserActivity } from "@/hooks/use-activity";
import { useAuth } from "@/context/auth-context";
import {
  syncEngineeringLabsToCloud,
  fetchEngineeringLabsFromCloud,
  deleteLabFromCloud,
  recordPendingDeletion,
  removePendingDeletion,
  flushPendingDeletionsToCloud,
} from "@/lib/supabase/sync-engine";

const STORAGE_KEY = "backend-interview-engineering-labs";
const CURRENT_SEED_VERSION = 1;

interface EngineeringLabsStore {
  labs: Record<string, EngineeringLab>;
  _seedVersion?: number;
}

function readStore(): Record<string, EngineeringLab> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultEngineeringLabs;
    }
    const parsed: EngineeringLabsStore = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.labs) {
      // Merge missing seeds if needed
      const merged = { ...defaultEngineeringLabs, ...parsed.labs };
      return merged;
    }
    return defaultEngineeringLabs;
  } catch {
    return defaultEngineeringLabs;
  }
}

function persistStore(labs: Record<string, EngineeringLab>) {
  try {
    const payload: EngineeringLabsStore = {
      labs,
      _seedVersion: CURRENT_SEED_VERSION,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to persist engineering labs to localStorage:", e);
  }
}

export function useEngineeringLabs() {
  const { user } = useAuth();
  const [labs, setLabs] = useState<Record<string, EngineeringLab>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initial = readStore();
    setLabs(initial);
    setLoaded(true);

    if (user?.id) {
      fetchEngineeringLabsFromCloud(user.id).then((cloudLabs) => {
        if (cloudLabs && Object.keys(cloudLabs).length > 0) {
          const merged = { ...initial, ...cloudLabs };
          setLabs(merged);
          persistStore(merged);
        }
      });
    }
  }, [user?.id]);

  const getLabById = useCallback(
    (id: string): EngineeringLab | undefined => {
      return labs[id];
    },
    [labs]
  );

  const addLab = useCallback((labData: Partial<EngineeringLab>): EngineeringLab => {
    const title = labData.title?.trim() || "New Custom Engineering Lab";
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = `lab-${slug}-${Date.now()}`;

    const newLab: EngineeringLab = {
      id,
      title,
      shortDescription: labData.shortDescription || "Custom hands-on engineering lab.",
      problemStatement: labData.problemStatement || "Define the core problem statement for this backend engineering lab.",
      interviewRelevance: labData.interviewRelevance || "★★★★☆ (Custom Engineering Lab)",
      relevanceRating: labData.relevanceRating || 4,
      difficulty: labData.difficulty || "Advanced",
      estimatedScope: labData.estimatedScope || "2 - 3 Days",
      primarySkills: labData.primarySkills && labData.primarySkills.length > 0 ? labData.primarySkills : ["Backend Engineering", "System Design"],
      overview: labData.overview || "Overview of what needs to be designed and built in this lab.",
      requirements: labData.requirements || { business: [], functional: [], nonFunctional: [] },
      technologies: labData.technologies || [],
      architecture: labData.architecture || { overview: "", components: [], communication: [], keyDecisions: [] },
      modules: labData.modules || [],
      dataDesign: labData.dataDesign || { databases: [] },
      apiDesign: labData.apiDesign || { apis: [] },
      eventDesign: labData.eventDesign || { events: [] },
      securityReliability: labData.securityReliability || { security: [], reliability: [], observability: [] },
      engineeringChallenges: labData.engineeringChallenges || [],
      buildPlan: labData.buildPlan || [],
      interviewDiscussion: labData.interviewDiscussion || { elevatorPitch: "", prompts: [] },
      isCustom: true,
    };

    setLabs((curr) => {
      const next = { ...curr, [id]: newLab };
      persistStore(next);
      if (user?.id) syncEngineeringLabsToCloud(user.id, next);
      logUserActivity({
        type: "project",
        title: newLab.title,
        subtitle: "Created custom Engineering Lab",
        href: `/projects/lab/${newLab.id}`,
      });
      return next;
    });

    return newLab;
  }, [user?.id]);

  const updateLab = useCallback((id: string, labData: Partial<EngineeringLab>) => {
    setLabs((curr) => {
      const existing = curr[id];
      if (!existing) return curr;
      const updated: EngineeringLab = {
        ...existing,
        ...labData,
      };
      const next = { ...curr, [id]: updated };
      persistStore(next);
      if (user?.id) syncEngineeringLabsToCloud(user.id, next);
      logUserActivity({
        type: "project",
        title: updated.title,
        subtitle: "Updated Engineering Lab Blueprint",
        href: `/projects/lab/${id}`,
      });
      return next;
    });
  }, [user?.id]);

  const deleteLab = useCallback((id: string) => {
    recordPendingDeletion("lab", id);
    setLabs((curr) => {
      const copy = { ...curr };
      delete copy[id];
      persistStore(copy);
      if (user?.id) {
        deleteLabFromCloud(user.id, id).then((success) => {
          if (success) removePendingDeletion("lab", id);
        });
      }
      return copy;
    });
  }, [user?.id]);

  const duplicateLab = useCallback((id: string): EngineeringLab | undefined => {
    let duplicated: EngineeringLab | undefined;
    setLabs((curr) => {
      const target = curr[id];
      if (!target) return curr;
      const newId = `${target.id}-copy-${Date.now()}`;
      duplicated = {
        ...target,
        id: newId,
        title: `${target.title} (Copy)`,
        isCustom: true,
      };
      const next = { ...curr, [newId]: duplicated };
      persistStore(next);
      if (user?.id) syncEngineeringLabsToCloud(user.id, next);
      return next;
    });
    return duplicated;
  }, [user?.id]);

  const resetLab = useCallback((id: string) => {
    setLabs((curr) => {
      const seed = defaultEngineeringLabs[id];
      if (!seed) return curr;
      const next = { ...curr, [id]: seed };
      persistStore(next);
      return next;
    });
  }, []);

  const resetAllLabs = useCallback(() => {
    setLabs(defaultEngineeringLabs);
    persistStore(defaultEngineeringLabs);
  }, []);

  return {
    loaded,
    labs,
    labsList: Object.values(labs),
    getLabById,
    addLab,
    updateLab,
    deleteLab,
    duplicateLab,
    resetLab,
    resetAllLabs,
  };
}
