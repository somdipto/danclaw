-- ============================================================
-- DanClaw - InsForge PostgreSQL Schema (Phase 1 MVP)
-- Aligned with @danclaw/shared types and docs/API.md
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Users Table (Synced with InsForge Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
  openrouter_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for users (was missing - only deployments had RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

COMMENT ON TABLE public.users IS 'User profiles synced with InsForge Auth. Contains subscription tier and OpenRouter token storage.';
COMMENT ON COLUMN public.users.id IS 'UUID primary key';
COMMENT ON COLUMN public.users.email IS 'Unique email address from OAuth provider';
COMMENT ON COLUMN public.users.name IS 'Display name from OAuth provider';
COMMENT ON COLUMN public.users.avatar IS 'Avatar URL from OAuth provider';
COMMENT ON COLUMN public.users.tier IS 'Subscription tier: free, pro, or elite';
COMMENT ON COLUMN public.users.openrouter_token IS 'User''s personal OpenRouter API token (encrypted at rest)';
COMMENT ON COLUMN public.users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN public.users.updated_at IS 'Last profile update timestamp';

-- Deployments Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_name TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'provisioning' CHECK (status IN ('provisioning', 'starting', 'running', 'stopping', 'stopped', 'restarting', 'destroying', 'error')),
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'elite')),
  region TEXT NOT NULL DEFAULT 'us-central1',
  model TEXT NOT NULL,
  channel TEXT NOT NULL,
  uptime INTEGER DEFAULT 0,
  memory_usage NUMERIC(4,2) DEFAULT 0,
  memory_limit NUMERIC(4,2),
  requests_today INTEGER DEFAULT 0,
  cost_this_month NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.deployments IS 'AI agent deployment instances. Each user can have multiple deployments across different channels.';
COMMENT ON COLUMN public.deployments.id IS 'UUID primary key';
COMMENT ON COLUMN public.deployments.user_id IS 'Owner user UUID';
COMMENT ON COLUMN public.deployments.service_name IS 'Unique service identifier (slug)';
COMMENT ON COLUMN public.deployments.status IS 'Lifecycle state: provisioning, starting, running, stopping, stopped, restarting, destroying, error';
COMMENT ON COLUMN public.deployments.tier IS 'Subscription tier for this deployment';
COMMENT ON COLUMN public.deployments.region IS 'Deployment region';
COMMENT ON COLUMN public.deployments.model IS 'OpenRouter model ID';
COMMENT ON COLUMN public.deployments.channel IS 'Channel: telegram, discord, whatsapp, etc.';
COMMENT ON COLUMN public.deployments.uptime IS 'Uptime in seconds since last start';
COMMENT ON COLUMN public.deployments.memory_usage IS 'Current memory usage in GB';
COMMENT ON COLUMN public.deployments.memory_limit IS 'Memory limit in GB for this tier';
COMMENT ON COLUMN public.deployments.requests_today IS 'Number of API requests processed today';
COMMENT ON COLUMN public.deployments.cost_this_month IS 'Accumulated cost this billing cycle in USD';
COMMENT ON COLUMN public.deployments.created_at IS 'Deployment creation timestamp';
COMMENT ON COLUMN public.deployments.updated_at IS 'Last status update timestamp';

-- Messages Table (Chat History)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'response', 'status', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for messages (access via deployment ownership)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (
    deployment_id IN (SELECT id FROM public.deployments WHERE user_id = auth.uid())
  );
CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (
    deployment_id IN (SELECT id FROM public.deployments WHERE user_id = auth.uid())
  );

COMMENT ON TABLE public.messages IS 'Chat message history for each deployment. Stores both user and agent messages.';
COMMENT ON COLUMN public.messages.id IS 'UUID primary key';
COMMENT ON COLUMN public.messages.deployment_id IS 'Parent deployment UUID';
COMMENT ON COLUMN public.messages.role IS 'Message author: user or agent';
COMMENT ON COLUMN public.messages.content IS 'Message text content';
COMMENT ON COLUMN public.messages.type IS 'Message type: message, response, status, error';
COMMENT ON COLUMN public.messages.created_at IS 'Message creation timestamp';

-- Activity Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  icon TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for activity
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_select_own" ON public.activity
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "activity_insert_own" ON public.activity
  FOR INSERT WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE public.activity IS 'User activity feed for analytics and notifications.';
COMMENT ON COLUMN public.activity.id IS 'UUID primary key';
COMMENT ON COLUMN public.activity.user_id IS 'User who performed the action';
COMMENT ON COLUMN public.activity.action IS 'Human-readable action description';
COMMENT ON COLUMN public.activity.icon IS 'Icon identifier for the action';
COMMENT ON COLUMN public.activity.timestamp IS 'When the action occurred';

-- ============================================================
-- 2. INDEXES
-- ============================================================

