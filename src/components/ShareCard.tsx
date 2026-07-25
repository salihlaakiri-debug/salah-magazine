"use client";

import { useState, useCallback } from "react";
import { ShareIcon, XIcon, DownloadIcon, CheckIcon } from "./Icons";

interface ShareCardProps {
  title: string;
  excerpt: string;
  section: string;
  author: string;
  articleId: string;
}

type CardStyle = "classic" | "literary" | "modern";
type CardSize = "square" | "landscape" | "story";

const CARD_SIZES: Record<CardSize, { w: number; h: number; label: string; platform: string }> = {
  square:   { w: 1080, h: 1080, label: "مربع", platform: "Instagram" },
  landscape: { w: 1200, h: 630,  label: "أفقي", platform: "Twitter / Facebook" },
  story:    { w: 1080, h: 1920, label: "قصة", platform: "Instagram / TikTok" },
};

const CARD_STYLES: { key: CardStyle; label: string; desc: string }[] = [
  { key: "classic",  label: "كلاسيكي", desc: "داكن مع زخارف هندسية" },
  { key: "literary", label: "أدبي",    desc: "ورقي مع خط عربي أنيق" },
  { key: "modern",   label: "عصري",    desc: "minimal بألوان جريئة" },
];

/* ─── Helpers ─── */

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getInitials(name: string): string {
  return name.startsWith("ال") ? name[2] || name[0] : name[0];
}

function getSectionColor(section: string) {
  const m: Record<string, { bg: string; fg: string; accent: string; glow: string }> = {
    "شعر":     { bg: "#f59e0b18", fg: "#fbbf24", accent: "#f59e0b", glow: "#f59e0b15" },
    "قصة":     { bg: "#3b82f618", fg: "#60a5fa", accent: "#3b82f6", glow: "#3b82f615" },
    "نثر":     { bg: "#10b98118", fg: "#34d399", accent: "#10b981", glow: "#10b98115" },
    "مقالات":   { bg: "#8b5cf618", fg: "#a78bfa", accent: "#8b5cf6", glow: "#8b5cf615" },
    "تأملات":   { bg: "#f43f5e18", fg: "#fb7185", accent: "#f43f5e", glow: "#f43f5e15" },
  };
  return m[section] || { bg: "#6c7bc018", fg: "#98a5e0", accent: "#6c7bc0", glow: "#6c7bc015" };
}

/* ─── Card builders (return full HTML string for the capture div) ─── */

