import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProjectGuide } from "@/types";
import { useAuth } from "@/context/auth-context";
import { syncProjectGuideToCloud, fetchProjectGuidesFromCloud } from "@/lib/supabase/sync-engine";

export type EditableProjectGuide = ProjectGuide & Record<string, any>;
export type ProjectGuideStore = Record<string, EditableProjectGuide>;
const STORAGE_KEY = "backend-interview-project-guides";
export const CURRENT_SEED_VERSION = 7;

function readStore(): ProjectGuideStore {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function mergeArrayById(storedArr: any[], seedArr: any[]) {
  if (!Array.isArray(storedArr)) return seedArr;
  if (!Array.isArray(seedArr)) return storedArr;

  const result = [...storedArr];
  seedArr.forEach((seedItem) => {
    const exists = storedArr.some(
      (item) =>
        item.id === seedItem.id ||
        (item.title && item.title === seedItem.title) ||
        (item.name && item.name === seedItem.name) ||
        (item.path && item.path === seedItem.path)
    );
    if (!exists) {
      result.push(seedItem);
    }
  });
  return result;
}

function migrateProjectGuide(
  stored: EditableProjectGuide,
  initial: EditableProjectGuide,
  targetVersion: number
): EditableProjectGuide {
  const result: EditableProjectGuide = { ...stored };

  // Helper to copy over new initial seed sections if missing or if migrating to version 7
  const copyIfMissing = (key: string) => {
    if (initial[key] !== undefined && (!stored[key] || (stored._seedVersion ?? 0) < 7)) {
      result[key] = initial[key];
    }
  };

  copyIfMissing("overviewSpec");
  copyIfMissing("businessRequirements");
  copyIfMissing("functionalRequirements");
  copyIfMissing("nonFunctionalRequirements");
  copyIfMissing("techStackCards");
  copyIfMissing("architectureSpec");
  copyIfMissing("serviceSpecs");
  copyIfMissing("databaseDesign");
  copyIfMissing("apiSpecs");
  copyIfMissing("eventSpecs");
  copyIfMissing("securityRequirements");
  copyIfMissing("reliabilityRequirements");
  copyIfMissing("observabilityRequirements");
  copyIfMissing("buildPlanPhases");
  copyIfMissing("interviewDiscussion");

  result._seedVersion = targetVersion;
  return result;
}

export function useProjectGuide(projectId: string, initialGuide: EditableProjectGuide = {}) {
  const { user } = useAuth();
  const [store, setStore] = useState<ProjectGuideStore>({});
  const [loaded, setLoaded] = useState(false);
  const [sourceState, setSourceState] = useState<"seed" | "localStorage" | "migrated">("seed");

  // Keep initialGuide reference stable via a ref so object identity changes don't trigger re-hydration loops
  const initialGuideRef = useRef(initialGuide);
  useEffect(() => {
    initialGuideRef.current = initialGuide;
  }, [initialGuide]);

  // Main hydration effect - depends strictly on projectId
  useEffect(() => {
    const diskStore = readStore();
    const storedForProject = diskStore[projectId];

    if (!storedForProject) {
      setStore(diskStore);
      setSourceState("seed");
    } else if (storedForProject._seedVersion === CURRENT_SEED_VERSION) {
      setStore(diskStore);
      setSourceState("localStorage");
    } else {
      // Outdated seed version in localStorage -> Migrate safely
      const migrated = migrateProjectGuide(storedForProject, initialGuideRef.current, CURRENT_SEED_VERSION);
      const updatedStore = { ...diskStore, [projectId]: migrated };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStore));
      } catch (e) {
        console.error("Failed to persist migrated project guide:", e);
      }
      setStore(updatedStore);
      setSourceState("migrated");
    }
    setLoaded(true);

    if (user?.id) {
      fetchProjectGuidesFromCloud(user.id).then((cloudGuides) => {
        if (cloudGuides && cloudGuides[projectId]) {
          setStore((prev) => {
            const next = { ...prev, [projectId]: cloudGuides[projectId] };
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      });
    }
  }, [projectId, user?.id]);

  const guide = useMemo(() => {
    const raw = store[projectId];
    if (!raw) return { ...initialGuideRef.current, _seedVersion: CURRENT_SEED_VERSION };
    return raw;
  }, [store, projectId]);

  const updateProjectGuide = useCallback(
    (data: Partial<EditableProjectGuide>) => {
      setStore((current) => {
        const existing = current[projectId] ?? initialGuideRef.current;
        const updatedGuide = {
          ...existing,
          ...data,
          _seedVersion: CURRENT_SEED_VERSION,
        };
        const next = {
          ...current,
          [projectId]: updatedGuide,
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error("Failed to save project guide:", e);
        }
        if (user?.id) {
          syncProjectGuideToCloud(user.id, projectId, updatedGuide);
        }
        return next;
      });
      setSourceState("localStorage");
    },
    [projectId, user?.id]
  );

  const updateDatabaseDesign = useCallback(
    (databaseDesign: unknown) => updateProjectGuide({ databaseDesign: databaseDesign as any }),
    [updateProjectGuide]
  );

  const resetProjectGuide = useCallback(() => {
    setStore((current) => {
      const { [projectId]: _, ...rest } = current;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      } catch (e) {
        console.error("Failed to reset project guide:", e);
      }
      return rest;
    });
    setSourceState("seed");
  }, [projectId]);

  return {
    loaded,
    guide,
    sourceState,
    getProjectGuide: useCallback(() => guide, [guide]),
    updateProjectGuide,
    updateDatabaseDesign,
    resetProjectGuide,
  };
}
