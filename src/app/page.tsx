import Link from "next/link";
import { SECTIONS } from "@/lib/types";
import { fetchPublishedArticles } from "@/lib/supabase-data";
import WorkCard from "@/components/WorkCard";
import SectionIcon from "@/components/SectionIcon";
import ScrollReveal from "@/components/ScrollReveal";
import NewsletterSignup from "@/components/NewsletterSignup";
import OrnamentalDivider from "@/components/OrnamentalDivider";
import SudfehIcon from "@/components/SudfehIcon";
import { ArrowLeftIcon, SearchIcon } from "@/components/Icons";

const QUOTES = [
  "الكلمةُ حين تُولد من الصمت، تحملهُ معها أينما ذهبت",
  "الكتابةُ ليست خروجاً من العزلة، بل دخولاً في نوعٍ آخر منها",
  "نحن لا نقرأ كلامَ المؤلف فحسب، بل نقرأ صمتَه",
  "القراءةُ الفعلية ليست في النص، بل فيما حوله",
  "حينَ يكتبُ الإنسان، لا يُسكنُ الحضور فحسب، بل يُسكنُ الغياب",
  "الاسمُ في حدِّ ذاته، يمنحُها شكلاً أكثرَ اكتمالاً مما تستحق",
];

export const metadata = {
  title: "السُّدفة | مجلة أدبية عربية",
  description: "حيث تولد الكلمة من الصمت، ويعود الصمت حاملاً المعنى. نفتح صفحاتٍ للغةٍ تتنفّس، وللأدبِ يهمس. شعرٌ ونثرٌ وتأملاتٌ من عوالمِ لا يسمعها إلا مَن يصغي.",
  openGraph: {
    title: "السُّدفة | مجلة أدبية عربية",
    description: "مجلة أدبية عربية تنشر القصائد والتأملات والحكايات من عوالم اللغة والصمت.",
    type: "website",
    locale: "ar_SA",
    siteName: "السُّدفة",
  },
};

