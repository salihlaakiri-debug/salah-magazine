-- ================================================================
-- Al-Sudfeh Magazine — Consolidated Full Schema Migration
-- Run this ONCE in Supabase SQL Editor.
-- Idempotent: safe to run multiple times (uses IF NOT EXISTS).
-- ================================================================

-- ================================================================
-- 1. EXTENSION
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- 2. TABLES (with IF NOT EXISTS)
-- ================================================================

-- 2a. Profiles (created by Supabase Auth trigger, but ensure exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  website TEXT DEFAULT '',
  twitter TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  role TEXT DEFAULT 'reader' CHECK (role IN ('reader', 'writer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2b. Articles
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  section TEXT NOT NULL,
  author TEXT DEFAULT '',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  read_time TEXT DEFAULT '5',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2c. Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT DEFAULT '',
  content TEXT,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2d. Tags
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2e. Article-Tags junction
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 2f. Subscribers (newsletter)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  confirmed BOOLEAN DEFAULT false,
  confirm_token TEXT,
  unsubscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2g. Article views
CREATE TABLE IF NOT EXISTS public.article_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2h. Follows
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- 2i. Likes
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- 2j. Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- 2k. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'publish', 'bookmark')),
  message TEXT NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2l. Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- 2m. Reading lists
CREATE TABLE IF NOT EXISTS public.reading_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  list_type TEXT NOT NULL CHECK (list_type IN ('want_to_read', 'reading', 'finished')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id, list_type)
);

-- 2n. Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  like_notifications BOOLEAN DEFAULT true,
  comment_notifications BOOLEAN DEFAULT true,
  follow_notifications BOOLEAN DEFAULT true,
  publish_notifications BOOLEAN DEFAULT true,
  bookmark_notifications BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2o. Rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.rate_limits(identifier, window_start);

-- ================================================================
-- 3. ROW LEVEL SECURITY
-- ================================================================

DO $$ BEGIN
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ================================================================
-- 4. RLS POLICIES (drop then create for idempotency)
-- ================================================================

-- 4a. Profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4b. Articles
DROP POLICY IF EXISTS "articles_select_published" ON public.articles;
DROP POLICY IF EXISTS "articles_select_own" ON public.articles;
DROP POLICY IF EXISTS "articles_insert" ON public.articles;
DROP POLICY IF EXISTS "articles_update" ON public.articles;
DROP POLICY IF EXISTS "articles_delete" ON public.articles;
CREATE POLICY "articles_select_published"
  ON public.articles FOR SELECT
  USING (status = 'published' AND (visibility = 'public' OR visibility IS NULL));
CREATE POLICY "articles_select_own"
  ON public.articles FOR SELECT
  USING (auth.uid() = author_id);
CREATE POLICY "articles_insert"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "articles_update"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "articles_delete"
  ON public.articles FOR DELETE
  USING (auth.uid() = author_id);

-- 4c. Comments
DROP POLICY IF EXISTS "comments_select" ON public.comments;
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
DROP POLICY IF EXISTS "comments_delete" ON public.comments;
CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_delete" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- 4d. Tags
DROP POLICY IF EXISTS "tags_select" ON public.tags;
DROP POLICY IF EXISTS "tags_insert" ON public.tags;
DROP POLICY IF EXISTS "tags_update" ON public.tags;
DROP POLICY IF EXISTS "tags_delete" ON public.tags;
CREATE POLICY "tags_select" ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags_insert" ON public.tags FOR INSERT WITH CHECK (true);
CREATE POLICY "tags_update" ON public.tags FOR UPDATE USING (true);
CREATE POLICY "tags_delete" ON public.tags FOR DELETE USING (true);

-- 4e. Article-Tags
DROP POLICY IF EXISTS "article_tags_select" ON public.article_tags;
DROP POLICY IF EXISTS "article_tags_insert" ON public.article_tags;
DROP POLICY IF EXISTS "article_tags_delete" ON public.article_tags;
CREATE POLICY "article_tags_select" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "article_tags_insert" ON public.article_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "article_tags_delete" ON public.article_tags FOR DELETE USING (true);

-- 4f. Subscribers
DROP POLICY IF EXISTS "subscribers_insert" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_select" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_update" ON public.subscribers;
CREATE POLICY "subscribers_insert" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "subscribers_select" ON public.subscribers FOR SELECT USING (true);
CREATE POLICY "subscribers_update" ON public.subscribers FOR UPDATE USING (true);

-- 4g. Article views
DROP POLICY IF EXISTS "article_views_insert" ON public.article_views;
DROP POLICY IF EXISTS "article_views_select" ON public.article_views;
CREATE POLICY "article_views_insert" ON public.article_views FOR INSERT WITH CHECK (true);
CREATE POLICY "article_views_select" ON public.article_views FOR SELECT USING (true);