function buildClassic(title: string, excerpt: string, section: string, author: string, w: number, h: number): string {
  const sc = getSectionColor(section);
  const initials = getInitials(author);
  const ratio = w / h;
  const pad = Math.round(w * 0.07);
  const fsTitle = ratio > 1.4 ? Math.round(w * 0.038) : Math.round(w * 0.048);
  const fsExcerpt = Math.round(fsTitle * 0.44);
  const fsSmall = Math.round(fsTitle * 0.28);
  const isStory = h > w;

  return `<div style="width:${w}px;height:${h}px;background:linear-gradient(160deg,#0f1021 0%,#1a1a2e 40%,#141428 100%);color:#fff;display:flex;flex-direction:column;overflow:hidden;position:relative;font-family:'Noto Kufi Arabic','Noto Naskh Arabic',sans-serif;direction:rtl">
  <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
    <div style="position:absolute;top:${-h*0.08}px;right:${-w*0.08}px;width:${w*0.55}px;height:${w*0.55}px;border-radius:50%;background:radial-gradient(circle,${sc.accent}12 0%,transparent 70%)"></div>
    <div style="position:absolute;bottom:${-h*0.06}px;left:${-w*0.05}px;width:${w*0.37}px;height:${w*0.37}px;border-radius:50%;background:radial-gradient(circle,rgba(108,123,192,0.06) 0%,transparent 70%)"></div>
    <svg style="position:absolute;top:${pad*0.5}px;right:${pad*0.5}px;opacity:0.04" width="${w*0.18}" height="${w*0.18}" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="none" stroke="white" stroke-width="0.5"/><circle cx="100" cy="100" r="70" fill="none" stroke="white" stroke-width="0.5"/><circle cx="100" cy="100" r="50" fill="none" stroke="white" stroke-width="0.5"/><line x1="100" y1="10" x2="100" y2="190" stroke="white" stroke-width="0.3"/><line x1="10" y1="100" x2="190" y2="100" stroke="white" stroke-width="0.3"/></svg>
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,transparent 48%,rgba(255,255,255,0.012) 48%,rgba(255,255,255,0.012) 52%,transparent 52%)"></div>
    ${isStory ? `<div style="position:absolute;top:35%;left:${w*0.05}px;font-size:${w*0.45}px;font-family:Amiri,serif;color:rgba(255,255,255,0.025);line-height:1;transform:scaleX(-1)">&#1548;</div>` : `<div style="position:absolute;top:${h*0.22}px;left:${w*0.05}px;font-size:${w*0.28}px;font-family:Amiri,serif;color:rgba(255,255,255,0.025);line-height:1;transform:scaleX(-1)">&#1548;</div>`}
  </div>
  <div style="position:relative;z-index:10;padding:${pad}px;${isStory ? `padding-top:${pad*2}px;padding-bottom:${pad*2}px` : ""};flex:1;display:flex;flex-direction:column">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${pad*0.65}px">
      <div style="display:flex;align-items:center;gap:${w*0.013}px">
        <div style="width:${w*0.044}px;height:${w*0.044}px;border-radius:${w*0.013}px;background:linear-gradient(135deg,${sc.accent}30,${sc.accent}15);display:flex;align-items:center;justify-content:center;border:1px solid ${sc.accent}25">
          <span style="font-size:${w*0.021}px;font-weight:800;color:${sc.fg}">س</span>
        </div>
        <div>
          <span style="font-size:${fsSmall*1.3}px;font-weight:700;color:rgba(255,255,255,0.85)">السُّدفة</span>
          <span style="display:block;font-size:${fsSmall}px;color:rgba(255,255,255,0.3);margin-top:-1px">مجلة أدبية</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:${w*0.007}px">
        <div style="width:${w*0.007}px;height:${w*0.007}px;border-radius:50%;background:${sc.accent};opacity:0.8"></div>
        <span style="font-size:${fsSmall*1.1}px;font-weight:600;color:${sc.fg};background:${sc.bg};padding:${w*0.005}px ${w*0.017}px;border-radius:999px;border:1px solid ${sc.accent}20">${esc(section)}</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:${w*0.015}px;margin-bottom:${pad*0.55}px">
      <div style="flex:1;height:1px;background:linear-gradient(to left,${sc.accent}40,transparent)"></div>
      <svg width="${w*0.018}" height="${w*0.018}" viewBox="0 0 20 20" style="opacity:0.3"><path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" fill="${sc.fg}"/></svg>
      <div style="flex:1;height:1px;background:linear-gradient(to right,${sc.accent}40,transparent)"></div>
    </div>
    <h1 style="font-size:${fsTitle}px;font-weight:800;line-height:1.35;margin:0 0 ${pad*0.5}px;color:rgba(255,255,255,0.95);font-family:'Noto Kufi Arabic',sans-serif">${esc(title)}</h1>
    <p style="font-size:${fsExcerpt}px;line-height:1.85;color:rgba(255,255,255,0.45);margin:0;font-family:'Noto Naskh Arabic',serif;display:-webkit-box;-webkit-line-clamp:${isStory ? 6 : 4};-webkit-box-orient:vertical;overflow:hidden">${esc(excerpt)}</p>
    <div style="flex:1;min-height:${pad*0.5}px"></div>
    <div style="padding-top:${pad*0.5}px">
      <div style="height:1px;background:linear-gradient(to left,${sc.accent}30,rgba(255,255,255,0.08),transparent);margin-bottom:${pad*0.5}px"></div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:${w*0.013}px">
          <div style="width:${w*0.044}px;height:${w*0.044}px;border-radius:50%;background:linear-gradient(135deg,${sc.accent}25,${sc.accent}10);display:flex;align-items:center;justify-content:center;color:${sc.fg};font-size:${w*0.017}px;font-weight:700;border:1px solid ${sc.accent}20">${initials}</div>
          <div>
            <span style="font-size:${fsSmall*1.3}px;font-weight:600;color:rgba(255,255,255,0.75)">${esc(author)}</span>
            <span style="display:block;font-size:${fsSmall}px;color:rgba(255,255,255,0.25);margin-top:1px">كاتب في السُّدفة</span>
          </div>
        </div>
        <span style="font-size:${fsSmall}px;color:rgba(255,255,255,0.2)">salah-magazine.vercel.app</span>
      </div>
    </div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:${Math.max(4, h*0.005)}px;background:linear-gradient(to left,${sc.accent},${sc.accent}60,rgba(108,123,192,0.3),transparent);z-index:20"></div>
</div>`;
}

function buildLiterary(title: string, excerpt: string, section: string, author: string, w: number, h: number): string {
  const sc = getSectionColor(section);
  const initials = getInitials(author);
  const ratio = w / h;
  const pad = Math.round(w * 0.08);
  const fsTitle = ratio > 1.4 ? Math.round(w * 0.04) : Math.round(w * 0.05);
  const fsExcerpt = Math.round(fsTitle * 0.42);
  const fsSmall = Math.round(fsTitle * 0.26);
  const isStory = h > w;

  return `<div style="width:${w}px;height:${h}px;background:#faf6f0;color:#2c1810;display:flex;flex-direction:column;overflow:hidden;position:relative;font-family:'Noto Kufi Arabic','Noto Naskh Arabic',Amiri,serif;direction:rtl">
  <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
    <div style="position:absolute;top:0;right:0;width:${w}px;height:${h}px;background:radial-gradient(ellipse at top right,${sc.accent}08,transparent 60%)"></div>
    <div style="position:absolute;top:${pad*0.4}px;right:${pad*0.4}px;width:${w*0.12}px;height:${w*0.12}px;border:1.5px solid ${sc.accent}15;border-radius:50%"></div>
    <div style="position:absolute;top:${pad*0.7}px;right:${pad*0.7}px;width:${w*0.06}px;height:${w*0.06}px;border:1px solid ${sc.accent}10;border-radius:50%"></div>
    <div style="position:absolute;bottom:${pad*0.4}px;left:${pad*0.4}px;font-size:${isStory ? w*0.35 : w*0.25}px;font-family:Amiri,serif;color:${sc.accent}08;line-height:1">&#1548;</div>
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.008) 3px,rgba(0,0,0,0.008) 4px)"></div>
  </div>
  <div style="position:absolute;top:0;left:0;right:0;height:${Math.max(4,h*0.006)}px;background:linear-gradient(to left,${sc.accent},${sc.accent}40,transparent);z-index:20"></div>
  <div style="position:relative;z-index:10;padding:${pad}px;${isStory ? `padding-top:${pad*2}px;padding-bottom:${pad*2}px` : ""};flex:1;display:flex;flex-direction:column">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${pad*0.7}px">
      <div style="display:flex;align-items:center;gap:${w*0.012}px">
        <div style="width:${w*0.042}px;height:${w*0.042}px;border-radius:50%;background:${sc.accent};display:flex;align-items:center;justify-content:center">
          <span style="font-size:${w*0.02}px;font-weight:800;color:#faf6f0">س</span>
        </div>
        <div>
          <span style="font-size:${fsSmall*1.4}px;font-weight:700;color:#2c1810">السُّدفة</span>
          <span style="display:block;font-size:${fsSmall}px;color:#8b7355;margin-top:-1px">مجلة أدبية</span>
        </div>
      </div>
      <span style="font-size:${fsSmall*1.1}px;font-weight:600;color:${sc.accent};border:1.5px solid ${sc.accent}30;padding:${w*0.004}px ${w*0.015}px;border-radius:999px">${esc(section)}</span>
    </div>
    <div style="width:${w*0.15}px;height:2px;background:${sc.accent};margin-bottom:${pad*0.5}px;border-radius:1px"></div>
    <h1 style="font-size:${fsTitle}px;font-weight:700;line-height:1.4;margin:0 0 ${pad*0.45}px;color:#1a0f0a;font-family:Amiri,'Noto Kufi Arabic',serif">${esc(title)}</h1>
    <p style="font-size:${fsExcerpt}px;line-height:1.9;color:#6b5a48;margin:0;font-family:'Noto Naskh Arabic',serif;display:-webkit-box;-webkit-line-clamp:${isStory ? 6 : 4};-webkit-box-orient:vertical;overflow:hidden;font-style:italic">${esc(excerpt)}</p>
    <div style="flex:1;min-height:${pad*0.5}px"></div>
    <div style="padding-top:${pad*0.45}px">
      <div style="width:100%;height:1px;background:linear-gradient(to left,${sc.accent}30,#d4c5b0,transparent);margin-bottom:${pad*0.45}px"></div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:${w*0.012}px">
          <div style="width:${w*0.042}px;height:${w*0.042}px;border-radius:50%;background:${sc.accent};display:flex;align-items:center;justify-content:center;color:#faf6f0;font-size:${w*0.016}px;font-weight:700">${initials}</div>
          <span style="font-size:${fsSmall*1.2}px;font-weight:600;color:#2c1810">${esc(author)}</span>
        </div>
        <span style="font-size:${fsSmall}px;color:#b0a090">salah-magazine.vercel.app</span>
      </div>
    </div>
  </div>
