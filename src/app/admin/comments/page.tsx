"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { TrashIcon, MessageIcon, CheckIcon, XIcon } from "@/components/Icons";

interface DbComment {
  id: string;
  article_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
}

const PAGE_SIZE = 20;

export default function CommentsPage() {
  const [comments, setComments] = useState<DbComment[]>([]);
  const [articleTitles, setArticleTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });
    setComments((data || []) as DbComment[]);

    const articleIds = [...new Set((data || []).map((c: any) => c.article_id))];
    if (articleIds.length > 0) {
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title")
        .in("id", articleIds);
      const map: Record<string, string> = {};
      (articles || []).forEach((a: any) => { map[a.id] = a.title; });
      setArticleTitles(map);
    }
    setLoading(false);
  }

  async function deleteComment(id: string) {
    await supabase.from("comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  }

  async function clearAll() {
    if (!confirm("هل أنت متأكد من حذف جميع التعليقات؟")) return;
    await supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setComments([]);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return comments;
    const q = search.toLowerCase();
    return comments.filter(
      (c) =>
        c.author_name.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        (articleTitles[c.article_id] || "").toLowerCase().includes(q)
    );
  }, [comments, search, articleTitles]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-accent" />
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">التعليقات</h1>
          <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border/50">{comments.length}</span>
        </div>
        {comments.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-all"
          >
            <TrashIcon size={14} />
            حذف الكل
          </button>
        )}
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في التعليقات أو أسماء الكتّاب أو عناوين المقالات..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <MessageIcon size={48} className="mx-auto text-text-muted mb-4 opacity-30" />
          <p className="text-text-muted">{search ? "لا توجد نتائج مطابقة." : "لا توجد تعليقات بعد."}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((c) => (
              <div key={c.id} className="bg-surface rounded-2xl border border-border/50 p-5 card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                      {c.author_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm">{c.author_name}</span>
                        <span className="text-[11px] text-text-muted">{new Date(c.created_at).toLocaleDateString("ar-SA")}</span>
                        {c.parent_id && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">رد</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{c.content}</p>
                      <p className="text-[11px] text-text-muted mt-2">
                        {articleTitles[c.article_id] ? (
                          <span>
                            مقال: <span className="text-accent">{articleTitles[c.article_id]}</span>
                          </span>
                        ) : (
                          <span>مقال #{c.article_id.slice(0, 8)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {deleteConfirm === c.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteComment(c.id)} className="p-2 rounded-lg bg-red-500 text-white"><CheckIcon size={14} /></button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-lg bg-border text-foreground"><XIcon size={14} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(c.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all"
                      >
                        <TrashIcon size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-border bg-surface hover:bg-surface-hover disabled:opacity-40 transition-all"
              >
                السابق
              </button>
              <span className="text-sm text-text-muted px-3">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-border bg-surface hover:bg-surface-hover disabled:opacity-40 transition-all"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
