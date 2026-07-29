import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { randomBytes } from "crypto";
import { validateEmail, validateName } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    const emailResult = validateEmail(email);
    if (!emailResult.valid) return NextResponse.json({ error: emailResult.error }, { status: 400 });

    const nameResult = validateName(name || "");
    if (!nameResult.valid) return NextResponse.json({ error: nameResult.error }, { status: 400 });

    const supabase = getSupabaseServer();
    if (!supabase) return NextResponse.json({ error: "خطأ في الاتصال بقاعدة البيانات" }, { status: 500 });
    const cleanedEmail = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, confirmed, unsubscribed")
      .eq("email", cleanedEmail)
      .single();

    if (existing) {
      if (existing.unsubscribed) {
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
    }

    const confirmToken = randomBytes(32).toString("hex");

    if (existing) {
      await supabase
        .from("subscribers")
        .update({ confirm_token: confirmToken, name: (name || "").trim() || null })
        .eq("id", existing.id);
    } else {
      const { error } = await supabase
        .from("subscribers")
        .insert({ email: cleanedEmail, name: (name || "").trim() || null, confirm_token: confirmToken, confirmed: false });
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
