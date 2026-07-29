import { getSupabaseServer } from "./supabase-server";
import { Tag } from "./types";

export async function fetchAllTags(): Promise<Tag[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from("tags")
    .select("id, name, slug, article_count, created_at")
    .order("article_count", { ascending: false });
  return (data || []) as Tag[];
}

export async function fetchTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase
    .from("tags")
    .select("id, name, slug, article_count, created_at")
    .eq("slug", slug)
    .single();
  return (data as Tag) || null;
}

export async function fetchTagsByArticle(articleId: string): Promise<Tag[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from("article_tags")
    .select("tags(id, name, slug, article_count)")
    .eq("article_id", articleId);
  if (!data) return [];
  return data.map((row: any) => row.tags).filter(Boolean) as Tag[];
}

export async function fetchArticlesByTagSlug(slug: string): Promise<any[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data: tag } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", slug)
    .single();
  if (!tag) return [];

  const { data } = await supabase
    .from("article_tags")
    .select("article_id")
    .eq("tag_id", tag.id);
  if (!data || data.length === 0) return [];

  const ids = data.map((r: any) => r.article_id);
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, excerpt, section, author_id, author_name, read_time, status, published_at, created_at")
    .eq("status", "published")
    .in("id", ids)
    .order("published_at", { ascending: false });
  return articles || [];
}

export async function upsertTag(name: string): Promise<Tag | null> {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "");
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("tags")
    .upsert({ name: name.trim(), slug }, { onConflict: "name" })
    .select("id, name, slug, article_count")
    .single();
  if (error) return null;
  return data as Tag;
}

export async function setArticleTags(articleId: string, tagNames: string[]): Promise<void> {
  const supabase = getSupabaseServer();
  if (!supabase) return;

  await supabase.from("article_tags").delete().eq("article_id", articleId);

  if (tagNames.length === 0) return;

  for (const name of tagNames) {
    const tag = await upsertTag(name);
    if (tag) {
      await supabase.from("article_tags").upsert(
        { article_id: articleId, tag_id: tag.id },
        { onConflict: "article_id,tag_id" }
      );
    }
  }
}
