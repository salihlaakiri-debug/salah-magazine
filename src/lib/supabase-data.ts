import { getSupabaseServer } from "./supabase-server";
import { Article, Section, UserProfile } from "./types";

function mapArticle(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt || "",
    section: row.section as Section,
    date: row.published_at || row.created_at,
    author: row.author_name || "السُّدفة",
    author_id: row.author_id || undefined,
    author_name: row.author_name || undefined,
    author_username: row.author_username || undefined,
    author_avatar_url: row.author_avatar_url || undefined,
    readTime: row.read_time || "3 دقائق",
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
    visibility: row.visibility || "public",
  };
}

async function enrichArticles(articles: Article[]): Promise<Article[]> {
  const authorIds = articles.filter(a => a.author_id).map(a => a.author_id!).filter(Boolean);
  if (authorIds.length === 0) return articles;

  const supabase = getSupabaseServer();
  if (!supabase) return articles;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", authorIds);

  if (!profiles?.length) return articles;

  const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
  return articles.map(a => ({
    ...a,
    author_username: profileMap.get(a.author_id!)?.username || a.author_username,
    author_avatar_url: profileMap.get(a.author_id!)?.avatar_url || a.author_avatar_url,
  }));
}

export async function fetchPublishedArticles(limit?: number, offset?: number): Promise<Article[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  let query = supabase
    .from("articles")
    .select("id, title, excerpt, section, author_id, author_name, read_time, status, published_at, created_at, visibility")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("published_at", { ascending: false });
  if (limit) query = query.range(offset || 0, (offset || 0) + limit - 1);
  const { data } = await query;
  return enrichArticles((data || []).map(mapArticle));
}

export async function fetchPublishedArticlesCount(): Promise<number> {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .eq("visibility", "public");
  return count || 0;
}

export async function fetchArticlesBySection(section: Section, limit?: number, offset?: number): Promise<Article[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  let query = supabase
    .from("articles")
    .select("id, title, excerpt, section, author_id, author_name, read_time, status, published_at, created_at, visibility")
    .eq("status", "published")
    .eq("visibility", "public")
    .eq("section", section)
    .order("published_at", { ascending: false });
  if (limit) query = query.range(offset || 0, (offset || 0) + limit - 1);
  const { data } = await query;
  return enrichArticles((data || []).map(mapArticle));
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase
    .from("articles")
    .select("id, title, content, excerpt, section, author_id, author_name, read_time, status, published_at, created_at, visibility")
    .eq("status", "published")
    .eq("id", id)
    .single();
  if (!data) return null;
  return (await enrichArticles([mapArticle(data)]))[0];
}

export async function fetchRecentArticles(count: number): Promise<Article[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from("articles")
    .select("id, title, excerpt, section, author_id, author_name, read_time, status, published_at, created_at, visibility")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("published_at", { ascending: false })
    .limit(count);
  return enrichArticles((data || []).map(mapArticle));
}

export async function searchArticlesServer(query: string): Promise<Article[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from("articles")
    .select("id, title, excerpt, section, author_id, author_name, read_time, status, published_at, created_at, visibility")
    .eq("status", "published")
    .eq("visibility", "public")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order("published_at", { ascending: false });
  return enrichArticles((data || []).map(mapArticle));
}

export async function fetchArticleCount(): Promise<number> {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .eq("visibility", "public");
  return count || 0;
}

export async function fetchPendingCount(): Promise<number> {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count || 0;
}

export async function fetchCommentCount(): Promise<number> {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

export async function fetchUserCount(): Promise<number> {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

export async function fetchLikeCount(articleId: string): Promise<number> {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("article_id", articleId);
  return count || 0;
}