</div>`;
}

function buildModern(title: string, excerpt: string, section: string, author: string, w: number, h: number): string {
  const sc = getSectionColor(section);
  const initials = getInitials(author);
  const ratio = w / h;
  const pad = Math.round(w * 0.065);
  const fsTitle = ratio > 1.4 ? Math.round(w * 0.042) : Math.round(w * 0.055);
  const fsExcerpt = Math.round(fsTitle * 0.38);
  const fsSmall = Math.round(fsTitle * 0.24);
  const isStory = h > w;

  return `<div style="width:${w}px;height:${h}px;background:#09090b;color:#fafafa;display:flex;flex-direction:column;overflow:hidden;position:relative;font-family:'Noto Kufi Arabic',sans-serif;direction:rtl">
  <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
    <div style="position:absolute;top:${-h*0.15}px;${ratio > 1.4 ? "right" : "left"}:${-w*0.1}px;width:${w*0.6}px;height:${w*0.6}px;border-radius:50%;background:radial-gradient(circle,${sc.accent}18 0%,transparent 65%)"></div>
    <div style="position:absolute;bottom:0;right:0;width:${w*0.35}px;height:${h*0.3}px;background:linear-gradient(to top left,${sc.accent}10,transparent)"></div>
    <div style="position:absolute;top:${pad}px;left:${pad}px;width:${w*0.005}px;height:${h*0.15}px;background:${sc.accent};border-radius:999px"></div>
  </div>
  <div style="position:relative;z-index:10;padding:${pad}px;${isStory ? `padding-top:${pad*2.5}px` : ""};flex:1;display:flex;flex-direction:column">
    <div style="display:flex;align-items:center;gap:${w*0.012}px;margin-bottom:${pad*0.8}px">
      <div style="width:${w*0.035}px;height:${w*0.035}px;border-radius:${w*0.008}px;background:${sc.accent};display:flex;align-items:center;justify-content:center">
        <span style="font-size:${w*0.018}px;font-weight:800;color:#09090b">س</span>
      </div>
      <span style="font-size:${fsSmall*1.3}px;font-weight:700;color:${sc.fg};letter-spacing:1px">السُّدفة</span>
      <div style="flex:1"></div>
      <span style="font-size:${fsSmall*1.1}px;font-weight:600;color:${sc.fg};background:${sc.accent}20;padding:${w*0.004}px ${w*0.014}px;border-radius:${w*0.004}px">${esc(section)}</span>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
      <h1 style="font-size:${fsTitle}px;font-weight:900;line-height:1.25;margin:0 0 ${pad*0.4}px;color:#fafafa;letter-spacing:-0.5px">${esc(title)}</h1>
      <p style="font-size:${fsExcerpt}px;line-height:1.8;color:rgba(255,255,255,0.4);margin:0;font-family:'Noto Naskh Arabic',serif;display:-webkit-box;-webkit-line-clamp:${isStory ? 5 : 3};-webkit-box-orient:vertical;overflow:hidden">${esc(excerpt)}</p>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding-top:${pad*0.4}px;border-top:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;align-items:center;gap:${w*0.01}px">
        <div style="width:${w*0.038}px;height:${w*0.038}px;border-radius:50%;background:${sc.accent};display:flex;align-items:center;justify-content:center;color:#09090b;font-size:${w*0.015}px;font-weight:800">${initials}</div>
        <span style="font-size:${fsSmall*1.2}px;font-weight:600;color:rgba(255,255,255,0.6)">${esc(author)}</span>
      </div>
      <span style="font-size:${fsSmall}px;color:rgba(255,255,255,0.2);letter-spacing:0.5px">salah-magazine.vercel.app</span>
    </div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:${Math.max(3,h*0.004)}px;background:${sc.accent};z-index:20"></div>
