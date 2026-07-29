import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Honeypot check
    const hpFields = Object.keys(body).filter(k => k.startsWith("hp_"));
    if (hpFields.some(k => body[k])) {
      return NextResponse.json({ message: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً." });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "يرجى ملء جميع الحقول المطلوبة" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || "",
      message,
    });

    if (error) throw error;
    return NextResponse.json({ message: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "خطأ داخلي" }, { status: 500 });
  }
}
