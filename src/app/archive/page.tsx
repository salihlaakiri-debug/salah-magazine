import Link from "next/link";
import { SECTIONS } from "@/lib/types";
import { fetchPublishedArticles, fetchPublishedArticlesCount } from "@/lib/supabase-data";
import WorkCard from "@/components/WorkCard";
import Pagination from "@/components/Pagination";
import { FileTextIcon } from "@/components/Icons";
import { formatMonthYear } from "@/lib/utils";
import ArchiveFilters from "./ArchiveFilters";

export const revalidate = 300;

const PAGE_SIZE = 12;

export const metadata = {
  title: "الأرشيف | مجلة السُّدفة",
  description: "تصفح جميع الأعمال الأدبية في مجلة السُّدفة",
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; section?: string; month?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const selectedSection = params.section || "الكل";
  const selectedMonth = params.month || "الكل";

  const totalArticles = await fetchPublishedArticlesCount();
  const offset = (currentPage - 1) * PAGE_SIZE;

  const allArticles = await fetchPublishedArticles(Math.min(totalArticles, 200));

  const months = [...new Set(allArticles.map((a) => a.date?.slice(0, 7)))].filter(Boolean).sort().reverse();

  const filtered = allArticles.filter((a) => {
    const sectionMatch = selectedSection === "الكل" || a.section === selectedSection;
    const monthMatch = selectedMonth === "الكل" || (a.date && a.date.startsWith(selectedMonth));
    return sectionMatch && monthMatch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav aria-label="التنقل" className="text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">الأرشيف</span>
      </nav>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-10 rounded-full bg-accent" aria-hidden="true" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)]">
            الأرشيف
          </h1>
          <p className="text-sm text-text-muted mt-1">تصفح جميع الأعمال الأدبية</p>
        </div>
      </div>

      <ArchiveFilters
        months={months}
        selectedSection={selectedSection}
        selectedMonth={selectedMonth}
        total={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <FileTextIcon size={48} className="mx-auto text-text-muted/20 mb-4" aria-hidden="true" />
          <p className="text-text-muted">لا توجد أعمال تطابق التصفية.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((article) => (
              <WorkCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/archive" />
        </>
      )}
    </div>
  );
}
