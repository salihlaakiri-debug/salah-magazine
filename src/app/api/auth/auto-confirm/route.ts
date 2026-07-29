import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateEmail, validatePassword } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const emailResult = validateEmail(email);
    if (!emailResult.valid) return NextResponse.json({ error: emailResult.error }, { status: 400 });

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) return NextResponse.json({ error: passwordResult.error }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceKey) {
      return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
    }

    const admin = createClient(url, serviceKey);
    const cleanedEmail = email.toLowerCase().trim();

    const { error: signInError } = await admin.auth.signInWithPassword({ email: cleanedEmail, password });

    if (!signInError) {
      return NextResponse.json({ success: true });
    }

    if (signInError.message === "Invalid login credentials") {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 });
    }

    if (!signInError.message.includes("Email not confirmed")) {
      return NextResponse.json({ error: signInError.message }, { status: 400 });
    }

    let targetUser: { id: string } | null = null;
    for (let page = 1; page <= 5; page++) {
      const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage: 100 });
      if (listError || !data?.users?.length) break;
      targetUser = data.users.find((u) => u.email === cleanedEmail) || null;
      if (targetUser || data.users.length < 100) break;
    }

    if (!targetUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const { error: confirmError } = await admin.auth.admin.updateUserById(targetUser.id, {
      email_confirm: true,
    });

    if (confirmError) {
      return NextResponse.json({ error: "فشل تأكيد البريد" }, { status: 500 });
    }

    const { data: retryData, error: retryError } = await admin.auth.signInWithPassword({
      email: cleanedEmail,
      password,
    });

    if (retryError) {
      return NextResponse.json({ error: retryError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      access_token: retryData.session?.access_token,
      refresh_token: retryData.session?.refresh_token,
    });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
