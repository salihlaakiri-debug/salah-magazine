"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import MarkdownContent from "@/components/MarkdownContent";
import { SECTIONS } from "@/lib/types";
import { ArrowLeftIcon, EyeIcon, EditIcon, ClockIcon } from "@/components/Icons";
import { showToast } from "@/lib/toast";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

const sectionColors: Record<string, string> = {
  "شعر": "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
  "قصة": "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
  "نثر": "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
  "مقالات": "from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400",
  "تأملات": "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400",
};

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    document.title = "معاينة المقال | مجلة السُّدفة";
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }

    async function load() {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data || !user) {
        showToast("المقال غير موجود", "error");
        router.replace("/");
        return;
      }

      const isOwner = data.author_id === user.id;
      if (!isOwner && !isAdmin) {
        showToast("لا تملك صلاحية معاينة هذا المقال", "error");
        router.replace("/");
        return;
      }

      setArticle(data);
      setAuthorized(true);
      setLoading(false);
    }
    load();
  }, [id, user, isAdmin, authLoading, router]);

  if (loading || authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  if (!article) return null;

  const colors = sectionColors[article.section] || "";
  const sectionSlug = SECTIONS.find((s) => s.name === article.section)?.slug || "";

  return (
    <div>
      {/* Preview banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            <EyeIcon size={16} />
            <span>وضع المعاينة — هذه الصفحة غير منشورة بعد</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/submit?edit=${article.id}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <EditIcon size={12} />
              تعديل
            </Link>
            <Link
              href="/my-works"
              className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border/50 text-text-muted hover:text-foreground transition-all flex items-center gap-1.5"
            >
              <ArrowLeftIcon size={12} />
              العودة
            </Link>
          </div>
        </div>
      </div>

      {/* Article content - same layout as work/[id] */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <nav className="text-sm text-text-muted mb-10 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
          <span className="text-border">/</span>
          <Link href={`/section/${sectionSlug}`} className="hover:text-accent transition-colors">{article.section}</Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{article.title}</span>
        </nav>

        <article>
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r ${colors}`}>
                {article.section}
              </span>
              <span className="text-xs text-text-muted">{article.read_time || "3 دقائق"}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                article.status === "published" ? "bg-emerald-500/10 text-emerald-600" :
                article.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                "bg-gray-500/10 text-gray-600"
              }`}>
                {article.status === "published" ? "منشور" : article.status === "pending" ? "قيد المراجعة" : "مسودة"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[var(--font-heading)] mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                {article.author_name?.[0] || "?"}
              </div>
              <div>
                <span className="block font-bold text-sm">{article.author_name}</span>
                <span className="text-xs text-text-muted">{article.created_at ? formatDate(article.created_at) : ""}</span>
              </div>
            </div>
          </header>

          <div className="article-content text-foreground/90">
            <MarkdownContent content={article.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
