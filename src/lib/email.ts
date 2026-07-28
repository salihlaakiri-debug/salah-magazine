"use server";

import nodemailer from "nodemailer";

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function emailLayout(body: string) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06)">
<tr><td style="background:linear-gradient(135deg,#2d3561,#1a1f3a);padding:32px 24px;text-align:center">
<div style="width:56px;height:56px;border-radius:50%;background:#ffffff10;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:24px;font-weight:700;color:#ffffff;line-height:56px">س</div>
<h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px">السُّدفة</h1>
<p style="margin:4px 0 0;font-size:13px;color:#a8b0d0">مجلة أدبية ثقافية</p>
</td></tr>
<tr><td style="padding:32px 24px">
${body}
</td></tr>
<tr><td style="background:#fafafa;padding:24px;text-align:center;border-top:1px solid #eee">
<p style="margin:0 0 8px;font-size:12px;color:#999">© 2026 السُّدفة. جميع الحقوق محفوظة.</p>
<p style="margin:0;font-size:11px;color:#bbb">
إذا لم تطلب هذه الرسالة، يمكنك تجاهلها بأمان.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function passwordResetEmail(resetLink: string) {
  const body = `
<p style="margin:0 0 16px;font-size:16px;color:#333;line-height:1.7">مرحباً،</p>
<p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.7">
لقد تلقينا طلباً لاستعادة كلمة المرور لحسابك في <strong>السُّدفة</strong>. 
يمكنك تعيين كلمة مرور جديدة بالنقر على الرابط أدناه:
</p>
<table cellpadding="0" cellspacing="0" style="margin:24px auto"><tr><td style="background:#2d3561;border-radius:12px;padding:14px 32px">
<a href="${resetLink}" style="color:#fff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block">استعادة كلمة المرور</a>
</td></tr></table>
<p style="margin:16px 0 0;font-size:13px;color:#888;line-height:1.7">
ينتهي صلاحية هذا الرابط بعد ساعة واحدة. إذا لم تطلب استعادة كلمة المرور، يُرجى تجاهل هذه الرسالة.
</p>
<hr style="border:none;border-top:1px solid #eee;margin:24px 0">
<p style="margin:0;font-size:13px;color:#888;line-height:1.7">
إذا واجهت أي مشكلة في النقر على الرابط، يمكنك نسخ الرابط التالي ولصقه في المتصفح:
<br><span style="color:#2d3561;font-size:12px;word-break:break-all">${resetLink}</span>
</p>
`;
  return emailLayout(body);
}

function welcomeEmail(displayName: string) {
  const body = `
<p style="margin:0 0 16px;font-size:16px;color:#333;line-height:1.7">مرحباً ${displayName}،</p>
<p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.7">
نرحّب بك في <strong>السُّدفة</strong> — مجلتنا الأدبية التي تحتفي بالكلمة الجميلة.
</p>
<p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.7">
يمكنك الآن قراءة المقالات الأدبية، والتفاعل مع الكتّاب، ومشاركة إبداعاتك مع المجتمع.
</p>
<table cellpadding="0" cellspacing="0" style="margin:24px auto"><tr><td style="background:#2d3561;border-radius:12px;padding:14px 32px">
<a href="https://al-sudfeh.vercel.app/dashboard" style="color:#fff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block">ابدأ القراءة</a>
</td></tr></table>
`;
  return emailLayout(body);
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!smtpConfigured) {
    console.log(`[email] SMTP not configured. Would send to ${to}: ${subject}`);
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    const transport = getTransport();
    await transport.sendMail({
      from: process.env.EMAIL_FROM || '"السُّدفة" <noreply@al-sudfeh.vercel.app>',
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[email] Failed to send:", error);
    return { sent: false, reason: "Failed to send" };
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  return sendEmail({
    to,
    subject: "استعادة كلمة المرور - السُّدفة",
    html: passwordResetEmail(resetLink),
  });
}

export async function sendWelcomeEmail(to: string, displayName: string) {
  return sendEmail({
    to,
    subject: "مرحباً بك في السُّدفة",
    html: welcomeEmail(displayName),
  });
}
