-- ================================================================
-- Migration 013c: Fix notification duplicates + follow trigger
-- ================================================================

-- 1. Add follow notification trigger (was missing)
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  IF NEW.follower_id = NEW.following_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, username) INTO follower_name
  FROM public.profiles WHERE id = NEW.follower_id;
  INSERT INTO public.notifications (user_id, type, from_user_id, message)
  VALUES (
    NEW.following_id,
    'follow',
    NEW.follower_id,
    COALESCE(follower_name, 'شخص') || ' بدأ بمتابعتك'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_follow ON public.follows;
CREATE TRIGGER trg_notify_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- 2. Clean up any existing duplicate notifications
-- Keep only the first notification per (user_id, type, from_user_id, article_id) within the last hour
DELETE FROM public.notifications n1
WHERE n1.id NOT IN (
  SELECT MIN(n2.id)
  FROM public.notifications n2
  WHERE n2.created_at > now() - interval '1 hour'
  GROUP BY n2.user_id, n2.type, n2.from_user_id, n2.article_id
)
AND n1.created_at > now() - interval '1 hour';
