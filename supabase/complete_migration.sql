-- =============================================
-- Complete Migration: 006 → 011
-- Run ONCE in Supabase SQL Editor
-- =============================================

-- =============================================
-- 006: Contact Messages
-- =============================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin via profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view contact messages" ON contact_messages;
CREATE POLICY "Only admins can view contact messages"
  ON contact_messages FOR SELECT
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- =============================================
-- 007: Nested Comments
-- =============================================

ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- =============================================
-- 008: Images Bucket
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 'images', true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner);

-- =============================================
-- 009: Account Features
-- =============================================

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_from_user ON notifications(from_user_id);

-- article_views table may not exist — skip if missing
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'article_views') THEN
    ALTER TABLE article_views ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_article_views_user ON article_views(user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS reading_lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  list_type text NOT NULL CHECK (list_type IN ('want_to_read', 'reading', 'finished')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id, list_type)
);

ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reading_lists_select" ON reading_lists;
DROP POLICY IF EXISTS "reading_lists_insert" ON reading_lists;
DROP POLICY IF EXISTS "reading_lists_update" ON reading_lists;
DROP POLICY IF EXISTS "reading_lists_delete" ON reading_lists;
CREATE POLICY "reading_lists_select" ON reading_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reading_lists_insert" ON reading_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reading_lists_update" ON reading_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reading_lists_delete" ON reading_lists FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user ON reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_type ON reading_lists(user_id, list_type);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  like_notifications boolean DEFAULT true,
  comment_notifications boolean DEFAULT true,
  follow_notifications boolean DEFAULT true,
  publish_notifications boolean DEFAULT true,
  bookmark_notifications boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_prefs_select" ON notification_preferences;
DROP POLICY IF EXISTS "notif_prefs_insert" ON notification_preferences;
DROP POLICY IF EXISTS "notif_prefs_update" ON notification_preferences;
CREATE POLICY "notif_prefs_select" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_prefs_insert" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_prefs_update" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid)
RETURNS int AS $$
  SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- Also fix RLS on subscribers table for admin access
DROP POLICY IF EXISTS "Admins can view all subscribers" ON subscribers;
CREATE POLICY "Admins can view all subscribers"
  ON subscribers FOR SELECT
  USING (public.is_admin());

-- Allow admin to update/delete subscribers
DROP POLICY IF EXISTS "Admins can manage subscribers" ON subscribers;
CREATE POLICY "Admins can manage subscribers"
  ON subscribers FOR ALL
  USING (public.is_admin());

-- =============================================
-- 010: Article Visibility
-- =============================================

ALTER TABLE articles ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'followers', 'private'));

CREATE INDEX IF NOT EXISTS idx_articles_visibility ON articles(visibility);

-- =============================================
-- 011: Set Admin
-- =============================================

UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'salihlaakiri@gmail.com');
