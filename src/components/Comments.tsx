"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { createNotification, getAuthorIdForArticle } from "@/lib/notify";
import { showToast } from "@/lib/toast";
import Honeypot from "./Honeypot";
import { MessageIcon, PlusIcon, XIcon, CheckIcon } from "./Icons";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

function groupComments(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];
  comments.forEach((c) => map.set(c.id, { ...c, replies: [] }));
  map.forEach((c) => {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies!.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

function CommentItem({ comment, articleId, onReply, replyTo, replyText, setReplyText, submitReply, replying }: {
  comment: Comment; articleId: string;
  onReply: (id: string | null) => void; replyTo: string | null;
  replyText: string; setReplyText: (v: string) => void;
  submitReply: (parentId: string) => Promise<void>; replying: boolean;
}) {
  const { user, profile } = useAuth();
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = (comment.replies?.length || 0) > 0;
  const isReplying = replyTo === comment.id;

  return (
    <div className="animate-fade-in">
      <div className={`flex gap-3 ${comment.parentId ? "pr-6 sm:pr-10" : ""}`}>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-xs sm:text-sm font-bold shrink-0 mt-1">
          {comment.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-surface/50 border border-border/30 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{comment.name}</span>
                <span className="text-[11px] text-text-muted">{formatDate(comment.date)}</span>
              </div>
              {user && (
                <button
                  onClick={() => onReply(isReplying ? null : comment.id)}
                  className="text-[11px] text-accent hover:text-accent-dark transition-colors font-medium cursor-pointer"
                >
                  {isReplying ? "إلغاء" : "رد"}
                </button>
              )}
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">{comment.text}</p>
          </div>

          {isReplying && (
            <form onSubmit={(e) => { e.preventDefault(); submitReply(comment.id); }} className="mt-2 mr-6 sm:mr-10 mb-2 p-4 rounded-xl bg-surface border border-border/30 animate-fade-in relative">
              <Honeypot />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-muted">رد على <span className="font-medium text-foreground">{comment.name}</span></span>
              </div>
              <textarea
                value={replyText} onChange={(e) => setReplyText(e.target.value)}
                placeholder="اكتب ردك..." rows={2}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none mb-2"
                required
              />
              <div className="flex items-center gap-2">
                <button type="submit" disabled={replying}
                  className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent-dark transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {replying ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckIcon size={12} />}
                  رد
                </button>
              </div>
            </form>
          )}

          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="mr-6 sm:mr-10 mt-1.5 text-[11px] text-text-muted hover:text-accent transition-colors font-medium cursor-pointer"
            >
              {showReplies ? "إخفاء الردود" : `عرض الردود (${comment.replies!.length})`}
            </button>
          )}
        </div>
      </div>

      {hasReplies && showReplies && (
        <div className="mt-2 space-y-2">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id} comment={reply} articleId={articleId}
              onReply={onReply} replyTo={replyTo}
              replyText={replyText} setReplyText={setReplyText}
              submitReply={submitReply} replying={replying}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Comments({ articleId }: { articleId: string }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [topLevelCount, setTopLevelCount] = useState(0);

  async function load() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true });

    const mapped: Comment[] = (data || []).map((c: any) => ({
      id: c.id,
      articleId: c.article_id,
      user_id: c.user_id,
      name: c.author_name,
      text: c.content,
      date: c.created_at,
      parentId: c.parent_id || null,
    }));
    setComments(mapped);
    const grouped = groupComments(mapped);
    setTopLevelCount(grouped.length);
    setLoading(false);
  }

  useEffect(() => { load(); }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    const authorName = profile?.display_name || profile?.username || "مجهول";
    const { data, error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      author_name: authorName,
      content: text.trim(),
    }).select().single();

    if (!error && data) {
      setComments((prev) => [...prev, {
        id: data.id, articleId: data.article_id,
        user_id: data.user_id, name: data.author_name,
        text: data.content, date: data.created_at,
      }]);
      setText(""); setShowForm(false); setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      showToast("تم نشر تعليقك", "success");
      const authorId = await getAuthorIdForArticle(articleId);
      if (authorId) {
        createNotification({
          userId: authorId, type: "comment", fromUserId: user.id, articleId,
          message: `${authorName} علّق على عملك: "${text.trim().slice(0, 50)}..."`,
        });
      }
    }
  };

  const submitReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return;
    setReplying(true);
    const authorName = profile?.display_name || profile?.username || "مجهول";
    const { data, error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      author_name: authorName,
      content: replyText.trim(),
      parent_id: parentId,
    }).select().single();

    if (!error && data) {
      setComments((prev) => [...prev, {
        id: data.id, articleId: data.article_id,
        user_id: data.user_id, name: data.author_name,
        text: data.content, date: data.created_at,
        parentId: data.parent_id,
      }]);
      setReplyText(""); setReplyTo(null);
      showToast("تم نشر الرد", "success");
    }
    setReplying(false);
  };

  const grouped = groupComments(comments);
  const totalComments = comments.length;

  return (
    <section className="mt-16">
      <div className="section-divider mb-10" />

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold font-[var(--font-heading)] flex items-center gap-2">
          <MessageIcon size={20} className="text-accent" />
          التعليقات
          <span className="text-sm font-normal text-text-muted">
            ({totalComments})
            {topLevelCount > 0 && topLevelCount !== totalComments && (
              <span className="mr-1">({topLevelCount} مناقشات)</span>
            )}
          </span>
        </h3>
        {!showForm && user && (
          <button onClick={() => setShowForm(true)} className="text-sm text-accent hover:text-accent-dark transition-colors font-medium flex items-center gap-1 cursor-pointer">
            <PlusIcon size={14} /> تعليق جديد
          </button>
        )}
        {!user && (
          <a href="/login" className="text-sm text-accent hover:text-accent-dark transition-colors font-medium">سجّل للتعليق</a>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-surface rounded-2xl border border-border/50 p-6 animate-fade-in relative">
          <Honeypot />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold">
              {profile?.display_name?.[0] || profile?.username?.[0] || "?"}
            </div>
            <span className="text-sm font-medium">{profile?.display_name || profile?.username}</span>
          </div>
          <textarea placeholder="اكتب تعليقك هنا..." value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-sm resize-none mb-4" required />
          <div className="flex items-center gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors shadow-lg shadow-accent/20 flex items-center gap-2 cursor-pointer">
              <CheckIcon size={14} /> نشر التعليق
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-text-muted hover:text-foreground transition-colors cursor-pointer">إلغاء</button>
            {submitted && <span className="text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in">تم النشر بنجاح</span>}
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading && <div className="text-center py-8"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" /></div>}
        {!loading && grouped.length === 0 && !showForm && (
          <div className="text-center py-12 bg-surface/50 rounded-2xl border border-border/30">
            <MessageIcon size={40} className="mx-auto text-text-muted mb-3 opacity-30" />
            <p className="text-sm text-text-muted">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
          </div>
        )}
        {grouped.map((c) => (
          <CommentItem
            key={c.id} comment={c} articleId={articleId}
            onReply={setReplyTo} replyTo={replyTo}
            replyText={replyText} setReplyText={setReplyText}
            submitReply={submitReply} replying={replying}
          />
        ))}
      </div>
    </section>
  );
}
