"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/lib/types";
import { TrashIcon, MessageIcon, CheckIcon, XIcon } from "@/components/Icons";

const STORAGE_KEY = "salah-comments";

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setComments(all);
    } catch { setComments([]); }
  }, []);

  const deleteComment = (id: string) => {
    const updated = comments.filter((c) => c.id !== id);
    setComments(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDeleteConfirm(null);
  };

  const clearAll = () => {
    setComments([]);
    localStorage.removeItem(STORAGE_KEY);
  };

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
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{c.name}</span>
                      <span className="text-[11px] text-text-muted">{c.date}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{c.text}</p>
                    <p className="text-[11px] text-text-muted mt-2">مقال #{c.articleId}</p>
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