-- Foreign key indexes for performance
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON public.deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_deployment_id ON public.messages(deployment_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.activity(user_id);

-- Frequently queried columns
CREATE INDEX IF NOT EXISTS idx_deployments_status ON public.deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_service_name ON public.deployments(service_name);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON public.activity(timestamp DESC);

-- Composite index for user's deployments with status filter
CREATE INDEX IF NOT EXISTS idx_deployments_user_id_status ON public.deployments(user_id, status);

-- Missing indexes for WHERE clause optimization
CREATE INDEX IF NOT EXISTS idx_messages_role ON public.messages(role);
CREATE INDEX IF NOT EXISTS idx_activity_action ON public.activity(action);

-- ============================================================
-- 2b. MISSING TABLES (Phase 2 - Billing & Agents)
-- ============================================================

-- Subscriptions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('revenuecat', 'stripe', 'internal')),
  external_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'elite')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'User subscription records from RevenueCat/Stripe';
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_external_id ON public.subscriptions(external_id);

-- Payments Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'refunded', 'pending')),
  payment_method TEXT,
  external_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.payments IS 'Payment transaction history';
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);

-- Usage Records Table (Daily granular usage)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  deployment_id UUID REFERENCES public.deployments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  model TEXT,
  request_count INTEGER NOT NULL DEFAULT 0,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, deployment_id, date, model)
);

COMMENT ON TABLE public.usage_records IS 'Daily granular usage tracking per user/deployment/model';
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_date ON public.usage_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_records_deployment_id ON public.usage_records(deployment_id);

-- Agents Table (OpenClaw/Hermes/SwarmClaw configurations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  model TEXT NOT NULL DEFAULT 'anthropic/claude-3.5-sonnet',
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  tools JSONB DEFAULT '[]',
  memory_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.agents IS 'AI agent configurations for OpenClaw/Hermes/SwarmClaw';
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);

-- Agent Deployments (linking agents to deployments with config)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deployment_id, agent_id)
);

COMMENT ON TABLE public.agent_deployments IS 'Links deployments to agent configurations';
CREATE INDEX IF NOT EXISTS idx_agent_deployments_deployment_id ON public.agent_deployments(deployment_id);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_agent_id ON public.agent_deployments(agent_id);

-- Agent Memory Table (persistent context per agent)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('short_term', 'long_term', 'episodic', 'semantic')),
  content JSONB NOT NULL,
  importance_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

COMMENT ON TABLE public.agent_memory IS 'Persistent memory for agents';
CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_id ON public.agent_memory(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON public.agent_memory(memory_type);

-- Provisioning Logs Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.provisioning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  step TEXT NOT NULL CHECK (step IN ('auth', 'container', 'swarmclaw', 'models', 'healthcheck')),
  level TEXT NOT NULL CHECK (level IN ('info', 'success', 'warning', 'error')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.provisioning_logs IS 'Deployment provisioning step logs';
CREATE INDEX IF NOT EXISTS idx_provisioning_logs_deployment_id ON public.provisioning_logs(deployment_id);

-- Webhook Events Table (idempotency)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('revenuecat', 'stripe', 'insforge')),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.webhook_events IS 'Idempotent webhook event processing';
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_event_id ON public.webhook_events(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed) WHERE processed = FALSE;

-- Add RLS for new tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provisioning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for payments
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for usage_records
CREATE POLICY "usage_records_select_own" ON public.usage_records
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "usage_records_insert_own" ON public.usage_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for agents
CREATE POLICY "agents_select_own" ON public.agents
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "agents_insert_own" ON public.agents
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "agents_update_own" ON public.agents
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "agents_delete_own" ON public.agents
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for agent_deployments (access via deployment ownership)
CREATE POLICY "agent_deployments_select_own" ON public.agent_deployments
  FOR SELECT USING (
    deployment_id IN (SELECT id FROM public.deployments WHERE user_id = auth.uid())
  );
CREATE POLICY "agent_deployments_insert_own" ON public.agent_deployments
  FOR INSERT WITH CHECK (
    deployment_id IN (SELECT id FROM public.deployments WHERE user_id = auth.uid())
  );

-- RLS Policies for agent_memory (access via agent ownership)
CREATE POLICY "agent_memory_select_own" ON public.agent_memory
  FOR SELECT USING (
    agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid())
  );
CREATE POLICY "agent_memory_insert_own" ON public.agent_memory
  FOR INSERT WITH CHECK (
    agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid())
  );

-- RLS Policies for provisioning_logs (access via deployment ownership)
CREATE POLICY "provisioning_logs_select_own" ON public.provisioning_logs
  FOR SELECT USING (
    deployment_id IN (SELECT id FROM public.deployments WHERE user_id = auth.uid())
  );
CREATE POLICY "provisioning_logs_insert_own" ON public.provisioning_logs
  FOR INSERT WITH CHECK (
    deployment_id IN (SELECT id FROM public.deployments WHERE user_id = auth.uid())
  );

-- RLS Policies for webhook_events (system table - insert only for webhooks)
CREATE POLICY "webhook_events_insert_system" ON public.webhook_events
  FOR INSERT WITH CHECK (provider IN ('revenuecat', 'stripe', 'insforge'));

