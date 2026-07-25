"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { SECTIONS, Section } from "@/lib/types";
import RichEditor from "@/components/RichEditor";
import { PenIcon, CheckIcon } from "@/components/Icons";

export default function SubmitPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [section, setSection] = useState<Section>("نثر");
  const [readTime, setReadTime] = useState("3 دقائق");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <PenIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <h2 className="text-xl font-bold mb-2">سجّل الدخول أولاً</h2>
          <p className="text-sm text-text-muted mb-4">تحتاج إلى حساب لنشر أعمالك الأدبية</p>
          <a href="/login" className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all">تسجيل الدخول</a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("العنوان والمحتوى مطلوبان"); return; }

    setSubmitting(true);
    setError("");

    const { error: insertError } = await supabase.from("articles").insert({
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || content.trim().replace(/[#*>\-!\[\]()]/g, "").slice(0, 200),
      section,
      author_id: user.id,
      author_name: profile?.display_name || profile?.username || "مجهول",
      status: "pending",
      read_time: readTime,
    });

    if (insertError) {
      setError("حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
      setSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/my-works"), 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div className="animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <CheckIcon size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">تم الإرسال بنجاح!</h2>
          <p className="text-sm text-text-muted">سيتم مراجعة عملك من قبل المشرفين ونشره قريباً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">إرسال عمل جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="text-red-500 text-xs bg-red-500/10 p-3 rounded-xl">{error}</p>}

        <div className="bg-surface rounded-2xl border border-border/50 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">عنوان العمل *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="عنوان عملك الأدبي" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">القسم *</label>
              <select value={section} onChange={(e) => setSection(e.target.value as Section)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                {SECTIONS.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">وقت القراءة</label>
              <select value={readTime} onChange={(e) => setReadTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                <option>دقيقة واحدة</option>
                <option>3 دقائق</option>
                <option>5 دقائق</option>
                <option>8 دقائق</option>
                <option>10 دقائق</option>
                <option>15 دقيقة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">المقتطف (اختياري)</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" placeholder="جملة قصيرة تلخص عملك..." />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-text-muted block mb-2">المحتوى *</label>
          <RichEditor value={content} onChange={setContent} placeholder="اكتب محتواك هنا... يمكنك استخدام **غامق** و *مائل* و ## عنوان" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><PenIcon size={16} /> إرسال للمراجعة</>}
          </button>
        </div>
      </form>
    </div>
  );
}
