"use client";

import { useCallback, useEffect, useState } from "react";
import type { InterviewTopic, InterviewQuestion } from "@/types";
import { defaultInterviewTopics, defaultInterviewQuestions } from "@/data/interview-questions-seed";

import { logUserActivity } from "@/hooks/use-activity";
import { useAuth } from "@/context/auth-context";
import { syncInterviewQuestionsToCloud, fetchInterviewQuestionsFromCloud } from "@/lib/supabase/sync-engine";

const STORAGE_KEY = "backend-interview-question-bank";

interface QuestionBankData {
  topics: InterviewTopic[];
  questions: InterviewQuestion[];
  _version?: number;
}

function readStore(): QuestionBankData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { topics: defaultInterviewTopics, questions: defaultInterviewQuestions, _version: 1 };
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.topics) && Array.isArray(parsed.questions)) {
      return parsed;
    }
    return { topics: defaultInterviewTopics, questions: defaultInterviewQuestions, _version: 1 };
  } catch {
    return { topics: defaultInterviewTopics, questions: defaultInterviewQuestions, _version: 1 };
  }
}

function persistStore(data: QuestionBankData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save interview questions bank to localStorage:", e);
  }
}

export function useInterviewQuestions() {
  const { user } = useAuth();
  const [data, setData] = useState<QuestionBankData>({ topics: [], questions: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initial = readStore();
    setData(initial);
    setLoaded(true);

    if (user?.id) {
      fetchInterviewQuestionsFromCloud(user.id).then((cloud) => {
        if (cloud && (cloud.topics.length > 0 || cloud.questions.length > 0)) {
          const merged: QuestionBankData = {
            topics: cloud.topics.length > 0 ? cloud.topics : initial.topics,
            questions: cloud.questions.length > 0 ? cloud.questions : initial.questions,
            _version: 1,
          };
          setData(merged);
          persistStore(merged);
        }
      });
    }
  }, [user?.id]);

  const addTopic = useCallback((name: string, description?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = `${slug}-${Date.now()}`;
    setData((curr) => {
      const next = {
        ...curr,
        topics: [...curr.topics, { id, name: trimmed, description, order: curr.topics.length + 1 }],
      };
      persistStore(next);
      if (user?.id) syncInterviewQuestionsToCloud(user.id, next.topics, next.questions);
      return next;
    });
  }, [user?.id]);

  const renameTopic = useCallback((topicId: string, newName: string, newDescription?: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setData((curr) => {
      const next = {
        ...curr,
        topics: curr.topics.map((t) => (t.id === topicId ? { ...t, name: trimmed, description: newDescription } : t)),
      };
      persistStore(next);
      if (user?.id) syncInterviewQuestionsToCloud(user.id, next.topics, next.questions);
      return next;
    });
  }, [user?.id]);

  const deleteTopic = useCallback((topicId: string) => {
    setData((curr) => {
      const next = {
        ...curr,
        topics: curr.topics.filter((t) => t.id !== topicId),
        questions: curr.questions.filter((q) => q.topicId !== topicId),
      };
      persistStore(next);
      if (user?.id) syncInterviewQuestionsToCloud(user.id, next.topics, next.questions);
      return next;
    });
  }, [user?.id]);

  const addQuestion = useCallback((q: Omit<InterviewQuestion, "id" | "createdAt" | "updatedAt">) => {
    const id = `iq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newQuestion: InterviewQuestion = {
      ...q,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setData((curr) => {
      const next = {
        ...curr,
        questions: [newQuestion, ...curr.questions],
      };
      persistStore(next);
      if (user?.id) syncInterviewQuestionsToCloud(user.id, next.topics, next.questions);
      logUserActivity({
        type: "question",
        title: newQuestion.question,
        subtitle: "Added to Question Bank",
        href: "/interview-questions",
      });
      return next;
    });
    return newQuestion;
  }, [user?.id]);

  const updateQuestion = useCallback((id: string, updates: Partial<InterviewQuestion>) => {
    const now = new Date().toISOString();
    setData((curr) => {
      const target = curr.questions.find((q) => q.id === id);
      const next = {
        ...curr,
        questions: curr.questions.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: now } : q)),
      };
      persistStore(next);
      if (user?.id) syncInterviewQuestionsToCloud(user.id, next.topics, next.questions);
      if (target) {
        logUserActivity({
          type: "question",
          title: updates.question || target.question,
          subtitle: "Updated question notes",
          href: "/interview-questions",
        });
      }
      return next;
    });
  }, [user?.id]);

  const deleteQuestion = useCallback((id: string) => {
    setData((curr) => {
      const next = {
        ...curr,
        questions: curr.questions.filter((q) => q.id !== id),
      };
      persistStore(next);
      if (user?.id) syncInterviewQuestionsToCloud(user.id, next.topics, next.questions);
      return next;
    });
  }, [user?.id]);

  const moveQuestion = useCallback((id: string, targetTopicId: string) => {
    const now = new Date().toISOString();
    setData((curr) => {
      const next = {
        ...curr,
        questions: curr.questions.map((q) => (q.id === id ? { ...q, topicId: targetTopicId, updatedAt: now } : q)),
      };
      persistStore(next);
      if (user?.id) syncInterviewQuestionsToCloud(user.id, next.topics, next.questions);
      return next;
    });
  }, [user?.id]);

  const duplicateQuestion = useCallback((id: string) => {
    setData((curr) => {
      const target = curr.questions.find((q) => q.id === id);
      if (!target) return curr;
      const newId = `iq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const duplicated: InterviewQuestion = {
        ...target,
        id: newId,
        question: `${target.question} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };
      const next = {
        ...curr,
        questions: [duplicated, ...curr.questions],
      };
      persistStore(next);
      if (user?.id) syncInterviewQuestionsToCloud(user.id, next.topics, next.questions);
      return next;
    });
  }, [user?.id]);

  const resetToDefault = useCallback(() => {
    const resetData = { topics: defaultInterviewTopics, questions: defaultInterviewQuestions, _version: 1 };
    setData(resetData);
    persistStore(resetData);
  }, []);

  return {
    loaded,
    topics: data.topics,
    questions: data.questions,
    addTopic,
    renameTopic,
    deleteTopic,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    duplicateQuestion,
    resetToDefault,
  };
}