-- Trigger function for automatic updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for new tables updated_at
CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_agent_deployments_updated_at
  BEFORE UPDATE ON public.agent_deployments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for users (was missing)
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for deployments (was missing)
CREATE TRIGGER trigger_update_deployments_updated_at
  BEFORE UPDATE ON public.deployments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-log deployment activity (eliminates N+1 in app code)
CREATE OR REPLACE FUNCTION public.log_deployment_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity (user_id, action, icon, timestamp)
    VALUES (
      NEW.user_id,
      'Deployed "' || NEW.service_name || '" agent',
      'rocket',
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_deployment_activity
  AFTER INSERT ON public.deployments
  FOR EACH ROW EXECUTE FUNCTION public.log_deployment_activity();

-- ============================================================
-- 3. ADDITIONAL INDEXES (Phase 2 tables)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_agents_memory_enabled ON public.agents(memory_enabled);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provisioning_logs_created_at ON public.provisioning_logs(created_at DESC);

-- Partial index for TTL cleanup
CREATE INDEX IF NOT EXISTS idx_agent_memory_expires_at ON public.agent_memory(expires_at) WHERE expires_at IS NOT NULL;

-- Partial index for error log queries
CREATE INDEX IF NOT EXISTS idx_provisioning_logs_level ON public.provisioning_logs(level) WHERE level = 'error';

-- Partial index for subscription status filtering
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Partial indexes for channel/model filtering
CREATE INDEX IF NOT EXISTS idx_deployments_channel ON public.deployments(channel);
CREATE INDEX IF NOT EXISTS idx_deployments_model ON public.deployments(model);

-- 5. SEED DATA (Development Only)
-- ============================================================

-- Clear existing seed data
DELETE FROM public.messages WHERE deployment_id IN (SELECT id FROM public.deployments WHERE service_name LIKE 'dev-%');
DELETE FROM public.deployments WHERE service_name LIKE 'dev-%';
DELETE FROM public.activity WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE 'dev-%@danclaw.dev');
DELETE FROM public.users WHERE email LIKE 'dev-%@danclaw.dev';

-- Seed Users
-- ============================================================
INSERT INTO public.users (id, email, name, avatar, tier, openrouter_token, created_at, updated_at) VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'dev-alice@danclaw.dev',
    'Alice Dev',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    'pro',
    'sk-or-v1-dev-alice-1234567890abcdef',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'dev-bob@danclaw.dev',
    'Bob Dev',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    'elite',
    'sk-or-v1-dev-bob-abcdef1234567890',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '2 hours'
  );

-- Seed Deployments
-- ============================================================
INSERT INTO public.deployments (id, user_id, service_name, status, tier, region, model, channel, uptime, memory_usage, memory_limit, requests_today, cost_this_month, created_at, updated_at) VALUES
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'dev-alice-telegram',
    'running',
    'pro',
    'us-central1',
    'anthropic/claude-3.5-sonnet',
    'telegram',
    86400,
    1.5,
    4.0,
    127,
    12.50,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'dev-alice-discord',
    'stopped',
    'pro',
    'eu-west1',
    'openai/gpt-4o',
    'discord',
    0,
    0,
    4.0,
    0,
    0,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '6 hours'
  ),
  (
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'dev-bob-whatsapp',
    'running',
    'elite',
    'asia-east1',
    'anthropic/claude-3.5-sonnet',
    'whatsapp',
    172800,
    3.2,
    16.0,
    542,
    89.25,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '30 minutes'
  );

-- Seed Messages
-- ============================================================
INSERT INTO public.messages (deployment_id, role, content, type, created_at) VALUES
  -- Alice's Telegram deployment messages
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'user',
    'Hello, can you help me deploy an AI agent?',
    'message',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'agent',
    'Hi Alice! I can help you deploy an AI agent. What channel would you like to use?',
    'response',
    NOW() - INTERVAL '2 hours' + INTERVAL '1 second'
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'user',
    'Telegram please',
    'message',
    NOW() - INTERVAL '1 hour 55 minutes'
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'agent',
    'Great! Your Telegram agent is ready. You can start chatting now.',
    'response',
    NOW() - INTERVAL '1 hour 54 minutes'
  ),
  -- Bob's WhatsApp deployment messages
  (
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    'user',
    'What models are available?',
    'message',
    NOW() - INTERVAL '1 day'
  ),
  (
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    'agent',
    'I have access to 500+ models via OpenRouter including Claude 3.5 Sonnet, GPT-4o, Gemini Pro, and many more!',
    'response',
    NOW() - INTERVAL '1 day' + INTERVAL '2 seconds'
  );

-- Seed Activity
-- ============================================================
INSERT INTO public.activity (user_id, action, icon, timestamp) VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Deployed "dev-alice-telegram" agent',
    'rocket',
    NOW() - INTERVAL '7 days'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Deployed "dev-alice-discord" agent',
    'rocket',
    NOW() - INTERVAL '3 days'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Upgraded to Pro plan',
    'star',
    NOW() - INTERVAL '20 days'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Deployed "dev-bob-whatsapp" agent',
    'rocket',
    NOW() - INTERVAL '14 days'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Upgraded to Elite plan',
    'crown',
    NOW() - INTERVAL '15 days'
  );
