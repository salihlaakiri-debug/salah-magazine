"use client";

import { useRouter } from "next/navigation";
import { SECTIONS } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";

export default function ArchiveFilters({
  months,
  selectedSection,
  selectedMonth,
  total,
}: {
  months: string[];
  selectedSection: string;
  selectedMonth: string;
  total: number;
}) {
  const router = useRouter();

  function updateParam(key: string, value: string) {
    const url = new URL(window.location.href);
    if (value === "الكل") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    url.searchParams.delete("page");
    router.push(url.pathname + url.search);
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-8" role="group" aria-label="التصفية">
        <div>
          <label htmlFor="section-filter" className="text-[11px] text-text-muted block mb-1.5 font-medium">القسم</label>
          <select
            id="section-filter"
            value={selectedSection}
            onChange={(e) => updateParam("section", e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          >
            <option value="الكل">جميع الأقسام</option>
            {SECTIONS.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month-filter" className="text-[11px] text-text-muted block mb-1.5 font-medium">الشهر</label>
          <select
            id="month-filter"
            value={selectedMonth}
            onChange={(e) => updateParam("month", e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          >
            <option value="الكل">جميع الأشهر</option>
            {months.map((m) => (
              <option key={m} value={m}>{formatMonthYear(m + "-01")}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
        <p className="text-sm text-text-muted">
          {total} عمل أدبي
        </p>
      </div>
    </>
  );
}
