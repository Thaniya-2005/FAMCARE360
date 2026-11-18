-- ==============================================================================
-- FAMCARE360: Complete Notification System, RLS & Cross-Family Verification
-- Migration: 20261118000002_complete_notifications_and_security.sql
-- ==============================================================================

-- 1. Ensure type column check constraint supports all required category types
DO $$ BEGIN
  ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
  ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('info', 'sos', 'health_warning', 'health', 'medication', 'appointment', 'care', 'check_in', 'routine'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 2. Ensure RLS is active on public.notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Users can only select their own notifications
DROP POLICY IF EXISTS "Users view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Users can only update their own notifications (e.g. marking read)
DROP POLICY IF EXISTS "Users update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Tightened INSERT policy: Users can only notify themselves or verified family members
DROP POLICY IF EXISTS "System/Family can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Family members can insert notifications" ON public.notifications;
CREATE POLICY "Family members can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR public.is_family_member(user_id)
  );

-- 6. Realtime publication: ensure notifications is published
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 7. Secure database-side function for cross-user family notifications
CREATE OR REPLACE FUNCTION public.send_family_notification(
  p_recipient_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Strict security barrier: Sender must be recipient or verified family member
  IF auth.uid() IS NOT NULL AND auth.uid() != p_recipient_user_id AND NOT public.is_family_member(p_recipient_user_id) THEN
    RAISE EXCEPTION 'Access Denied: Recipient is not an authorized family member.';
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (p_recipient_user_id, p_title, p_message, p_type, p_link)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
