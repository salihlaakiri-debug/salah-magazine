import { Article } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import WorkCard from "./WorkCard";
import { useEffect, useState } from "react";

export default function RelatedArticles({ current }: { current: Article }) {
  const [related, setRelated] = useState<Article[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("id, title, content, excerpt, section, author_id, author_name, read_time, status, published_at, created_at")
        .eq("section", current.section)
        .eq("status", "published")
        .neq("id", current.id)
        .limit(2);
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content || "",
        excerpt: row.excerpt || "",
        section: row.section,
        date: row.published_at || row.created_at,
        author: row.author_name || "السُّدفة",
        author_id: row.author_id,
        author_name: row.author_name,
        readTime: row.read_time || "3 دقائق",
        status: row.status,
        published_at: row.published_at,
        created_at: row.created_at,
      })) as Article[];
      setRelated(mapped);
    }
    load();
  }, [current.id, current.section]);

  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="section-divider mb-10" />
      <h3 className="text-xl font-bold font-[var(--font-heading)] mb-6">
        أعمال ذات صلة
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {related.map((a) => (
          <WorkCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
