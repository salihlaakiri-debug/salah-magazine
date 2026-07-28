-- =============================================
-- Notifications, Follows, Likes, Bookmarks
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Follows table
CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);

-- 2. Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_likes_article ON likes(article_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);

-- 3. Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_select" ON bookmarks FOR SELECT USING (true);
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article ON bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

-- 4. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  article_id uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_service" ON notifications FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 5. Mark all notifications read RPC
CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id uuid)
RETURNS void AS $$
  UPDATE notifications SET read = true WHERE user_id = p_user_id AND read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. Trigger: notify article author when a new comment is posted
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  article_author uuid;
  commenter_name text;
BEGIN
  SELECT author_id INTO article_author FROM articles WHERE id = NEW.article_id;
  IF article_author IS NULL OR article_author = NEW.user_id THEN
    RETURN NEW;
  END IF;
  commenter_name := COALESCE(NEW.author_name, 'مجهول');
  INSERT INTO notifications (user_id, type, message, article_id)
  VALUES (
    article_author,
    'comment',
    commenter_name || ' علّق على عملك: "' || LEFT(NEW.content, 80) || '"',
    NEW.article_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_comment ON comments;
CREATE TRIGGER trg_notify_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

-- 7. Trigger: notify on bookmark
CREATE OR REPLACE FUNCTION notify_on_bookmark()
RETURNS TRIGGER AS $$
DECLARE
  article_author uuid;
  article_title text;
BEGIN
  SELECT author_id, title INTO article_author, article_title FROM articles WHERE id = NEW.article_id;
  IF article_author IS NULL OR article_author = NEW.user_id THEN
    RETURN NEW;
  END IF;
  INSERT INTO notifications (user_id, type, message, article_id)
  VALUES (
    article_author,
    'bookmark',
    'أحدهم أضاف عملك "' || LEFT(COALESCE(article_title, ''), 60) || '" إلى محفوظاته',
    NEW.article_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_bookmark ON bookmarks;
CREATE TRIGGER trg_notify_bookmark
  AFTER INSERT ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_bookmark();

-- 8. Trigger: notify on like
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  article_author uuid;
  article_title text;
BEGIN
  SELECT author_id, title INTO article_author, article_title FROM articles WHERE id = NEW.article_id;
  IF article_author IS NULL OR article_author = NEW.user_id THEN
    RETURN NEW;
  END IF;
  INSERT INTO notifications (user_id, type, message, article_id)
  VALUES (
    article_author,
    'like',
    'أعجب أحدهم بعملك "' || LEFT(COALESCE(article_title, ''), 60) || '"',
    NEW.article_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_like ON likes;
CREATE TRIGGER trg_notify_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

-- 9. Trigger: notify followers on new published article
CREATE OR REPLACE FUNCTION notify_on_new_article()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO notifications (user_id, type, message, article_id)
    SELECT
      f.follower_id,
      'publish',
      'عمل جديد "' || LEFT(NEW.title, 60) || '" في قسم ' || COALESCE(NEW.section, ''),
      NEW.id
    FROM follows f
    WHERE f.following_id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_article ON articles;
CREATE TRIGGER trg_notify_new_article
  AFTER INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_article();
