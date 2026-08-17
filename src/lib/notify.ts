import { getSupabaseServer } from "./supabase-server";

interface NotificationParams {
  userId: string;
  type: "like" | "comment" | "follow" | "publish";
  fromUserId?: string;
  articleId?: string;
  message: string;
}

export async function createNotification(params: NotificationParams) {
  const { userId, fromUserId, message } = params;
  if (userId === fromUserId) return;

  const isServer = typeof window === "undefined";

  if (isServer) {
    const supabase = getSupabaseServer();
    if (!supabase) return;
    const { error } = await supabase.from("notifications").insert({
      user_id: params.userId,
      type: params.type,
      from_user_id: params.fromUserId || null,
      article_id: params.articleId || null,
      message: params.message,
    });
    if (error) console.error("Notification insert error:", error);
  } else {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
    } catch (err) {
      console.error("Notification API error:", err);
    }
  }
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
  return (data || []).map((f: any) => f.follower_id);
}
