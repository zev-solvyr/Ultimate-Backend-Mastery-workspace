import { createClient, isSupabaseConfigured } from "./client";
import type { Company, QuestionSet, InterviewQuestion, InterviewTopic, ResourceItem, ResourceCategory, EngineeringLab } from "@/types";
import { getFileRecord } from "@/lib/file-storage";

// Helper to check if cloud operations are available
function canSync(): boolean {
  return isSupabaseConfigured() && typeof window !== "undefined";
}

// ============================================================================
// PENDING DELETIONS QUEUE (TOMBSTONES FOR OFFLINE / RESURRECTION PROTECTION)
// ============================================================================
export interface PendingDeletion {
  entityType: "question" | "question_set" | "company" | "topic" | "resource" | "lab";
  id: string;
  timestamp: string;
}

const DELETIONS_KEY = "backend-interview-pending-deletions";

export function getPendingDeletions(): PendingDeletion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DELETIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordPendingDeletion(entityType: PendingDeletion["entityType"], id: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getPendingDeletions();
    if (!current.some((d) => d.entityType === entityType && d.id === id)) {
      const next = [...current, { entityType, id, timestamp: new Date().toISOString() }];
      window.localStorage.setItem(DELETIONS_KEY, JSON.stringify(next));
    }
  } catch (e) {
    console.error("Failed to record pending deletion:", e);
  }
}

export function removePendingDeletion(entityType: PendingDeletion["entityType"], id: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getPendingDeletions();
    const next = current.filter((d) => !(d.entityType === entityType && d.id === id));
    window.localStorage.setItem(DELETIONS_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("Failed to remove pending deletion:", e);
  }
}

// ============================================================================
// 1. COMPANY → QUESTION SET → QUESTIONS CLOUD SYNC & DELETION
// ============================================================================
export async function deleteCompanyFromCloud(userId: string, companyId: string): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    // 1. Fetch child question sets for explicit multi-level deletion fallback
    const { data: sets, error: fetchErr } = await supabase
      .from("interview_question_sets")
      .select("id")
      .eq("company_id", companyId)
      .eq("user_id", userId);

    if (fetchErr) {
      console.error(`Failed to fetch child question sets for company ${companyId}: [${fetchErr.code}] ${fetchErr.message}`);
    }

    if (sets && sets.length > 0) {
      const setIds = sets.map((s) => s.id);
      // Delete questions belonging to those question sets
      const { error: delQuestionsErr } = await supabase
        .from("interview_questions")
        .delete()
        .in("question_set_id", setIds)
        .eq("user_id", userId);

      if (delQuestionsErr) {
        console.error(`Failed to delete questions for setIds [${setIds.join(",")}]: [${delQuestionsErr.code}] ${delQuestionsErr.message}`);
      }

      // Delete question sets belonging to company
      const { error: delSetsErr } = await supabase
        .from("interview_question_sets")
        .delete()
        .eq("company_id", companyId)
        .eq("user_id", userId);

      if (delSetsErr) {
        console.error(`Failed to delete question sets for company ${companyId}: [${delSetsErr.code}] ${delSetsErr.message}`);
      }
    }

    // 2. Delete company row from interview_companies
    const { error: delCompanyErr } = await supabase
      .from("interview_companies")
      .delete()
      .eq("id", companyId)
      .eq("user_id", userId);

    if (delCompanyErr) {
      console.error(
        `Failed to delete company ${companyId} from Supabase: [${delCompanyErr.code}] ${delCompanyErr.message} (${delCompanyErr.details || delCompanyErr.hint || "No additional details"})`
      );
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`Unexpected exception in deleteCompanyFromCloud (${companyId}):`, err?.message || String(err));
    return false;
  }
}

export async function deleteQuestionSetFromCloud(userId: string, setId: string): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    const { error: delQuestionsErr } = await supabase
      .from("interview_questions")
      .delete()
      .eq("question_set_id", setId)
      .eq("user_id", userId);

    if (delQuestionsErr) {
      console.error(`Failed to delete questions for set ${setId}: [${delQuestionsErr.code}] ${delQuestionsErr.message}`);
    }

    const { error: delSetErr } = await supabase
      .from("interview_question_sets")
      .delete()
      .eq("id", setId)
      .eq("user_id", userId);

    if (delSetErr) {
      console.error(`Failed to delete question set ${setId} from Supabase: [${delSetErr.code}] ${delSetErr.message}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`Unexpected exception in deleteQuestionSetFromCloud (${setId}):`, err?.message || String(err));
    return false;
  }
}

export async function deleteInterviewQuestionFromCloud(userId: string, questionId: string): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("interview_questions")
      .delete()
      .eq("id", questionId)
      .eq("user_id", userId);

    if (error) {
      console.error(`Failed to delete interview question ${questionId} from Supabase: [${error.code}] ${error.message}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`Unexpected exception in deleteInterviewQuestionFromCloud (${questionId}):`, err?.message || String(err));
    return false;
  }
}

