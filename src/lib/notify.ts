import { getSupabaseServer } from "./supabase-server";

export async function createNotification({
  userId,
  type,
  fromUserId,
  articleId,
  message,
}: {
  userId: string;
  type: "like" | "comment" | "follow" | "publish";
  fromUserId?: string;
  articleId?: string;
  message: string;
}) {
  if (userId === fromUserId) return;
  const supabase = getSupabaseServer();
  if (!supabase) return;
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    from_user_id: fromUserId || null,
    article_id: articleId || null,
    message,
  });
}

export async function getAuthorIdForArticle(articleId: string): Promise<string | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase
    .from("articles")
    .select("author_id")
    .eq("id", articleId)
    .single();
  return data?.author_id || null;
}

export async function getFollowerIds(authorId: string): Promise<string[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", authorId);
  return (data || []).map((f) => f.follower_id);
}
