"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { SECTIONS, Section } from "@/lib/types";
import RichEditor from "@/components/RichEditor";
import { TagInput } from "@/components/TagBadge";
import { PenIcon, CheckIcon, SaveIcon } from "@/components/Icons";

export default function SubmitPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [section, setSection] = useState<Section>("نثر");
  const [readTime, setReadTime] = useState("3 دقائق");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Word/character count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!user || !title.trim() || !content.trim()) return;

    autoSaveTimer.current = setTimeout(async () => {
      const draftKey = isEditing ? `draft-${editId}` : "draft-new";
      const draft = { title, content, excerpt, section, readTime, tags, savedAt: new Date().toISOString() };
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setAutoSaved(true);
      setLastSaved(new Date());
      setTimeout(() => setAutoSaved(false), 2000);
    }, 30000);

    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, content, excerpt, section, readTime, tags, user, isEditing, editId]);

  // Load draft on mount
  useEffect(() => {
    if (!user) return;
    const draftKey = isEditing ? `draft-${editId}` : "draft-new";
    const saved = localStorage.getItem(draftKey);
    if (saved && !title) {
      try {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.content) setContent(draft.content);
        if (draft.excerpt) setExcerpt(draft.excerpt);
        if (draft.section) setSection(draft.section);
        if (draft.readTime) setReadTime(draft.readTime);
        if (draft.tags) setTags(draft.tags);
      } catch {}
    }
  }, [user, isEditing, editId]);

  // Manual save
  const saveDraft = useCallback(() => {
    const draftKey = isEditing ? `draft-${editId}` : "draft-new";
    const draft = { title, content, excerpt, section, readTime, tags, savedAt: new Date().toISOString() };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setAutoSaved(true);
    setLastSaved(new Date());
    setTimeout(() => setAutoSaved(false), 2000);
  }, [title, content, excerpt, section, readTime, tags, isEditing, editId]);

  useEffect(() => {
    if (editId && user) {
      setLoadingArticle(true);
      supabase
        .from("articles")
        .select("*")
        .eq("id", editId)
        .eq("author_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setTitle(data.title);
            setContent(data.content);
            setExcerpt(data.excerpt || "");
            setSection(data.section as Section);
            setReadTime(data.read_time || "3 دقائق");
          }
          setLoadingArticle(false);
        });
    }
  }, [editId, user]);

  if (loading || loadingArticle) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <PenIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <h2 className="text-xl font-bold mb-2">سجّل الدخول أولاً</h2>
          <p className="text-sm text-text-muted mb-4">تحتاج إلى حساب لنشر أعمالك الأدبية</p>
          <Link href="/login" className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("العنوان والمحتوى مطلوبان"); return; }

    setSubmitting(true);
    setError("");

    if (isEditing) {
      const { error: updateError } = await supabase
        .from("articles")
        .update({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.trim().replace(/[#*>\-!\[\]()]/g, "").slice(0, 200),
          section,
          read_time: readTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editId)
        .eq("author_id", user.id);

      if (updateError) {
        setError("حدث خطأ أثناء التعديل. حاول مرة أخرى.");
        setSubmitting(false);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/my-works"), 2000);
      }
    } else {
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
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div className="animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <CheckIcon size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">{isEditing ? "تم التعديل بنجاح!" : "تم الإرسال بنجاح!"}</h2>
          <p className="text-sm text-text-muted">{isEditing ? "تم حفظ التعديلات على عملك" : "سيتم مراجعة عملك من قبل المشرفين ونشره قريباً"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">{isEditing ? "تعديل العمل" : "إرسال عمل جديد"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="text-red-500 text-xs bg-red-500/10 p-3 rounded-xl">{error}</p>}

        <div className="bg-surface rounded-2xl border border-border/50 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">عنوان العمل *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="عنوان عملك الأدبي" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">الوسوم (حد أقصى 5)</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-text-muted">المحتوى *</label>
            <div className="flex items-center gap-3 text-[11px] text-text-muted">
              {lastSaved && (
                <span className="flex items-center gap-1">
                  <SaveIcon size={10} />
                  آخر حفظ: {lastSaved.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <span>{wordCount} كلمة</span>
              <span>{charCount} حرف</span>
            </div>
          </div>
          <RichEditor value={content} onChange={setContent} placeholder="اكتب محتواك هنا... يمكنك استخدام **غامق** و *مائل* و ## عنوان" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={saveDraft} className="px-5 py-3.5 rounded-xl border border-border bg-surface font-medium text-sm hover:bg-surface-hover transition-all flex items-center gap-2">
            <SaveIcon size={14} />
            حفظ مسودة
          </button>
          <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><PenIcon size={16} /> {isEditing ? "حفظ التعديلات" : "إرسال للمراجعة"}</>}
          </button>
        </div>

        {autoSaved && (
          <p className="text-center text-xs text-accent animate-fade-in">تم حفظ المسودة تلقائياً</p>
        )}
      </form>
    </div>
  );
}
