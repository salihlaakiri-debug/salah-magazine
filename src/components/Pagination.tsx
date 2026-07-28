"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function getPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return `${baseUrl}${qs ? `?${qs}` : ""}`;
  }

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav aria-label="تنقل بين الصفحات" className="flex items-center justify-center gap-1.5 mt-10">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-hover transition-all"
          aria-label="الصفحة السابقة"
        >
          ← السابق
        </Link>
      )}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-sm text-text-muted">...</span>
        ) : (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
              page === currentPage
                ? "bg-accent text-white shadow-lg shadow-accent/20"
                : "hover:bg-surface-hover"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-hover transition-all"
          aria-label="الصفحة التالية"
        >
          التالي →
        </Link>
      )}
    </nav>
  );
}
