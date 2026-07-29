"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { BellIcon, ChevronDownIcon } from "./Icons";
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
  const [shake, setShake] = useState(false);
  const prevUnread = useRef(unread);
  const panelRef = useRef<HTMLDivElement>(null);

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
        setShake(true);
        setTimeout(() => setShake(false), 600);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (unread > prevUnread.current) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    prevUnread.current = unread;
  }, [unread]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.rpc("mark_notifications_read", { p_user_id: user.id });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-xl hover:bg-surface-hover transition-colors active:scale-90 ${shake ? "animate-heart-beat" : ""}`}
        aria-label="الإشعارات"
      >
        <BellIcon size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pop-in">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-surface border border-border/50 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in origin-top-left">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="font-bold text-sm font-[var(--font-heading)]">الإشعارات</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-accent hover:text-accent-dark transition-colors px-2 py-1 rounded-lg hover:bg-accent/5">
                  قراءة الكل
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-foreground transition-colors p-1 rounded-lg hover:bg-surface-hover">
                <ChevronDownIcon size={14} />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-muted">لا توجد إشعارات</div>
            ) : (
              notifications.map((n, i) => (
                <Link
                  key={n.id}
                  href={n.article_id ? `/work/${n.article_id}` : "#"}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border/20 animate-fade-in ${
                    !n.read ? "bg-accent/5" : ""
                  }`}
                  style={{ animationDelay: `${i * 30}ms`, animationDuration: "0.3s" }}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5 animate-dot-pulse" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${!n.read ? "font-medium" : ""}`}>{n.message}</p>
                      <p className="text-[10px] text-text-muted mt-1">
                        {new Date(n.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-xs text-accent hover:text-accent-dark py-3 border-t border-border/20 font-medium transition-colors hover:bg-accent/5"
          >
            عرض كل الإشعارات
          </Link>
        </div>
      )}
    </div>
  );
}
