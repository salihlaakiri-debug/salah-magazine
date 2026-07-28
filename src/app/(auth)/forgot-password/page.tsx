"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckIcon } from "@/components/Icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2 text-center">تم الإرسال</h1>
        <p className="text-sm text-text-muted text-center mb-8">
          إذا كان البريد الإلكتروني مسجلاً لدينا، ستصل لك رسالة استعادة كلمة المرور.
        </p>
        <div className="text-center">
          <Link href="/login" className="text-accent hover:text-accent-dark font-medium text-sm">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2 text-center">استعادة كلمة المرور</h1>
      <p className="text-sm text-text-muted text-center mb-8">أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة</p>

      <form onSubmit={handleSubmit} className="bg-surface rounded-3xl border border-border/50 p-8 shadow-xl space-y-4">
        {error && <p className="text-red-500 text-xs text-center bg-red-500/10 p-3 rounded-xl">{error}</p>}

        <div>
          <label className="text-xs font-medium text-text-muted block mb-1.5">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckIcon size={16} /> إرسال</>}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        <Link href="/login" className="text-accent hover:text-accent-dark font-medium">العودة إلى تسجيل الدخول</Link>
      </p>
    </div>
  );
}
