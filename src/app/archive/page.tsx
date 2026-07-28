"use client";

import { useState, useEffect } from "react";
import { Article, SECTIONS } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import WorkCard from "@/components/WorkCard";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { ArchiveIcon, FileTextIcon } from "@/components/Icons";

const PAGE_SIZE = 12;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
  });
}

export default function ArchivePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("الكل");
  const [selectedMonth, setSelectedMonth] = useState("الكل");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [selectedSection, selectedMonth]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("id, title, excerpt, section, author_id, author_name, read_time, status, published_at, created_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setArticles((data || []).map((a: any) => ({
        id: a.id, title: a.title, content: a.content || "", excerpt: a.excerpt || "",
        section: a.section, date: a.published_at || a.created_at,
        author: a.author_name || "السُّدفة", author_id: a.author_id,
        readTime: a.read_time || "3 دقائق", status: a.status,
        published_at: a.published_at, created_at: a.created_at,
      })));
      setLoading(false);
    }
    load();
  }, []);

  const months = [...new Set(articles.map((a) => a.date?.slice(0, 7)))].filter(Boolean).sort().reverse();

  const filtered = articles.filter((a) => {
    const sectionMatch = selectedSection === "الكل" || a.section === selectedSection;
    const monthMatch = selectedMonth === "الكل" || (a.date && a.date.startsWith(selectedMonth));
    return sectionMatch && monthMatch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav aria-label="التنقل" className="text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">الأرشيف</span>
      </nav>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-10 rounded-full bg-accent" aria-hidden="true" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)]">
            الأرشيف
          </h1>
          <p className="text-sm text-text-muted mt-1">تصفح جميع الأعمال الأدبية</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8" role="group" aria-label="التصفية">
        <div>
          <label htmlFor="section-filter" className="text-[11px] text-text-muted block mb-1.5 font-medium">القسم</label>
          <select
            id="section-filter"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          >
            <option value="الكل">جميع الأقسام</option>
            {SECTIONS.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month-filter" className="text-[11px] text-text-muted block mb-1.5 font-medium">الشهر</label>
          <select
            id="month-filter"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          >
            <option value="الكل">جميع الأشهر</option>
            {months.map((m) => (
              <option key={m} value={m}>{formatDate(m + "-01")}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
        <p className="text-sm text-text-muted">
          {loading ? "...جاري التحميل" : `${filtered.length} عمل أدبي`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20" role="status" aria-label="جاري التحميل">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <FileTextIcon size={48} className="mx-auto text-text-muted/20 mb-4" aria-hidden="true" />
          <p className="text-text-muted">لا توجد أعمال تطابق التصفية.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((article) => (
              <WorkCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} baseUrl="/archive" />
        </>
      )}
    </div>
  );
}
