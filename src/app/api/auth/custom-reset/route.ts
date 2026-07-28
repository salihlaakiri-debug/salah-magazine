import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceKey) {
      return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
    }

    const admin = createClient(url, serviceKey);

    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app"}/auth/callback` },
    });

    if (linkError || !data?.properties?.action_link) {
      // Don't reveal whether the email exists — just return success
      return NextResponse.json({ success: true, message: "إذا كان البريد مسجلاً، ستصل لك رسالة استعادة كلمة المرور." });
    }

    const resetLink = data.properties.action_link;

    const result = await sendPasswordResetEmail(email, resetLink);

    return NextResponse.json({
      success: true,
      sent: result.sent,
      message: "إذا كان البريد مسجلاً، ستصل لك رسالة استعادة كلمة المرور.",
    });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
