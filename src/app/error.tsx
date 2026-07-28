"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/Icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-red-500/10 flex items-center justify-center">
          <span className="text-4xl">!</span>
        </div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-3">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-text-muted mb-8 leading-relaxed">
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all duration-300 active:scale-95"
          >
            حاول مرة أخرى
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-border bg-surface text-sm font-medium hover:bg-surface-hover transition-all duration-300 flex items-center gap-2 active:scale-95"
          >
            الرئيسية
            <ArrowLeftIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
