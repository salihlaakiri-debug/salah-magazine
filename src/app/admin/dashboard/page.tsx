"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { SECTIONS } from "@/lib/types";
import Link from "next/link";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import {
  BarChartIcon, FileTextIcon, MessageIcon, TrendingUpIcon,
  ClockIcon, UsersIcon, MailIcon, EyeIcon, HeartIcon,
  StarIcon, TrendingIcon, PenIcon,
} from "@/components/Icons";

interface DashboardStats {
  articles: number; pending: number; comments: number; users: number;
  subscribers: number; totalViews: number; unreadMessages: number;
  totalLikes: number; writers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    articles: 0, pending: 0, comments: 0, users: 0,
    subscribers: 0, totalViews: 0, unreadMessages: 0,
    totalLikes: 0, writers: 0,
  });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [topAuthors, setTopAuthors] = useState<any[]>([]);
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>({});
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [recentViews, setRecentViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewsData, setViewsData] = useState<{ day: string; count: number }[]>([]);

  const loadDashboard = useCallback(async () => {
    const [
      { count: articles }, { count: comments }, { count: users },
      { count: pending }, { count: subscribers }, { count: unreadMessages },
      { count: totalLikes }, { count: writers },
    ] = await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("subscribers").select("*", { count: "exact", head: true }).eq("confirmed", true).eq("unsubscribed", false),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
      supabase.from("likes").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["writer", "admin"]),
    ]);

    let totalViews = 0;
    try {
      const { count: views } = await supabase.from("article_views").select("*", { count: "exact", head: true });
      totalViews = views || 0;
    } catch {}

    setStats({
      articles: articles || 0, comments: comments || 0, users: users || 0,
      pending: pending || 0, subscribers: subscribers || 0, totalViews,
      unreadMessages: unreadMessages || 0, totalLikes: totalLikes || 0,
      writers: writers || 0,
    });

    const [{ data: recent }, { data: recentC }] = await Promise.all([
      supabase.from("articles")
        .select("id, title, section, status, created_at, author_name, visibility")
        .order("created_at", { ascending: false }).limit(8),
      supabase.from("comments")
        .select("id, article_id, author_name, content, created_at")
        .order("created_at", { ascending: false }).limit(5),
    ]);
    setRecentArticles(recent || []);
    setRecentComments(recentC || []);

    const counts: Record<string, number> = {};
    for (const s of SECTIONS) {
      const { count } = await supabase.from("articles")
        .select("*", { count: "exact", head: true })
        .eq("section", s.name).eq("status", "published");
      counts[s.name] = count || 0;
    }
    setSectionCounts(counts);

    const { data: authors } = await supabase
      .from("articles")
      .select("author_name, author_id")
      .eq("status", "published");
    const authorCounts: Record<string, { count: number; id: string }> = {};
    (authors || []).forEach((a: any) => {
      const key = a.author_name || "مجهول";
      if (!authorCounts[key]) authorCounts[key] = { count: 0, id: a.author_id };
      authorCounts[key].count++;
    });
    setTopAuthors(
      Object.entries(authorCounts)
        .map(([name, data]) => ({ name, count: data.count, id: data.id }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRealtimeEvent = useCallback((payload: any) => {
    const table = payload.table;
    const eventType = payload.eventType;
    const record = payload.new;
    const oldRecord = payload.old;

    if (table === "articles") {
      loadDashboard();
    } else if (table === "comments") {
      if (eventType === "INSERT") {
        setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
        setRecentComments(prev => [record, ...prev].slice(0, 5));
      } else if (eventType === "DELETE") {
        setStats(prev => ({ ...prev, comments: Math.max(0, prev.comments - 1) }));
        setRecentComments(prev => prev.filter(c => c.id !== oldRecord.id));
      }
    } else if (table === "contact_messages") {
      if (eventType === "INSERT") {
        setStats(prev => ({ ...prev, unreadMessages: prev.unreadMessages + 1 }));
      } else if (eventType === "UPDATE" && record.read) {
        setStats(prev => ({ ...prev, unreadMessages: Math.max(0, prev.unreadMessages - 1) }));
      } else if (eventType === "UPDATE" && !record.read) {
        setStats(prev => ({ ...prev, unreadMessages: prev.unreadMessages + 1 }));
      }
    } else if (table === "subscribers") {
      if (eventType === "INSERT" && record.confirmed) {
        setStats(prev => ({ ...prev, subscribers: prev.subscribers + 1 }));
      } else if (eventType === "UPDATE") {
        if (record.confirmed && !oldRecord.confirmed) {
          setStats(prev => ({ ...prev, subscribers: prev.subscribers + 1 }));
        } else if (!record.confirmed && oldRecord.confirmed) {
          setStats(prev => ({ ...prev, subscribers: Math.max(0, prev.subscribers - 1) }));
        }
      } else if (eventType === "DELETE" && oldRecord.confirmed) {
        setStats(prev => ({ ...prev, subscribers: Math.max(0, prev.subscribers - 1) }));
      }
    } else if (table === "profiles") {
      if (eventType === "INSERT") {
        setStats(prev => ({ ...prev, users: prev.users + 1 }));
        if (record.role === "writer" || record.role === "admin") {
          setStats(prev => ({ ...prev, writers: prev.writers + 1 }));
        }
      } else if (eventType === "UPDATE") {
        if (record.role === "writer" || record.role === "admin") {
          if (oldRecord.role !== "writer" && oldRecord.role !== "admin") {
            setStats(prev => ({ ...prev, writers: prev.writers + 1 }));
          }
        } else {
          if (oldRecord.role === "writer" || oldRecord.role === "admin") {
            setStats(prev => ({ ...prev, writers: Math.max(0, prev.writers - 1) }));
          }
        }
      }
    } else if (table === "likes") {
      if (eventType === "INSERT") {
        setStats(prev => ({ ...prev, totalLikes: prev.totalLikes + 1 }));
      } else if (eventType === "DELETE") {
        setStats(prev => ({ ...prev, totalLikes: Math.max(0, prev.totalLikes - 1) }));
      }
    } else if (table === "article_views") {
      if (eventType === "INSERT") {
        setStats(prev => ({ ...prev, totalViews: prev.totalViews + 1 }));
      }
    }
  }, []);

  useAdminRealtime("admin-dashboard", [
    { table: "articles", event: "INSERT" },
    { table: "articles", event: "UPDATE" },
    { table: "articles", event: "DELETE" },
    { table: "comments", event: "INSERT" },
    { table: "comments", event: "DELETE" },
    { table: "contact_messages", event: "INSERT" },
    { table: "contact_messages", event: "UPDATE" },
    { table: "subscribers", event: "INSERT" },
    { table: "subscribers", event: "UPDATE" },
    { table: "subscribers", event: "DELETE" },
    { table: "profiles", event: "INSERT" },
    { table: "profiles", event: "UPDATE" },
    { table: "likes", event: "INSERT" },
    { table: "likes", event: "DELETE" },
    { table: "article_views", event: "INSERT" },
  ], handleRealtimeEvent);

  const statCards = [
    { label: "المقالات", value: stats.articles, icon: FileTextIcon, color: "from-blue-500 to-indigo-600", link: "/admin/articles" },
    { label: "قيد المراجعة", value: stats.pending, icon: ClockIcon, color: "from-amber-500 to-orange-600", link: "/admin/submissions" },
    { label: "التعليقات", value: stats.comments, icon: MessageIcon, color: "from-emerald-500 to-teal-600", link: "/admin/comments" },
    { label: "المستخدمون", value: stats.users, icon: UsersIcon, color: "from-purple-500 to-violet-600", link: "/admin/users" },
    { label: "الكتّاب", value: stats.writers, icon: PenIcon, color: "from-rose-500 to-pink-600", link: "/admin/users" },
    { label: "المشتركون", value: stats.subscribers, icon: MailIcon, color: "from-cyan-500 to-blue-600", link: "/admin/subscribers" },
    { label: "مشاهدات", value: stats.totalViews, icon: EyeIcon, color: "from-indigo-500 to-purple-600" },
    { label: "إعجابات", value: stats.totalLikes, icon: HeartIcon, color: "from-red-500 to-rose-600" },
    { label: "رسائل غير مقروءة", value: stats.unreadMessages, icon: MailIcon, color: "from-rose-500 to-pink-600", link: "/admin/messages" },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">لوحة التحكم</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {statCards.map((s, i) => (
          <Link key={i} href={s.link || "#"} className={`bg-surface rounded-2xl border border-border/50 p-5 card-hover ${!s.link ? "cursor-default" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                <s.icon size={18} />
              </div>
              {(s.label === "قيد المراجعة" || s.label === "رسائل غير مقروءة") && s.value > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <p className="text-2xl font-bold font-[var(--font-heading)]">{s.value.toLocaleString()}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
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
                    <span className="text-xs text-text-muted">{count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-l from-accent to-accent-light transition-all duration-1000" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <StarIcon size={18} className="text-amber-500" />
            أكثر الكتّاب نشراً
          </h3>
          {topAuthors.length === 0 ? (
            <p className="text-sm text-text-muted">لا يوجد كتاب بعد</p>
          ) : (
            <div className="space-y-3">
              {topAuthors.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover transition-colors">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-amber-500/20 text-amber-600" :
                    i === 1 ? "bg-gray-400/20 text-gray-500" :
                    i === 2 ? "bg-orange-500/20 text-orange-600" :
                    "bg-accent/5 text-text-muted"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                  </div>
                  <span className="text-xs text-text-muted">{a.count} مقال{a.count > 1 ? "ات" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <ClockIcon size={18} className="text-accent" />
            آخر الأعمال
          </h3>
          <div className="space-y-2">
            {recentArticles.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  a.status === "published" ? "bg-emerald-500" :
                  a.status === "pending" ? "bg-amber-500" : "bg-border"
                }`} />
                <Link href={`/work/${a.id}`} target="_blank" className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate hover:text-accent transition-colors">{a.title}</p>
                  <p className="text-[11px] text-text-muted">
                    {a.section} · {a.author_name} · {new Date(a.created_at).toLocaleDateString("ar-SA")}
                    {a.visibility && a.visibility !== "public" && (
                      <span className={`mr-1 ${a.visibility === "private" ? "text-rose-500" : "text-amber-500"}`}>
                        · {a.visibility === "private" ? "خاص" : "متابعون"}
                      </span>
                    )}
                  </p>
                </Link>
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
                      <span className="text-[10px] text-text-muted">{new Date(c.created_at).toLocaleDateString("ar-SA")}</span>
                    </div>
                    <p className="text-xs text-foreground/80 line-clamp-2">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
