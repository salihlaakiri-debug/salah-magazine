"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MailIcon, DownloadIcon, CheckIcon, XIcon, TrashIcon } from "@/components/Icons";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "confirmed" | "unconfirmed">("all");

  useEffect(() => { fetchSubscribers(); }, []);

  async function fetchSubscribers() {
    setLoading(true);
    const { data } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    setSubscribers(data || []);
    setLoading(false);
  }

  async function deleteSub(id: string) {
    if (!confirm("حذف المشترك؟")) return;
    await supabase.from("subscribers").delete().eq("id", id);
    setSubscribers(prev => prev.filter(s => s.id !== id));
  }

  async function toggleConfirm(sub: any) {
    await supabase.from("subscribers")
      .update({ confirmed: !sub.confirmed })
      .eq("id", sub.id);
    setSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, confirmed: !s.confirmed } : s));
  }

  function exportCSV() {
    const header = "البريد الإلكتروني,الاسم,تاريخ الاشتراك,مؤكد\n";
    const rows = filtered.map(s =>
      `${s.email},${s.name || ""},${new Date(s.created_at).toLocaleDateString("ar-SA")},${s.confirmed ? "نعم" : "لا"}`
    ).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = subscribers.filter(s => {
    if (filter === "confirmed") return s.confirmed;
    if (filter === "unconfirmed") return !s.confirmed;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-accent" />
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">المشتركون</h1>
          <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border/50">{subscribers.length}</span>
        </div>
        {subscribers.length > 0 && (
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20"
          >
            <DownloadIcon size={16} />
            تصدير CSV
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "confirmed", "unconfirmed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === f ? "bg-accent text-white" : "bg-surface border border-border/50 text-text-muted hover:bg-surface-hover"
            }`}
          >
            {f === "all" ? "الكل" : f === "confirmed" ? "مؤكد" : "غير مؤكد"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <MailIcon size={48} className="mx-auto text-text-muted mb-4 opacity-30" />
          <p className="text-text-muted">لا يوجد مشتركون</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="bg-surface rounded-2xl border border-border/50 p-4 flex items-center gap-4 card-hover">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                s.confirmed ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
              }`}>
                <MailIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-sm">{s.email}</span>
                  {s.name && <span className="text-xs text-text-muted">({s.name})</span>}
                </div>
                <p className="text-[11px] text-text-muted">
                  اشترك في {new Date(s.created_at).toLocaleDateString("ar-SA")}
                  {s.confirmed ? " · البريد مؤكد" : " · البريد غير مؤكد"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => toggleConfirm(s)}
                  className={`p-2 rounded-lg transition-all ${
                    s.confirmed ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                  }`}
                  title={s.confirmed ? "إلغاء التأكيد" : "تأكيد"}
                >
                  {s.confirmed ? <XIcon size={14} /> : <CheckIcon size={14} />}
                </button>
                <button onClick={() => deleteSub(s.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all"
                  title="حذف"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
