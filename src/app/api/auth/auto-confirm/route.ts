import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceKey) {
      return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
    }

    const admin = createClient(url, serviceKey);

    const { error: signInError } = await admin.auth.signInWithPassword({ email, password });

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
    let page = 1;
    const perPage = 50;

    while (!targetUser) {
      const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage });
      if (listError || !data?.users?.length) break;

      targetUser = data.users.find((u) => u.email === email) || null;
      if (data.users.length < perPage) break;
      page++;
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
      email,
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
