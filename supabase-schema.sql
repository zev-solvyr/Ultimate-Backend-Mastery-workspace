-- ============================================================================
-- BACKEND ENGINEERING WORKSPACE — SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INTERVIEW TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.interview_topics (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    "order" INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INTERVIEW QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    difficulty TEXT,
    company TEXT,
    reference_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESOURCE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.resource_categories (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    url TEXT,
    file_name TEXT,
    mime_type TEXT,
    file_size BIGINT,
    stored_file_id TEXT,
    storage_path TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROADMAP KNOWLEDGE BASE NOTES TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_base_notes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subtopic_id TEXT NOT NULL,
    notes TEXT DEFAULT '',
    code TEXT DEFAULT '',
    interview_questions JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, subtopic_id)
);

-- 6. PROJECT GUIDE EDITS TABLE
CREATE TABLE IF NOT EXISTS public.project_guide_edits (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL,
    guide_data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, project_id)
);

-- 7. ENGINEERING LAB EDITS TABLE
CREATE TABLE IF NOT EXISTS public.engineering_lab_edits (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lab_id TEXT NOT NULL,
    lab_data JSONB NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, lab_id)
);

-- 8. USER ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.user_activities (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    href TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_interview_topics_user ON public.interview_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_user ON public.interview_questions(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_resource_categories_user ON public.resource_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_user ON public.resources(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_kb_notes_user ON public.knowledge_base_notes(user_id, subtopic_id);
CREATE INDEX IF NOT EXISTS idx_project_guides_user ON public.project_guide_edits(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_engineering_labs_user ON public.engineering_lab_edits(user_id, lab_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON public.user_activities(user_id, timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — MANDATORY USER OWNERSHIP ENFORCEMENT
-- ============================================================================
ALTER TABLE public.interview_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_guide_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineering_lab_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first for safe re-execution idempotency
DROP POLICY IF EXISTS "Users can manage their own interview_topics" ON public.interview_topics;
CREATE POLICY "Users can manage their own interview_topics" ON public.interview_topics FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own interview_questions" ON public.interview_questions;
CREATE POLICY "Users can manage their own interview_questions" ON public.interview_questions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own resource_categories" ON public.resource_categories;
CREATE POLICY "Users can manage their own resource_categories" ON public.resource_categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own resources" ON public.resources;
CREATE POLICY "Users can manage their own resources" ON public.resources FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own knowledge_base_notes" ON public.knowledge_base_notes;
CREATE POLICY "Users can manage their own knowledge_base_notes" ON public.knowledge_base_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own project_guide_edits" ON public.project_guide_edits;
CREATE POLICY "Users can manage their own project_guide_edits" ON public.project_guide_edits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own engineering_lab_edits" ON public.engineering_lab_edits;
CREATE POLICY "Users can manage their own engineering_lab_edits" ON public.engineering_lab_edits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own user_activities" ON public.user_activities;
CREATE POLICY "Users can manage their own user_activities" ON public.user_activities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SUPABASE STORAGE BUCKET FOR USER RESOURCE UPLOADS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-resources', 'user-resources', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload resource files" ON storage.objects;
CREATE POLICY "Authenticated users can upload resource files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-resources' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Authenticated users can view own resource files" ON storage.objects;
CREATE POLICY "Authenticated users can view own resource files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-resources' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Authenticated users can delete own resource files" ON storage.objects;
CREATE POLICY "Authenticated users can delete own resource files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-resources' AND (storage.foldername(name))[1] = auth.uid()::text);
