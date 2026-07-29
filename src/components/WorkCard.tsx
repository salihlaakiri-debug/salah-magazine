import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/types";
import { ArrowLeftIcon } from "./Icons";

function getAuthorInitial(name: string): string {
  if (name.startsWith("ال")) return name[2] || name[0];
  return name[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function AuthorLink({ username, className, children }: { username?: string; className?: string; children: React.ReactNode }) {
  if (!username) return <div className={className}>{children}</div>;
  return <Link href={`/profile/${username}`} className={className}>{children}</Link>;
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
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-accent/[0.03] group-hover:bg-accent/[0.06] transition-colors duration-500 blur-lg" />
          <div className="relative p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r section-badge ${colors}`}>
                {article.section}
              </span>
              {article.visibility && article.visibility !== "public" && (
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  article.visibility === "private" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {article.visibility === "private" ? "خاص" : "متابعون"}
                </span>
              )}
              <span className="text-xs text-text-muted">{article.readTime}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)] mb-4 group-hover:text-accent transition-colors duration-300 leading-tight">
              {article.title}
            </h2>
            <p className="text-text-muted leading-relaxed mb-6 line-clamp-3">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <AuthorLink username={article.author_username} className="flex items-center gap-3 text-sm text-text-muted group/author">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold ring-2 ring-accent/5 overflow-hidden">
                  {article.author_avatar_url ? (
                    <Image src={article.author_avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    getAuthorInitial(article.author)
                  )}
                </div>
                <div>
                  <span className="block font-medium text-foreground text-xs group-hover/author:text-accent transition-colors">{article.author}</span>
                  <span className="text-xs">{formatDate(article.date)}</span>
                </div>
              </AuthorLink>
              <span className="text-sm text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
                اقرأ المزيد
                <ArrowLeftIcon size={14} />
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
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-accent/[0.03] group-hover:bg-accent/[0.06] transition-colors duration-500 blur-lg" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r section-badge ${colors}`}>
              {article.section}
            </span>
            {article.visibility && article.visibility !== "public" && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                article.visibility === "private" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}>
                {article.visibility === "private" ? "خاص" : "متابعون"}
              </span>
            )}
            <span className="text-[11px] text-text-muted">{article.readTime}</span>
          </div>
          <h3 className="text-lg font-bold font-[var(--font-heading)] mb-2 group-hover:text-accent transition-colors duration-300 leading-relaxed">
            {article.title}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <AuthorLink username={article.author_username} className="flex items-center gap-2 group/author">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold ring-1 ring-accent/5 overflow-hidden shrink-0 relative">
                {article.author_avatar_url ? (
                  <Image src={article.author_avatar_url} alt="" fill className="object-cover" />
                ) : (
                  getAuthorInitial(article.author)
                )}
              </div>
              <span className="group-hover/author:text-accent transition-colors">{article.author}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{formatDate(article.date)}</span>
            </AuthorLink>
            <span className="text-accent opacity-0 group-hover:opacity-100 transition-all duration-300">
              <ArrowLeftIcon size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
