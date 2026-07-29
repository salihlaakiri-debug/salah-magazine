import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { validateName, validateEmail, validateMessage, validateSubject } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    const hpFields = Object.keys(body).filter(k => k.startsWith("hp_"));
    if (hpFields.some(k => body[k])) {
      return NextResponse.json({ message: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً." });
    }

    const nameResult = validateName(name);
    if (!nameResult.valid) return NextResponse.json({ error: nameResult.error }, { status: 400 });

    const emailResult = validateEmail(email);
    if (!emailResult.valid) return NextResponse.json({ error: emailResult.error }, { status: 400 });

    const messageResult = validateMessage(message);
    if (!messageResult.valid) return NextResponse.json({ error: messageResult.error }, { status: 400 });

    const subjectResult = validateSubject(subject);
    if (!subjectResult.valid) return NextResponse.json({ error: subjectResult.error }, { status: 400 });

    const supabase = getSupabaseServer();
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: (subject || "").trim(),
      message: message.trim(),
    });

    if (error) throw error;
    return NextResponse.json({ message: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "خطأ داخلي" }, { status: 500 });
  }
}
