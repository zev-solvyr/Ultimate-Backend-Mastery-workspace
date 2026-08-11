import { createClient, isSupabaseConfigured } from "./client";
import type { InterviewQuestion, InterviewTopic, ResourceItem, ResourceCategory, EngineeringLab } from "@/types";
import { getFileRecord } from "@/lib/file-storage";

// Helper to check if cloud operations are available
function canSync(): boolean {
  return isSupabaseConfigured() && typeof window !== "undefined";
}

// ============================================================================
// 1. INTERVIEW QUESTIONS CLOUD SYNC
// ============================================================================
export async function syncInterviewQuestionsToCloud(
  userId: string,
  topics: InterviewTopic[],
  questions: InterviewQuestion[]
): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    // Upsert topics
    if (topics.length > 0) {
      const topicRows = topics.map((t) => ({
        id: t.id,
        user_id: userId,
        name: t.name,
        description: t.description || null,
        order: t.order || 0,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("interview_topics").upsert(topicRows);
    }

    // Upsert questions
    if (questions.length > 0) {
      const questionRows = questions.map((q) => ({
        id: q.id,
        user_id: userId,
        topic_id: q.topicId,
        question: q.question,
        answer: q.answer || "",
        tags: q.tags || [],
        difficulty: q.difficulty || null,
        company: q.company || null,
        reference_url: q.referenceUrl || null,
        created_at: q.createdAt || new Date().toISOString(),
        updated_at: q.updatedAt || new Date().toISOString(),
      }));
      await supabase.from("interview_questions").upsert(questionRows);
    }

    return true;
  } catch (err) {
    console.error("Failed to sync interview questions to Supabase:", err);
    return false;
  }
}

export async function fetchInterviewQuestionsFromCloud(userId: string): Promise<{
  topics: InterviewTopic[];
  questions: InterviewQuestion[];
} | null> {
  if (!canSync() || !userId) return null;
  const supabase = createClient();

  try {
    const { data: tRows } = await supabase.from("interview_topics").select("*").eq("user_id", userId).order("order");
    const { data: qRows } = await supabase.from("interview_questions").select("*").eq("user_id", userId).order("created_at", { ascending: false });

    if (!tRows && !qRows) return null;

    const topics: InterviewTopic[] = (tRows || []).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || undefined,
      order: t.order || 0,
    }));

    const questions: InterviewQuestion[] = (qRows || []).map((q) => ({
      id: q.id,
      topicId: q.topic_id,
      question: q.question,
      answer: q.answer || "",
      tags: q.tags || [],
      difficulty: q.difficulty || undefined,
      company: q.company || undefined,
      referenceUrl: q.reference_url || undefined,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
    }));

    return { topics, questions };
  } catch (err) {
    console.error("Failed to fetch interview questions from Supabase:", err);
    return null;
  }
}

