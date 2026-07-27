import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceKey) {
      return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
    }

    const admin = createClient(url, serviceKey);

    const { data: signUpData, error: signUpError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, display_name: username },
    });

    if (signUpError) {
      const { data: signInData, error: signInError } = await admin.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError && signInData.session) {
        return NextResponse.json({
          success: true,
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
        });
      }

      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجّل بالفعل. يُرجى تسجيل الدخول." }, { status: 409 });
    }

    const { data: signInData, error: signInError } = await admin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      return NextResponse.json({ success: true, message: "تم إنشاء الحساب بنجاح." });
    }

    return NextResponse.json({
      success: true,
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
    });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
