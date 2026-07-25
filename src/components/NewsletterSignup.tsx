"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeftIcon } from "./Icons";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim(), subscribed_at: new Date().toISOString() });

    if (error) {
      if (error.code === "23505") {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    } else {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent-light to-accent-dark opacity-90" />
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

      <div className="relative glass rounded-3xl p-8 md:p-12 border border-white/10">
        <div className="max-w-lg mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground font-[family-name:var(--font-heading)] mb-3">
            اشترك في نشرتنا البريدية
          </h3>
          <p className="text-text-muted text-sm md:text-base mb-8 leading-relaxed">
            احصل على أحدث الأعمال الأدبية في بريدك
          </p>

          {status === "success" ? (
            <div className="animate-bounce-in flex flex-col items-center gap-3 py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-foreground font-medium">تم الاشتراك بنجاح!</p>
              <p className="text-text-muted text-sm">شكراً لك، ستتصلك الرسالة قريباً</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder="بريدك الإلكتروني"
                required
                dir="ltr"
                className="input-focus flex-1 px-5 py-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-border text-foreground placeholder:text-text-muted text-sm outline-none transition-all"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-ripple flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-dark transition-all shadow-lg shadow-accent/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {status === "loading" ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowLeftIcon size={16} />
                    <span>اشترك</span>
                  </>
                )}
              </button>
            </form>
          )}

          {status === "duplicate" && (
            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 animate-fade-in">
              هذا البريد مشترك بالفعل
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400 animate-fade-in">
              حدث خطأ، يرجى المحاولة مرة أخرى
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
