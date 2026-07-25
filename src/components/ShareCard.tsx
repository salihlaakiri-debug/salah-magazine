"use client";

import { useState } from "react";
import { ShareIcon, XIcon } from "./Icons";

interface ShareCardProps {
  title: string;
  excerpt: string;
  section: string;
  author: string;
  articleId: string;
}

function buildCardHTML(title: string, excerpt: string, section: string, author: string): string {
  const initials = author.startsWith("ال") ? author[2] || author[0] : author[0];
  return `
<div style="width:1080px;height:1080px;background:#1a1a2e;color:#fff;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative;font-family:'Noto Kufi Arabic',sans-serif;direction:rtl">
  <div style="position:absolute;inset:0;pointer-events:none">
    <div style="position:absolute;top:64px;right:64px;width:256px;height:256px;border-radius:50%;border:1px solid rgba(255,255,255,0.05)"></div>
    <div style="position:absolute;bottom:80px;left:80px;width:160px;height:160px;border-radius:50%;border:1px solid rgba(255,255,255,0.04)"></div>
    <div style="position:absolute;top:50%;left:33%;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.02)"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:8px;background:linear-gradient(to left,#6c7bc0,#4a5899,transparent)"></div>
  </div>
  <div style="position:relative;z-index:10;padding:80px">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:40px">
      <div style="width:56px;height:56px;border-radius:12px;background:rgba(108,123,192,0.2);display:flex;align-items:center;justify-content:center">
        <span style="font-size:24px;font-weight:700;color:#98a5e0">س</span>
      </div>
      <span style="font-size:16px;color:rgba(255,255,255,0.4)">السُّدفة — مجلة أدبية</span>
    </div>
    <span style="display:inline-block;font-size:14px;font-weight:600;padding:8px 20px;border-radius:999px;background:rgba(108,123,192,0.2);color:#98a5e0;margin-bottom:32px">${section}</span>
    <h2 style="font-size:56px;font-weight:700;line-height:1.3;margin:0 0 32px">${title}</h2>
    <p style="font-size:24px;color:rgba(255,255,255,0.5);line-height:1.7;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-family:'Noto Naskh Arabic',serif">${excerpt}</p>
  </div>
  <div style="position:relative;z-index:10;padding:80px;padding-top:0;display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:16px">
      <div style="width:48px;height:48px;border-radius:50%;background:rgba(108,123,192,0.2);display:flex;align-items:center;justify-content:center;color:#98a5e0;font-size:20px;font-weight:700">${initials}</div>
      <span style="font-size:16px;color:rgba(255,255,255,0.6)">${author}</span>
    </div>
    <span style="font-size:14px;color:rgba(255,255,255,0.3)">salah-magazine.vercel.app</span>
  </div>
</div>`;
}

export default function ShareCard({ title, excerpt, section, author, articleId }: ShareCardProps) {
  const [showCard, setShowCard] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadCard = async () => {
    setGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "position:fixed;left:0;top:0;z-index:-1;pointer-events:none";
      wrapper.innerHTML = buildCardHTML(title, excerpt, section, author);
      document.body.appendChild(wrapper);

      const cardEl = wrapper.firstElementChild as HTMLElement;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const canvas = await html2canvas(cardEl, {
        useCORS: true,
        backgroundColor: "#1a1a2e",
        width: 1080,
        height: 1080,
      } as any);

      document.body.removeChild(wrapper);

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
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-[#6c7bc0]/20 flex items-center justify-center">
                    <span className="text-base font-bold text-[#98a5e0]" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>س</span>
                  </div>
                  <span className="text-xs text-white/40" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>السُّدفة — مجلة أدبية</span>
                </div>
                <span
                  className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full bg-[#6c7bc0]/20 text-[#98a5e0] mb-4"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  {section}
                </span>
                <h2
                  className="text-xl font-bold leading-snug mb-3"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  {title}
                </h2>
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
                  {excerpt}
                </p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#6c7bc0]/20 flex items-center justify-center text-[#98a5e0] text-xs font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                      {author.startsWith("ال") ? author[2] || author[0] : author[0]}
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
    </>
  );
}
