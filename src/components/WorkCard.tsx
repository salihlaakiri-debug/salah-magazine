import Link from "next/link";
import { Article } from "@/lib/types";

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

export default function WorkCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const colors = sectionColors[article.section] || "from-gray-500/10 to-gray-500/10 text-gray-600";

  if (featured) {
    return (
      <Link href={`/work/${article.id}`} className="group block">
        <div className="relative overflow-hidden rounded-3xl bg-surface border border-border/50 card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-light/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${colors}`}>
                {article.section}
              </span>
              <span className="text-xs text-text-muted">{article.readTime}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)] mb-4 group-hover:text-accent transition-colors leading-tight">
              {article.title}
            </h2>
            <p className="text-text-muted leading-relaxed mb-6 line-clamp-3">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                  {article.author[0]}
                </div>
                <div>
                  <span className="block font-medium text-foreground text-xs">{article.author}</span>
                  <span className="text-xs">{formatDate(article.date)}</span>
                </div>
              </div>
              <span className="text-sm text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                اقرأ المزيد ←
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/work/${article.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border/50 p-6 card-hover">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${colors}`}>
              {article.section}
            </span>
            <span className="text-[11px] text-text-muted">{article.readTime}</span>
          </div>
          <h3 className="text-lg font-bold font-[var(--font-heading)] mb-2 group-hover:text-accent transition-colors leading-relaxed">
            {article.title}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold">
                {article.author[0]}
              </div>
              <span>{article.author}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{formatDate(article.date)}</span>
            </div>
            <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
              ←
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
