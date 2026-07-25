"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/lib/types";
import { MessageIcon, PlusIcon, XIcon, CheckIcon } from "./Icons";

const STORAGE_KEY = "salah-comments";

function getComments(articleId: string): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return all.filter((c: Comment) => c.articleId === articleId);
  } catch {
    return [];
  }
}

function saveComment(comment: Comment) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    all.push(comment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Comments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setComments(getComments(articleId));
  }, [articleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      articleId,
      name: name.trim(),
      text: text.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    saveComment(newComment);
    setComments((prev) => [...prev, newComment]);
    setName("");
    setText("");
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="mt-16">
      <div className="section-divider mb-10" />

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold font-[var(--font-heading)] flex items-center gap-2">
          <MessageIcon size={20} className="text-accent" />
          التعليقات
          <span className="text-sm font-normal text-text-muted">({comments.length})</span>
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-accent hover:text-accent-dark transition-colors font-medium flex items-center gap-1"
          >
            <PlusIcon size={14} />
            تعليق جديد
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-surface rounded-2xl border border-border/50 p-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="اسمك"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-sm"
              required
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-text-muted hover:text-foreground transition-colors flex items-center gap-1"
              >
                <XIcon size={14} />
                إلغاء
              </button>
            </div>
          </div>
          <textarea
            placeholder="اكتب تعليقك هنا..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-sm resize-none mb-4"
            required
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              <CheckIcon size={14} />
              نشر التعليق
            </button>
            {submitted && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in flex items-center gap-1">
                <CheckIcon size={14} />
                تم النشر بنجاح
              </span>
            )}
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.length === 0 && !showForm && (
          <div className="text-center py-12 bg-surface/50 rounded-2xl border border-border/30">
            <MessageIcon size={40} className="mx-auto text-text-muted mb-3 opacity-30" />
            <p className="text-sm text-text-muted">لا توجد تعليقات بعد.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm text-accent hover:text-accent-dark transition-colors font-medium"
            >
              كن أول من يعلّق
            </button>
          </div>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-surface/50 border border-border/30 rounded-2xl p-5 animate-fade-in"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold">
                {c.name[0]}
              </div>
              <div>
                <span className="font-bold text-sm block">{c.name}</span>
                <span className="text-[11px] text-text-muted">{formatDate(c.date)}</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80 pr-12">
              {c.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
