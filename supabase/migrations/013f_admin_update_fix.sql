-- ================================================================
-- Migration 013f: Fix admin approve/reject submissions
-- Run ONCE in Supabase SQL Editor
-- ================================================================

-- 1. Ensure admin can UPDATE any article (drop first to avoid conflict)
DROP POLICY IF EXISTS "articles_update_admin" ON public.articles;
CREATE POLICY "articles_update_admin"
  ON public.articles FOR UPDATE
  USING (public.is_admin());

-- 2. Ensure admin can SELECT all articles (pending included)
DROP POLICY IF EXISTS "articles_select_admin" ON public.articles;
CREATE POLICY "articles_select_admin"
  ON public.articles FOR SELECT
  USING (public.is_admin());

-- 3. Ensure admin can DELETE any article
DROP POLICY IF EXISTS "articles_delete_admin" ON public.articles;
CREATE POLICY "articles_delete_admin"
  ON public.articles FOR DELETE
  USING (public.is_admin());

-- 4. Make notify_on_new_article trigger resilient (don't fail the UPDATE if notification insert fails)
CREATE OR REPLACE FUNCTION public.notify_on_new_article()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO public.notifications (user_id, type, message, article_id, from_user_id)
    SELECT
      f.follower_id, 'publish',
      'نشر عمل جديد "' || LEFT(NEW.title, 60) || '" في قسم ' || COALESCE(NEW.section, ''),
      NEW.id, NEW.author_id
    FROM public.follows f
    WHERE f.following_id = NEW.author_id;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_on_new_article failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
