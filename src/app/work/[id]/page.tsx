import { notFound } from "next/navigation";
import Link from "next/link";
import { SECTIONS } from "@/lib/types";
import { fetchPublishedArticles, fetchArticleById } from "@/lib/supabase-data";
import Comments from "@/components/Comments";
import ReadingProgress from "@/components/ReadingProgress";
import ReadingMode from "@/components/ReadingMode";
import TableOfContents from "@/components/TableOfContents";
import ShareButtons from "@/components/ShareButtons";
import ShareCard from "@/components/ShareCard";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "@/components/BookmarkButton";
import MarkdownContent from "@/components/MarkdownContent";
import { ArrowLeftIcon } from "@/components/Icons";

export async function generateStaticParams() {
  const articles = await fetchPublishedArticles();
  return articles.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await fetchArticleById(id);
  if (!article) return {};
  return {
    title: `${article.title} | مجلة السُّدفة`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      locale: "ar_SA",
      siteName: "السُّدفة",
      authors: [article.author],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const sectionColors: Record<string, string> = {
  "شعر": "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
  "قصة": "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
  "نثر": "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
  "مقالات": "from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400",
  "تأملات": "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400",
};

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await fetchArticleById(id);
  if (!article) notFound();

  const allArticles = await fetchPublishedArticles();
  const related = allArticles
    .filter((a) => a.section === article.section && a.id !== article.id)
    .slice(0, 3);

  const sectionSlug = SECTIONS.find((s) => s.name === article.section)?.slug || "";
  const colors = sectionColors[article.section] || "";

  return (
    <>
      <ReadingProgress />
      <ReadingMode />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto lg:ml-auto lg:mr-0">
        <nav className="text-sm text-text-muted mb-10 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
          <span className="text-border">/</span>
          <Link href={`/section/${sectionSlug}`} className="hover:text-accent transition-colors">
            {article.section}
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{article.title}</span>
        </nav>

        <article>
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r ${colors}`}>
                {article.section}
              </span>
              <span className="text-xs text-text-muted">{article.readTime}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[var(--font-heading)] mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold">
                  {article.author.startsWith("ال") ? (article.author[2] || article.author[0]) : article.author[0]}
                </div>
                <div>
                  <span className="block font-bold text-sm">{article.author}</span>
                  <span className="text-xs text-text-muted">{formatDate(article.date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <LikeButton articleId={article.id} />
                <BookmarkButton articleId={article.id} />
                <ShareCard
                  title={article.title}
                  excerpt={article.excerpt}
                  section={article.section}
                  author={article.author}
                  articleId={article.id}
                />
                <ShareButtons title={article.title} url={`https://salah-magazine.vercel.app/work/${article.id}`} />
              </div>
            </div>
          </header>

          <div className="article-content text-foreground/90">
            <MarkdownContent content={article.content} />
          </div>
        </article>

        <Comments articleId={article.id} />
        </div>

        {/* Desktop TOC sidebar */}
        <div className="hidden lg:block">
          <TableOfContents content={article.content} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
          <div className="section-divider mb-10" />
          <h3 className="text-xl font-bold font-[var(--font-heading)] mb-6">أعمال مشابهة</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <Link key={a.id} href={`/work/${a.id}`} className="group block">
                <div className="bg-surface/50 border border-border/30 rounded-2xl p-5 hover:border-accent/30 transition-all">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${sectionColors[a.section] || ""}`}>
                    {a.section}
                  </span>
                  <h4 className="text-sm font-bold font-[var(--font-heading)] mt-3 mb-2 group-hover:text-accent transition-colors">{a.title}</h4>
                  <p className="text-xs text-text-muted line-clamp-2">{a.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 pt-8 border-t border-border">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dark transition-colors group"
        >
            <span className="group-hover:-translate-x-1 transition-transform">
              <ArrowLeftIcon size={16} />
            </span>
            العودة إلى الصفحة الرئيسية
          </Link>
      </div>
    </>
  );
}
