-- QuikQuillAI Database Schema Migration
-- This script creates all tables, relationships, indexes, and security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Stores user profile data (linked to Firebase Auth UID)
CREATE TABLE public.users (
  id TEXT PRIMARY KEY, -- Firebase Auth UID
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  photo_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. AGENTS TABLE
-- =====================================================
-- Stores AI writing agents with their configurations
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  writing_style TEXT NOT NULL,
  tone TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  expertise TEXT,
  target_audience TEXT,
  content_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. SCRIPTS TABLE
-- =====================================================
-- Stores uploaded reference scripts for agent training
CREATE TABLE public.scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size INTEGER NOT NULL, -- Size in bytes
  file_type TEXT NOT NULL, -- MIME type
  content TEXT, -- Extracted text content for AI context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TASKS TABLE
-- =====================================================
-- Stores user tasks/content generation requests
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  word_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. USAGE TRACKING TABLE
-- =====================================================
-- Tracks token usage for subscription limits
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('generate', 'rephrase', 'continue', 'edit')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================
-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);

-- Agents indexes
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_created_at ON public.agents(created_at DESC);

-- Scripts indexes
CREATE INDEX idx_scripts_agent_id ON public.scripts(agent_id);
CREATE INDEX idx_scripts_user_id ON public.scripts(user_id);
CREATE INDEX idx_scripts_created_at ON public.scripts(created_at DESC);

-- Tasks indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_agent_id ON public.tasks(agent_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- Usage tracking indexes
CREATE INDEX idx_usage_user_id ON public.usage_tracking(user_id);
CREATE INDEX idx_usage_created_at ON public.usage_tracking(created_at DESC);

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (true); -- Allow reading own user data via service role

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Agents policies
CREATE POLICY "Users can view own agents"
  ON public.agents FOR SELECT
  USING (true);

CREATE POLICY "Users can create own agents"
  ON public.agents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own agents"
  ON public.agents FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own agents"
  ON public.agents FOR DELETE
  USING (true);

-- Scripts policies
CREATE POLICY "Users can view own scripts"
  ON public.scripts FOR SELECT
  USING (true);

CREATE POLICY "Users can upload own scripts"
  ON public.scripts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own scripts"
  ON public.scripts FOR DELETE
  USING (true);

-- Tasks policies
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (true);

CREATE POLICY "Users can create own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (true);

-- Usage tracking policies
CREATE POLICY "Users can view own usage"
  ON public.usage_tracking FOR SELECT
  USING (true);

CREATE POLICY "Service can insert usage"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 8. FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- =====================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Function to get user's total token usage for current month
CREATE OR REPLACE FUNCTION public.get_user_monthly_token_usage(p_user_id TEXT)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(tokens_used), 0)::INTEGER
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE);
$$ LANGUAGE sql STABLE;

-- Function to get agent with script count
CREATE OR REPLACE FUNCTION public.get_agent_with_script_count(p_agent_id UUID)
RETURNS TABLE (
  agent_json JSON,
  script_count BIGINT
) AS $$
  SELECT
    row_to_json(a.*) as agent_json,
    COUNT(s.id) as script_count
  FROM public.agents a
  LEFT JOIN public.scripts s ON s.agent_id = a.id
  WHERE a.id = p_agent_id
  GROUP BY a.id;
$$ LANGUAGE sql STABLE;

-- =====================================================
-- 10. STORAGE BUCKET SETUP (Run this separately in Supabase Dashboard)
-- =====================================================
-- Create storage bucket for script uploads
-- This needs to be run via Supabase Dashboard or via supabase-js
--
-- Bucket name: agent-scripts
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: text/plain, text/x-python, application/javascript, etc.

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Create storage bucket "agent-scripts" in Storage section
-- 3. Set up storage policies for the bucket
-- 4. Update your .env.local with Supabase credentials
