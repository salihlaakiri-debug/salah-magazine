"use client";

import { useState } from "react";
import { ShareIcon } from "./Icons";

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

  const generateCard = async () => {
    setShowCard(true);
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 100));
    setGenerating(false);
  };

  const downloadCard = async () => {
    const card = document.getElementById(`share-card-${articleId}`);
    if (!card) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(card as HTMLDivElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1a1a2e",
        width: 1080,
        height: 1080,
      } as any);
      const link = document.createElement("a");
      link.download = `sudfeh-${articleId.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate card:", err);
    }
  };

  return (
    <>
      <button
        onClick={generateCard}
        className="p-2 rounded-lg hover:bg-accent/10 text-text-muted hover:text-accent transition-all"
        title="إنشاء صورة للمشاركة"
      >
        <ShareIcon size={16} />
      </button>

      {showCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCard(false)}>
          <div className="bg-surface rounded-3xl border border-border/50 p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold font-[var(--font-heading)]">صورة المشاركة</h3>
              <button onClick={() => setShowCard(false)} className="text-text-muted hover:text-foreground text-sm">إغلاق</button>
            </div>

            <div className="rounded-2xl overflow-hidden mb-4">
              <div
                id={`share-card-${articleId}`}
                style={{
                  width: "1080px",
                  height: "1080px",
                  transform: "scale(1)",
                  transformOrigin: "top right",
                  direction: "rtl",
                }}
                className="relative bg-[#1a1a2e] text-white p-20 flex flex-col justify-between overflow-hidden"
              >
                {/* Background decorations */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-16 right-16 w-64 h-64 rounded-full border border-white/[0.05]" />
                  <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full border border-white/[0.04]" />
                  <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white/[0.02]" />
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-l from-[#6c7bc0] via-[#4a5899] to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#6c7bc0]/20 flex items-center justify-center">
                      <span className="text-xl font-bold text-[#6c7bc0]" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>س</span>
                    </div>
                    <span className="text-sm text-white/40" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>السُّدفة — مجلة أدبية</span>
                  </div>

                  <span
                    className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full bg-[#6c7bc0]/20 text-[#98a5e0] mb-6"
                    style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                  >
                    {section}
                  </span>

                  <h2
                    className="text-5xl font-bold leading-[1.3] mb-6"
                    style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                  >
                    {title}
                  </h2>

                  <p className="text-lg text-white/50 leading-relaxed line-clamp-3" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
                    {excerpt}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6c7bc0]/20 flex items-center justify-center text-[#6c7bc0] text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                      {author.startsWith("ال") ? author[2] || author[0] : author[0]}
                    </div>
                    <span className="text-sm text-white/60" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{author}</span>
                  </div>
                  <span className="text-xs text-white/30" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    salah-magazine.vercel.app
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-text-muted mb-3 text-center">صورة بحجم 1080×1080 — مثالية لـ Instagram و Twitter</p>

            <button
              onClick={downloadCard}
              disabled={generating}
              className="w-full py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShareIcon size={14} />
                  تحميل الصورة
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
