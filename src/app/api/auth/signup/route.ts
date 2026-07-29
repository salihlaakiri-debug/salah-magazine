import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateEmail, validatePassword, validateUsername } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username } = body;

    const emailResult = validateEmail(email);
    if (!emailResult.valid) return NextResponse.json({ error: emailResult.error }, { status: 400 });

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) return NextResponse.json({ error: passwordResult.error }, { status: 400 });

    const usernameResult = validateUsername(username);
    if (!usernameResult.valid) return NextResponse.json({ error: usernameResult.error }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceKey) {
      return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
    }

    const admin = createClient(url, serviceKey);

    const { error: signUpError } = await admin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: { username: username.trim(), display_name: username.trim() },
    });

    if (signUpError) {
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجّل بالفعل. يُرجى تسجيل الدخول." }, { status: 409 });
    }

    const { data: signInData, error: signInError } = await admin.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
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
