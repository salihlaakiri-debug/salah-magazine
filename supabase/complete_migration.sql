-- =============================================
-- Complete Migration: 002 → 011 (safe version)
-- Run ONCE in Supabase SQL Editor
-- =============================================

-- =============================================
-- 002: Tags, Subscribers & Views
-- =============================================

CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  confirmed BOOLEAN DEFAULT false,
  confirm_token TEXT,
  unsubscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_tag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET article_count = article_count + 1 WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET article_count = article_count - 1 WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tag_count ON article_tags;
CREATE TRIGGER trg_tag_count
  AFTER INSERT OR DELETE ON article_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_count();

CREATE OR REPLACE FUNCTION confirm_subscriber(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE subscribers SET confirmed = true, confirm_token = NULL
  WHERE confirm_token = token AND confirmed = false;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_views(p_article_id UUID, p_ip TEXT, p_ua TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO article_views (article_id, viewer_ip, user_agent)
  VALUES (p_article_id, p_ip, p_ua);
  SELECT COUNT(*) INTO v_count FROM article_views WHERE article_id = p_article_id;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirmed ON subscribers(confirmed);
CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_created ON article_views(created_at DESC);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tags_select" ON tags; CREATE POLICY "tags_select" ON tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "tags_insert" ON tags; CREATE POLICY "tags_insert" ON tags FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "tags_update" ON tags; CREATE POLICY "tags_update" ON tags FOR UPDATE USING (true);
DROP POLICY IF EXISTS "tags_delete" ON tags; CREATE POLICY "tags_delete" ON tags FOR DELETE USING (true);

DROP POLICY IF EXISTS "article_tags_select" ON article_tags; CREATE POLICY "article_tags_select" ON article_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "article_tags_insert" ON article_tags; CREATE POLICY "article_tags_insert" ON article_tags FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "article_tags_delete" ON article_tags; CREATE POLICY "article_tags_delete" ON article_tags FOR DELETE USING (true);

DROP POLICY IF EXISTS "subscribers_insert" ON subscribers; CREATE POLICY "subscribers_insert" ON subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "subscribers_select" ON subscribers; CREATE POLICY "subscribers_select" ON subscribers FOR SELECT USING (true);

DROP POLICY IF EXISTS "article_views_insert" ON article_views; CREATE POLICY "article_views_insert" ON article_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "article_views_select" ON article_views; CREATE POLICY "article_views_select" ON article_views FOR SELECT USING (true);

-- =============================================
-- Follows table (already exists from 002_follows_notifications)
-- Ensure 'author_id' is renamed to 'following_id' for consistency
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'follows') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'follows' AND column_name = 'author_id') THEN
      ALTER TABLE follows RENAME COLUMN author_id TO following_id;
    END IF;
  END IF;
END $$;

-- Ensure column exists
ALTER TABLE follows ADD COLUMN IF NOT EXISTS following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "follows_select" ON follows; CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "follows_insert" ON follows; CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
DROP POLICY IF EXISTS "follows_delete" ON follows; CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);

-- =============================================
-- Likes table
-- =============================================

CREATE TABLE IF NOT EXISTS likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "likes_select" ON likes; CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "likes_insert" ON likes; CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "likes_delete" ON likes; CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_likes_article ON likes(article_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);

-- =============================================
-- Bookmarks table
-- =============================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bookmarks_select" ON bookmarks; CREATE POLICY "bookmarks_select" ON bookmarks FOR SELECT USING (true);
DROP POLICY IF EXISTS "bookmarks_insert" ON bookmarks; CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "bookmarks_delete" ON bookmarks; CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article ON bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

-- =============================================
-- Notifications table
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  article_id uuid,
  from_user_id uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Drop check constraint if exists (from old migration)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications; CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifications_update_own" ON notifications; CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications; CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifications_insert_service" ON notifications; CREATE POLICY "notifications_insert_service" ON notifications FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id uuid)
RETURNS void AS $$
  UPDATE notifications SET read = true WHERE user_id = p_user_id AND read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- Notification Triggers
-- =============================================

CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  article_author uuid;
  commenter_name text;
