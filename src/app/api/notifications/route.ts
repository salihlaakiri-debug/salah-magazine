import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, fromUserId, articleId, message } = body;

    if (!userId || !type || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (userId === fromUserId) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      from_user_id: fromUserId || null,
      article_id: articleId || null,
      message,
    });

    if (error) {
      console.error("Notification insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notification API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
