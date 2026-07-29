import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { articleId, userId } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.rpc("increment_views", {
      p_article_id: articleId,
      p_ip: req.headers.get("x-forwarded-for") || "unknown",
      p_ua: req.headers.get("user-agent") || "unknown",
    });

    if (userId) {
      await supabase.from("article_views").upsert({
        article_id: articleId,
        user_id: userId,
        viewer_ip: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      }, { onConflict: "article_id, user_id", ignoreDuplicates: true });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
