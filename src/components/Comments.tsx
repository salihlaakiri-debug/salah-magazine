"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { MessageIcon, PlusIcon, XIcon, CheckIcon } from "./Icons";

export default function Comments({ articleId }: { articleId: string }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });

      setComments((data || []).map((c: any) => ({
        id: c.id,
        articleId: c.article_id,
        user_id: c.user_id,
        name: c.author_name,
        text: c.content,
        date: c.created_at,
      })));
      setLoading(false);
    }
    load();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const authorName = profile?.display_name || profile?.username || "مجهول";

    const { data, error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user?.id || null,
      author_name: authorName,
      content: text.trim(),
    }).select().single();

    if (!error && data) {
      setComments((prev) => [...prev, {
        id: data.id,
        articleId: data.article_id,
        user_id: data.user_id,
        name: data.author_name,
        text: data.content,
        date: data.created_at,
      }]);
      setText("");
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  return (
    <section className="mt-16">
      <div className="section-divider mb-10" />

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold font-[var(--font-heading)] flex items-center gap-2">
          <MessageIcon size={20} className="text-accent" />
          التعليقات
          <span className="text-sm font-normal text-text-muted">({comments.length})</span>
        </h3>
        {!showForm && user && (
          <button onClick={() => setShowForm(true)} className="text-sm text-accent hover:text-accent-dark transition-colors font-medium flex items-center gap-1">
            <PlusIcon size={14} /> تعليق جديد
          </button>
        )}
        {!user && (
          <a href="/login" className="text-sm text-accent hover:text-accent-dark transition-colors font-medium">سجّل للتعليق</a>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-surface rounded-2xl border border-border/50 p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold">
              {profile?.display_name?.[0] || profile?.username?.[0] || "?"}
            </div>
            <span className="text-sm font-medium">{profile?.display_name || profile?.username}</span>
          </div>
          <textarea placeholder="اكتب تعليقك هنا..." value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-sm resize-none mb-4" required />
          <div className="flex items-center gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors shadow-lg shadow-accent/20 flex items-center gap-2">
              <CheckIcon size={14} /> نشر التعليق
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-text-muted hover:text-foreground transition-colors">إلغاء</button>
            {submitted && <span className="text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in">تم النشر بنجاح</span>}
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading && <div className="text-center py-8"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" /></div>}
        {!loading && comments.length === 0 && !showForm && (
          <div className="text-center py-12 bg-surface/50 rounded-2xl border border-border/30">
            <MessageIcon size={40} className="mx-auto text-text-muted mb-3 opacity-30" />
            <p className="text-sm text-text-muted">لا توجد تعليقات بعد.</p>
          </div>
        )}
        {comments.map((c) => (
          <div key={c.id} className="bg-surface/50 border border-border/30 rounded-2xl p-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold">{c.name[0]}</div>
              <div>
                <span className="font-bold text-sm block">{c.name}</span>
                <span className="text-[11px] text-text-muted">{formatDate(c.date)}</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80 pr-12">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
