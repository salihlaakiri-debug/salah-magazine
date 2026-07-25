"use client";

import { useState, useRef } from "react";
import { ShareIcon, XIcon } from "./Icons";

interface ShareCardProps {
  title: string;
  excerpt: string;
  section: string;
  author: string;
  articleId: string;
}

export default function ShareCard({ title, excerpt, section, author, articleId }: ShareCardProps) {
  const [showCard, setShowCard] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const offscreenRef = useRef<HTMLDivElement>(null);

  const initials = author.startsWith("ال") ? author[2] || author[0] : author[0];

  const downloadCard = async () => {
    setGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = offscreenRef.current;
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1a1a2e",
        width: 1080,
        height: 1080,
      } as any);

      document.body.removeChild(el);

      const link = document.createElement("a");
      link.download = `sudfeh-${articleId.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate card:", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://salah-magazine.vercel.app/work/${articleId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowCard(true)}
        className="p-2 rounded-lg hover:bg-accent/10 text-text-muted hover:text-accent transition-all"
        title="مشاركة"
      >
        <ShareIcon size={16} />
      </button>

      {showCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCard(false)}
        >
          <div
            className="bg-surface rounded-2xl sm:rounded-3xl border border-border/50 w-full max-w-sm shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <h3 className="font-bold font-[var(--font-heading)] text-sm">مشاركة</h3>
              <button
                onClick={() => setShowCard(false)}
                className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Preview card */}
            <div className="p-4">
              <div className="rounded-xl overflow-hidden bg-[#1a1a2e] text-white p-6">
                {/* Brand */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-[#6c7bc0]/20 flex items-center justify-center">
                    <span className="text-base font-bold text-[#98a5e0]" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>س</span>
                  </div>
                  <span className="text-xs text-white/40" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>السُّدفة — مجلة أدبية</span>
                </div>

                {/* Section tag */}
                <span
                  className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full bg-[#6c7bc0]/20 text-[#98a5e0] mb-4"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  {section}
                </span>

                {/* Title */}
                <h2
                  className="text-xl font-bold leading-snug mb-3"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  {title}
                </h2>

                {/* Excerpt */}
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
                  {excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#6c7bc0]/20 flex items-center justify-center text-[#98a5e0] text-xs font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                      {initials}
                    </div>
                    <span className="text-[11px] text-white/60" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{author}</span>
                  </div>
                  <span className="text-[9px] text-white/30" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    salah-magazine.vercel.app
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 space-y-2">
              <button
                onClick={downloadCard}
                disabled={generating}
                className="w-full py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <ShareIcon size={14} />
                    تحميل الصورة
                  </>
                )}
              </button>
              <button
                onClick={copyLink}
                className="w-full py-2.5 rounded-xl border border-border text-text-muted text-sm hover:bg-surface-hover transition-all"
              >
                {copied ? "تم النسخ ✓" : "نسخ الرابط"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off-screen div for html2canvas — not visible, not in layout flow */}
      <div ref={offscreenRef} style={{ width: 1080, height: 1080, position: "fixed", left: -9999, top: 0, direction: "rtl" }} className="bg-[#1a1a2e] text-white flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 right-16 w-64 h-64 rounded-full border border-white/[0.05]" />
          <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full border border-white/[0.04]" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white/[0.02]" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-l from-[#6c7bc0] via-[#4a5899] to-transparent" />
        </div>
        <div className="relative z-10 p-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-xl bg-[#6c7bc0]/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#98a5e0]" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>س</span>
            </div>
            <span className="text-base text-white/40" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>السُّدفة — مجلة أدبية</span>
          </div>
          <span className="inline-block text-sm font-semibold px-5 py-2 rounded-full bg-[#6c7bc0]/20 text-[#98a5e0] mb-8" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            {section}
          </span>
          <h2 className="text-[3.5rem] font-bold leading-[1.3] mb-8" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            {title}
          </h2>
          <p className="text-2xl text-white/50 leading-relaxed line-clamp-3" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
            {excerpt}
          </p>
        </div>
        <div className="relative z-10 p-20 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6c7bc0]/20 flex items-center justify-center text-[#98a5e0] text-lg font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              {initials}
            </div>
            <span className="text-base text-white/60" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{author}</span>
          </div>
          <span className="text-sm text-white/30" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>salah-magazine.vercel.app</span>
        </div>
      </div>
    </>
  );
}
