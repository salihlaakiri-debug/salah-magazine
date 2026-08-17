-- ================================================================
-- Migration 013d: Admin RLS fixes — full admin control
-- ================================================================

-- 1. Comments: admin can delete any comment
DROP POLICY IF EXISTS "comments_delete" ON public.comments;
CREATE POLICY "comments_delete"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- 2. Profiles: admin can update any profile (role changes)
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- 3. Contact messages: admin can update + delete
DROP POLICY IF EXISTS "contact_messages_update" ON public.contact_messages;
CREATE POLICY "contact_messages_update"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "contact_messages_delete" ON public.contact_messages;
CREATE POLICY "contact_messages_delete"
  ON public.contact_messages FOR DELETE
  USING (public.is_admin());

-- 4. Subscribers: admin can delete
DROP POLICY IF EXISTS "subscribers_delete" ON public.subscribers;
CREATE POLICY "subscribers_delete"
  ON public.subscribers FOR DELETE
  USING (public.is_admin());

-- 5. Articles: admin can insert (for admin panel article creation)
DROP POLICY IF EXISTS "articles_insert" ON public.articles;
CREATE POLICY "articles_insert"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id OR public.is_admin());

-- 6. Notifications: admin can delete (cleanup)
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
CREATE POLICY "notifications_delete"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- 7. Likes: admin can delete (cleanup)
DROP POLICY IF EXISTS "likes_delete" ON public.likes;
CREATE POLICY "likes_delete"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());