export default async function HomePage() {
  const allArticles = await fetchPublishedArticles();
  const featured = allArticles[0];
  const latest = allArticles.slice(1, 4);
  const more = allArticles.slice(4, 8);

  const bySection = SECTIONS.map((s) => ({
    ...s,
    articles: allArticles.filter((a) => a.section === s.name).slice(0, 2),
  })).filter((s) => s.articles.length > 0);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-center hero-gradient overflow-hidden arabesque-bg">
        {/* Animated background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
          {/* Large orbs */}
          <div className="absolute top-[8%] right-[3%] w-80 h-80 rounded-full bg-accent/[0.03] animate-drift blur-sm" />
          <div className="absolute bottom-[12%] left-[5%] w-56 h-56 rounded-full bg-accent/[0.04] animate-drift blur-sm" style={{ animationDelay: "-7s" }} />

          {/* Rings */}
          <div className="absolute top-[35%] left-[55%] w-28 h-28 rounded-full border border-accent/[0.06] animate-drift" style={{ animationDelay: "-12s" }} />
          <div className="absolute top-[60%] right-[25%] w-16 h-16 rounded-full border border-accent/[0.08] animate-drift" style={{ animationDelay: "-4s" }} />

          {/* Diamonds */}
          <div className="absolute top-[20%] right-[40%] w-6 h-6 shape-diamond border border-accent/[0.1] animate-drift" style={{ animationDelay: "-3s" }} />
          <div className="absolute bottom-[35%] left-[30%] w-4 h-4 shape-diamond bg-accent/[0.06] animate-drift" style={{ animationDelay: "-9s" }} />
          <div className="absolute top-[65%] right-[15%] w-8 h-8 shape-diamond border border-accent/[0.05] animate-drift" style={{ animationDelay: "-6s" }} />

          {/* Diagonal lines */}
          <div className="absolute top-[15%] right-[20%] w-20 h-px bg-accent/[0.08] rotate-45 animate-drift" style={{ animationDelay: "-11s" }} />
          <div className="absolute bottom-[25%] left-[45%] w-16 h-px bg-accent/[0.06] -rotate-30 animate-drift" style={{ animationDelay: "-5s" }} />

          {/* Small dots */}
          <div className="absolute top-[18%] left-[22%] w-2.5 h-2.5 rounded-full bg-accent/25 animate-float" style={{ animationDelay: "-2s" }} />
          <div className="absolute bottom-[28%] right-[18%] w-2 h-2 rounded-full bg-accent/35 animate-float" style={{ animationDelay: "-5s" }} />
          <div className="absolute top-[55%] right-[32%] w-3 h-3 rounded-full bg-accent/15 animate-float" style={{ animationDelay: "-1s" }} />
          <div className="absolute top-[70%] left-[35%] w-1.5 h-1.5 rounded-full bg-accent/20 animate-float" style={{ animationDelay: "-8s" }} />

          {/* Decorative letter */}
          <div className="absolute top-[8%] left-[10%] text-[20vw] font-[var(--font-heading)] font-bold text-stroke opacity-[0.03] select-none leading-none animate-gentle-pulse" aria-hidden="true">س</div>

          {/* Gradient mesh */}
          <div className="absolute inset-0 mesh-gradient opacity-60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-36 w-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-right">
              <div className="inline-flex items-center gap-3 mb-6 sm:mb-8 animate-fade-in-up">
                <div className="editorial-line" />
                <span className="text-[10px] sm:text-xs font-medium tracking-widest text-accent uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                  مجلة أدبية عربية
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black font-[var(--font-heading)] mb-6 sm:mb-8 animate-fade-in-up delay-100 opacity-0 leading-[0.95]">
                <span className="gradient-text">السُّدفة</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-text-muted max-w-xl mx-auto lg:mx-0 mb-8 sm:mb-10 animate-fade-in-up delay-200 opacity-0 leading-relaxed">
                حيث تولد الكلمة من الصمت، ويعود الصمت حاملاً المعنى.
                <br className="hidden sm:block" />
                نفتح صفحاتٍ للغةٍ تتنفّس، وللأدبِ يهمس.
                <br className="hidden sm:block" />
                <span className="text-accent/70">شعرٌ ونثرٌ وتأملاتٌ من عوالمِ لا يسمعها إلا مَن يصغي.</span>
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 animate-fade-in-up delay-300 opacity-0">
                <Link
                  href="/archive"
                  className="group px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-accent text-white font-medium hover:bg-accent-dark transition-all duration-300 shadow-xl shadow-accent/15 hover:shadow-accent/25 hover:shadow-2xl flex items-center gap-2 sm:gap-2.5 text-sm btn-ripple active:scale-95"
                >
                  تصفّح الأرشيف
                  <ArrowLeftIcon size={15} />
                </Link>
                <Link
                  href="/search"
                  className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-border bg-surface font-medium hover:border-accent/30 hover:bg-surface-hover transition-all duration-300 flex items-center gap-2 sm:gap-2.5 text-sm btn-ripple active:scale-95"
                >
                  <SearchIcon size={15} />
                  بحث
                </Link>
              </div>
            </div>

            {featured && (
              <div className="lg:col-span-5 animate-fade-in-up delay-400 opacity-0">
                <Link href={`/work/${featured.id}`} className="group block">
                  <div className="relative bg-surface rounded-2xl sm:rounded-3xl border border-border/60 p-6 sm:p-8 shadow-xl shadow-accent/[0.04] card-hover overflow-hidden">
                    {/* Animated top bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-accent via-accent-light to-transparent" />
                    {/* Background glow */}
                    <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-accent/[0.04] group-hover:bg-accent/[0.08] transition-colors duration-500 blur-xl" />
                    <div className="relative">
                      <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-accent/10 text-accent mb-4 inline-block section-badge">
                        {featured.section}
                      </span>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold font-[var(--font-heading)] mb-3 group-hover:text-accent transition-colors duration-300 leading-snug">
                        {featured.title}
                      </h2>
                      <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-5 sm:mb-6">
                        {featured.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold">
                            {featured.author.startsWith("ال") ? featured.author[2] || featured.author[0] : featured.author[0]}
      {/* ── NEWSLETTER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <ScrollReveal>
          <NewsletterSignup />
        </ScrollReveal>
      </section>
    </div>
                          <span className="text-xs text-text-muted">{featured.author}</span>
                        </div>
                        <span className="text-accent text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          اقرأ المزيد
                          <ArrowLeftIcon size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="border-y border-border/40 bg-surface/40 overflow-hidden py-4 sm:py-5 marquee-edge" role="marquee" aria-label="اقتباسات أدبية">
        <div className="flex whitespace-nowrap marquee-track" aria-hidden="true">
          {[...QUOTES, ...QUOTES].map((q, i) => (
            <span key={i} className="mx-6 sm:mx-8 text-xs sm:text-sm text-text-muted/50 italic font-[var(--font-arabic)]">
              &laquo; {q} &raquo;
            </span>
          ))}
        </div>
      </div>

      <OrnamentalDivider className="py-6" />

      {/* ── LATEST WORKS ── */}
      {latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-10 sm:mb-12">
              <div className="editorial-line-lg" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-[var(--font-heading)]">
                الأحدث
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
            {latest[0] && (
              <ScrollReveal className="md:col-span-7" delay={100}>
                <WorkCard article={latest[0]} featured />
              </ScrollReveal>
            )}
            <div className="md:col-span-5 flex flex-col gap-4 sm:gap-5">
              {latest.slice(1).map((a, i) => (
                <ScrollReveal key={a.id} delay={200 + i * 100}>
                  <WorkCard article={a} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTIONS ── */}
      {bySection.length > 0 && (
        <section className="bg-surface/40 border-y border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-10 sm:mb-14">
                <div className="editorial-line-lg" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-[var(--font-heading)]">
                  أقسام المجلة
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5" role="list" aria-label="أقسام المجلة">
              {SECTIONS.map((s, i) => (
                <ScrollReveal key={s.slug} delay={i * 80}>
                  <Link
                    href={`/section/${s.slug}`}
                    className="group relative bg-surface rounded-xl sm:rounded-2xl border border-border/50 p-4 sm:p-6 card-hover text-center overflow-hidden block"
                    role="listitem"
                    aria-label={s.name}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-accent/[0.07] flex items-center justify-center text-accent group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/10 transition-all duration-300">
                        <SectionIcon section={s.name} size={22} />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm font-[var(--font-heading)] group-hover:text-accent transition-colors duration-300 mb-1">
                        {s.name}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-text-muted leading-relaxed line-clamp-2 hidden sm:block">
                        {s.description}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION ARTICLES ── */}
      {bySection.map((s) => {
        if (s.articles.length === 0) return null;
        return (
          <section key={s.slug} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="editorial-line" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold font-[var(--font-heading)]">
                    {s.name}
                  </h2>
                </div>
                <Link
                  href={`/section/${s.slug}`}
                  className="text-xs sm:text-sm text-accent hover:text-accent-dark transition-all duration-300 font-medium flex items-center gap-1.5 hover:translate-x-[-2px]"
                >
                  المزيد
                  <ArrowLeftIcon size={13} />
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
              {s.articles.map((article, i) => (
                <ScrollReveal key={article.id} delay={i * 100}>
                  <WorkCard article={article} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        );
      })}

      {/* ── MORE ARTICLES ── */}
      {more.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="editorial-line-lg" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-[var(--font-heading)]">
                المزيد من الأعمال
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((article, i) => (
              <ScrollReveal key={article.id} delay={i * 80}>
                <WorkCard article={article} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-accent via-accent-dark to-[#0d1025] p-8 sm:p-12 lg:p-20 text-center">
            {/* CTA background shapes */}
            <div className="absolute inset-0 pointer-events-none hidden sm:block">
              <div className="absolute top-[10%] right-[10%] w-40 h-40 rounded-full border border-white/[0.06] animate-drift" />
              <div className="absolute bottom-[15%] left-[15%] w-24 h-24 rounded-full border border-white/[0.04] animate-drift" style={{ animationDelay: "-8s" }} />
              <div className="absolute top-[50%] left-[50%] w-60 h-60 rounded-full bg-white/[0.02] animate-gentle-pulse" />
              <div className="absolute top-[20%] left-[40%] w-2 h-2 rounded-full bg-white/20 animate-float" />
              <div className="absolute bottom-[30%] right-[35%] w-1.5 h-1.5 rounded-full bg-white/15 animate-float" style={{ animationDelay: "-3s" }} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <SudfehIcon size={24} className="text-white/90" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-[var(--font-heading)] mb-3 sm:mb-4 text-white">
                هل تكتب؟
              </h2>
              <p className="text-white/50 max-w-lg mx-auto mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                نفتح أبوابنا لكل كاتبٍ يحمل قلماً صادقاً. شاركنا أعمالك في أيٍّ من أقسامنا الأدبية.
              </p>
              <Link
                href="/submit"
                className="inline-flex px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-accent-dark font-bold text-sm hover:bg-white/90 transition-all duration-300 shadow-2xl shadow-black/20 hover:shadow-black/30 items-center gap-2.5 btn-ripple active:scale-95 hover:scale-[1.02]"
              >
                أرسل عملك
                <ArrowLeftIcon size={15} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
