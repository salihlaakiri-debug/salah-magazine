"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Article } from "@/lib/types";
import Link from "next/link";
import WorkCard from "@/components/WorkCard";
import { ClockIcon, BookOpenIcon } from "@/components/Icons";

export default function ReadingHistoryPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "سجل القراءة | مجلة السُّدفة"; }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      const { data: views } = await supabase
        .from("article_views")
        .select("article_id, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (!views || views.length === 0) { setLoading(false); return; }

      const uniqueIds = [...new Set(views.map((v) => v.article_id))];
      const { data: arts } = await supabase
        .from("articles")
        .select("*")
        .in("id", uniqueIds)
        .eq("status", "published");

      const viewMap = new Map(views.map((v) => [v.article_id, v.created_at]));
      const sorted = (arts || [])
        .sort((a, b) => {
          const aTime = viewMap.get(a.id) || "";
          const bTime = viewMap.get(b.id) || "";
          return bTime.localeCompare(aTime);
        })
        .map((a: any) => ({
          id: a.id, title: a.title, content: a.content, excerpt: a.excerpt || "",
          section: a.section, date: a.published_at || a.created_at,
          author: a.author_name || "السُّدفة", readTime: a.read_time || "3 دقائق",
        }));

      setArticles(sorted);
      setLoading(false);
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpenIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">سجل القراءة</h1>
          <p className="text-sm text-text-muted mb-6">سجّل الدخول لرؤية سجل قراءتك</p>
          <Link href="/login" className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">سجل القراءة</span>
      </nav>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-10 rounded-full bg-accent" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)]">سجل القراءة</h1>
          <p className="text-sm text-text-muted mt-1">الأعمال التي اطلعت عليها</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <BookOpenIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <p className="text-text-muted mb-4">لم تقرأ أي أعمال بعد</p>
          <Link href="/archive" className="text-sm text-accent hover:text-accent-dark transition-colors">تصفح الأعمال</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => <WorkCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}
