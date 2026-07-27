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

    const { data: signInData, error: signInError } = await admin.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError && signInData.session) {
      return NextResponse.json({ success: true, autoSignedIn: true });
    }

    if (signInError && signInError.message.includes("Email not confirmed")) {
      const { data: users, error: listError } = await admin.auth.admin.listUsers();

      if (listError || !users?.users?.length) {
        return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      }

      const user = users.users.find((u) => u.email === email);
      if (!user) {
        return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      }

      const { error: confirmError } = await admin.auth.admin.updateUserById(user.id, {
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
        autoSignedIn: true,
        access_token: retryData.session?.access_token,
        refresh_token: retryData.session?.refresh_token,
      });
    }

    return NextResponse.json({ error: signInError?.message || "خطأ غير معروف" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
