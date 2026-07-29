-- =============================================
-- Article Visibility: public, followers, private
-- Run in Supabase SQL Editor
-- =============================================

ALTER TABLE articles ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'followers', 'private'));

CREATE INDEX IF NOT EXISTS idx_articles_visibility ON articles(visibility);