export async function deleteInterviewTopicFromCloud(userId: string, topicId: string): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    await supabase.from("interview_questions").delete().eq("topic_id", topicId).eq("user_id", userId);
    const { error } = await supabase.from("interview_topics").delete().eq("id", topicId).eq("user_id", userId);
    if (error) {
      console.error("Failed to delete interview topic from Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete interview topic from Supabase:", err);
    return false;
  }
}

export async function syncCompanyDataToCloud(
  userId: string,
  companies: Company[],
  questionSets: QuestionSet[],
  questions: InterviewQuestion[]
): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    if (companies.length > 0) {
      const cRows = companies.map((c) => ({
        id: c.id,
        user_id: userId,
        name: c.name,
        description: c.description || null,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("interview_companies").upsert(cRows);
    }

    if (questionSets.length > 0) {
      const sRows = questionSets.map((s) => ({
        id: s.id,
        user_id: userId,
        company_id: s.companyId,
        title: s.title,
        role: s.role || null,
        experience: s.experience || null,
        interview_round: s.interviewRound || null,
        source: s.source || null,
        source_url: s.sourceUrl || null,
        notes: s.notes || null,
        raw_content: s.rawContent || null,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("interview_question_sets").upsert(sRows);
    }

    if (questions.length > 0) {
      const qRows = questions.map((q) => ({
        id: q.id,
        user_id: userId,
        question_set_id: q.questionSetId || q.topicId || "legacy",
        topic_id: q.topicId || null,
        question: q.question,
        answer: q.answer || "",
        order: q.order || 0,
        tags: q.tags || [],
        difficulty: q.difficulty || null,
        company: q.company || null,
        reference_url: q.referenceUrl || null,
        created_at: q.createdAt || new Date().toISOString(),
        updated_at: q.updatedAt || new Date().toISOString(),
      }));
      await supabase.from("interview_questions").upsert(qRows);
    }

    return true;
  } catch (err) {
    console.error("Failed to sync company interview data to Supabase:", err);
    return false;
  }
}

export async function fetchCompanyDataFromCloud(userId: string): Promise<{
  companies: Company[];
  questionSets: QuestionSet[];
  questions: InterviewQuestion[];
} | null> {
  if (!canSync() || !userId) return null;
  const supabase = createClient();
  const userPrefix = userId ? `${userId.substring(0, 8)}...` : "NONE";

  try {
    console.log(`[INTERVIEW DEBUG] CLOUD FETCH START | user=${userPrefix}`);

    const { data: cRows, error: cErr } = await supabase.from("interview_companies").select("*").eq("user_id", userId).order("created_at", { ascending: true });
    const { data: sRows, error: sErr } = await supabase.from("interview_question_sets").select("*").eq("user_id", userId).order("created_at", { ascending: true });
    const { data: qRows, error: qErr } = await supabase.from("interview_questions").select("*").eq("user_id", userId).order("order", { ascending: true });

    if (cErr || sErr || qErr) {
      console.error(`[INTERVIEW DEBUG] CLOUD FETCH ERROR | cErr=${cErr?.message || "none"} | sErr=${sErr?.message || "none"} | qErr=${qErr?.message || "none"}`);
    }

    console.log(`[INTERVIEW DEBUG] CLOUD FETCH RAW ROWS | cRows=${cRows?.length || 0} | sRows=${sRows?.length || 0} | qRows=${qRows?.length || 0}`);

    if (!cRows && !sRows && !qRows) return null;

    const pending = getPendingDeletions();
    const pendingCompanyIds = new Set(pending.filter((d) => d.entityType === "company").map((d) => d.id));
    const pendingSetIds = new Set(pending.filter((d) => d.entityType === "question_set").map((d) => d.id));
    const pendingQuestionIds = new Set(pending.filter((d) => d.entityType === "question").map((d) => d.id));

    if (pendingCompanyIds.size > 0 || pendingSetIds.size > 0 || pendingQuestionIds.size > 0) {
      console.log(`[INTERVIEW DEBUG] PENDING DELETIONS FILTER | pendingCompanies=${pendingCompanyIds.size} | pendingSets=${pendingSetIds.size} | pendingQuestions=${pendingQuestionIds.size}`);
    }

    const companies: Company[] = (cRows || [])
      .filter((c) => !pendingCompanyIds.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || undefined,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

    const questionSets: QuestionSet[] = (sRows || [])
      .filter((s) => !pendingSetIds.has(s.id) && !pendingCompanyIds.has(s.company_id))
      .map((s) => ({
        id: s.id,
        companyId: s.company_id,
        title: s.title,
        role: s.role || undefined,
        experience: s.experience || undefined,
        interviewRound: s.interview_round || undefined,
        source: s.source || undefined,
        sourceUrl: s.source_url || undefined,
        notes: s.notes || undefined,
        rawContent: s.raw_content || undefined,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }));

    const questions: InterviewQuestion[] = (qRows || [])
      .filter((q) => !pendingQuestionIds.has(q.id) && (!q.question_set_id || !pendingSetIds.has(q.question_set_id)))
      .map((q) => ({
        id: q.id,
        questionSetId: q.question_set_id || q.topic_id || "legacy",
        topicId: q.topic_id || undefined,
        question: q.question,
        answer: q.answer || "",
        order: q.order || 0,
        tags: q.tags || [],
        difficulty: q.difficulty || undefined,
        company: q.company || undefined,
        referenceUrl: q.reference_url || undefined,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
      }));

    console.log(`[INTERVIEW DEBUG] CLOUD FETCH PROCESSED | companies=${companies.length} | questionSets=${questionSets.length} | questions=${questions.length}`);

    return { companies, questionSets, questions };
  } catch (err) {
    console.error("Failed to fetch company interview data from Supabase:", err);
    return null;
  }
}

export async function syncInterviewQuestionsToCloud(
  userId: string,
  topics: InterviewTopic[],
  questions: InterviewQuestion[]
): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    if (questions.length > 0) {
      const questionRows = questions.map((q) => ({
        id: q.id,
        user_id: userId,
        question_set_id: q.questionSetId || q.topicId || "legacy",
        topic_id: q.topicId || null,
        question: q.question,
        answer: q.answer || "",
        order: q.order || 0,
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

    const pending = getPendingDeletions();
    const pendingQuestionIds = new Set(pending.filter((d) => d.entityType === "question").map((d) => d.id));
    const pendingTopicIds = new Set(pending.filter((d) => d.entityType === "topic").map((d) => d.id));

    const topics: InterviewTopic[] = (tRows || [])
      .filter((t) => !pendingTopicIds.has(t.id))
      .map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description || undefined,
        order: t.order || 0,
      }));

    const questions: InterviewQuestion[] = (qRows || [])
      .filter((q) => !pendingQuestionIds.has(q.id) && !pendingTopicIds.has(q.topic_id))
      .map((q) => ({
        id: q.id,
        questionSetId: q.question_set_id || q.topic_id || "legacy",
        topicId: q.topic_id || undefined,
        question: q.question,
        answer: q.answer || "",
        order: q.order || 0,
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
        storage_path: r.fileName ? `${userId}/${r.id}/${r.fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}` : null,
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

    const pending = getPendingDeletions();
    const pendingResourceIds = new Set(pending.filter((d) => d.entityType === "resource").map((d) => d.id));

    const categories: ResourceCategory[] = (cRows || []).map((c) => ({
      id: c.id,
      name: c.name,
      order: c.order || 0,
    }));

    const items: ResourceItem[] = (rRows || [])
      .filter((r) => !pendingResourceIds.has(r.id))
      .map((r) => ({
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

export async function deleteResourceFromCloud(userId: string, resourceId: string): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    // 1. Delete associated file objects from user-resources storage bucket
    const { data: fileList } = await supabase.storage.from("user-resources").list(`${userId}/${resourceId}`);
    if (fileList && fileList.length > 0) {
      const pathsToDelete = fileList.map((f) => `${userId}/${resourceId}/${f.name}`);
      await supabase.storage.from("user-resources").remove(pathsToDelete);
    }

    // 2. Delete database metadata record from resources table
    const { error } = await supabase.from("resources").delete().eq("id", resourceId).eq("user_id", userId);
    if (error) {
      console.error("Failed to delete resource from Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete resource from Supabase:", err);
    return false;
  }
}

export async function deleteLabFromCloud(userId: string, labId: string): Promise<boolean> {
  if (!canSync() || !userId) return false;
  const supabase = createClient();

  try {
    const { error } = await supabase.from("engineering_lab_edits").delete().eq("lab_id", labId).eq("user_id", userId);
    if (error) {
      console.error("Failed to delete engineering lab from Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete engineering lab from Supabase:", err);
    return false;
  }
}

export async function flushPendingDeletionsToCloud(userId: string) {
  if (!canSync() || !userId) return;
  const pending = getPendingDeletions();
  if (pending.length === 0) return;

  for (const item of pending) {
    if (item.entityType === "company") {
      const ok = await deleteCompanyFromCloud(userId, item.id);
      if (ok) removePendingDeletion("company", item.id);
    } else if (item.entityType === "question_set") {
      const ok = await deleteQuestionSetFromCloud(userId, item.id);
      if (ok) removePendingDeletion("question_set", item.id);
    } else if (item.entityType === "question") {
      const ok = await deleteInterviewQuestionFromCloud(userId, item.id);
      if (ok) removePendingDeletion("question", item.id);
    } else if (item.entityType === "topic") {
      const ok = await deleteInterviewTopicFromCloud(userId, item.id);
      if (ok) removePendingDeletion("topic", item.id);
    } else if (item.entityType === "resource") {
      const ok = await deleteResourceFromCloud(userId, item.id);
      if (ok) removePendingDeletion("resource", item.id);
    } else if (item.entityType === "lab") {
      const ok = await deleteLabFromCloud(userId, item.id);
      if (ok) removePendingDeletion("lab", item.id);
    }
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

    const pending = getPendingDeletions();
    const pendingLabIds = new Set(pending.filter((d) => d.entityType === "lab").map((d) => d.id));

    const result: Record<string, EngineeringLab> = {};
    rows.forEach((r) => {
      if (r.lab_data && typeof r.lab_data === "object" && !pendingLabIds.has(r.lab_id)) {
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
