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
  const cardRef = useRef<HTMLDivElement>(null);

  const generateCard = async () => {
    setShowCard(true);
  };

  const downloadCard = async () => {
    const card = cardRef.current;
    if (!card) return;

    setGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(card, {
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
    } finally {
      setGenerating(false);
    }
  };

  const initials = author.startsWith("ال") ? author[2] || author[0] : author[0];

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCard(false)}
        >
          <div
            className="bg-surface rounded-2xl sm:rounded-3xl border border-border/50 w-full max-w-md shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <h3 className="font-bold font-[var(--font-heading)] text-sm">صورة المشاركة</h3>
              <button
                onClick={() => setShowCard(false)}
                className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Card preview */}
            <div className="p-4">
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-border/20">
                {/* Actual card at 1080x1080, scaled down */}
                <div
                  ref={cardRef}
                  style={{
                    width: "1080px",
                    height: "1080px",
                    transform: "scale(0.34)",
                    transformOrigin: "top right",
                    position: "relative",
                  }}
                  className="bg-[#1a1a2e] text-white flex flex-col justify-between overflow-hidden"
                >
                  {/* Background decorations */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-16 right-16 w-64 h-64 rounded-full border border-white/[0.05]" />
                    <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full border border-white/[0.04]" />
                    <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white/[0.02]" />
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-l from-[#6c7bc0] via-[#4a5899] to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-20">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-xl bg-[#6c7bc0]/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#98a5e0]" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>س</span>
                      </div>
                      <span className="text-base text-white/40" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>السُّدفة — مجلة أدبية</span>
                    </div>

                    <span
                      className="inline-block text-sm font-semibold px-5 py-2 rounded-full bg-[#6c7bc0]/20 text-[#98a5e0] mb-8"
                      style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                    >
                      {section}
                    </span>

                    <h2
                      className="text-[3.5rem] font-bold leading-[1.3] mb-8"
                      style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                    >
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
                    <span className="text-sm text-white/30" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                      salah-magazine.vercel.app
                    </span>
                  </div>
                </div>

                {/* Spacer to maintain aspect ratio */}
                <div style={{ height: "367px" }} />
              </div>

              <p className="text-[11px] text-text-muted mt-3 text-center">صورة 1080×1080 — مثالية لـ Instagram و Twitter و Facebook</p>
            </div>

            {/* Download button */}
            <div className="px-4 pb-4">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