</div>`;
}

function buildCardHTML(title: string, excerpt: string, section: string, author: string, style: CardStyle, size: CardSize): string {
  const { w, h } = CARD_SIZES[size];
  if (style === "literary") return buildLiterary(title, excerpt, section, author, w, h);
  if (style === "modern") return buildModern(title, excerpt, section, author, w, h);
  return buildClassic(title, excerpt, section, author, w, h);
}

/* ─── React Preview Components ─── */

function PreviewClassic({ title, excerpt, section, author, compact }: { title: string; excerpt: string; section: string; author: string; compact?: boolean }) {
  const sc = getSectionColor(section);
  const initials = getInitials(author);
  return (
    <div className="rounded-xl overflow-hidden text-white relative" style={{ background: "linear-gradient(160deg,#0f1021 0%,#1a1a2e 40%,#141428 100%)", aspectRatio: "1/1" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -right-[12%] w-[55%] h-[55%] rounded-full" style={{ background: `radial-gradient(circle,${sc.accent}12,transparent 70%)` }} />
        <div className="absolute top-[22%] left-[6%] text-[25vw] leading-none font-[Amiri] opacity-[0.025] scale-x-[-1]">،</div>
      </div>
      <div className="relative z-10 flex flex-col h-full p-[7%]">
        <div className="flex items-center justify-between mb-[5%]">
          <div className="flex items-center gap-[3%]">
            <div className="w-[7%] aspect-square rounded-[14%] flex items-center justify-center border" style={{ background: `linear-gradient(135deg,${sc.accent}30,${sc.accent}15)`, borderColor: `${sc.accent}25` }}>
              <span className="font-extrabold text-[4%]" style={{ color: sc.fg }}>س</span>
            </div>
            <div>
              <span className="block font-bold text-[3%] text-white/85">السُّدفة</span>
              <span className="block text-[2%] text-white/30 -mt-[1px]">مجلة أدبية</span>
            </div>
          </div>
          <div className="flex items-center gap-[1.5%]">
            <div className="w-[1.2%] aspect-square rounded-full" style={{ background: sc.accent, opacity: 0.8 }} />
            <span className="font-semibold text-[2.3%] px-[3%] py-[0.8%] rounded-full border" style={{ color: sc.fg, background: sc.bg, borderColor: `${sc.accent}20` }}>{section}</span>
          </div>
        </div>
        <div className="flex items-center gap-[2.5%] mb-[4.5%]">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left,${sc.accent}40,transparent)` }} />
          <svg width="10" height="10" viewBox="0 0 20 20" style={{ opacity: 0.3 }}><path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" fill={sc.fg} /></svg>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right,${sc.accent}40,transparent)` }} />
        </div>
        <h2 className="font-extrabold leading-[1.3] mb-[4%] text-white/95 line-clamp-2" style={{ fontSize: compact ? "14px" : "16px", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>{title}</h2>
        <p className="leading-[1.8] text-white/40 line-clamp-3 flex-1" style={{ fontSize: compact ? "10px" : "11px", fontFamily: "'Noto Naskh Arabic',serif" }}>{excerpt}</p>
        <div className="mt-auto pt-[4%]">
          <div className="h-px mb-[3.5%]" style={{ background: `linear-gradient(to left,${sc.accent}30,rgba(255,255,255,0.08),transparent)` }} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[2.5%]">
              <div className="w-[6%] aspect-square rounded-full flex items-center justify-center text-[2.5%] font-bold border" style={{ background: `linear-gradient(135deg,${sc.accent}25,${sc.accent}10)`, color: sc.fg, borderColor: `${sc.accent}20` }}>{initials}</div>
              <div>
                <span className="block font-semibold text-[2.5%] text-white/75">{author}</span>
                <span className="block text-[1.6%] text-white/25 mt-[-1px]">كاتب في السُّدفة</span>
              </div>
            </div>
            <span className="text-[1.8%] text-white/20">salah-magazine.vercel.app</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[0.6%]" style={{ background: `linear-gradient(to left,${sc.accent},${sc.accent}60,transparent)` }} />
      </div>
    </div>
  );
}

