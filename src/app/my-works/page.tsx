"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Article } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PenIcon, EyeIcon, EditIcon, TrashIcon, CheckIcon, XIcon } from "@/components/Icons";

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-gray-500/10 text-gray-500" },
  pending: { label: "قيد المراجعة", color: "bg-amber-500/10 text-amber-500" },
  published: { label: "منشور", color: "bg-emerald-500/10 text-emerald-500" },
  rejected: { label: "مرفوض", color: "bg-red-500/10 text-red-500" },
};

export default function MyWorksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { document.title = "أعمالي | مجلة السُّدفة"; }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase.from("articles").select("*").eq("author_id", user!.id).order("created_at", { ascending: false });
      setArticles((data || []) as Article[]);
      setLoadingData(false);
    }
    load();
  }, [user]);

  const deleteArticle = async (id: string) => {
    await supabase.from("articles").delete().eq("id", id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  };

  if (loading || !user) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-accent" />
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">أعمالي</h1>
          <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border/50">{articles.length}</span>
        </div>
        <Link href="/submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20">
          <PenIcon size={16} /> إضافة عمل جديد
        </Link>
      </div>

      {loadingData ? (
        <div className="text-center py-16"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border/30">
          <PenIcon size={40} className="mx-auto text-text-muted/20 mb-3" />
          <p className="text-sm text-text-muted mb-4">لم ترسل أي أعمال بعد</p>
          <Link href="/submit" className="text-sm text-accent hover:text-accent-dark font-medium">أرسل عملك الأول</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => {
            const st = statusLabels[a.status || "draft"];
            return (
              <div key={a.id} className="bg-surface rounded-2xl border border-border/50 p-5 flex items-center gap-4 card-hover">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">{a.section}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    <span className="text-[11px] text-text-muted">{new Date(a.date || a.created_at || "").toLocaleDateString("ar-SA")}</span>
                  </div>
                  <h3 className="font-bold text-sm truncate">{a.title}</h3>
                  <p className="text-xs text-text-muted truncate mt-0.5">{a.excerpt}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {a.status === "published" ? (
                    <Link href={`/work/${a.id}`} target="_blank" className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-foreground transition-all"><EyeIcon size={16} /></Link>
                  ) : (
                    <Link href={`/preview/${a.id}`} target="_blank" className="p-2 rounded-lg hover:bg-amber-500/10 text-text-muted hover:text-amber-500 transition-all"><EyeIcon size={16} /></Link>
                  )}
                  <Link href={`/submit?edit=${a.id}`} className="p-2 rounded-lg hover:bg-accent/10 text-text-muted hover:text-accent transition-all"><EditIcon size={16} /></Link>
                  {a.status !== "published" && (
                    deleteConfirm === a.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteArticle(a.id)} className="p-2 rounded-lg bg-red-500 text-white"><CheckIcon size={14} /></button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-lg bg-border text-foreground"><XIcon size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(a.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all"><TrashIcon size={16} /></button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
