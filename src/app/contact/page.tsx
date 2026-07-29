"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import Honeypot from "@/components/Honeypot";
import { MailIcon, MessageIcon, ArrowLeftIcon, CheckIcon } from "@/components/Icons";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [responseMsg, setResponseMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setResponseMsg(data.message);
      } else {
        setStatus("error");
        setResponseMsg(data.error || "حدث خطأ");
      }
    } catch {
      setStatus("error");
      setResponseMsg("حدث خطأ في الاتصال");
    }
  };

  return (
    <div>
      <section className="relative min-h-[40vh] flex items-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="editorial-line" />
            <span className="text-xs font-medium tracking-widest text-accent uppercase">تواصل معنا</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[var(--font-heading)] mb-4 gradient-text">
            تواصل مع السُّدفة
          </h1>
          <p className="text-text-muted max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            نرحب بملاحظاتك، استفساراتك، ومشاركاتك
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <ScrollReveal>
          <div className="bg-surface rounded-2xl border border-border/50 p-6 sm:p-10">
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckIcon size={28} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-2">تم الإرسال!</h2>
                <p className="text-text-muted mb-6">{responseMsg}</p>
                <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all text-sm">
                  <ArrowLeftIcon size={15} />
                  العودة للرئيسية
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative">
                <Honeypot />
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">الاسم *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="input-focus w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-text-muted text-sm outline-none transition-all"
                      placeholder="اسمك الكريم" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">البريد الإلكتروني *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required dir="ltr"
                      className="input-focus w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-text-muted text-sm outline-none transition-all"
                      placeholder="بريدك@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">الموضوع</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-focus w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-text-muted text-sm outline-none transition-all"
                    placeholder="موضوع الرسالة" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">الرسالة *</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required rows={6}
                    className="input-focus w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-text-muted text-sm outline-none transition-all resize-y"
                    placeholder="اكتب رسالتك هنا..." />
                </div>
                {status === "error" && (
                  <p className="text-sm text-red-600 dark:text-red-400">{responseMsg}</p>
                )}
                <button type="submit" disabled={status === "loading"}
                  className="btn-ripple w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer">
                  {status === "loading" ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <MailIcon size={16} />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>

        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          <div className="text-center p-6 rounded-xl bg-surface border border-border/30">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <MailIcon size={18} className="text-accent" />
            </div>
            <h3 className="font-bold text-sm mb-1">البريد</h3>
            <p className="text-xs text-text-muted">contact@al-sudfeh.com</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-surface border border-border/30">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <MessageIcon size={18} className="text-accent" />
            </div>
            <h3 className="font-bold text-sm mb-1">وسائل التواصل</h3>
            <p className="text-xs text-text-muted">@al_sudfeh</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-surface border border-border/30">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <ArrowLeftIcon size={18} className="text-accent" />
            </div>
            <h3 className="font-bold text-sm mb-1">روابط سريعة</h3>
            <p className="text-xs text-text-muted">
              <Link href="/about" className="text-accent hover:underline">عن المجلة</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