BEGIN
  SELECT author_id INTO article_author FROM articles WHERE id = NEW.article_id;
  IF article_author IS NULL OR article_author = NEW.user_id THEN RETURN NEW; END IF;
  commenter_name := COALESCE(NEW.author_name, 'مجهول');
  INSERT INTO notifications (user_id, type, message, article_id)
  VALUES (article_author, 'comment', commenter_name || ' علّق على عملك: "' || LEFT(NEW.content, 80) || '"', NEW.article_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_comment ON comments;
CREATE TRIGGER trg_notify_comment AFTER INSERT ON comments FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

CREATE OR REPLACE FUNCTION notify_on_bookmark()
RETURNS TRIGGER AS $$
DECLARE
  article_author uuid;
  article_title text;
BEGIN
  SELECT author_id, title INTO article_author, article_title FROM articles WHERE id = NEW.article_id;
  IF article_author IS NULL OR article_author = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO notifications (user_id, type, message, article_id)
  VALUES (article_author, 'bookmark', 'أحدهم أضاف عملك "' || LEFT(COALESCE(article_title, ''), 60) || '" إلى محفوظاته', NEW.article_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_bookmark ON bookmarks;
CREATE TRIGGER trg_notify_bookmark AFTER INSERT ON bookmarks FOR EACH ROW EXECUTE FUNCTION notify_on_bookmark();

CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  article_author uuid;
  article_title text;
BEGIN
  SELECT author_id, title INTO article_author, article_title FROM articles WHERE id = NEW.article_id;
  IF article_author IS NULL OR article_author = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO notifications (user_id, type, message, article_id)
  VALUES (article_author, 'like', 'أعجب أحدهم بعملك "' || LEFT(COALESCE(article_title, ''), 60) || '"', NEW.article_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_like ON likes;
CREATE TRIGGER trg_notify_like AFTER INSERT ON likes FOR EACH ROW EXECUTE FUNCTION notify_on_like();

CREATE OR REPLACE FUNCTION notify_on_new_article()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO notifications (user_id, type, message, article_id)
    SELECT f.follower_id, 'publish', 'عمل جديد "' || LEFT(NEW.title, 60) || '" في قسم ' || COALESCE(NEW.section, ''), NEW.id
    FROM follows f WHERE f.following_id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_article ON articles;
CREATE TRIGGER trg_notify_new_article AFTER INSERT OR UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION notify_on_new_article();

-- =============================================
-- 004: Profile Settings (cover + storage)
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url text DEFAULT '';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profiles', 'profiles', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profiles');

-- =============================================
-- 005: Profile Social Links
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram text DEFAULT '';

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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view contact messages" ON contact_messages;
CREATE POLICY "Only admins can view contact messages"
  ON contact_messages FOR SELECT USING (public.is_admin());

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
VALUES ('images', 'images', true, 10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']::text[])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT TO public USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images' AND auth.uid() = owner);

-- =============================================
-- 009: Account Features
-- =============================================

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_user_id uuid;
CREATE INDEX IF NOT EXISTS idx_notifications_from_user ON notifications(from_user_id);

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
RETURNS int AS $$ SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- Fix subscribers RLS for admin access
DROP POLICY IF EXISTS "Admins can view all subscribers" ON subscribers;
CREATE POLICY "Admins can view all subscribers" ON subscribers FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage subscribers" ON subscribers;
CREATE POLICY "Admins can manage subscribers" ON subscribers FOR ALL USING (public.is_admin());

-- Fix tags RLS for admin
DROP POLICY IF EXISTS "tags_select" ON tags;
DROP POLICY IF EXISTS "tags_insert" ON tags;
DROP POLICY IF EXISTS "tags_update" ON tags;
DROP POLICY IF EXISTS "tags_delete" ON tags;
CREATE POLICY "tags_select" ON tags FOR SELECT USING (true);
CREATE POLICY "tags_insert" ON tags FOR INSERT WITH CHECK (true);
CREATE POLICY "tags_update" ON tags FOR UPDATE USING (true);
CREATE POLICY "tags_delete" ON tags FOR DELETE USING (public.is_admin());

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
