-- DanClaw - InsForge PostgreSQL Schema
-- Aligned with @danclaw/shared types and docs/API.md

-- ─────────────────────────────────────────────
-- 1. Tables
-- ─────────────────────────────────────────────

-- Users Table (Synced with InsForge Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
  openrouter_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deployments Table
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_name TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'provisioning',
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'elite')),
  region TEXT NOT NULL,
  model TEXT NOT NULL,
  channel TEXT NOT NULL,
  uptime INTEGER DEFAULT 0,
  memory_usage NUMERIC(4,2) DEFAULT 0,
  requests_today INTEGER DEFAULT 0,
  cost_this_month NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table (Chat History)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID REFERENCES public.deployments(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
  type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'response', 'status', 'error')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage/Activity Table (Optional but good for analytics)
CREATE TABLE IF NOT EXISTS public.activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  icon TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. Row Level Security (RLS)
-- ─────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

-- users: Users can only see/update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- deployments: Users can only see/manage their own deployments
CREATE POLICY "Users can view own deployments" ON public.deployments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own deployments" ON public.deployments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own deployments" ON public.deployments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own deployments" ON public.deployments
  FOR DELETE USING (user_id = auth.uid());

-- messages: Users can only see messages for their own deployments
CREATE POLICY "Users can view messages of own deployments" ON public.messages
  FOR SELECT USING (
    deployment_id IN (SELECT id FROM public.deployments WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages to own deployments" ON public.messages
  FOR INSERT WITH CHECK (
    deployment_id IN (SELECT id FROM public.deployments WHERE user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- 3. Triggers for updated_at
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON public.deployments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
