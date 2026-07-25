"use client";

import { useState } from "react";
import { articles } from "@/lib/data";
import { SECTIONS } from "@/lib/types";
import WorkCard from "@/components/WorkCard";
import Link from "next/link";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
  });
}

export default function ArchivePage() {
  const [selectedSection, setSelectedSection] = useState("الكل");
  const [selectedMonth, setSelectedMonth] = useState("الكل");

  const months = [...new Set(articles.map((a) => a.date.slice(0, 7)))].sort().reverse();

  const filtered = articles.filter((a) => {
    const sectionMatch = selectedSection === "الكل" || a.section === selectedSection;
    const monthMatch = selectedMonth === "الكل" || a.date.startsWith(selectedMonth);
    return sectionMatch && monthMatch;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">الأرشيف</span>
      </nav>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-10 rounded-full bg-accent" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)]">
            الأرشيف
          </h1>
          <p className="text-sm text-text-muted mt-1">تصفح جميع الأعمال الأدبية</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div>
          <label className="text-[11px] text-text-muted block mb-1.5 font-medium">القسم</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          >
            <option value="الكل">جميع الأقسام</option>
            {SECTIONS.map((s) => (
              <option key={s.slug} value={s.name}>{s.icon} {s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-text-muted block mb-1.5 font-medium">الشهر</label>
          <select
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
        <span className="w-2 h-2 rounded-full bg-accent" />
        <p className="text-sm text-text-muted">
          {sorted.length} عمل أدبي
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-text-muted">لا توجد أعمال تطابق التصفية.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((article) => (
            <WorkCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
