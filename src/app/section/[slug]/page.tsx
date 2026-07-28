import { notFound } from "next/navigation";
import Link from "next/link";
import { SECTIONS } from "@/lib/types";
import { fetchArticlesBySection } from "@/lib/supabase-data";
import WorkCard from "@/components/WorkCard";
import SectionIcon from "@/components/SectionIcon";
import { FileTextIcon } from "@/components/Icons";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = SECTIONS.find((s) => s.slug === slug);
  if (!section) return {};
  return {
    title: `${section.name} | مجلة السُّدفة`,
    description: section.description,
    openGraph: {
      title: `${section.name} | مجلة السُّدفة`,
      description: section.description,
      type: "website",
      locale: "ar_SA",
      siteName: "السُّدفة",
    },
    twitter: {
      card: "summary_large_image",
      title: `${section.name} | مجلة السُّدفة`,
      description: section.description,
    },
  };
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = SECTIONS.find((s) => s.slug === slug);
  if (!section) notFound();

  const articles = await fetchArticlesBySection(section.name);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", url: "/" },
          { name: section.name, url: `/section/${section.slug}` },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-text-muted mb-10">
          <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{section.name}</span>
        </nav>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-10 rounded-full bg-accent" />
            <div className="text-accent">
              <SectionIcon section={section.name} size={40} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)] mb-3">
            {section.name}
          </h1>
          <p className="text-text-muted text-lg">{section.description}</p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
            <FileTextIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
            <p className="text-text-muted">لا توجد أعمال في هذا القسم بعد.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <WorkCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
