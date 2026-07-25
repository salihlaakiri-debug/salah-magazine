import { getSupabaseServer } from "./supabase-server";
import { Article, Section } from "./types";

function mapArticle(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt || "",
    section: row.section as Section,
    date: row.published_at || row.created_at,
    author: row.author_name || "صلاح",
    author_id: row.author_id || undefined,
    author_name: row.author_name || undefined,
    readTime: row.read_time || "3 دقائق",
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
  };
}

export async function fetchPublishedArticles(): Promise<Article[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data || []).map(mapArticle);
}

export async function fetchArticlesBySection(section: Section): Promise<Article[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("section", section)
    .order("published_at", { ascending: false });
  return (data || []).map(mapArticle);
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) return null;
  return mapArticle(data);
}

export async function fetchRecentArticles(count: number): Promise<Article[]> {
  const all = await fetchPublishedArticles();
  return all.slice(0, count);
}

export async function searchArticlesServer(query: string): Promise<Article[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order("published_at", { ascending: false });
  return (data || []).map(mapArticle);
}

export async function fetchArticleCount(): Promise<number> {
  const supabase = getSupabaseServer();
  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  return count || 0;
}

export async function fetchPendingCount(): Promise<number> {
  const supabase = getSupabaseServer();
  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count || 0;
}

export async function fetchCommentCount(): Promise<number> {
  const supabase = getSupabaseServer();
  const { count } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

export async function fetchUserCount(): Promise<number> {
  const supabase = getSupabaseServer();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

export async function fetchLikeCount(articleId: string): Promise<number> {
  const supabase = getSupabaseServer();
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("article_id", articleId);
  return count || 0;
}
