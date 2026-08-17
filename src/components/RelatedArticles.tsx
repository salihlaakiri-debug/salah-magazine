import { Article } from "@/lib/types";
import { getSupabaseServer } from "@/lib/supabase-server";
import WorkCard from "./WorkCard";

export default async function RelatedArticles({ current }: { current: Article }) {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data } = await supabase
    .from("articles")
    .select("id, title, excerpt, section, author_id, author_name, author_username, author_avatar_url, read_time, published_at, created_at")
    .eq("section", current.section)
    .eq("status", "published")
    .eq("visibility", "public")
    .neq("id", current.id)
    .limit(2);

  if (!data?.length) return null;

  const related = data.map((row: any) => ({
    id: row.id,
    title: row.title,
    content: "",
    excerpt: row.excerpt || "",
    section: row.section,
    date: row.published_at || row.created_at,
    author: row.author_name || "السُّدفة",
    author_id: row.author_id,
    author_name: row.author_name,
    author_username: row.author_username,
    author_avatar_url: row.author_avatar_url,
    readTime: row.read_time || "3 دقائق",
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
    visibility: "public" as const,
  })) as Article[];

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
