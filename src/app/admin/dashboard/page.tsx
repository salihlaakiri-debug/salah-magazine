"use client";

import { articles } from "@/lib/data";
import { SECTIONS } from "@/lib/types";
import { BarChartIcon, FileTextIcon, MessageIcon, TrendingUpIcon, ClockIcon, PenIcon } from "@/components/Icons";

export default function DashboardPage() {
  const totalArticles = articles.length;
  const sections = SECTIONS.length;
  const recentArticles = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const stats = [
    { label: "إجمالي الأعمال", value: totalArticles, icon: FileTextIcon, color: "from-blue-500 to-indigo-600" },
    { label: "الأقسام", value: sections, icon: BarChartIcon, color: "from-emerald-500 to-teal-600" },
    { label: "هذا الشهر", value: articles.filter(a => a.date.startsWith("2026-07")).length, icon: TrendingUpIcon, color: "from-purple-500 to-violet-600" },
    { label: "آخر إضافة", value: recentArticles.length > 0 ? recentArticles[0].date.slice(5) : "-", icon: ClockIcon, color: "from-amber-500 to-orange-600" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">لوحة التحكم</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border/50 p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold font-[var(--font-heading)]">{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <ClockIcon size={18} className="text-accent" />
            آخر الأعمال
          </h3>
          <div className="space-y-3">
            {recentArticles.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-[11px] text-text-muted">{a.section} · {a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
            <BarChartIcon size={18} className="text-accent" />
            توزيع الأقسام
          </h3>
          <div className="space-y-4">
            {SECTIONS.map((s) => {
              const count = articles.filter((a) => a.section === s.name).length;
              const percent = totalArticles > 0 ? (count / totalArticles) * 100 : 0;
              return (
                <div key={s.slug}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs text-text-muted">{count} أعمال</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
