-- Task Revisions Migration
-- Creates table and policies for storing task revision history

-- =====================================================
-- 1. TASK REVISIONS TABLE
-- =====================================================
-- Stores revision history for each task
CREATE TABLE public.task_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  revision_type TEXT NOT NULL CHECK (revision_type IN ('ai-generated', 'user-edit', 'rephrased')),
  revision_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_task_revisions_task_id ON public.task_revisions(task_id);
CREATE INDEX idx_task_revisions_user_id ON public.task_revisions(user_id);
CREATE INDEX idx_task_revisions_created_at ON public.task_revisions(task_id, created_at DESC);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on task_revisions table
ALTER TABLE public.task_revisions ENABLE ROW LEVEL SECURITY;

-- Task revisions policies
CREATE POLICY "Users can view own task revisions"
  ON public.task_revisions FOR SELECT
  USING (true);

CREATE POLICY "Users can create own task revisions"
  ON public.task_revisions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own task revisions"
  ON public.task_revisions FOR DELETE
  USING (true);

-- =====================================================
-- 4. HELPER FUNCTION
-- =====================================================
-- Function to create initial revision when task is created
CREATE OR REPLACE FUNCTION public.create_initial_task_revision()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create initial revision if task has content
  IF NEW.content IS NOT NULL AND NEW.content != '' THEN
    INSERT INTO public.task_revisions (
      task_id,
      user_id,
      content,
      revision_type,
      revision_name
    ) VALUES (
      NEW.id,
      NEW.user_id,
      NEW.content,
      'ai-generated',
      'Initial Version'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create initial revision on task insert
CREATE TRIGGER create_task_initial_revision
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_initial_task_revision();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
