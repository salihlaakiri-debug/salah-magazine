"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TrashIcon, MessageIcon, CheckIcon, XIcon } from "@/components/Icons";

interface DbComment {
  id: string;
  article_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<DbComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
    setLoading(false);
  }

  async function deleteComment(id: string) {
    await supabase.from("comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  }

  async function clearAll() {
    await supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setComments([]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
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

      {comments.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <MessageIcon size={48} className="mx-auto text-text-muted mb-4 opacity-30" />
          <p className="text-text-muted">لا توجد تعليقات بعد.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-surface rounded-2xl border border-border/50 p-5 card-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                    {c.author_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{c.author_name}</span>
                      <span className="text-[11px] text-text-muted">{new Date(c.created_at).toLocaleDateString("ar-SA")}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{c.content}</p>
                    <p className="text-[11px] text-text-muted mt-2">مقال #{c.article_id.slice(0, 8)}</p>
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
      )}
    </div>
  );
}
