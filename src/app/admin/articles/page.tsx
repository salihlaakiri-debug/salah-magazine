"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Article, SECTIONS, Tag } from "@/lib/types";
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, XIcon, CheckIcon } from "@/components/Icons";
import { TagInput } from "@/components/TagBadge";
import Link from "next/link";

export default function ArticlesPage() {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", section: "نثر" as Article["section"], date: new Date().toISOString().split("T")[0], author: "السُّدفة", readTime: "5 دقائق" });
  const [formTags, setFormTags] = useState<string[]>([]);
  const [articleTagsMap, setArticleTagsMap] = useState<Record<string, Tag[]>>({});
  const [filter, setFilter] = useState("الكل");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    setArticlesList((data || []) as Article[]);

    const ids = (data || []).map((a: any) => a.id);
    if (ids.length > 0) {
      const { data: at } = await supabase
        .from("article_tags")
        .select("article_id, tags(id, name, slug)")
        .in("article_id", ids);
      const map: Record<string, Tag[]> = {};
      (at || []).forEach((row: any) => {
        if (!map[row.article_id]) map[row.article_id] = [];
        map[row.article_id].push(row.tags);
      });
      setArticleTagsMap(map);
    }
    setLoading(false);
  }

  const filtered = filter === "الكل" ? articlesList : articlesList.filter((a) => a.section === filter);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", content: "", excerpt: "", section: "نثر", date: new Date().toISOString().split("T")[0], author: "السُّدفة", readTime: "5 دقائق" });
    setFormTags([]);
    setShowModal(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content, excerpt: a.excerpt, section: a.section, date: a.date || a.created_at?.split("T")[0] || "", author: a.author_name || a.author, readTime: a.readTime || "5 دقائق" });
    setFormTags((articleTagsMap[a.id] || []).map((t) => t.name));
    setShowModal(true);
  };

  async function saveTags(articleId: string, tagNames: string[]) {
    await supabase.from("article_tags").delete().eq("article_id", articleId);
    if (tagNames.length === 0) return;
    for (const name of tagNames) {
      const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "");
      const { data: tag } = await supabase
        .from("tags")
        .upsert({ name: name.trim(), slug }, { onConflict: "name" })
        .select("id")
        .single();
      if (tag) {
        await supabase.from("article_tags").upsert(
          { article_id: articleId, tag_id: tag.id },
          { onConflict: "article_id,tag_id" }
        );
      }
    }
  }

  async function save() {
    if (!form.title.trim() || !form.content.trim()) return;

    if (editing) {
      const { error } = await supabase
        .from("articles")
        .update({
          title: form.title,
          content: form.content,
          excerpt: form.excerpt,
          section: form.section,
          author_name: form.author,
          read_time: form.readTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editing.id);
      if (!error) {
        await saveTags(editing.id, formTags);
        await fetchArticles();
      }
    } else {
      const { data, error } = await supabase
        .from("articles")
        .insert({
          title: form.title,
          content: form.content,
          excerpt: form.excerpt,
          section: form.section,
          author_name: form.author,
          read_time: form.readTime,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (!error && data) {
        await saveTags(data.id, formTags);
        await fetchArticles();
      }
    }
    setShowModal(false);
  }

  async function deleteArticle(id: string) {
    await supabase.from("article_tags").delete().eq("article_id", id);
    await supabase.from("articles").delete().eq("id", id);
    setArticlesList((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-accent" />
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">المقالات</h1>
          <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border/50">{articlesList.length}</span>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20"
        >
          <PlusIcon size={16} />
          إضافة عمل جديد
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["الكل", ...SECTIONS.map((s) => s.name)].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === f ? "bg-accent text-white" : "bg-surface border border-border/50 text-text-muted hover:bg-surface-hover"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((a) => (
          <div key={a.id} className="bg-surface rounded-2xl border border-border/50 p-5 flex items-center gap-4 card-hover">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">{a.section}</span>
                <span className="text-[11px] text-text-muted">{a.date}</span>
              </div>
              <h3 className="font-bold text-sm truncate">{a.title}</h3>
              <p className="text-xs text-text-muted truncate mt-0.5">{a.excerpt}</p>
              {articleTagsMap[a.id] && articleTagsMap[a.id].length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {articleTagsMap[a.id].map((t) => (
                    <span key={t.id} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/5 text-accent/70">#{t.name}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={`/work/${a.id}`}
                target="_blank"
                className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-foreground transition-all"
              >
                <EyeIcon size={16} />
              </Link>
              <button
                onClick={() => openEdit(a)}
                className="p-2 rounded-lg hover:bg-accent/10 text-text-muted hover:text-accent transition-all"
              >
                <EditIcon size={16} />
              </button>
              {deleteConfirm === a.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => deleteArticle(a.id)} className="p-2 rounded-lg bg-red-500 text-white"><CheckIcon size={14} /></button>
                  <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-lg bg-border text-foreground"><XIcon size={14} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(a.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all"
                >
                  <TrashIcon size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-3xl border border-border/50 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-[var(--font-heading)]">
                {editing ? "تعديل العمل" : "إضافة عمل جديد"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-surface-hover"><XIcon size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1.5">العنوان</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  placeholder="عنوان العمل"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1.5">القسم</label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value as Article["section"] })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    {SECTIONS.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1.5">التاريخ</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1.5">الكاتب</label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1.5">وقت القراءة</label>
                  <input
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1.5">الوسوم</label>
                <TagInput tags={formTags} onChange={setFormTags} />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1.5">المقتطف</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                  placeholder="ملخص مختصر..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1.5">المحتوى</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none font-mono"
                  placeholder="نص العمل الكامل..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={save}
                  className="flex-1 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                >
                  <CheckIcon size={16} />
                  {editing ? "حفظ التعديلات" : "نشر العمل"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl border border-border bg-background font-medium hover:bg-surface-hover transition-all text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
