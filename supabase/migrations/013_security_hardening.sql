-- ================================================================
-- Migration 013: Security Hardening & Critical Bug Fixes
-- Run ONCE in Supabase SQL Editor after 012_consolidated.sql
-- ================================================================

-- ================================================================
-- 1. HELPER FUNCTIONS
-- ================================================================

-- is_admin(): check if current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ================================================================
-- 2. PROFILE TRIGGER: auto-create profile on signup
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.raw_user_meta_data ->> 'preferred_username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 3. PREVENT PRIVILEGE ESCALATION
-- ================================================================

-- Trigger: prevent non-admins from changing their own role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Cannot change role: admin privileges required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ================================================================
-- 4. FIX RLS POLICIES
-- ================================================================

-- 4a. PROFILES: allow users to update own profile (role protected by trigger)
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4b. SUBSCRIBERS: admin-only read, no public access to emails
DROP POLICY IF EXISTS "subscribers_select" ON public.subscribers;
CREATE POLICY "subscribers_select"
  ON public.subscribers FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "subscribers_update" ON public.subscribers;
CREATE POLICY "subscribers_update"
  ON public.subscribers FOR UPDATE
  USING (public.is_admin());

-- 4c. COMMENTS: require authentication
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4d. TAGS: admin-only for write operations
DROP POLICY IF EXISTS "tags_insert" ON public.tags;
CREATE POLICY "tags_insert"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "tags_update" ON public.tags;
CREATE POLICY "tags_update"
  ON public.tags FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "tags_delete" ON public.tags;
CREATE POLICY "tags_delete"
  ON public.tags FOR DELETE
  USING (public.is_admin());

-- 4e. ARTICLE_TAGS: admin-only for write operations
DROP POLICY IF EXISTS "article_tags_insert" ON public.article_tags;
CREATE POLICY "article_tags_insert"
  ON public.article_tags FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "article_tags_delete" ON public.article_tags;
CREATE POLICY "article_tags_delete"
  ON public.article_tags FOR DELETE
  USING (public.is_admin());

-- 4f. NOTIFICATIONS: prevent anonymous insertion
DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;
CREATE POLICY "notifications_insert_service"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4g. CONTACT_MESSAGES: fix JWT role check to use is_admin()
DROP POLICY IF EXISTS "contact_messages_select" ON public.contact_messages;
CREATE POLICY "contact_messages_select"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

-- 4h. ARTICLES: admin can manage all articles
DROP POLICY IF EXISTS "articles_select_followers" ON public.articles;
CREATE POLICY "articles_select_followers"
  ON public.articles FOR SELECT
  USING (
    status = 'published' AND visibility = 'followers'
    AND EXISTS (
      SELECT 1 FROM public.follows
      WHERE follower_id = auth.uid() AND following_id = author_id
    )
  );

CREATE POLICY "articles_select_admin"
  ON public.articles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "articles_update_admin"
  ON public.articles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "articles_delete_admin"
  ON public.articles FOR DELETE
  USING (public.is_admin());

-- 4i. BOOKMARKS: private to owner only
DROP POLICY IF EXISTS "bookmarks_select" ON public.bookmarks;
CREATE POLICY "bookmarks_select"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- 4j. ARTICLE_VIEWS: restrict read to admin only
DROP POLICY IF EXISTS "article_views_select" ON public.article_views;
CREATE POLICY "article_views_select"
  ON public.article_views FOR SELECT
  USING (public.is_admin() OR auth.uid() = user_id);

-- 4k. RATE_LIMITS: restrict to service role only
DROP POLICY IF EXISTS "rate_limits_insert" ON public.rate_limits;
DROP POLICY IF EXISTS "rate_limits_select" ON public.rate_limits;
-- No user policies = only accessible via service role / SECURITY DEFINER functions

-- ================================================================
-- 5. FIX SECURITY DEFINER FUNCTIONS (IDOR protection)
-- ================================================================

-- 5a. mark_notifications_read: verify user ownership
CREATE OR REPLACE FUNCTION public.mark_notifications_read(p_user_id UUID)
RETURNS void AS $$
  UPDATE public.notifications SET read = true
  WHERE user_id = p_user_id AND read = false
    AND (p_user_id = auth.uid() OR public.is_admin());
$$ LANGUAGE sql SECURITY DEFINER;

-- 5b. get_unread_notification_count: verify user ownership
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS int AS $$
  SELECT COUNT(*) FROM public.notifications
  WHERE user_id = p_user_id AND read = false
    AND (p_user_id = auth.uid() OR public.is_admin());
$$ LANGUAGE sql SECURITY DEFINER;

-- 5c. increment_views: add rate limit guard
CREATE OR REPLACE FUNCTION public.increment_views(p_article_id UUID, p_ip TEXT, p_ua TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Prevent rapid duplicate views from same IP within 1 minute
  IF EXISTS (
    SELECT 1 FROM public.article_views
    WHERE article_id = p_article_id AND viewer_ip = p_ip
      AND created_at > NOW() - INTERVAL '1 minute'
  ) THEN
    SELECT COUNT(*) INTO v_count FROM public.article_views WHERE article_id = p_article_id;
    RETURN v_count;
  END IF;

  INSERT INTO public.article_views (article_id, viewer_ip, user_agent)
  VALUES (p_article_id, p_ip, p_ua);
  SELECT COUNT(*) INTO v_count FROM public.article_views WHERE article_id = p_article_id;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 6. STORAGE: restrict images bucket path
-- ================================================================

DROP POLICY IF EXISTS "image_upload" ON storage.objects;
CREATE POLICY "image_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'uploads'
    AND octet_length(name) < 512
  );
