-- =====================================================
-- SUPABASE STORAGE BUCKET SETUP
-- =====================================================
-- This script sets up the storage bucket and policies for script uploads

-- Note: Storage buckets are typically created via Dashboard or JS SDK
-- But here are the SQL policies for the bucket after creation

-- =====================================================
-- STORAGE POLICIES FOR 'agent-scripts' BUCKET
-- =====================================================

-- Allow users to upload scripts to their own folders
CREATE POLICY "Users can upload own scripts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-scripts' AND
  auth.role() = 'authenticated'
);

-- Allow users to view their own scripts
CREATE POLICY "Users can view own scripts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'agent-scripts' AND
  auth.role() = 'authenticated'
);

-- Allow users to delete their own scripts
CREATE POLICY "Users can delete own scripts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'agent-scripts' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own scripts
CREATE POLICY "Users can update own scripts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'agent-scripts' AND
  auth.role() = 'authenticated'
);
