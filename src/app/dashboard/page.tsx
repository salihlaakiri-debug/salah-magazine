"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Article, SECTIONS } from "@/lib/types";
import Link from "next/link";
import { FileTextIcon, MessageIcon, HeartIcon, UsersIcon, PlusIcon, ClockIcon, CheckIcon, EyeIcon } from "@/components/Icons";

const sectionColors: Record<string, string> = {
  "شعر": "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
  "قصة": "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
  "نثر": "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
  "مقالات": "from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400",
  "تأملات": "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400",
};

export default function WriterDashboard() {
  const { user, profile } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    published: 0, pending: 0, rejected: 0,
    totalLikes: 0, totalComments: 0, followers: 0, totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "لوحة التحكم | مجلة السُّدفة"; }, []);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: arts } = await supabase
        .from("articles").select("*").eq("author_id", user!.id).order("created_at", { ascending: false });
      setArticles(arts || []);

      const [{ count: published }, { count: pending }, { count: rejected }, { count: followers }] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("author_id", user!.id).eq("status", "published"),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("author_id", user!.id).eq("status", "pending"),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("author_id", user!.id).eq("status", "rejected"),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("author_id", user!.id),
      ]);

      let totalLikes = 0, totalComments = 0, totalViews = 0;
      if (arts && arts.length > 0) {
        const ids = arts.map((a: any) => a.id);
        const [likesRes, commentsRes, viewsRes] = await Promise.all([
          supabase.from("likes").select("*", { count: "exact", head: true }).in("article_id", ids),
          supabase.from("comments").select("*", { count: "exact", head: true }).in("article_id", ids),
          supabase.from("article_views").select("*", { count: "exact", head: true }).in("article_id", ids),
        ]);
        totalLikes = likesRes.count || 0;
        totalComments = commentsRes.count || 0;
        totalViews = viewsRes.count || 0;
      }

      setStats({
        published: published || 0, pending: pending || 0, rejected: rejected || 0,
        totalLikes, totalComments, followers: followers || 0, totalViews,
      });
      setLoading(false);
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <FileTextIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">لوحة الكاتب</h1>
          <p className="text-sm text-text-muted mb-6">سجّل الدخول للوصول إلى لوحة التحكم</p>
          <Link href="/login" className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  const sectionBreakdown = SECTIONS.map(s => ({
    name: s.name,
    count: articles.filter(a => a.section === s.name).length,
  })).filter(s => s.count > 0);

  const topArticles = [...articles]
    .filter(a => a.status === "published")
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-heading)]">لوحة الكاتب</h1>
          <p className="text-sm text-text-muted mt-1">مرحباً {profile?.display_name || profile?.username}</p>
        </div>
        <Link href="/submit" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all flex items-center gap-2 shadow-lg shadow-accent/20">
          <PlusIcon size={16} /> عمل جديد
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Main stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {[
              { label: "منشور", value: stats.published, icon: CheckIcon, color: "from-emerald-500 to-teal-600" },
              { label: "قيد المراجعة", value: stats.pending, icon: ClockIcon, color: "from-amber-500 to-orange-600" },
              { label: "مشاهدات", value: stats.totalViews, icon: EyeIcon, color: "from-sky-500 to-blue-600" },
              { label: "إعجابات", value: stats.totalLikes, icon: HeartIcon, color: "from-red-500 to-pink-600" },
              { label: "تعليقات", value: stats.totalComments, icon: MessageIcon, color: "from-violet-500 to-purple-600" },
              { label: "متابِعون", value: stats.followers, icon: UsersIcon, color: "from-blue-500 to-indigo-600" },
            ].map((s, i) => (
              <div key={i} className="bg-surface rounded-2xl border border-border/50 p-4">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg mb-2`}>
                  <s.icon size={16} />
                </div>
                <p className="text-xl font-bold font-[var(--font-heading)]">{s.value}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-10">
            {/* Section breakdown */}
            <div className="bg-surface rounded-2xl border border-border/50 p-6">
              <h3 className="text-sm font-bold font-[var(--font-heading)] mb-4">التوزيع حسب الأقسام</h3>
              {sectionBreakdown.length === 0 ? (
                <p className="text-xs text-text-muted">لا توجد أعمال بعد</p>
              ) : (
                <div className="space-y-3">
                  {sectionBreakdown.map((s) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-14 shrink-0">{s.name}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-accent/5 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-l" style={{
                          width: `${(s.count / Math.max(...sectionBreakdown.map(x => x.count), 1)) * 100}%`,
                          background: "linear-gradient(270deg, #2d3561, #5b6abf)"
                        }} />
                      </div>
                      <span className="text-[11px] text-text-muted w-5 text-left">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top articles */}
            <div className="bg-surface rounded-2xl border border-border/50 p-6 lg:col-span-2">
              <h3 className="text-sm font-bold font-[var(--font-heading)] mb-4">أحدث الأعمال المنشورة</h3>
              {topArticles.length === 0 ? (
                <p className="text-xs text-text-muted">لم تنشر أي أعمال بعد</p>
              ) : (
                <div className="space-y-2">
                  {topArticles.map((a) => (
                    <Link key={a.id} href={`/work/${a.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all group">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${sectionColors[a.section] || ""}`}>
                        {a.section}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate group-hover:text-accent transition-colors">{a.title}</span>
                      <span className="text-[11px] text-text-muted shrink-0">
                        {new Date(a.published_at || a.created_at).toLocaleDateString("ar-SA")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All articles */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-accent" />
            <h2 className="text-xl font-bold font-[var(--font-heading)]">جميع أعمالي</h2>
            <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border/50">{articles.length}</span>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border/30">
              <FileTextIcon size={40} className="mx-auto text-text-muted/20 mb-3" />
              <p className="text-sm text-text-muted mb-4">لم تنشر أي أعمال بعد</p>
              <Link href="/submit" className="text-sm text-accent hover:text-accent-dark transition-colors">أرسل عملك الأول</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/work/${a.id}`} className="group block">
                  <div className="bg-surface rounded-2xl border border-border/50 p-5 hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${sectionColors[a.section] || ""}`}>
                        {a.section}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        a.status === "published" ? "bg-emerald-500/10 text-emerald-600" :
                        a.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                        a.status === "rejected" ? "bg-red-500/10 text-red-600" :
                        "bg-border/50 text-text-muted"
                      }`}>
                        {a.status === "published" ? "منشور" : a.status === "pending" ? "قيد المراجعة" : a.status === "rejected" ? "مرفوض" : "مسودة"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-[var(--font-heading)] mt-3 group-hover:text-accent transition-colors">{a.title}</h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-1">{a.excerpt}</p>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-text-muted">
                      <span>{new Date(a.created_at).toLocaleDateString("ar-SA")}</span>
                      <span>{a.read_time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
