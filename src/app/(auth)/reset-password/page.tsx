"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckIcon } from "@/components/Icons";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      router.push("/login?reset=success");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2 text-center">تعيين كلمة مرور جديدة</h1>
      <p className="text-sm text-text-muted text-center mb-8">أدخل كلمة المرور الجديدة لحسابك</p>

      <form onSubmit={handleSubmit} className="bg-surface rounded-3xl border border-border/50 p-8 shadow-xl space-y-4">
        {error && <p className="text-red-500 text-xs text-center bg-red-500/10 p-3 rounded-xl">{error}</p>}

        <div>
          <label className="text-xs font-medium text-text-muted block mb-1.5">كلمة المرور الجديدة</label>
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
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckIcon size={16} /> حفظ</>}
        </button>
      </form>
    </div>
  );
}
