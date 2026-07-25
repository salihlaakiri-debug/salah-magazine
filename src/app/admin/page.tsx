"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShieldIcon, PenIcon } from "@/components/Icons";

export default function AdminLogin() {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/admin/dashboard");
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(password);
      if (ok) {
        router.push("/admin/dashboard");
      } else {
        setError(true);
        setLoading(false);
        setTimeout(() => setError(false), 2000);
      }
    }, 500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white mx-auto mb-5 shadow-xl shadow-accent/20">
            <ShieldIcon size={28} />
          </div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">لوحة التحكم</h1>
          <p className="text-sm text-text-muted">أدخل كلمة المرور للوصول</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-3xl border border-border/50 p-8 shadow-xl">
          <div className="mb-6">
            <label className="text-xs font-medium text-text-muted block mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-3.5 rounded-xl border bg-background text-center text-lg tracking-widest focus:outline-none focus:ring-2 transition-all ${
                error
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-border focus:ring-accent/30 focus:border-accent"
              }`}
              required
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs mt-2 text-center animate-shake">
                كلمة المرور غير صحيحة
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <PenIcon size={16} />
                دخول
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-text-muted mt-6">
          كلمة المرور الافتراضية: salah2026
        </p>
      </div>
    </div>
  );
}
