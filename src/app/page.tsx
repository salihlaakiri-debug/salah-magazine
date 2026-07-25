import Link from "next/link";
import { SECTIONS } from "@/lib/types";
import { fetchRecentArticles, fetchPublishedArticles } from "@/lib/supabase-data";
import WorkCard from "@/components/WorkCard";
import SectionIcon from "@/components/SectionIcon";
import { PenIcon, SearchIcon, ArchiveIcon, ArrowLeftIcon, StarIcon, MessageIcon } from "@/components/Icons";

export default async function HomePage() {
  const allArticles = await fetchPublishedArticles();
  const featured = allArticles[0];
  const recent = allArticles.slice(1, 6);

  const sectionsWithArticles = await Promise.all(
    SECTIONS.map(async (s) => {
      const sectionArticles = allArticles.filter((a) => a.section === s.name).slice(0, 2);
      return { ...s, articles: sectionArticles };
    })
  );

  return (
    <div>
      <section className="relative hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-medium mb-8 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              مجلة أدبية عربية
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-[var(--font-heading)] mb-6 animate-fade-in-up delay-100 opacity-0">
              <span className="gradient-text">السُّدفة</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-muted max-w-xl mx-auto mb-10 animate-fade-in-up delay-200 opacity-0 leading-relaxed">
              نكتب لنفهم، وصمتاً لنسمع.
              <br />
              قصائد وتأملات وحكايات من عوالم اللغة والصمت.
            </p>

            <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up delay-300 opacity-0">
              <Link
                href="/archive"
                className="group px-7 py-3.5 rounded-full bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30 flex items-center gap-2"
              >
                <ArchiveIcon size={16} />
                تصفّح الأرشيف
              </Link>
              <Link
                href="/search"
                className="px-7 py-3.5 rounded-full border border-border bg-surface font-medium hover:bg-surface-hover transition-all flex items-center gap-2"
              >
                <SearchIcon size={16} />
                بحث
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {featured && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 rounded-full bg-accent" />
            <StarIcon size={20} className="text-accent" />
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)]">
              العمل المميز
            </h2>
          </div>
          <WorkCard article={featured} featured />
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 rounded-full bg-accent" />
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)]">
            الأقسام
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SECTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/section/${s.slug}`}
              className="group relative overflow-hidden rounded-2xl p-6 border border-border/50 bg-surface card-hover text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <SectionIcon section={s.name} size={24} />
                </div>
                <h3 className="font-bold text-sm font-[var(--font-heading)] group-hover:text-accent transition-colors">
                  {s.name}
                </h3>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed line-clamp-2">
                  {s.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-accent" />
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)]">
              الأحدث
            </h2>
          </div>
          <Link
            href="/archive"
            className="text-sm text-accent hover:text-accent-dark transition-colors font-medium flex items-center gap-1"
          >
            عرض الكل
            <ArrowLeftIcon size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {recent.map((article) => (
            <WorkCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {sectionsWithArticles.map((s) => {
        if (s.articles.length === 0) return null;
        return (
          <section key={s.slug} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full bg-accent" />
                <h2 className="text-xl sm:text-2xl font-bold font-[var(--font-heading)]">
                  {s.name}
                </h2>
              </div>
              <Link
                href={`/section/${s.slug}`}
                className="text-sm text-accent hover:text-accent-dark transition-colors flex items-center gap-1"
              >
                المزيد
                <ArrowLeftIcon size={14} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {s.articles.map((article) => (
                <WorkCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/10 via-surface to-accent-light/10 border border-border/50 p-10 sm:p-14 text-center">
          <div className="absolute top-4 right-4 opacity-5">
            <PenIcon size={120} />
          </div>
          <div className="absolute bottom-4 left-4 opacity-5">
            <MessageIcon size={100} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)] mb-4 relative">
            هل تكتب؟
          </h2>
          <p className="text-text-muted max-w-lg mx-auto mb-6 relative leading-relaxed">
            نفتح أبوابنا لكل كاتبٍ يحمل قلماً صادقاً. شاركنا أعمالك في أيٍّ من أقسامنا الأدبية.
          </p>
          <Link
            href="/submit"
            className="inline-flex px-8 py-3.5 rounded-full bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 relative items-center gap-2"
          >
            أرسل عملك
            <ArrowLeftIcon size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
