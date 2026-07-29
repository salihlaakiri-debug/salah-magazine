-- =============================================
-- Account Features: reading history, lists, notifications upgrade
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Add from_user_id to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_from_user ON notifications(from_user_id);

-- 2. Add user_id to article_views for per-user reading history
ALTER TABLE article_views ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_article_views_user ON article_views(user_id);

-- 3. Reading lists table
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

-- 4. Notification preferences (per user)
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

-- 5. RPC to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid)
RETURNS int AS $$
  SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. RPC to get reading stats for a user
CREATE OR REPLACE FUNCTION get_user_reading_stats(p_user_id uuid)
RETURNS TABLE (
  total_articles_read bigint,
  total_reading_time_minutes bigint,
  total_sections_read jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT av.article_id),
    COALESCE(SUM(
      CASE
        WHEN a.read_time ~ '^\d+' THEN substring(a.read_time from '^\d+')::bigint
        ELSE 0
      END
    ), 0),
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('section', a2.section, 'count', count))
       FROM (
         SELECT a2.section, COUNT(*) as count
         FROM article_views av2
         JOIN articles a2 ON a2.id = av2.article_id
         WHERE av2.user_id = p_user_id
         GROUP BY a2.section
         ORDER BY count DESC
       ) a2),
      '[]'::jsonb
    )
  FROM article_views av
  JOIN articles a ON a.id = av.article_id
  WHERE av.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
