"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TagIcon, TrashIcon, CheckIcon, XIcon } from "@/components/Icons";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";

interface Tag { id: string; name: string; slug: string; article_count?: number; }

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchTags(); }, []);

  useAdminRealtime("admin-tags", [
    { table: "tags", event: "INSERT" },
    { table: "tags", event: "DELETE" },
  ], useCallback((payload: any) => {
    const { eventType, new: record, old: oldRecord } = payload;
    if (eventType === "INSERT") {
      setTags(prev => [...prev, { id: record.id, name: record.name, slug: record.slug, article_count: 0 }]);
    } else if (eventType === "DELETE") {
      setTags(prev => prev.filter(t => t.id !== oldRecord.id));
    }
  }, []));

  async function fetchTags() {
    setLoading(true);
    const { data: tagsData } = await supabase.from("tags").select("*").order("name");
    const tagList = (tagsData || []) as Tag[];

    const { data: articleTags } = await supabase
      .from("article_tags")
      .select("tag_id");
    const countMap: Record<string, number> = {};
    (articleTags || []).forEach((at: any) => {
      countMap[at.tag_id] = (countMap[at.tag_id] || 0) + 1;
    });

    setTags(tagList.map(t => ({ ...t, article_count: countMap[t.id] || 0 })));
    setLoading(false);
  }

  async function addTag() {
    const name = newTagName.trim();
    if (!name) return;
    setAdding(true);
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "");
    const { error } = await supabase.from("tags").upsert(
      { name, slug },
      { onConflict: "name" }
    );
    if (!error) {
      setNewTagName("");
      await fetchTags();
    }
    setAdding(false);
  }

  async function deleteTag(id: string) {
    await supabase.from("article_tags").delete().eq("tag_id", id);
    await supabase.from("tags").delete().eq("id", id);
    setTags(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm(null);
  }

  const filtered = tags.filter(t =>
    !search.trim() || t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">الوسوم</h1>
        <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border/50">{tags.length}</span>
      </div>

      <div className="bg-surface rounded-2xl border border-border/50 p-5 mb-6">
        <div className="flex gap-3">
          <input
            type="text" value={newTagName} onChange={e => setNewTagName(e.target.value)}
            placeholder="اسم الوسم الجديد..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            onKeyDown={e => e.key === "Enter" && addTag()}
          />
          <button onClick={addTag} disabled={adding || !newTagName.trim()}
            className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckIcon size={16} />
            إضافة
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث في الوسوم..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <TagIcon size={48} className="mx-auto text-text-muted mb-4 opacity-30" />
          <p className="text-text-muted">لا توجد وسوم</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(t => (
            <div key={t.id} className="bg-surface rounded-2xl border border-border/50 p-4 flex items-center justify-between card-hover">
              <div>
                <span className="text-sm font-medium">#{t.name}</span>
                <p className="text-[11px] text-text-muted mt-0.5">{t.article_count} مقال{t.article_count !== 1 ? "ات" : ""}</p>
              </div>
              {deleteConfirm === t.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => deleteTag(t.id)} className="p-2 rounded-lg bg-red-500 text-white"><CheckIcon size={14} /></button>
                  <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-lg bg-border text-foreground"><XIcon size={14} /></button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(t.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all"
                >
                  <TrashIcon size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
