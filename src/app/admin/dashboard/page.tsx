"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SECTIONS } from "@/lib/types";
import { BarChartIcon, FileTextIcon, MessageIcon, TrendingUpIcon, ClockIcon, UsersIcon, MailIcon, EyeIcon, TrendingIcon } from "@/components/Icons";

export default function DashboardPage() {
  const [stats, setStats] = useState({ articles: 0, comments: 0, users: 0, pending: 0, subscribers: 0, totalViews: 0, unreadMessages: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>({});
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ count: articles }, { count: comments }, { count: users }, { count: pending }, { count: subscribers }, { count: unreadMessages }] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("subscribers").select("*", { count: "exact", head: true }).eq("confirmed", true).eq("unsubscribed", false),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
      ]);

      let totalViews = 0;
      try {
        const { count: views } = await supabase.from("article_views").select("*", { count: "exact", head: true });
        totalViews = views || 0;
      } catch {}

      setStats({
        articles: articles || 0,
        comments: comments || 0,
        users: users || 0,
        pending: pending || 0,
        subscribers: subscribers || 0,
        totalViews,
        unreadMessages: unreadMessages || 0,
      });

      const { data: recent } = await supabase
        .from("articles")
        .select("id, title, section, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      setRecentArticles(recent || []);

      const { data: recentC } = await supabase
        .from("comments")
        .select("id, article_id, author_name, content, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentComments(recentC || []);

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
    { label: "المشتركون", value: stats.subscribers, icon: MailIcon, color: "from-rose-500 to-pink-600" },
    { label: "مشاهدات", value: stats.totalViews, icon: EyeIcon, color: "from-cyan-500 to-blue-600" },
    { label: "رسائل غير مقروءة", value: stats.unreadMessages, icon: MailIcon, color: "from-rose-500 to-pink-600" },
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

      <div className="mt-6">
        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <MessageIcon size={18} className="text-accent" />
            آخر التعليقات
          </h3>
          {recentComments.length === 0 ? (
            <p className="text-sm text-text-muted">لا توجد تعليقات بعد.</p>
          ) : (
            <div className="space-y-3">
              {recentComments.map((c) => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                    {c.author_name?.[0] || "؟"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold">{c.author_name}</span>
                      <span className="text-[10px] text-text-muted">مقال #{c.article_id.slice(0, 8)}</span>
                    </div>
                    <p className="text-xs text-foreground/80 line-clamp-2">{c.content}</p>
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0">
                    {new Date(c.created_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