-- 4h. Follows
DROP POLICY IF EXISTS "follows_select" ON public.follows;
DROP POLICY IF EXISTS "follows_insert" ON public.follows;
DROP POLICY IF EXISTS "follows_delete" ON public.follows;
CREATE POLICY "follows_select" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 4i. Likes
DROP POLICY IF EXISTS "likes_select" ON public.likes;
DROP POLICY IF EXISTS "likes_insert" ON public.likes;
DROP POLICY IF EXISTS "likes_delete" ON public.likes;
CREATE POLICY "likes_select" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- 4j. Bookmarks
DROP POLICY IF EXISTS "bookmarks_select" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks_insert" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks_delete" ON public.bookmarks;
CREATE POLICY "bookmarks_select" ON public.bookmarks FOR SELECT USING (true);
CREATE POLICY "bookmarks_insert" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- 4k. Notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_service"
  ON public.notifications FOR INSERT WITH CHECK (true);

-- 4l. Contact messages
DROP POLICY IF EXISTS "contact_messages_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_select" ON public.contact_messages;
CREATE POLICY "contact_messages_insert"
  ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_select"
  ON public.contact_messages FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- 4m. Reading lists
DROP POLICY IF EXISTS "reading_lists_select" ON public.reading_lists;
DROP POLICY IF EXISTS "reading_lists_insert" ON public.reading_lists;
DROP POLICY IF EXISTS "reading_lists_update" ON public.reading_lists;
DROP POLICY IF EXISTS "reading_lists_delete" ON public.reading_lists;
CREATE POLICY "reading_lists_select"
  ON public.reading_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reading_lists_insert"
  ON public.reading_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reading_lists_update"
  ON public.reading_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reading_lists_delete"
  ON public.reading_lists FOR DELETE USING (auth.uid() = user_id);

-- 4n. Notification preferences
DROP POLICY IF EXISTS "notif_prefs_select" ON public.notification_preferences;
DROP POLICY IF EXISTS "notif_prefs_insert" ON public.notification_preferences;
DROP POLICY IF EXISTS "notif_prefs_update" ON public.notification_preferences;
CREATE POLICY "notif_prefs_select"
  ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_prefs_insert"
  ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_prefs_update"
  ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 4o. Rate limits (service role only, restrict public)
DROP POLICY IF EXISTS "rate_limits_insert" ON public.rate_limits;
DROP POLICY IF EXISTS "rate_limits_select" ON public.rate_limits;
CREATE POLICY "rate_limits_insert"
  ON public.rate_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "rate_limits_select"
  ON public.rate_limits FOR SELECT USING (true);

-- ================================================================
-- 5. INDEXES
-- ================================================================

