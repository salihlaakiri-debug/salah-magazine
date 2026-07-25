"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Article } from "@/lib/types";
import { CheckIcon, XIcon, EyeIcon } from "@/components/Icons";
import Link from "next/link";

export default function SubmissionsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Article[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/admin");
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    async function load() {
      const { data } = await supabase.from("articles").select("*").eq("status", "pending").order("created_at", { ascending: false });
      setSubmissions((data || []) as Article[]);
      setLoadingData(false);
    }
    load();
  }, [isAdmin]);

  const updateStatus = async (id: string, status: "published" | "rejected") => {
    await supabase.from("articles").update({ status, published_at: status === "published" ? new Date().toISOString() : null }).eq("id", id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading || !isAdmin) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">المراجعات</h1>
        <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border/50">{submissions.length}</span>
      </div>

      {loadingData ? (
        <div className="text-center py-16"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" /></div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border/30">
          <CheckIcon size={40} className="mx-auto text-emerald-500/20 mb-3" />
          <p className="text-sm text-text-muted">لا توجد أعمال تنتظر المراجعة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="bg-surface rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">{s.section}</span>
                    <span className="text-[11px] text-text-muted">{s.author_name}</span>
                    <span className="text-[11px] text-text-muted">{new Date(s.created_at || "").toLocaleDateString("ar-SA")}</span>
                  </div>
                  <h3 className="font-bold text-sm">{s.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{s.excerpt}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-foreground transition-all"><EyeIcon size={16} /></button>
                  <button onClick={() => updateStatus(s.id, "published")} className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all" title="نشر"><CheckIcon size={14} /></button>
                  <button onClick={() => updateStatus(s.id, "rejected")} className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all" title="رفض"><XIcon size={14} /></button>
                </div>
              </div>
              {expandedId === s.id && (
                <div className="px-5 pb-5 border-t border-border/30 pt-4 animate-fade-in">
                  <div className="prose prose-sm max-w-none text-foreground/80 leading-loose max-h-64 overflow-y-auto">
                    {s.content.split("\n\n").map((p, i) => <p key={i} className="mb-3">{p}</p>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
