"use client";

import { useState } from "react";
import { ShareIcon, XIcon, DownloadIcon } from "./Icons";

interface ShareCardProps {
  title: string;
  excerpt: string;
  section: string;
  author: string;
  articleId: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSectionColor(section: string): { bg: string; fg: string; accent: string } {
  const map: Record<string, { bg: string; fg: string; accent: string }> = {
    "شعر":   { bg: "#f59e0b20", fg: "#fbbf24", accent: "#f59e0b" },
    "قصة":   { bg: "#3b82f620", fg: "#60a5fa", accent: "#3b82f6" },
    "نثر":   { bg: "#10b98120", fg: "#34d399", accent: "#10b981" },
    "مقالات": { bg: "#8b5cf620", fg: "#a78bfa", accent: "#8b5cf6" },
    "تأملات": { bg: "#f43f5e20", fg: "#fb7185", accent: "#f43f5e" },
  };
  return map[section] || { bg: "#6c7bc020", fg: "#98a5e0", accent: "#6c7bc0" };
}

function buildCardHTML(title: string, excerpt: string, section: string, author: string): string {
  const initials = author.startsWith("ال") ? author[2] || author[0] : author[0];
  const sc = getSectionColor(section);
  const safeTitle = escapeHtml(title);
  const safeExcerpt = escapeHtml(excerpt);
  const safeAuthor = escapeHtml(author);
  const safeSection = escapeHtml(section);

  return `
<div style="
  width:1080px;height:1080px;
  background:linear-gradient(160deg,#0f1021 0%,#1a1a2e 40%,#141428 100%);
  color:#fff;display:flex;flex-direction:column;
  overflow:hidden;position:relative;
  font-family:'Noto Kufi Arabic','Noto Naskh Arabic',sans-serif;
  direction:rtl
">

  <!-- Decorative background -->
  <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
    <!-- Large soft glow -->
    <div style="position:absolute;top:-120px;right:-100px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,${sc.accent}12 0%,transparent 70%)"></div>
    <div style="position:absolute;bottom:-80px;left:-60px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(108,123,192,0.06) 0%,transparent 70%)"></div>

    <!-- Geometric patterns -->
    <svg style="position:absolute;top:40px;right:40px;opacity:0.04" width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="90" fill="none" stroke="white" stroke-width="0.5"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="white" stroke-width="0.5"/>
      <circle cx="100" cy="100" r="50" fill="none" stroke="white" stroke-width="0.5"/>
      <line x1="100" y1="10" x2="100" y2="190" stroke="white" stroke-width="0.3"/>
      <line x1="10" y1="100" x2="190" y2="100" stroke="white" stroke-width="0.3"/>
    </svg>

    <!-- Diagonal line -->
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,transparent 48%,rgba(255,255,255,0.015) 48%,rgba(255,255,255,0.015) 52%,transparent 52%)"></div>

    <!-- Decorative quote mark -->
    <div style="position:absolute;top:200px;left:60px;font-size:300px;font-family:Amiri,serif;color:rgba(255,255,255,0.03);line-height:1;margin:0;transform:scaleX(-1)">&#1548;</div>
  </div>

  <!-- Main content -->
  <div style="position:relative;z-index:10;padding:72px 80px 0;flex:1;display:flex;flex-direction:column">

    <!-- Top bar: logo + section -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:48px">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,${sc.accent}30,${sc.accent}15);display:flex;align-items:center;justify-content:center;border:1px solid ${sc.accent}25">
          <span style="font-size:22px;font-weight:800;color:${sc.fg}">س</span>
        </div>
        <div>
          <span style="font-size:15px;font-weight:700;color:rgba(255,255,255,0.85);letter-spacing:-0.3px">السُّدفة</span>
          <span style="display:block;font-size:11px;color:rgba(255,255,255,0.3);margin-top:-2px;letter-spacing:0.5px">مجلة أدبية</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:8px;height:8px;border-radius:50%;background:${sc.accent};opacity:0.8"></div>
        <span style="font-size:13px;font-weight:600;color:${sc.fg};background:${sc.bg};padding:6px 18px;border-radius:999px;border:1px solid ${sc.accent}20">${safeSection}</span>
      </div>
    </div>

    <!-- Decorative divider -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:40px">
      <div style="flex:1;height:1px;background:linear-gradient(to left,${sc.accent}40,transparent)"></div>
      <svg width="20" height="20" viewBox="0 0 20 20" style="opacity:0.3">
        <path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" fill="${sc.fg}"/>
      </svg>
      <div style="flex:1;height:1px;background:linear-gradient(to right,${sc.accent}40,transparent)"></div>
    </div>

    <!-- Title -->
    <h1 style="
      font-size:52px;font-weight:800;line-height:1.35;
      margin:0 0 36px;
      color:rgba(255,255,255,0.95);
      letter-spacing:-0.5px;
      font-family:'Noto Kufi Arabic',sans-serif
    ">${safeTitle}</h1>

    <!-- Excerpt -->
    <p style="
      font-size:22px;line-height:1.85;
      color:rgba(255,255,255,0.45);
      margin:0;
      font-family:'Noto Naskh Arabic',serif;
      display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden
    ">${safeExcerpt}</p>

    <!-- Bottom decorative element -->
    <div style="flex:1"></div>

    <!-- Bottom section -->
    <div style="padding:48px 0 0">
      <!-- Divider -->
      <div style="height:1px;background:linear-gradient(to left,${sc.accent}30,rgba(255,255,255,0.08),transparent);margin-bottom:36px"></div>

      <div style="display:flex;align-items:center;justify-content:space-between">
        <!-- Author -->
        <div style="display:flex;align-items:center;gap:14px">
          <div style="
            width:48px;height:48px;border-radius:50%;
            background:linear-gradient(135deg,${sc.accent}25,${sc.accent}10);
            display:flex;align-items:center;justify-content:center;
            color:${sc.fg};font-size:18px;font-weight:700;
            border:1px solid ${sc.accent}20
          ">${initials}</div>
          <div>
            <span style="font-size:15px;font-weight:600;color:rgba(255,255,255,0.75)">${safeAuthor}</span>
            <span style="display:block;font-size:11px;color:rgba(255,255,255,0.25);margin-top:2px">كاتب في السُّدفة</span>
          </div>
        </div>

        <!-- URL -->
        <div style="text-align:left">
          <span style="font-size:12px;color:rgba(255,255,255,0.2);letter-spacing:0.3px">salah-magazine.vercel.app</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom accent bar -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(to left,${sc.accent},${sc.accent}60,rgba(108,123,192,0.3),transparent);z-index:20"></div>
</div>`;
}

/* ─── Preview card (scaled-down visual replica) ─── */
function PreviewCard({ title, excerpt, section, author }: { title: string; excerpt: string; section: string; author: string }) {
  const sc = getSectionColor(section);
  const initials = author.startsWith("ال") ? author[2] || author[0] : author[0];

  return (
    <div
      className="rounded-xl overflow-hidden text-white"
      style={{
        background: "linear-gradient(160deg,#0f1021 0%,#1a1a2e 40%,#141428 100%)",
        aspectRatio: "1/1",
      }}
    >
      <div className="relative h-full flex flex-col p-[7%]">
        {/* BG decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[15%] -right-[12%] w-[55%] h-[55%] rounded-full" style={{ background: `radial-gradient(circle,${sc.accent}12,transparent 70%)` }} />
          <div className="absolute bottom-[8%] -left-[6%] w-[37%] h-[37%] rounded-full" style={{ background: "radial-gradient(circle,rgba(108,123,192,0.06),transparent 70%)" }} />
          <div className="absolute top-[19%] left-[6%] text-[28vw] leading-none font-[Amiri] opacity-[0.03] scale-x-[-1]">،</div>
        </div>

        {/* Logo + section */}
        <div className="relative z-10 flex items-center justify-between mb-[6%]">
          <div className="flex items-center gap-[3.5%]">
            <div className="w-[7.5%] aspect-square rounded-[14%] flex items-center justify-center border" style={{ background: `linear-gradient(135deg,${sc.accent}30,${sc.accent}15)`, borderColor: `${sc.accent}25` }}>
              <span className="font-extrabold text-[4.5%]" style={{ color: sc.fg }}>س</span>
            </div>
            <div>
              <span className="block font-bold text-[3.2%] text-white/85" style={{ letterSpacing: "-0.3px" }}>السُّدفة</span>
              <span className="block text-[2.1%] text-white/30 -mt-[1px]" style={{ letterSpacing: "0.5px" }}>مجلة أدبية</span>
            </div>
          </div>
          <div className="flex items-center gap-[1.5%]">
            <div className="w-[1.5%] aspect-square rounded-full" style={{ background: sc.accent, opacity: 0.8 }} />
            <span className="font-semibold text-[2.5%] px-[3.5%] py-[1%] rounded-full border" style={{ color: sc.fg, background: sc.bg, borderColor: `${sc.accent}20` }}>
              {section}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative z-10 flex items-center gap-[3%] mb-[6%]">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left,${sc.accent}40,transparent)` }} />
          <svg width="12" height="12" viewBox="0 0 20 20" style={{ opacity: 0.3 }}>
            <path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" fill={sc.fg} />
          </svg>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right,${sc.accent}40,transparent)` }} />
        </div>

        {/* Title */}
        <h1
          className="relative z-10 font-extrabold leading-[1.35] mb-[5%] text-white/95 line-clamp-3"
          style={{ fontSize: "clamp(14px,4.5vw,22px)", letterSpacing: "-0.5px", fontFamily: "'Noto Kufi Arabic',sans-serif" }}
        >
          {title}
        </h1>

        {/* Excerpt */}
        <p
          className="relative z-10 leading-[1.85] text-white/40 line-clamp-3 flex-1"
          style={{ fontSize: "clamp(10px,2.8vw,14px)", fontFamily: "'Noto Naskh Arabic',serif" }}
        >
          {excerpt}
        </p>

        {/* Bottom */}
        <div className="relative z-10 mt-auto pt-[5%]">
          <div className="h-px mb-[4.5%]" style={{ background: `linear-gradient(to left,${sc.accent}30,rgba(255,255,255,0.08),transparent)` }} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[3%]">
              <div className="w-[7%] aspect-square rounded-full flex items-center justify-center text-[2.8%] font-bold border" style={{ background: `linear-gradient(135deg,${sc.accent}25,${sc.accent}10)`, color: sc.fg, borderColor: `${sc.accent}20` }}>
                {initials}
              </div>
              <div>
                <span className="block font-semibold text-[2.8%] text-white/75">{author}</span>
                <span className="block text-[1.8%] text-white/25 mt-[-1px]">كاتب في السُّدفة</span>
              </div>
            </div>
            <span className="text-[2%] text-white/20">salah-magazine.vercel.app</span>
          </div>
        </div>

        {/* Accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[1%]" style={{ background: `linear-gradient(to left,${sc.accent},${sc.accent}60,rgba(108,123,192,0.3),transparent)` }} />
      </div>
    </div>
  );
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
        backgroundColor: "#0f1021",
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCard(false)}
        >
          <div
            className="bg-surface rounded-2xl sm:rounded-3xl border border-border/50 w-full max-w-[380px] shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
              <h3 className="font-bold font-[var(--font-heading)] text-sm">صورة المشاركة</h3>
              <button
                onClick={() => setShowCard(false)}
                className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Card preview */}
            <div className="p-3">
              <PreviewCard title={title} excerpt={excerpt} section={section} author={author} />
              <p className="text-[10px] text-text-muted mt-2.5 text-center">صورة 1080×1080 — مثالية لجميع منصات التواصل</p>
            </div>

            {/* Actions */}
            <div className="px-3 pb-3 space-y-2">
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
                    <DownloadIcon size={14} />
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
