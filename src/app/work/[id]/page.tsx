import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticleById } from "@/lib/data";
import Comments from "@/components/Comments";
import ReadingProgress from "@/components/ReadingProgress";
import ShareButtons from "@/components/ShareButtons";
import RelatedArticles from "@/components/RelatedArticles";

export function generateStaticParams() {
  return articles.map((a) => ({ id: a.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const article = getArticleById(params.id);
  if (!article) return {};
  return {
    title: `${article.title} | مجلة صلاح`,
    description: article.excerpt,
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

export default function WorkPage({
  params,
}: {
  params: { id: string };
}) {
  const article = getArticleById(params.id);
  if (!article) notFound();

  const colors = sectionColors[article.section] || "";
  const paragraphs = article.content.split("\n\n");

  return (
    <>
      <ReadingProgress />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <nav className="text-sm text-text-muted mb-10 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
          <span className="text-border">/</span>
          <Link href={`/section/${encodeURIComponent(article.section)}`} className="hover:text-accent transition-colors">
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

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold">
                  {article.author[0]}
                </div>
                <div>
                  <span className="block font-bold text-sm">{article.author}</span>
                  <span className="text-xs text-text-muted">{formatDate(article.date)}</span>
                </div>
              </div>
              <ShareButtons title={article.title} url={`http://localhost:3000/work/${article.id}`} />
            </div>
          </header>

          <div className="article-content text-foreground/90">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        <Comments articleId={article.id} />
        <RelatedArticles current={article} />

        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dark transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </>
  );
}
