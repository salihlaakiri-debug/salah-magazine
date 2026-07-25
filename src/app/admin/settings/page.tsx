"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { SettingsIcon, CheckIcon, AlertIcon } from "@/components/Icons";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [siteName, setSiteName] = useState("صلاح");
  const [siteDesc, setSiteDesc] = useState("مجلة أدبية عربية");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
            عام
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">اسم المجلة</label>
              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">الوصف</label>
              <textarea
                value={siteDesc}
                onChange={(e) => setSiteDesc(e.target.value)}
                rows={2}
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
            <button
              onClick={toggle}
              className={`w-14 h-7 rounded-full transition-all relative ${
                theme === "dark" ? "bg-accent" : "bg-border"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-all ${
                theme === "dark" ? "right-1" : "right-7"
              }`} />
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <AlertIcon size={18} className="text-amber-500" />
            الأمان
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="اتركها فارغة إذا لا تريد التغيير"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20"
          >
            {saved ? <><CheckIcon size={16} /> تم الحفظ</> : "حفظ الإعدادات"}
          </button>
          <button
            onClick={async () => { await signOut(); }}
            className="px-6 py-3 rounded-xl border border-red-500/30 text-red-500 font-medium hover:bg-red-500/10 transition-all text-sm"
          >
            خروج من لوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
}
