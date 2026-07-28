"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon } from "@/components/Icons";

function RegisterForm() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) { setError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل"); return; }
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }

    setLoading(true);
    setError("");
    const result = await signUp(email, password, username);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(redirectTo);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle(redirectTo);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2 text-center">إنشاء حساب</h1>
      <p className="text-sm text-text-muted text-center mb-8">انضم إلى مجتمع السُّدفة وابدأ رحلتك الأدبية</p>

      <form onSubmit={handleSubmit} className="bg-surface rounded-3xl border border-border/50 p-8 shadow-xl space-y-4">
        {error && <p className="text-red-500 text-xs text-center bg-red-500/10 p-3 rounded-xl">{error}</p>}

        <div>
          <label className="text-xs font-medium text-text-muted block mb-1.5">اسم المستخدم</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="اسمك المستخدم"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            required
          />
        </div>

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

        <div>
          <label className="text-xs font-medium text-text-muted block mb-1.5">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 أحرف على الأقل"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckIcon size={16} /> إنشاء حساب</>}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
          <div className="relative flex justify-center"><span className="bg-surface px-4 text-xs text-text-muted">أو</span></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 rounded-xl border border-border bg-background font-medium hover:bg-surface-hover transition-all text-sm flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          التسجيل بحساب Google
        </button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="text-accent hover:text-accent-dark font-medium">تسجيل الدخول</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
