-- ================================================================
-- Migration 013e: Realtime + submission notifications
-- Run ONCE in Supabase SQL Editor
-- ================================================================

-- 1. Enable Realtime on ALL tables used by useAdminRealtime + NotificationsBell
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'articles', 'notifications', 'comments', 'profiles',
    'tags', 'subscribers', 'contact_messages', 'likes', 'article_views'
  ]) LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- 2. Notify admin(s) when a new article is submitted
CREATE OR REPLACE FUNCTION public.notify_admin_new_submission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'pending') THEN
    INSERT INTO public.notifications (user_id, type, from_user_id, article_id, message)
    SELECT
      p.id,
      'comment',
      NEW.author_id,
      NEW.id,
      'عمل جديد بانتظار المراجعة: "' || NEW.title || '"'
    FROM public.profiles p
    WHERE p.role = 'admin'
      AND p.id != NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admin_submission ON public.articles;
CREATE TRIGGER trg_notify_admin_submission
  AFTER INSERT ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_submission();
