"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Article, SECTIONS } from "@/lib/types";
import { CheckIcon, XIcon, EyeIcon, MessageIcon } from "@/components/Icons";
import Link from "next/link";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";

export default function SubmissionsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Article[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("الكل");
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/admin");
  }, [user, loading, isAdmin, router]);

  const fetchSubmissions = useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setSubmissions((data || []) as any);
    setLoadingData(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useAdminRealtime("admin-submissions", [
    { table: "articles", event: "INSERT", filter: "status=eq.pending" },
    { table: "articles", event: "UPDATE" },
    { table: "articles", event: "DELETE" },
  ], useCallback((payload: any) => {
    const { eventType, new: record, old: oldRecord } = payload;
    if (eventType === "INSERT" && record.status === "pending") {
      setSubmissions(prev => [record as Article, ...prev]);
      return;
    }
    if (eventType === "UPDATE") {
      if (oldRecord.status === "pending" && record.status !== "pending") {
        setSubmissions(prev => prev.filter(s => s.id !== record.id));
        return;
      }
      if (record.status === "pending" && oldRecord.status !== "pending") {
        setSubmissions(prev => [record as Article, ...prev]);
        return;
      }
    }
    if (eventType === "DELETE" && oldRecord.status === "pending") {
      setSubmissions(prev => prev.filter(s => s.id !== oldRecord.id));
      return;
    }
    fetchSubmissions();
  }, [fetchSubmissions]));

  const updateStatus = async (id: string, status: "published" | "rejected") => {
    if (status === "published") {
      await supabase.from("articles").update({
        status, published_at: new Date().toISOString(),
      }).eq("id", id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } else {
      setRejectConfirm(id);
    }
  };

  const confirmReject = async () => {
    if (!rejectConfirm) return;
    await supabase.from("articles").update({
      status: "rejected",
    }).eq("id", rejectConfirm);
    setSubmissions((prev) => prev.filter((s) => s.id !== rejectConfirm));
    setRejectConfirm(null);
  };

  const filtered = filter === "الكل"
    ? submissions
    : submissions.filter((s) => s.section === filter);

  if (loading || !isAdmin) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">المراجعات</h1>
        <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border/50">{submissions.length}</span>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["الكل", ...SECTIONS.map((s) => s.name)].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === f ? "bg-accent text-white" : "bg-surface border border-border/50 text-text-muted hover:bg-surface-hover"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loadingData ? (
        <div className="text-center py-16"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" /></div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border/30">
          <CheckIcon size={40} className="mx-auto text-emerald-500/20 mb-3" />
          <p className="text-sm text-text-muted">لا توجد أعمال تنتظر المراجعة</p>
          <p className="text-xs text-text-muted mt-1">كل الأعمال تمت مراجعتها</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border/30">
          <MessageIcon size={40} className="mx-auto text-text-muted/20 mb-3" />
          <p className="text-sm text-text-muted">لا توجد أعمال في هذا القسم</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s: any) => (
            <div key={s.id} className="bg-surface rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">{s.section}</span>
                      <span className="text-[11px] text-text-muted">{s.author_name}</span>
                      <span className="text-[11px] text-text-muted">
                        {new Date(s.created_at || "").toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h3 className="font-bold text-base">{s.title}</h3>
                    {s.excerpt && <p className="text-xs text-text-muted mt-1 line-clamp-2">{s.excerpt}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      className={`p-2 rounded-lg transition-all ${expandedId === s.id ? "bg-accent/10 text-accent" : "hover:bg-surface-hover text-text-muted hover:text-foreground"}`}
                    >
                      <EyeIcon size={16} />
                    </button>
                    <button onClick={() => updateStatus(s.id, "published")}
                      className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                      title="نشر">
                      <CheckIcon size={14} />
                    </button>
                    <button onClick={() => updateStatus(s.id, "rejected")}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                      title="رفض">
                      <XIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {expandedId === s.id && (
                <div className="px-5 pb-5 border-t border-border/30 pt-4 animate-fade-in">
                  <div className="text-foreground/80 leading-loose max-h-72 overflow-y-auto text-sm whitespace-pre-wrap bg-background/50 rounded-xl p-4 border border-border/20">
                    {s.content}
                  </div>
                  {s.tags && s.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {s.tags.map((t: any) => (
                        <span key={t.name || t} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/5 text-accent/70">
                          #{t.name || t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setRejectConfirm(null)}>
          <div className="bg-surface rounded-3xl border border-border/50 w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold font-[var(--font-heading)] mb-2">تأكيد الرفض</h3>
            <p className="text-sm text-text-muted mb-4">هل أنت متأكد من رفض هذا العمل؟</p>
            <div className="flex gap-3">
              <button onClick={confirmReject}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
              >
                تأكيد الرفض
              </button>
              <button onClick={() => setRejectConfirm(null)}
                className="px-6 py-3 rounded-xl border border-border bg-background font-medium hover:bg-surface-hover transition-all text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
