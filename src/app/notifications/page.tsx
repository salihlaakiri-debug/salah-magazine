"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { BellIcon, HeartIcon, MessageIcon, UsersIcon, BookmarkIcon, RssIcon, CheckIcon } from "@/components/Icons";

const typeIcons: Record<string, { icon: any; color: string; bg: string }> = {
  like: { icon: HeartIcon, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
  comment: { icon: MessageIcon, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
  follow: { icon: UsersIcon, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  publish: { icon: RssIcon, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  bookmark: { icon: BookmarkIcon, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
};

const typeLabels: Record<string, string> = {
  like: "إعجاب",
  comment: "تعليق",
  follow: "متابعة",
  publish: "عمل جديد",
  bookmark: "حفظ",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 30;

  useEffect(() => { document.title = "الإشعارات | مجلة السُّدفة"; }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadNotifications();
  }, [user, filter, page]);

  async function loadNotifications() {
    setLoading(true);
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filter !== "all") {
      query = query.eq("type", filter);
    }

    const { data } = await query;
    if (page === 0) {
      setNotifications(data || []);
    } else {
      setNotifications((prev) => [...prev, ...(data || [])]);
    }
    setHasMore((data || []).length === PAGE_SIZE);
    setLoading(false);
  }

  const markAllRead = async () => {
    if (!user) return;
    await supabase.rpc("mark_notifications_read", { p_user_id: user.id });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <BellIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">الإشعارات</h1>
          <p className="text-sm text-text-muted mb-6">سجّل الدخول لرؤية إشعاراتك</p>
          <Link href="/login" className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">الإشعارات</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full bg-accent" />
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)]">الإشعارات</h1>
            <p className="text-sm text-text-muted mt-1">
              {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-accent hover:text-accent-dark transition-colors flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-accent/5">
            <CheckIcon size={14} /> قراءة الكل
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[{ key: "all", label: "الكل" }, ...Object.entries(typeLabels).map(([key, label]) => ({ key, label }))].map((t) => (
          <button key={t.key} onClick={() => { setFilter(t.key); setPage(0); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
              filter === t.key ? "border-accent bg-accent/10 text-accent font-medium" : "border-border/50 text-text-muted hover:border-accent/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && page === 0 ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <BellIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <p className="text-text-muted">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => {
            const meta = typeIcons[n.type] || { icon: BellIcon, color: "text-text-muted", bg: "bg-surface-hover" };
            const IconComponent = meta.icon;
            return (
              <Link
                key={n.id}
                href={n.article_id ? `/work/${n.article_id}` : "#"}
                onClick={() => { if (!n.read) markAsRead(n.id); }}
                className={`group flex items-start gap-4 p-4 rounded-2xl transition-all ${
                  !n.read ? "bg-accent/5 border border-accent/10" : "hover:bg-surface-hover border border-transparent"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 ${meta.color}`}>
                  <IconComponent size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!n.read ? "font-medium" : ""}`}>{n.message}</p>
                  <p className="text-[11px] text-text-muted mt-1.5 flex items-center gap-2">
                    <span>{new Date(n.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    {n.type && <span className="px-1.5 py-0.5 rounded-full bg-surface-hover text-[10px]">{typeLabels[n.type] || n.type}</span>}
                  </p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-3" />}
              </Link>
            );
          })}

          {hasMore && (
            <div className="text-center pt-6 pb-4">
              <button onClick={() => setPage((p) => p + 1)} disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-surface border border-border/50 text-sm text-text-muted hover:text-foreground hover:border-accent/30 transition-all disabled:opacity-50"
              >
                {loading ? "جاري التحميل..." : "عرض المزيد"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
