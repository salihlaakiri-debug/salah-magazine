"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { BellIcon } from "./Icons";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  message: string;
  article_id: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications(data || []);
      setUnread((data || []).filter((n) => !n.read).length);
    }
    load();

    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const n = payload.new as Notification;
        setNotifications((prev) => [n, ...prev].slice(0, 20));
        setUnread((prev) => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-surface-hover transition-colors"
      >
        <BellIcon size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-80 bg-surface border border-border/50 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <span className="font-bold text-sm font-[var(--font-heading)]">الإشعارات</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-accent hover:text-accent-dark transition-colors">
                  قراءة الكل
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-muted">لا توجد إشعارات</div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={`/work/${n.article_id}`}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border/20 ${
                      !n.read ? "bg-accent/5" : ""
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {new Date(n.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