// ============================================================================
// 2. RESOURCES CLOUD SYNC & FILE STORAGE
// ============================================================================
export async function syncResourcesToCloud(
  userId: string,
  categories: ResourceCategory[],
  resources: ResourceItem[]
): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    if (categories.length > 0) {
      const catRows = categories.map((c) => ({
        id: c.id,
        user_id: userId,
        name: c.name,
        order: c.order || 0,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("resource_categories").upsert(catRows);
    }

    if (resources.length > 0) {
      const resRows = resources.map((r) => ({
        id: r.id,
        user_id: userId,
        category_id: r.categoryId,
        title: r.title,
        description: r.description || null,
        type: r.type,
        tags: r.tags || [],
        notes: r.notes || null,
        url: r.url || null,
        file_name: r.fileName || null,
        mime_type: r.mimeType || null,
        file_size: r.fileSize || null,
        stored_file_id: r.storedFileId || null,
        is_favorite: r.isFavorite || false,
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString(),
      }));
      await supabase.from("resources").upsert(resRows);
    }

    return true;
  } catch (err) {
    console.error("Failed to sync resources to Supabase:", err);
    return false;
  }
}

export async function fetchResourcesFromCloud(userId: string): Promise<{
  categories: ResourceCategory[];
  items: ResourceItem[];
} | null> {
  if (!canSync() || !userId) return null;
  const supabase = createClient();

  try {
    const { data: cRows } = await supabase.from("resource_categories").select("*").eq("user_id", userId).order("order");
    const { data: rRows } = await supabase.from("resources").select("*").eq("user_id", userId).order("created_at", { ascending: false });

    if (!cRows && !rRows) return null;

    const categories: ResourceCategory[] = (cRows || []).map((c) => ({
      id: c.id,
      name: c.name,
      order: c.order || 0,
    }));

    const items: ResourceItem[] = (rRows || []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || undefined,
      type: r.type as any,
      categoryId: r.category_id,
      tags: r.tags || [],
      notes: r.notes || undefined,
      url: r.url || undefined,
      fileName: r.file_name || undefined,
      mimeType: r.mime_type || undefined,
      fileSize: r.file_size ? Number(r.file_size) : undefined,
      storedFileId: r.stored_file_id || undefined,
      isFavorite: Boolean(r.is_favorite),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return { categories, items };
  } catch (err) {
    console.error("Failed to fetch resources from Supabase:", err);
    return null;
  }
}

export async function uploadResourceFileToStorage(
  userId: string,
  resourceId: string,
  file: File | Blob,
  fileName: string
): Promise<string | null> {
  if (!canSync() || !userId) return null;
  const supabase = createClient();

  try {
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${userId}/${resourceId}/${sanitizedName}`;

    const { error } = await supabase.storage.from("user-resources").upload(path, file, {
      upsert: true,
    });

    if (error) {
      console.error("Supabase file upload error:", error);
      return null;
    }

    return path;
  } catch (err) {
    console.error("Failed to upload file to Supabase storage:", err);
    return null;
  }
}

// ============================================================================
// 3. ROADMAP KNOWLEDGE BASE CLOUD SYNC
// ============================================================================
export async function syncKnowledgeBaseToCloud(
  userId: string,
  subtopicId: string,
  content: { notes: string; code: string; interviewQuestions: any[] }
): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    await supabase.from("knowledge_base_notes").upsert(
      {
        user_id: userId,
        subtopic_id: subtopicId,
        notes: content.notes || "",
        code: content.code || "",
        interview_questions: content.interviewQuestions || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,subtopic_id" }
    );
    return true;
  } catch (err) {
    console.error("Failed to sync knowledge base notes to Supabase:", err);
    return false;
  }
}

export async function fetchKnowledgeBaseFromCloud(userId: string): Promise<Record<string, any> | null> {
  if (!canSync() || !userId) return null;
  const supabase = createClient();

  try {
    const { data: rows } = await supabase.from("knowledge_base_notes").select("*").eq("user_id", userId);
    if (!rows) return null;

    const result: Record<string, any> = {};
    rows.forEach((r) => {
      result[r.subtopic_id] = {
        notes: r.notes || "",
        code: r.code || "",
        interviewQuestions: r.interview_questions || [],
      };
    });
    return result;
  } catch (err) {
    console.error("Failed to fetch knowledge base from Supabase:", err);
    return null;
  }
}

// ============================================================================
// 4. ENGINEERING LABS CLOUD SYNC
// ============================================================================
export async function syncEngineeringLabsToCloud(
  userId: string,
  labs: Record<string, EngineeringLab>
): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    const labRows = Object.values(labs).map((lab) => ({
      user_id: userId,
      lab_id: lab.id,
      lab_data: lab,
      is_custom: Boolean(lab.isCustom),
      updated_at: new Date().toISOString(),
    }));

    if (labRows.length > 0) {
      await supabase.from("engineering_lab_edits").upsert(labRows, { onConflict: "user_id,lab_id" });
    }
    return true;
  } catch (err) {
    console.error("Failed to sync engineering labs to Supabase:", err);
    return false;
  }
}

export async function fetchEngineeringLabsFromCloud(userId: string): Promise<Record<string, EngineeringLab> | null> {
  if (!canSync() || !userId) return null;
  const supabase = createClient();

  try {
    const { data: rows } = await supabase.from("engineering_lab_edits").select("*").eq("user_id", userId);
    if (!rows || rows.length === 0) return null;

    const result: Record<string, EngineeringLab> = {};
    rows.forEach((r) => {
      if (r.lab_data && typeof r.lab_data === "object") {
        result[r.lab_id] = r.lab_data as EngineeringLab;
      }
    });
    return result;
  } catch (err) {
    console.error("Failed to fetch engineering labs from Supabase:", err);
    return null;
  }
}

// ============================================================================
// 5. PROJECT GUIDES CLOUD SYNC
// ============================================================================
export async function syncProjectGuideToCloud(
  userId: string,
  projectId: string,
  guideData: any
): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    await supabase.from("project_guide_edits").upsert(
      {
        user_id: userId,
        project_id: projectId,
        guide_data: guideData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,project_id" }
    );
    return true;
  } catch (err) {
    console.error("Failed to sync project guide to Supabase:", err);
    return false;
  }
}

export async function fetchProjectGuidesFromCloud(userId: string): Promise<Record<string, any> | null> {
  if (!canSync() || !userId) return null;
  const supabase = createClient();

  try {
    const { data: rows } = await supabase.from("project_guide_edits").select("*").eq("user_id", userId);
    if (!rows || rows.length === 0) return null;

    const result: Record<string, any> = {};
    rows.forEach((r) => {
      if (r.guide_data) {
        result[r.project_id] = r.guide_data;
      }
    });
    return result;
  } catch (err) {
    console.error("Failed to fetch project guides from Supabase:", err);
    return null;
  }
}

// ============================================================================
// 6. USER ACTIVITY CLOUD SYNC
// ============================================================================
export async function syncActivityToCloud(userId: string, activities: any[]): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    const rows = activities.map((a) => ({
      id: a.id,
      user_id: userId,
      type: a.type,
      title: a.title,
      subtitle: a.subtitle,
      href: a.href,
      timestamp: a.timestamp || new Date().toISOString(),
    }));

    if (rows.length > 0) {
      await supabase.from("user_activities").upsert(rows);
    }
    return true;
  } catch (err) {
    console.error("Failed to sync activity to Supabase:", err);
    return false;
  }
}

export async function fetchActivityFromCloud(userId: string): Promise<any[] | null> {
  if (!canSync() || !userId) return null;
  const supabase = createClient();

  try {
    const { data: rows } = await supabase.from("user_activities").select("*").eq("user_id", userId).order("timestamp", { ascending: false }).limit(20);
    if (!rows) return null;
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      subtitle: r.subtitle,
      href: r.href,
      timestamp: r.timestamp,
    }));
  } catch (err) {
    console.error("Failed to fetch activity from Supabase:", err);
    return null;
  }
}

// ============================================================================
// 7. LOCAL DATA IMPORT MIGRATION HELPER
// ============================================================================
export async function migrateLocalDataToCloud(userId: string): Promise<boolean> {
  if (!canSync() || !userId) return false;

  try {
    // 1. Migrate Questions
    const iqRaw = window.localStorage.getItem("backend-interview-question-bank");
    if (iqRaw) {
      const iqData = JSON.parse(iqRaw);
      if (iqData?.topics && iqData?.questions) {
        await syncInterviewQuestionsToCloud(userId, iqData.topics, iqData.questions);
      }
    }

    // 2. Migrate Resources
    const resRaw = window.localStorage.getItem("backend-interview-resources");
    if (resRaw) {
      const resData = JSON.parse(resRaw);
      if (resData?.categories && resData?.items) {
        await syncResourcesToCloud(userId, resData.categories, resData.items);

        // Upload any IndexedDB blobs to Supabase Storage
        for (const item of resData.items) {
          if (item.storedFileId) {
            const record = await getFileRecord(item.storedFileId);
            if (record && record.blob) {
              await uploadResourceFileToStorage(userId, item.id, record.blob, item.fileName || "document");
            }
          }
        }
      }
    }

    // 3. Migrate Engineering Labs
    const labsRaw = window.localStorage.getItem("backend-interview-engineering-labs");
    if (labsRaw) {
      const labsData = JSON.parse(labsRaw);
      if (labsData?.labs) {
        await syncEngineeringLabsToCloud(userId, labsData.labs);
      }
    }

    // 4. Migrate Knowledge Base
    const kbRaw = window.localStorage.getItem("backend-interview-knowledge-base");
    if (kbRaw) {
      const kbData = JSON.parse(kbRaw);
      for (const [subtopicId, content] of Object.entries(kbData)) {
        await syncKnowledgeBaseToCloud(userId, subtopicId, content as any);
      }
    }

    // 5. Migrate Project Guides
    const pgRaw = window.localStorage.getItem("backend-interview-project-guides");
    if (pgRaw) {
      const pgData = JSON.parse(pgRaw);
      for (const [projectId, guideData] of Object.entries(pgData)) {
        await syncProjectGuideToCloud(userId, projectId, guideData);
      }
    }

    window.localStorage.setItem(`cloud_migrated_${userId}`, "true");
    return true;
  } catch (err) {
    console.error("Local data cloud migration failed:", err);
    return false;
  }
}
