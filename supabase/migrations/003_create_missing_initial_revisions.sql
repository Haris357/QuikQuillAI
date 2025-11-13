-- Create initial revisions for existing tasks that don't have any revisions
-- This is a one-time migration to backfill revision history for existing tasks

-- Insert initial revisions for tasks with content but no revisions
INSERT INTO public.task_revisions (task_id, user_id, content, revision_type, revision_name)
SELECT
  t.id as task_id,
  t.user_id,
  t.content,
  'ai-generated' as revision_type,
  'Initial Version' as revision_name
FROM public.tasks t
LEFT JOIN public.task_revisions tr ON t.id = tr.task_id
WHERE
  t.content IS NOT NULL
  AND t.content != ''
  AND tr.id IS NULL  -- No existing revisions
GROUP BY t.id, t.user_id, t.content;

-- Log the results
DO $$
DECLARE
  revision_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO revision_count FROM public.task_revisions;
  RAISE NOTICE 'Total revisions in database: %', revision_count;
END $$;