-- Articles
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_section ON public.articles(section);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_section_status ON public.articles(section, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_visibility ON public.articles(visibility);
CREATE INDEX IF NOT EXISTS idx_articles_title_gin ON public.articles USING gin(to_tsvector('arabic', title));
CREATE INDEX IF NOT EXISTS idx_articles_content_gin ON public.articles USING gin(to_tsvector('arabic', content));

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_article_created ON public.comments(article_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- Tags
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

-- Article-Tags
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON public.article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON public.article_tags(tag_id);

-- Subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirmed ON public.subscribers(confirmed);

-- Article Views
CREATE INDEX IF NOT EXISTS idx_article_views_article ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_created ON public.article_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_views_user ON public.article_views(user_id);

-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- Likes
CREATE INDEX IF NOT EXISTS idx_likes_article ON public.likes(article_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);

-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_article ON public.bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user ON public.notifications(from_user_id);

-- Contact Messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Reading Lists
CREATE INDEX IF NOT EXISTS idx_reading_lists_user ON public.reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_type ON public.reading_lists(user_id, list_type);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ================================================================
-- 6. FUNCTIONS & RPCs
-- ================================================================

-- 6a. Update tag count trigger
CREATE OR REPLACE FUNCTION public.update_tag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tags SET article_count = article_count + 1 WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tags SET article_count = article_count - 1 WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_tag_count ON public.article_tags;
CREATE TRIGGER trg_tag_count
  AFTER INSERT OR DELETE ON public.article_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_tag_count();

-- 6b. Confirm subscriber
CREATE OR REPLACE FUNCTION public.confirm_subscriber(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.subscribers
  SET confirmed = true, confirm_token = NULL
  WHERE confirm_token = token AND confirmed = false;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6c. Increment views
CREATE OR REPLACE FUNCTION public.increment_views(p_article_id UUID, p_ip TEXT, p_ua TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.article_views (article_id, viewer_ip, user_agent)
  VALUES (p_article_id, p_ip, p_ua);
  SELECT COUNT(*) INTO v_count FROM public.article_views WHERE article_id = p_article_id;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6d. Mark notifications read
CREATE OR REPLACE FUNCTION public.mark_notifications_read(p_user_id UUID)
RETURNS void AS $$
  UPDATE public.notifications SET read = true
  WHERE user_id = p_user_id AND read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- 6e. Get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS int AS $$
  SELECT COUNT(*) FROM public.notifications
  WHERE user_id = p_user_id AND read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- 6f. Get user reading stats
CREATE OR REPLACE FUNCTION public.get_user_reading_stats(p_user_id UUID)
RETURNS TABLE (
  total_articles_read BIGINT,
  total_reading_time_minutes BIGINT,
  total_sections_read JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT av.article_id),
    COALESCE(SUM(
      CASE
        WHEN a.read_time ~ '^\d+' THEN substring(a.read_time from '^\d+')::BIGINT
        ELSE 0
      END
    ), 0),
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('section', a2.section, 'count', count))
       FROM (
         SELECT a2.section, COUNT(*) as count
         FROM public.article_views av2
         JOIN public.articles a2 ON a2.id = av2.article_id
         WHERE av2.user_id = p_user_id
         GROUP BY a2.section
         ORDER BY count DESC
       ) a2),
      '[]'::JSONB
    )
  FROM public.article_views av
  JOIN public.articles a ON a.id = av.article_id
  WHERE av.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6g. Check rate limit (for DB-backed rate limiting)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_limit INTEGER,
  p_window_start TIMESTAMPTZ
)
RETURNS TABLE (allowed BOOLEAN, remaining INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '10 minutes'
    AND identifier = p_identifier;

  INSERT INTO public.rate_limits (identifier, window_start)
  VALUES (p_identifier, p_window_start);

  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND window_start >= p_window_start;

  RETURN QUERY
  SELECT
    v_count <= p_limit AS allowed,
    GREATEST(0, p_limit - v_count)::INTEGER AS remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. NOTIFICATION TRIGGERS
-- ================================================================

-- 7a. Comment notification
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  article_author UUID;
  commenter_name TEXT;
BEGIN
  SELECT author_id INTO article_author FROM public.articles WHERE id = NEW.article_id;
  IF article_author IS NULL OR article_author = NEW.user_id THEN
    RETURN NEW;
  END IF;
  commenter_name := COALESCE(NEW.author_name, 'مجهول');
  INSERT INTO public.notifications (user_id, type, message, article_id, from_user_id)
  VALUES (
    article_author, 'comment',
    commenter_name || ' علّق على عملك: "' || LEFT(NEW.content, 80) || '"',
    NEW.article_id, NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_comment ON public.comments;
CREATE TRIGGER trg_notify_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- 7b. Bookmark notification
CREATE OR REPLACE FUNCTION public.notify_on_bookmark()
RETURNS TRIGGER AS $$
DECLARE
  article_author UUID;
  article_title TEXT;
BEGIN
  SELECT author_id, title INTO article_author, article_title FROM public.articles WHERE id = NEW.article_id;
  IF article_author IS NULL OR article_author = NEW.user_id THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.notifications (user_id, type, message, article_id, from_user_id)
  VALUES (
    article_author, 'bookmark',
    'أحدهم أضاف عملك "' || LEFT(COALESCE(article_title, ''), 60) || '" إلى محفوظاته',
    NEW.article_id, NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_bookmark ON public.bookmarks;
CREATE TRIGGER trg_notify_bookmark
  AFTER INSERT ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_bookmark();

-- 7c. Like notification
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  article_author UUID;
  article_title TEXT;
BEGIN
  SELECT author_id, title INTO article_author, article_title FROM public.articles WHERE id = NEW.article_id;
  IF article_author IS NULL OR article_author = NEW.user_id THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.notifications (user_id, type, message, article_id, from_user_id)
  VALUES (
    article_author, 'like',
    'أعجب أحدهم بعملك "' || LEFT(COALESCE(article_title, ''), 60) || '"',
    NEW.article_id, NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_like ON public.likes;
CREATE TRIGGER trg_notify_like
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- 7d. New published article notification (to followers)
CREATE OR REPLACE FUNCTION public.notify_on_new_article()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO public.notifications (user_id, type, message, article_id, from_user_id)
    SELECT
      f.follower_id, 'publish',
      'عمل جديد "' || LEFT(NEW.title, 60) || '" في قسم ' || COALESCE(NEW.section, ''),
      NEW.id, NEW.author_id
    FROM public.follows f
    WHERE f.following_id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_article ON public.articles;
CREATE TRIGGER trg_notify_new_article
  AFTER INSERT OR UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_article();

-- ================================================================
-- 8. STORAGE BUCKETS
-- ================================================================

-- 8a. Profiles bucket (avatars & covers)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles', 'profiles', true, 5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']::TEXT[]
)
ON CONFLICT (id) DO NOTHING;

-- 8b. Images bucket (article content images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 'images', true, 10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']::TEXT[]
)
ON CONFLICT (id) DO NOTHING;

-- Profiles bucket policies
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;

CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profiles');

-- Images bucket policies
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "image_upload" ON storage.objects;
DROP POLICY IF EXISTS "image_select" ON storage.objects;
DROP POLICY IF EXISTS "image_delete" ON storage.objects;

CREATE POLICY "image_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');

CREATE POLICY "image_select"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'images');

CREATE POLICY "image_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner);

-- ================================================================
-- 9. SET ADMIN (idempotent)
-- ================================================================
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'salihlaakiri@gmail.com');
