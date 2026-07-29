-- =============================================
-- All Pending Migrations (009 + 010 + 011)
-- Run ONCE in Supabase SQL Editor
-- =============================================

-- =============================================
-- 009: Account Features
-- =============================================

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_from_user ON notifications(from_user_id);

-- article_views table may not exist, skip column add

-- Reading lists table
CREATE TABLE IF NOT EXISTS reading_lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  list_type text NOT NULL CHECK (list_type IN ('want_to_read', 'reading', 'finished')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id, list_type)
);

ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reading_lists_select" ON reading_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reading_lists_insert" ON reading_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reading_lists_update" ON reading_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reading_lists_delete" ON reading_lists FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user ON reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_type ON reading_lists(user_id, list_type);

-- Notification preferences (per user)
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
CREATE POLICY "notif_prefs_select" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_prefs_insert" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_prefs_update" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid)
RETURNS int AS $$
  SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND read = false;
$$ LANGUAGE sql SECURITY DEFINER;

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