function PreviewLiterary({ title, excerpt, section, author }: { title: string; excerpt: string; section: string; author: string }) {
  const sc = getSectionColor(section);
  const initials = getInitials(author);
  return (
    <div className="rounded-xl overflow-hidden relative" style={{ background: "#faf6f0", aspectRatio: "1/1" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.5%] z-10" style={{ background: `linear-gradient(to left,${sc.accent},${sc.accent}40,transparent)` }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.5) 3px,rgba(0,0,0,0.5) 4px)" }} />
      <div className="relative z-10 flex flex-col h-full p-[7%]">
        <div className="flex items-center justify-between mb-[5%]">
          <div className="flex items-center gap-[3%]">
            <div className="w-[6.5%] aspect-square rounded-full flex items-center justify-center" style={{ background: sc.accent }}>
              <span className="font-extrabold text-[3.5%]" style={{ color: "#faf6f0" }}>س</span>
            </div>
            <div>
              <span className="block font-bold text-[2.8%]" style={{ color: "#2c1810" }}>السُّدفة</span>
              <span className="block text-[1.8%] -mt-[1px]" style={{ color: "#8b7355" }}>مجلة أدبية</span>
            </div>
          </div>
          <span className="font-semibold text-[2.2%] px-[3%] py-[0.8%] rounded-full border" style={{ color: sc.accent, borderColor: `${sc.accent}30` }}>{section}</span>
        </div>
        <div className="w-[12%] h-[2px] mb-[4%] rounded-full" style={{ background: sc.accent }} />
        <h2 className="font-bold leading-[1.4] mb-[3.5%] line-clamp-2" style={{ fontSize: "15px", color: "#1a0f0a", fontFamily: "Amiri,'Noto Kufi Arabic',serif" }}>{title}</h2>
        <p className="leading-[1.8] line-clamp-3 flex-1 italic" style={{ fontSize: "10px", color: "#6b5a48", fontFamily: "'Noto Naskh Arabic',serif" }}>{excerpt}</p>
        <div className="mt-auto pt-[3.5%]">
          <div className="h-px mb-[3.5%]" style={{ background: "linear-gradient(to left,rgba(0,0,0,0.06),#d4c5b0,transparent)" }} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[2.5%]">
              <div className="w-[6%] aspect-square rounded-full flex items-center justify-center text-[2.3%] font-bold" style={{ background: sc.accent, color: "#faf6f0" }}>{initials}</div>
              <span className="font-semibold text-[2.3%]" style={{ color: "#2c1810" }}>{author}</span>
            </div>
            <span className="text-[1.8%]" style={{ color: "#b0a090" }}>salah-magazine.vercel.app</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewModern({ title, excerpt, section, author }: { title: string; excerpt: string; section: string; author: string }) {
  const sc = getSectionColor(section);
  const initials = getInitials(author);
  return (
    <div className="rounded-xl overflow-hidden text-white relative" style={{ background: "#09090b", aspectRatio: "1/1" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[15%] w-[60%] h-[60%] rounded-full" style={{ background: `radial-gradient(circle,${sc.accent}18,transparent 65%)` }} />
        <div className="absolute top-[5%] left-[5%] w-[0.5%] h-[12%] rounded-full" style={{ background: sc.accent }} />
      </div>
      <div className="relative z-10 flex flex-col h-full p-[6.5%]">
        <div className="flex items-center gap-[2.5%] mb-[6%]">
          <div className="w-[5.5%] aspect-square rounded-[18%] flex items-center justify-center" style={{ background: sc.accent }}>
            <span className="font-extrabold text-[3%]" style={{ color: "#09090b" }}>س</span>
          </div>
          <span className="font-bold text-[2.8%]" style={{ color: sc.fg, letterSpacing: "1px" }}>السُّدفة</span>
          <div className="flex-1" />
          <span className="font-semibold text-[2.2%] px-[2.5%] py-[0.6%] rounded" style={{ color: sc.fg, background: `${sc.accent}20` }}>{section}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="font-black leading-[1.2] mb-[3%] text-white line-clamp-2" style={{ fontSize: "17px", letterSpacing: "-0.5px" }}>{title}</h2>
          <p className="leading-[1.7] text-white/40 line-clamp-3" style={{ fontSize: "10px", fontFamily: "'Noto Naskh Arabic',serif" }}>{excerpt}</p>
        </div>
        <div className="flex items-center justify-between pt-[3.5%] border-t border-white/10">
          <div className="flex items-center gap-[2%]">
            <div className="w-[5.5%] aspect-square rounded-full flex items-center justify-center text-[2.2%] font-extrabold" style={{ background: sc.accent, color: "#09090b" }}>{initials}</div>
            <span className="font-semibold text-[2.3%] text-white/60">{author}</span>
          </div>
          <span className="text-[1.8%] text-white/20" style={{ letterSpacing: "0.5px" }}>salah-magazine.vercel.app</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[0.4%]" style={{ background: sc.accent }} />
      </div>
    </div>
  );
}

function CardPreview({ title, excerpt, section, author, style }: { title: string; excerpt: string; section: string; author: string; style: CardStyle }) {
  if (style === "literary") return <PreviewLiterary title={title} excerpt={excerpt} section={section} author={author} />;
  if (style === "modern") return <PreviewModern title={title} excerpt={excerpt} section={section} author={author} />;
  return <PreviewClassic title={title} excerpt={excerpt} section={section} author={author} />;
}

/* ─── Main Component ─── */

export default function ShareCard({ title, excerpt, section, author, articleId }: ShareCardProps) {
  const [showCard, setShowCard] = useState(false);
  const [cardStyle, setCardStyle] = useState<CardStyle>("classic");
  const [cardSize, setCardSize] = useState<CardSize>("square");
  const [generating, setGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "style" | "size">("preview");

  const articleUrl = `https://salah-magazine.vercel.app/work/${articleId}`;

  const generateCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const html2canvas = (await import("html2canvas")).default;
    const html = buildCardHTML(title, excerpt, section, author, cardStyle, cardSize);
    const { w, h } = CARD_SIZES[cardSize];

    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:fixed;left:0;top:0;z-index:-1;pointer-events:none";
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    const cardEl = wrapper.firstElementChild as HTMLElement;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const canvas = await html2canvas(cardEl, {
      useCORS: true,
      backgroundColor: cardStyle === "literary" ? "#faf6f0" : cardStyle === "modern" ? "#09090b" : "#0f1021",
      width: w,
      height: h,
    } as any);

    document.body.removeChild(wrapper);
    return canvas;
  }, [title, excerpt, section, author, cardStyle, cardSize]);

  const downloadCard = async () => {
    setGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `sudfeh-${cardStyle}-${cardSize}-${articleId.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate card:", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyImage = async () => {
    setGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        }
        setGenerating(false);
      }, "image/png");
    } catch (err) {
      console.error("Failed to copy image:", err);
      setGenerating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        setGenerating(true);
        const canvas = await generateCanvas();
        if (!canvas) return;
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `sudfeh-${articleId.slice(0, 8)}.png`, { type: "image/png" });
            try {
              await navigator.share({ title, text: excerpt.slice(0, 100), files: [file] });
            } catch {
              await navigator.share({ title, text: `${title}\n\n${articleUrl}` });
            }
          }
          setGenerating(false);
        }, "image/png");
      } catch {
        setGenerating(false);
      }
    }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowCard(false)}>
          <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border/50 w-full max-w-[400px] shadow-2xl animate-scale-in max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30 shrink-0">
              <h3 className="font-bold font-[var(--font-heading)] text-sm">صورة المشاركة</h3>
              <button onClick={() => setShowCard(false)} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
                <XIcon size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/30 shrink-0">
              {([["preview", "معاينة"], ["style", "التصميم"], ["size", "الحجم"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === key ? "text-accent border-b-2 border-accent" : "text-text-muted hover:text-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {activeTab === "preview" && (
                <div className="p-3">
                  <CardPreview title={title} excerpt={excerpt} section={section} author={author} style={cardStyle} />
                  <p className="text-[10px] text-text-muted mt-2 text-center">
                    {CARD_SIZES[cardSize].w}×{CARD_SIZES[cardSize].h} — {CARD_SIZES[cardSize].platform}
                  </p>
                </div>
              )}

              {activeTab === "style" && (
                <div className="p-4 space-y-2.5">
                  {CARD_STYLES.map((s) => (
                    <button key={s.key} onClick={() => setCardStyle(s.key)} className={`w-full text-right p-3 rounded-xl border-2 transition-all ${cardStyle === s.key ? "border-accent bg-accent/5" : "border-border/50 hover:border-border"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold block">{s.label}</span>
                          <span className="text-[11px] text-text-muted">{s.desc}</span>
                        </div>
                        {cardStyle === s.key && <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"><CheckIcon size={12} className="text-white" /></div>}
                      </div>
                    </button>
                  ))}
                  <div className="mt-3">
                    <CardPreview title={title} excerpt={excerpt} section={section} author={author} style={cardStyle} />
                  </div>
                </div>
              )}

              {activeTab === "size" && (
                <div className="p-4 space-y-2.5">
                  {(Object.entries(CARD_SIZES) as [CardSize, typeof CARD_SIZES.square][]).map(([key, val]) => (
                    <button key={key} onClick={() => setCardSize(key)} className={`w-full text-right p-3 rounded-xl border-2 transition-all ${cardSize === key ? "border-accent bg-accent/5" : "border-border/50 hover:border-border"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold block">{val.label}</span>
                          <span className="text-[11px] text-text-muted">{val.w}×{val.h} — {val.platform}</span>
                        </div>
                        {cardSize === key && <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"><CheckIcon size={12} className="text-white" /></div>}
                      </div>
                    </button>
                  ))}
                  <div className="mt-3">
                    <CardPreview title={title} excerpt={excerpt} section={section} author={author} style={cardStyle} />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 pt-3 border-t border-border/30 space-y-2 shrink-0">
              <button onClick={downloadCard} disabled={generating} className="w-full py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري التوليد...</>) : (<><DownloadIcon size={14} />تحميل الصورة</>)}
              </button>
              <div className="flex gap-2">
                <button onClick={copyImage} disabled={generating} className="flex-1 py-2.5 rounded-xl border border-border text-text-muted text-xs font-medium hover:bg-surface-hover transition-all disabled:opacity-50">
                  {copiedImage ? "تم النسخ ✓" : "نسخ الصورة"}
                </button>
                <button onClick={copyLink} className="flex-1 py-2.5 rounded-xl border border-border text-text-muted text-xs font-medium hover:bg-surface-hover transition-all">
                  {copiedLink ? "تم النسخ ✓" : "نسخ الرابط"}
                </button>
              </div>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button onClick={nativeShare} disabled={generating} className="w-full py-2.5 rounded-xl bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-all disabled:opacity-50">
                  مشاركة مباشرة
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
