import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, confirmed, unsubscribed")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.unsubscribed) {
        // Re-subscribe
        const { error } = await supabase
          .from("subscribers")
          .update({ unsubscribed: false, confirmed: true })
          .eq("id", existing.id);
        if (error) throw error;
        return NextResponse.json({ message: "تم إعادة اشتراكك بنجاح!" });
      }
      if (existing.confirmed) {
        return NextResponse.json({ message: "أنت مشترك بالفعل!" });
      }
      // Not confirmed yet — resend
    }

    const confirmToken = randomBytes(32).toString("hex");

    if (existing) {
      await supabase
        .from("subscribers")
        .update({ confirm_token: confirmToken, name: name || null })
        .eq("id", existing.id);
    } else {
      const { error } = await supabase
        .from("subscribers")
        .insert({ email, name: name || null, confirm_token: confirmToken, confirmed: false });
      if (error) throw error;
    }

    return NextResponse.json({
      message: "تم الاشتراك بنجاح! يمكنك تصفح المقالات الآن.",
      token: confirmToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "خطأ داخلي" }, { status: 500 });
  }
}
