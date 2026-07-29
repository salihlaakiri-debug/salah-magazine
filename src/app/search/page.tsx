"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Article, SECTIONS, Section } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { SearchIcon, XIcon, ArrowLeftIcon } from "@/components/Icons";

const ALL_SECTIONS = "الكل";
const sectionOptions = [ALL_SECTIONS, ...SECTIONS.map((s) => s.name)] as const;

type SortOption = "الأحدث" | "الأقدم" | "الأكثر قراءة";
const sortOptions: SortOption[] = ["الأحدث", "الأقدم", "الأكثر قراءة"];

const sectionColors: Record<string, string> = {
  شعر: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
  قصة: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
  نثر: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
  مقالات: "from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400",
  تأملات: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400",
};

function getAuthorInitial(name: string): string {
  if (name.startsWith("ال")) return name[2] || name[0];
  return name[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-surface border border-border/50 p-6 animate-pulse"
        >
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-16 rounded-full bg-border/50" />
            <div className="h-5 w-12 rounded-full bg-border/50" />
          </div>
          <div className="h-6 w-3/4 rounded bg-border/50 mb-2" />
          <div className="h-4 w-full rounded bg-border/50 mb-1" />
          <div className="h-4 w-2/3 rounded bg-border/50 mb-4" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-border/50" />
            <div className="h-3 w-20 rounded bg-border/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultCard({ article }: { article: Article }) {
  const colors = sectionColors[article.section] || "from-gray-500/10 to-gray-500/10 text-gray-600";

  return (
    <Link href={`/work/${article.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border/50 p-6 card-hover h-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-accent/[0.03] group-hover:bg-accent/[0.06] transition-colors duration-500 blur-lg" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r section-badge ${colors}`}
            >
              {article.section}
            </span>
          </div>
          <h3 className="text-lg font-bold font-[var(--font-heading)] mb-2 group-hover:text-accent transition-colors duration-300 leading-relaxed">
            {article.title}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold ring-1 ring-accent/5">
                {getAuthorInitial(article.author)}
              </div>
              <span>{article.author}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{formatDate(article.date)}</span>
            </div>
            <span className="text-accent opacity-0 group-hover:opacity-100 transition-all duration-300">
              <ArrowLeftIcon size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  useEffect(() => { document.title = "بحث | مجلة السُّدفة"; }, []);
  const [activeSection, setActiveSection] = useState<string>(ALL_SECTIONS);
  const [sortBy, setSortBy] = useState<SortOption>("الأحدث");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async () => {
    setLoading(true);
    const q = query.trim();

    let builder = supabase
      .from("articles")
      .select("*")
      .eq("status", "published");

    if (q.length > 0) {
      builder = builder.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
    }

    if (activeSection !== ALL_SECTIONS) {
      builder = builder.eq("section", activeSection);
    }

    const ascending = sortBy === "الأقدم";
    const orderCol = sortBy === "الأكثر قراءة" ? "read_count" : "published_at";
    builder = builder.order(orderCol, { ascending });

    const { data } = await builder;

    setResults(
      (data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        excerpt: a.excerpt || "",
        section: a.section,
        date: a.published_at || a.created_at,
        author: a.author_name || "السُّدفة",
        readTime: a.read_time || "3 دقائق",
      }))
    );
    setHasSearched(true);
    setLoading(false);
  }, [query, activeSection, sortBy]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      doSearch();
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [doSearch]);

  const clearAll = () => {
    setQuery("");
    setActiveSection(ALL_SECTIONS);
    setSortBy("الأحدث");
  };

  const hasActiveFilters =
    query.trim().length > 0 || activeSection !== ALL_SECTIONS || sortBy !== "الأحدث";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <nav className="text-sm text-text-muted mb-10">
        <Link href="/" className="hover:text-accent transition-colors">
          الرئيسية
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">بحث</span>
      </nav>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-10 rounded-full bg-accent" />
        <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)]">
          بحث
        </h1>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          placeholder="ابحث عن عنوان أو كلمة أو عبارة..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-14 pl-10 py-4 rounded-2xl border border-border bg-surface text-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-sm focus:shadow-md"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* Section Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sectionOptions.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
              activeSection === section
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-surface text-text-muted border-border hover:border-accent/50 hover:text-foreground"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Sort Options + Clear */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {sortOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                sortBy === option
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            <XIcon size={12} />
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Results */}
      {loading && <LoadingSkeleton />}

      {!loading && hasSearched && results.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <SearchIcon size={64} className="mx-auto text-text-muted/20 mb-4" />
          <p className="text-lg text-text-muted mb-2">
            لا توجد نتائج مطابقة لبحثك
          </p>
          <p className="text-sm text-text-muted/70">
            جرّب كلمات مختلفة أو غيّر الفلاتر
          </p>
        </div>
      )}

      {!loading && hasSearched && results.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <p className="text-sm text-text-muted">
              {results.length} نتيجة
              {query.trim() ? ` لـ "${query.trim()}"` : ""}
              {activeSection !== ALL_SECTIONS ? ` في ${activeSection}` : ""}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((article) => (
              <ResultCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {!hasSearched && !loading && (
        <div className="text-center py-16">
          <SearchIcon size={64} className="mx-auto text-text-muted/20 mb-4" />
          <p className="text-text-muted">ابحث في جميع الأعمال الأدبية</p>
        </div>
      )}
    </div>
  );
}
