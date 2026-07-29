"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { SettingsIcon, CheckIcon, AlertIcon } from "@/components/Icons";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, bio").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
      }
    });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      display_name: displayName,
      bio,
    }).eq("id", user.id);
    if (!error) {
      setSaved("تم الحفظ");
      setTimeout(() => setSaved(null), 2000);
    }
  }

  async function handlePasswordChange() {
    if (!newPassword || !user) return;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      setNewPassword("");
      setSaved("تم تغيير كلمة المرور");
      setTimeout(() => setSaved(null), 2000);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">الإعدادات</h1>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <SettingsIcon size={18} className="text-accent" />
            الملف الشخصي
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">الاسم المعروض</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">السيرة</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4">المظهر</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">الوضع الليلي</p>
              <p className="text-xs text-text-muted">تبديل بين الوضع النهاري والليلي</p>
            </div>
            <button onClick={toggle}
              className={`w-14 h-7 rounded-full transition-all relative ${theme === "dark" ? "bg-accent" : "bg-border"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-all ${theme === "dark" ? "right-1" : "right-7"}`} />
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <AlertIcon size={18} className="text-amber-500" />
            الأمان
          </h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-text-muted block mb-1.5">كلمة المرور الجديدة</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="اتركها فارغة إذا لا تريد التغيير"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <button onClick={handlePasswordChange} disabled={!newPassword}
              className="px-5 py-3 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-all disabled:opacity-50"
            >
              تغيير
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20"
          >
            {saved ? <><CheckIcon size={16} /> {saved}</> : "حفظ الإعدادات"}
          </button>
          <button onClick={async () => { await signOut(); }}
            className="px-6 py-3 rounded-xl border border-red-500/30 text-red-500 font-medium hover:bg-red-500/10 transition-all text-sm"
          >
            خروج من لوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
}
