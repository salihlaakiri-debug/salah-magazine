"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SECTIONS } from "@/lib/types";
import { BarChartIcon, FileTextIcon, MessageIcon, TrendingUpIcon, ClockIcon, UsersIcon } from "@/components/Icons";

export default function DashboardPage() {
  const [stats, setStats] = useState({ articles: 0, comments: 0, users: 0, pending: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ count: articles }, { count: comments }, { count: users }, { count: pending }] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setStats({
        articles: articles || 0,
        comments: comments || 0,
        users: users || 0,
        pending: pending || 0,
      });

      const { data: recent } = await supabase
        .from("articles")
        .select("id, title, section, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      setRecentArticles(recent || []);

      const counts: Record<string, number> = {};
      for (const s of SECTIONS) {
        const { count } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("section", s.name)
          .eq("status", "published");
        counts[s.name] = count || 0;
      }
      setSectionCounts(counts);
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: "المقالات المنشورة", value: stats.articles, icon: FileTextIcon, color: "from-blue-500 to-indigo-600" },
    { label: "قيد المراجعة", value: stats.pending, icon: ClockIcon, color: "from-amber-500 to-orange-600" },
    { label: "التعليقات", value: stats.comments, icon: MessageIcon, color: "from-emerald-500 to-teal-600" },
    { label: "المستخدمون", value: stats.users, icon: UsersIcon, color: "from-purple-500 to-violet-600" },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">لوحة التحكم</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border/50 p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold font-[var(--font-heading)]">{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <ClockIcon size={18} className="text-accent" />
            آخر الأعمال
          </h3>
          <div className="space-y-3">
            {recentArticles.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${a.status === "published" ? "bg-emerald-500" : a.status === "pending" ? "bg-amber-500" : "bg-border"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-[11px] text-text-muted">{a.section} · {new Date(a.created_at).toLocaleDateString("ar-SA")}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  a.status === "published" ? "bg-emerald-500/10 text-emerald-600" :
                  a.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                  "bg-border/50 text-text-muted"
                }`}>
                  {a.status === "published" ? "منشور" : a.status === "pending" ? "قيد المراجعة" : "مسودة"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <BarChartIcon size={18} className="text-accent" />
            توزيع الأقسام
          </h3>
          <div className="space-y-4">
            {SECTIONS.map((s) => {
              const count = sectionCounts[s.name] || 0;
              const total = stats.articles || 1;
              const percent = (count / total) * 100;
              return (
                <div key={s.slug}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs text-text-muted">{count} أعمال</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
