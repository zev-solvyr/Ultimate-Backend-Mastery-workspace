"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import type { Company, QuestionSet, InterviewQuestion } from "@/types";
import {
  defaultCompanies,
  defaultQuestionSets,
  defaultInterviewQuestions,
} from "@/data/interview-questions-seed";
import { logUserActivity } from "@/hooks/use-activity";
import { useAuth } from "@/context/auth-context";
import {
  syncCompanyDataToCloud,
  fetchCompanyDataFromCloud,
  deleteCompanyFromCloud,
  deleteQuestionSetFromCloud,
  deleteInterviewQuestionFromCloud,
  recordPendingDeletion,
  removePendingDeletion,
  flushPendingDeletionsToCloud,
} from "@/lib/supabase/sync-engine";
import { parseBulkQuestionsText, normalizeQuestionText } from "@/lib/bulk-import-parser";

const V2_STORAGE_KEY = "backend-interview-company-bank-v2";
const LEGACY_STORAGE_KEY = "backend-interview-question-bank";

interface InterviewBankStoreData {
  companies: Company[];
  questionSets: QuestionSet[];
  questions: InterviewQuestion[];
  _version: number;
}

function readStore(): InterviewBankStoreData {
  if (typeof window === "undefined") {
    return { companies: defaultCompanies, questionSets: defaultQuestionSets, questions: defaultInterviewQuestions, _version: 2 };
  }

  try {
    const rawV2 = window.localStorage.getItem(V2_STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.companies) && Array.isArray(parsed.questionSets) && Array.isArray(parsed.questions)) {
        return parsed;
      }
    }

    // Attempt legacy migration if V2 does not exist
    const rawLegacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawLegacy) {
      const legacy = JSON.parse(rawLegacy);
      if (legacy && typeof legacy === "object" && (Array.isArray(legacy.topics) || Array.isArray(legacy.questions))) {
        const legacyCompany: Company = {
          id: "company-general-legacy",
          name: "General / Core Topics",
          description: "Migrated legacy topics and interview question bank",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const legacyTopics = legacy.topics || [];
        const legacyQuestionSets: QuestionSet[] = legacyTopics.map((t: any, idx: number) => ({
          id: `set-legacy-${t.id || idx}`,
          companyId: legacyCompany.id,
          title: t.name || `Topic ${idx + 1}`,
          notes: t.description || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        // Default set for orphaned questions
        const defaultLegacySet: QuestionSet = {
          id: "set-legacy-general",
          companyId: legacyCompany.id,
          title: "General Core Java Questions",
          notes: "Migrated legacy questions",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        legacyQuestionSets.push(defaultLegacySet);

        const legacyQuestions: InterviewQuestion[] = (legacy.questions || []).map((q: any, idx: number) => {
          const matchedSet = legacyQuestionSets.find((s) => s.id === `set-legacy-${q.topicId}`);
          return {
            id: q.id || `iq-legacy-${Date.now()}-${idx}`,
            questionSetId: matchedSet ? matchedSet.id : defaultLegacySet.id,
            topicId: q.topicId,
            question: q.question,
            answer: q.answer || "",
            order: idx + 1,
            tags: q.tags || [],
            difficulty: q.difficulty,
            company: q.company,
            referenceUrl: q.referenceUrl,
            createdAt: q.createdAt || new Date().toISOString(),
            updatedAt: q.updatedAt || new Date().toISOString(),
          };
        });

        const migratedData: InterviewBankStoreData = {
          companies: [legacyCompany, ...defaultCompanies.filter((c) => c.id !== legacyCompany.id)],
          questionSets: [...legacyQuestionSets, ...defaultQuestionSets],
          questions: [...legacyQuestions, ...defaultInterviewQuestions],
          _version: 2,
        };

        window.localStorage.setItem(V2_STORAGE_KEY, JSON.stringify(migratedData));
        return migratedData;
      }
    }

    return { companies: defaultCompanies, questionSets: defaultQuestionSets, questions: defaultInterviewQuestions, _version: 2 };
  } catch (e) {
    console.error("Failed to read interview bank store:", e);
    return { companies: defaultCompanies, questionSets: defaultQuestionSets, questions: defaultInterviewQuestions, _version: 2 };
  }
}

function persistStore(data: InterviewBankStoreData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(V2_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save interview bank to localStorage:", e);
  }
}

export function useInterviewQuestions() {
  const { user } = useAuth();
  const [store, setStore] = useState<InterviewBankStoreData>({ companies: [], questionSets: [], questions: [], _version: 2 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initial = readStore();
    const userPrefix = user?.id ? `${user.id.substring(0, 8)}...` : "NONE";
    console.log(`[INTERVIEW DEBUG] STAGE 1 - LOCAL HYDRATION | user=${userPrefix} | companies=${initial.companies.length} | sets=${initial.questionSets.length} | questions=${initial.questions.length}`);
    setStore(initial);
    setLoaded(true);

    if (user?.id) {
      console.log(`[INTERVIEW DEBUG] STAGE 2 - AUTH RESOLVED | user=${userPrefix}`);
      flushPendingDeletionsToCloud(user.id).then(() => {
        console.log(`[INTERVIEW DEBUG] STAGE 3 - CLOUD FETCH START | user=${userPrefix}`);
        fetchCompanyDataFromCloud(user.id).then((cloud) => {
          if (cloud) {
            console.log(`[INTERVIEW DEBUG] STAGE 4 - CLOUD FETCH RESULT | cloudComp=${cloud.companies.length} | cloudSets=${cloud.questionSets.length} | cloudQuestions=${cloud.questions.length}`);

            const mergedCompanies = cloud.companies.length > 0 ? cloud.companies : initial.companies;
            const mergedSets = cloud.questionSets.length > 0 ? cloud.questionSets : initial.questionSets;
            
            // If cloud has structured company/set data for authenticated user, cloud.questions is authoritative.
            const mergedQuestions = (cloud.companies.length > 0 || cloud.questionSets.length > 0)
              ? cloud.questions
              : (cloud.questions.length > 0 ? cloud.questions : initial.questions);

            console.log(`[INTERVIEW DEBUG] STAGE 5 - MERGE RESULT | mergedComp=${mergedCompanies.length} | mergedSets=${mergedSets.length} | mergedQuestions=${mergedQuestions.length}`);

            const nextStore: InterviewBankStoreData = {
              companies: mergedCompanies,
              questionSets: mergedSets,
              questions: mergedQuestions,
              _version: 2,
            };
            setStore(nextStore);
            persistStore(nextStore);
            console.log(`[INTERVIEW DEBUG] STAGE 6 - FINAL STATE SET & PERSISTED | questions=${nextStore.questions.length}`);
          }
        });
      });
    }
  }, [user?.id]);

  const refreshFromCloud = useCallback(async () => {
    if (!user?.id) return false;
    const userPrefix = `${user.id.substring(0, 8)}...`;
    console.log(`[INTERVIEW DEBUG] MANUAL REFRESH START | user=${userPrefix}`);
    const cloud = await fetchCompanyDataFromCloud(user.id);
    if (cloud) {
      console.log(`[INTERVIEW DEBUG] MANUAL REFRESH RESULT | companies=${cloud.companies.length} | sets=${cloud.questionSets.length} | questions=${cloud.questions.length}`);
      const nextStore: InterviewBankStoreData = {
        companies: cloud.companies,
        questionSets: cloud.questionSets,
        questions: cloud.questions,
        _version: 2,
      };
      setStore(nextStore);
      persistStore(nextStore);
      return true;
    }
    return false;
  }, [user?.id]);

  // Map for fast frequency lookup ("Seen X times")
  const questionFrequencyMap = useMemo(() => {
    const map = new Map<string, { count: number; companyIds: Set<string>; setIds: Set<string> }>();
    const companyMap = new Map(store.companies.map((c) => [c.id, c.name]));
    const setMap = new Map(store.questionSets.map((s) => [s.id, s]));

    store.questions.forEach((q) => {
      const norm = normalizeQuestionText(q.question);
      if (!norm) return;

      const parentSet = setMap.get(q.questionSetId);
      const companyId = parentSet?.companyId || "unknown";

      if (!map.has(norm)) {
        map.set(norm, { count: 1, companyIds: new Set([companyId]), setIds: new Set([q.questionSetId]) });
      } else {
        const entry = map.get(norm)!;
        entry.count += 1;
        entry.companyIds.add(companyId);
        entry.setIds.add(q.questionSetId);
      }
    });

    return { map, companyMap, setMap };
  }, [store.companies, store.questionSets, store.questions]);

  const getQuestionFrequency = useCallback(
    (questionText: string) => {
      const norm = normalizeQuestionText(questionText);
      const entry = questionFrequencyMap.map.get(norm);
      if (!entry) return { count: 1, companyNames: [], setTitles: [] };

      const companyNames = Array.from(entry.companyIds)
        .map((cid) => questionFrequencyMap.companyMap.get(cid))
        .filter(Boolean) as string[];

      const setTitles = Array.from(entry.setIds)
        .map((sid) => questionFrequencyMap.setMap.get(sid)?.title)
        .filter(Boolean) as string[];

      return {
        count: entry.count,
        companyNames,
        setTitles,
      };
    },
    [questionFrequencyMap]
  );

  // --- COMPANY CRUD ---
  const addCompany = useCallback(
    (name: string, description?: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;

      const newCompany: Company = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: trimmed,
        description: description?.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setStore((curr) => {
        const next = { ...curr, companies: [...curr.companies, newCompany] };
        persistStore(next);
        if (user?.id) syncCompanyDataToCloud(user.id, next.companies, next.questionSets, next.questions);
        return next;
      });

      logUserActivity({
        type: "question",
        title: newCompany.name,
        subtitle: "Added new Company for Interview Questions",
        href: "/interview-questions",
      });

      return newCompany;
    },
    [user?.id]
  );

  const updateCompany = useCallback(
    (id: string, updates: Partial<Pick<Company, "name" | "description">>) => {
      const now = new Date().toISOString();
      setStore((curr) => {
        const next = {
          ...curr,
          companies: curr.companies.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: now } : c)),
        };
        persistStore(next);
        if (user?.id) syncCompanyDataToCloud(user.id, next.companies, next.questionSets, next.questions);
        return next;
      });
    },
    [user?.id]
  );

  const deleteCompany = useCallback(
    (id: string) => {
      setStore((curr) => {
        const setIdsToDelete = curr.questionSets.filter((s) => s.companyId === id).map((s) => s.id);
        const setIdsSet = new Set(setIdsToDelete);
        const qIdsToDelete = curr.questions.filter((q) => setIdsSet.has(q.questionSetId)).map((q) => q.id);

        // Record tombstones for all levels to prevent resurrection during offline/rehydration
        recordPendingDeletion("company", id);
        setIdsToDelete.forEach((setId) => recordPendingDeletion("question_set", setId));
        qIdsToDelete.forEach((qId) => recordPendingDeletion("question", qId));

        const next = {
          ...curr,
          companies: curr.companies.filter((c) => c.id !== id),
          questionSets: curr.questionSets.filter((s) => s.companyId !== id),
          questions: curr.questions.filter((q) => !setIdsSet.has(q.questionSetId)),
        };

        persistStore(next);

        if (user?.id) {
          deleteCompanyFromCloud(user.id, id).then((ok) => {
            if (ok) {
              removePendingDeletion("company", id);
              setIdsToDelete.forEach((setId) => removePendingDeletion("question_set", setId));
              qIdsToDelete.forEach((qId) => removePendingDeletion("question", qId));
            }
          });
        }
        return next;
      });
    },
    [user?.id]
  );

  // --- QUESTION SET CRUD ---
  const addQuestionSet = useCallback(
    (
      companyId: string,
      data: {
        title: string;
        role?: string;
        experience?: string;
        interviewRound?: string;
        source?: string;
        sourceUrl?: string;
        notes?: string;
        rawContent?: string;
      }
    ) => {
      const trimmedTitle = data.title.trim();
      if (!trimmedTitle || !companyId) return null;
      const now = new Date().toISOString();

      const newSet: QuestionSet = {
        id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        companyId,
        title: trimmedTitle,
        role: data.role?.trim() || undefined,
        experience: data.experience?.trim() || undefined,
        interviewRound: data.interviewRound?.trim() || undefined,
        source: data.source?.trim() || undefined,
        sourceUrl: data.sourceUrl?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        rawContent: data.rawContent || undefined,
        createdAt: now,
        updatedAt: now,
      };

      setStore((curr) => {
        const next = { ...curr, questionSets: [...curr.questionSets, newSet] };
        persistStore(next);
        if (user?.id) syncCompanyDataToCloud(user.id, next.companies, next.questionSets, next.questions);
        return next;
      });

      return newSet;
    },
    [user?.id]
  );

  const updateQuestionSet = useCallback(
    (id: string, updates: Partial<Omit<QuestionSet, "id" | "createdAt" | "companyId">>) => {
      const now = new Date().toISOString();
      setStore((curr) => {
        const next = {
          ...curr,
          questionSets: curr.questionSets.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now } : s)),
        };
        persistStore(next);
        if (user?.id) syncCompanyDataToCloud(user.id, next.companies, next.questionSets, next.questions);
        return next;
      });
    },
    [user?.id]
  );

  const deleteQuestionSet = useCallback(
    (id: string) => {
      recordPendingDeletion("question_set", id);
      setStore((curr) => {
        const next = {
          ...curr,
          questionSets: curr.questionSets.filter((s) => s.id !== id),
          questions: curr.questions.filter((q) => q.questionSetId !== id),
        };
        persistStore(next);
        if (user?.id) {
          deleteQuestionSetFromCloud(user.id, id).then((ok) => {
            if (ok) removePendingDeletion("question_set", id);
          });
        }
        return next;
      });
    },
    [user?.id]
  );

  const duplicateQuestionSet = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      let createdSetId: string | null = null;

      setStore((curr) => {
        const targetSet = curr.questionSets.find((s) => s.id === id);
        if (!targetSet) return curr;

        const newSetId = `set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        createdSetId = newSetId;

        const duplicatedSet: QuestionSet = {
          ...targetSet,
          id: newSetId,
          title: `${targetSet.title} (Copy)`,
          createdAt: now,
          updatedAt: now,
        };

        const targetQuestions = curr.questions.filter((q) => q.questionSetId === id);
        const duplicatedQuestions: InterviewQuestion[] = targetQuestions.map((q, idx) => ({
          ...q,
          id: `iq-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          questionSetId: newSetId,
          createdAt: now,
          updatedAt: now,
        }));

        const next = {
          ...curr,
          questionSets: [...curr.questionSets, duplicatedSet],
          questions: [...curr.questions, ...duplicatedQuestions],
        };

        persistStore(next);
        if (user?.id) syncCompanyDataToCloud(user.id, next.companies, next.questionSets, next.questions);
        return next;
      });

      return createdSetId;
    },
    [user?.id]
  );

  // --- BULK IMPORT WORKFLOW ---
  const bulkImportQuestionSet = useCallback(
    (data: {
      companyId: string;
      title: string;
      role?: string;
      experience?: string;
      interviewRound?: string;
      source?: string;
      sourceUrl?: string;
      notes?: string;
      rawText: string;
    }) => {
      const now = new Date().toISOString();
      const parsedItems = parseBulkQuestionsText(data.rawText);

      const setId = `set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const newSet: QuestionSet = {
        id: setId,
        companyId: data.companyId,
        title: data.title.trim(),
        role: data.role?.trim() || undefined,
        experience: data.experience?.trim() || undefined,
        interviewRound: data.interviewRound?.trim() || undefined,
        source: data.source?.trim() || undefined,
        sourceUrl: data.sourceUrl?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        rawContent: data.rawText,
        createdAt: now,
        updatedAt: now,
      };

      const newQuestions: InterviewQuestion[] = parsedItems.map((item, idx) => ({
        id: `iq-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        questionSetId: setId,
        question: item.question,
        answer: "",
        order: item.order,
        createdAt: now,
        updatedAt: now,
      }));

      setStore((curr) => {
        const next = {
          ...curr,
          questionSets: [...curr.questionSets, newSet],
          questions: [...curr.questions, ...newQuestions],
        };
        persistStore(next);
        if (user?.id) syncCompanyDataToCloud(user.id, next.companies, next.questionSets, next.questions);
        return next;
      });

      logUserActivity({
        type: "question",
        title: `${newSet.title} (${parsedItems.length} questions)`,
        subtitle: "Bulk imported Question Set",
        href: "/interview-questions",
      });

      return newSet;
    },
    [user?.id]
  );

  // --- QUESTION CRUD ---
  const addQuestion = useCallback(
    (questionSetId: string, questionText: string, answerText?: string) => {
      const trimmed = questionText.trim();
      if (!trimmed || !questionSetId) return null;
      const now = new Date().toISOString();

      setStore((curr) => {
        const existingCount = curr.questions.filter((q) => q.questionSetId === questionSetId).length;
        const newQuestion: InterviewQuestion = {
          id: `iq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          questionSetId,
          question: trimmed,
          answer: answerText?.trim() || "",
          order: existingCount + 1,
          createdAt: now,
          updatedAt: now,
        };

        const next = {
          ...curr,
          questions: [...curr.questions, newQuestion],
        };
        persistStore(next);
        if (user?.id) syncCompanyDataToCloud(user.id, next.companies, next.questionSets, next.questions);
        return next;
      });
    },
    [user?.id]
  );

  const updateQuestion = useCallback(
    (id: string, updates: Partial<Pick<InterviewQuestion, "question" | "answer" | "order">>) => {
      const now = new Date().toISOString();
      setStore((curr) => {
        const next = {
          ...curr,
          questions: curr.questions.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: now } : q)),
        };
        persistStore(next);
        if (user?.id) syncCompanyDataToCloud(user.id, next.companies, next.questionSets, next.questions);
        return next;
      });
    },
    [user?.id]
  );

  const deleteQuestion = useCallback(
    (id: string) => {
      recordPendingDeletion("question", id);
      setStore((curr) => {
        const next = {
          ...curr,
          questions: curr.questions.filter((q) => q.id !== id),
        };
        persistStore(next);
        if (user?.id) {
          deleteInterviewQuestionFromCloud(user.id, id).then((ok) => {
            if (ok) removePendingDeletion("question", id);
          });
        }
        return next;
      });
    },
    [user?.id]
  );

  const duplicateQuestion = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setStore((curr) => {
        const target = curr.questions.find((q) => q.id === id);
        if (!target) return curr;

        const duplicated: InterviewQuestion = {
          ...target,
          id: `iq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          question: `${target.question} (Copy)`,
          createdAt: now,
          updatedAt: now,
        };

        const next = {
          ...curr,
          questions: [...curr.questions, duplicated],
        };
        persistStore(next);
        if (user?.id) syncCompanyDataToCloud(user.id, next.companies, next.questionSets, next.questions);
        return next;
      });
    },
    [user?.id]
  );

  return {
    loaded,
    companies: store.companies,
    questionSets: store.questionSets,
    questions: store.questions,
    refreshFromCloud,
    getQuestionFrequency,
    addCompany,
    updateCompany,
    deleteCompany,
    addQuestionSet,
    updateQuestionSet,
    deleteQuestionSet,
    duplicateQuestionSet,
    bulkImportQuestionSet,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
  };
}
