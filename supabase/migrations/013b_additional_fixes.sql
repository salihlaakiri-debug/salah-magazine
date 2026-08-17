-- ================================================================
-- Migration 013b: Additional security + notification preferences
-- Run AFTER 013_security_hardening.sql
-- ================================================================

-- 1. Articles: ensure users can only update/delete their OWN articles
DROP POLICY IF EXISTS "articles_update" ON public.articles;
CREATE POLICY "articles_update"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "articles_delete" ON public.articles;
CREATE POLICY "articles_delete"
  ON public.articles FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- 2. Ensure published articles are publicly readable
DROP POLICY IF EXISTS "articles_select_published" ON public.articles;
CREATE POLICY "articles_select_published"
  ON public.articles FOR SELECT
  USING (status = 'published' AND visibility = 'public');

-- 3. Ensure users can view their own articles regardless of status
DROP POLICY IF EXISTS "articles_select_own" ON public.articles;
CREATE POLICY "articles_select_own"
  ON public.articles FOR SELECT
  USING (auth.uid() = author_id);

-- 4. Ensure authenticated users can insert articles
DROP POLICY IF EXISTS "articles_insert" ON public.articles;
CREATE POLICY "articles_insert"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- 5. Notification preferences: add unique constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notification_preferences_user_id_key'
  ) THEN
    ALTER TABLE public.notification_preferences
      ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 6. Notification preferences: add RLS policies
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_prefs_select" ON public.notification_preferences;
CREATE POLICY "notif_prefs_select"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_prefs_insert" ON public.notification_preferences;
CREATE POLICY "notif_prefs_insert"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_prefs_update" ON public.notification_preferences;
CREATE POLICY "notif_prefs_update"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_prefs_delete" ON public.notification_preferences;
CREATE POLICY "notif_prefs_delete"
  ON public.notification_preferences FOR DELETE
  USING (auth.uid() = user_id);
