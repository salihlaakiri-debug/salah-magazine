import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchTagBySlug, fetchArticlesByTagSlug } from "@/lib/tags";
import WorkCard from "@/components/WorkCard";
import { FileTextIcon } from "@/components/Icons";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await fetchTagBySlug(slug);
  if (!tag) return {};
  return {
    title: `#${tag.name} | مجلة السُّدفة`,
    description: `تصفح الأعمال المُعلّمة بـ ${tag.name} في مجلة السُّدفة`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await fetchTagBySlug(slug);
  if (!tag) notFound();

  const rawArticles = await fetchArticlesByTagSlug(slug);
  const articles = rawArticles.map((a: any) => ({
    id: a.id,
    title: a.title,
    content: a.content || "",
    excerpt: a.excerpt || "",
    section: a.section,
    date: a.published_at || a.created_at,
    author: a.author_name || "السُّدفة",
    author_id: a.author_id,
    readTime: a.read_time || "3 دقائق",
    status: a.status,
    published_at: a.published_at,
    created_at: a.created_at,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-text-muted mb-10">
        <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">#{tag.name}</span>
      </nav>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-10 rounded-full bg-accent" />
          <span className="text-4xl text-accent/30 font-bold">#</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)] mb-3">
          {tag.name}
        </h1>
        <p className="text-text-muted">{tag.article_count} عمل أدبي</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <FileTextIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
          <p className="text-text-muted">لا توجد أعمال بهذا التاغ بعد.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article: any) => (
            <WorkCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
