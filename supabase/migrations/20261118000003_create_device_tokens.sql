-- ==============================================================================
-- FAMCARE360: Device Tokens for Firebase Cloud Messaging (FCM)
-- Migration: 20261118000003_create_device_tokens.sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  device_info TEXT DEFAULT 'Browser Web',
  platform TEXT NOT NULL DEFAULT 'web' CHECK (platform IN ('web', 'ios', 'android')),
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 1. Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON public.device_tokens(user_id);

-- 2. Index for token deduplication and registration
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON public.device_tokens(token);

-- 3. Composite index for active device routing
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_active ON public.device_tokens(user_id, is_active);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies: Users can only manage their own device tokens
DROP POLICY IF EXISTS "Users view own device tokens" ON public.device_tokens;
CREATE POLICY "Users view own device tokens" ON public.device_tokens
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own device tokens" ON public.device_tokens;
CREATE POLICY "Users insert own device tokens" ON public.device_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own device tokens" ON public.device_tokens;
CREATE POLICY "Users update own device tokens" ON public.device_tokens
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own device tokens" ON public.device_tokens;
CREATE POLICY "Users delete own device tokens" ON public.device_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Attach updated_at automatic trigger
DROP TRIGGER IF EXISTS set_device_tokens_updated_at ON public.device_tokens;
CREATE TRIGGER set_device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
