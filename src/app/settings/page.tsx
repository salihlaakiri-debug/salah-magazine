"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { UserProfile } from "@/lib/types";
import AvatarUpload from "@/components/AvatarUpload";
import { showToast } from "@/lib/toast";
import { SaveIcon, AlertIcon, ArrowLeftIcon } from "@/components/Icons";

export default function SettingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  useEffect(() => { document.title = "الإعدادات | مجلة السُّدفة"; }, []);
  const router = useRouter();
  const [form, setForm] = useState({ display_name: "", username: "", bio: "", website: "", twitter: "", instagram: "" });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    loadProfile();
  }, [user, authLoading]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();

    if (data) {
      const p = data as UserProfile;
      setForm({ display_name: p.display_name || "", username: p.username || "", bio: p.bio || "", website: p.website || "", twitter: p.twitter || "", instagram: p.instagram || "" });
      setAvatarUrl(p.avatar_url || "");
      setCoverUrl(p.cover_url || "");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name,
        username: form.username,
        bio: form.bio,
        website: form.website,
        twitter: form.twitter,
        instagram: form.instagram,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
      })
      .eq("id", user!.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
      showToast("حدث خطأ أثناء الحفظ", "error");
    } else {
      setMessage({ type: "success", text: "تم حفظ التغييرات بنجاح" });
      showToast("تم حفظ التغييرات بنجاح", "success");
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  };

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/profile/${profile?.username}`} className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent mb-6 transition-all">
        <ArrowLeftIcon size={16} /> العودة إلى الملف الشخصي
      </Link>

      <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-8">إعدادات الحساب</h1>

      {/* Cover image */}
      <div className="mb-8">
        <label className="text-xs font-medium text-text-muted block mb-2">صورة الغلاف</label>
        <AvatarUpload uid={user!.id} url={coverUrl} onUpload={setCoverUrl} type="cover" />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar + display name row */}
        <div className="flex items-start gap-6">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-2">الصورة الشخصية</label>
            <AvatarUpload uid={user!.id} url={avatarUrl} onUpload={setAvatarUrl} type="avatar" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-text-muted block mb-1.5">الاسم المعروض</label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1.5">اسم المستخدم</label>
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">@</span>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full pr-8 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              dir="ltr"
              required
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1.5">السيرة الذاتية</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          />
        </div>

        {/* Social links */}
        <div className="pt-2 border-t border-border/40">
          <p className="text-xs font-medium text-text-muted mb-4">روابط التواصل</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">الموقع الإلكتروني</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">تويتر</label>
              <input
                type="text"
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                placeholder="username"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">إنستغرام</label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="username"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
            {message.type === "error" && <AlertIcon size={14} />}
            {message.text}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><SaveIcon size={16} /> حفظ التغييرات</>}
        </button>
      </form>
    </div>
  );
}
