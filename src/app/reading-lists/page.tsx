"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Article } from "@/lib/types";
import Link from "next/link";
import WorkCard from "@/components/WorkCard";
import { BookmarkIcon, ClockIcon, CheckIcon, BookOpenIcon } from "@/components/Icons";

const tabs = [
  { key: "want_to_read", label: "أريد قراءته", icon: BookmarkIcon },
  { key: "reading", label: "أقرأه الآن", icon: ClockIcon },
  { key: "finished", label: "أنهيت قراءته", icon: CheckIcon },
];

export default function ReadingListsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<Record<string, Article[]>>({ want_to_read: [], reading: [], finished: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("want_to_read");

  useEffect(() => { document.title = "قوائم القراءة | مجلة السُّدفة"; }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      const { data: entries } = await supabase
        .from("reading_lists")
        .select("article_id, list_type")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (!entries || entries.length === 0) { setLoading(false); return; }

      const grouped: Record<string, string[]> = { want_to_read: [], reading: [], finished: [] };
      for (const e of entries) {
        if (grouped[e.list_type]) grouped[e.list_type].push(e.article_id);
      }

      const allIds = [...new Set(entries.map((e) => e.article_id))];
      const { data: arts } = await supabase
        .from("articles")
        .select("*")
        .in("id", allIds)
        .eq("status", "published");

      const articleMap = new Map((arts || []).map((a: any) => [a.id, {
        id: a.id, title: a.title, content: a.content, excerpt: a.excerpt || "",
        section: a.section, date: a.published_at || a.created_at,
        author: a.author_name || "السُّدفة", readTime: a.read_time || "3 دقائق",
      }]));

      setLists({
        want_to_read: (grouped.want_to_read.map((id) => articleMap.get(id)).filter(Boolean) as Article[]),
        reading: (grouped.reading.map((id) => articleMap.get(id)).filter(Boolean) as Article[]),
        finished: (grouped.finished.map((id) => articleMap.get(id)).filter(Boolean) as Article[]),
      });
      setLoading(false);
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpenIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">قوائم القراءة</h1>
          <p className="text-sm text-text-muted mb-6">سجّل الدخول لإدارة قوائم قراءتك</p>
          <Link href="/login" className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">قوائم القراءة</span>
      </nav>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-10 rounded-full bg-accent" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)]">قوائم القراءة</h1>
          <p className="text-sm text-text-muted mt-1">نظّم قراءاتك حسب ما تريد</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-8 border-b border-border/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = lists[tab.key]?.length || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.key ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              <span className="text-[11px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : (lists[activeTab] || []).length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <BookmarkIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <p className="text-text-muted mb-4">لا توجد أعمال في هذه القائمة</p>
          <Link href="/archive" className="text-sm text-accent hover:text-accent-dark transition-colors">تصفح الأعمال</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(lists[activeTab] || []).map((a) => <WorkCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}
