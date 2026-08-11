import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { syncKnowledgeBaseToCloud, fetchKnowledgeBaseFromCloud } from "@/lib/supabase/sync-engine";

export interface InterviewQuestion { id: string; question: string; answer: string; }
export interface SubtopicContent { notes: string; code: string; interviewQuestions: InterviewQuestion[]; }
export type KnowledgeBaseContent = Record<string, SubtopicContent>;
const KEY = "backend-interview-knowledge-base";
const empty = (): SubtopicContent => ({ notes: "", code: "", interviewQuestions: [] });
const EMPTY_CONTENT: SubtopicContent = { notes: "", code: "", interviewQuestions: [] };

export function useKnowledgeBase(subtopicId: string) {
  const { user } = useAuth();
  const [all, setAll] = useState<KnowledgeBaseContent>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const value = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
      setAll(value && typeof value === "object" ? value : {});
    } catch {
      setAll({});
    } finally {
      setLoaded(true);
    }

    if (user?.id) {
      fetchKnowledgeBaseFromCloud(user.id).then((cloudKB) => {
        if (cloudKB && Object.keys(cloudKB).length > 0) {
          setAll((prev) => {
            const next = { ...prev, ...cloudKB };
            try {
              window.localStorage.setItem(KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      });
    }
  }, [user?.id]);

  const content = useMemo(() => all[subtopicId] ?? EMPTY_CONTENT, [all, subtopicId]);

  const update = useCallback(
    (change: Partial<SubtopicContent>) => {
      setAll((previous) => {
        const mergedContent = { ...(previous[subtopicId] ?? empty()), ...change };
        const next = { ...previous, [subtopicId]: mergedContent };
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch {}
        if (user?.id) {
          syncKnowledgeBaseToCloud(user.id, subtopicId, mergedContent);
        }
        return next;
      });
    },
    [subtopicId, user?.id]
  );

  return {
    content,
    loaded,
    saveNotes: (notes: string) => update({ notes }),
    saveCode: (code: string) => update({ code }),
    saveQuestions: (interviewQuestions: InterviewQuestion[]) => update({ interviewQuestions }),
  };
}
