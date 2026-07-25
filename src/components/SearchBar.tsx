"use client";

import { useState, useEffect, useCallback } from "react";
import { Article } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import WorkCard from "./WorkCard";
import { SearchIcon, XIcon } from "./Icons";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async () => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const q = query.trim();
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .or(`title.ilike.%${q}%,content.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order("published_at", { ascending: false });
    setResults((data || []).map((a: any) => ({
      id: a.id, title: a.title, content: a.content, excerpt: a.excerpt || "",
      section: a.section, date: a.published_at || a.created_at,
      author: a.author_name || "صلاح", readTime: a.read_time || "3 دقائق",
    })));
    setSearched(true);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(doSearch, 400);
    return () => clearTimeout(timer);
  }, [doSearch]);

  return (
    <div>
      <div className={`relative mb-8 transition-all duration-300 ${focused ? "scale-[1.01]" : ""}`}>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          placeholder="ابحث عن عنوان أو كلمة أو عبارة..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pr-14 pl-6 py-5 rounded-2xl border border-border bg-surface text-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-sm focus:shadow-md"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      )}

      {!loading && searched && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <p className="text-sm text-text-muted">
              {results.length === 0
                ? `لا توجد نتائج لـ "${query}"`
                : `${results.length} نتيجة لـ "${query}"`}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((article) => (
              <WorkCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center py-16">
          <SearchIcon size={64} className="mx-auto text-text-muted/20 mb-4" />
          <p className="text-text-muted">ابحث في جميع الأعمال الأدبية</p>
        </div>
      )}
    </div>
  );
}
