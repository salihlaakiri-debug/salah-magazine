-- =============================================
-- Al-Sudfeh Magazine - Tags, Subscribers & Realtime
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Article-Tags junction
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 3. Newsletter subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  confirmed BOOLEAN DEFAULT false,
  confirm_token TEXT,
  unsubscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Article views counter
CREATE TABLE IF NOT EXISTS article_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Auto-update article_tags count
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

-- 6. Auto-confirm subscriber RPC
CREATE OR REPLACE FUNCTION confirm_subscriber(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE subscribers SET confirmed = true, confirm_token = NULL
  WHERE confirm_token = token AND confirmed = false;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Increment article views RPC
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

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirmed ON subscribers(confirmed);
CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_created ON article_views(created_at DESC);

-- 9. RLS policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- Tags: anyone can read, admin can manage
CREATE POLICY "tags_select" ON tags FOR SELECT USING (true);
CREATE POLICY "tags_insert" ON tags FOR INSERT WITH CHECK (true);
CREATE POLICY "tags_update" ON tags FOR UPDATE USING (true);
CREATE POLICY "tags_delete" ON tags FOR DELETE USING (true);

-- Article tags: anyone can read
CREATE POLICY "article_tags_select" ON article_tags FOR SELECT USING (true);
CREATE POLICY "article_tags_insert" ON article_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "article_tags_delete" ON article_tags FOR DELETE USING (true);

-- Subscribers: anyone can insert (subscribe), service role manages
CREATE POLICY "subscribers_insert" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "subscribers_select" ON subscribers FOR SELECT USING (true);

-- Article views: anyone can insert
CREATE POLICY "article_views_insert" ON article_views FOR INSERT WITH CHECK (true);
CREATE POLICY "article_views_select" ON article_views FOR SELECT USING (true);
