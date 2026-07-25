"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "reading-mode";
const DEFAULT_SIZE = 1.2;
const STEP = 0.1;
const MIN_SIZE = 0.8;
const MAX_SIZE = 2.0;

interface ReadingSettings {
  fontSize: number;
  sepia: boolean;
}

function loadSettings(): ReadingSettings {
  if (typeof window === "undefined")
    return { fontSize: DEFAULT_SIZE, sepia: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { fontSize: DEFAULT_SIZE, sepia: false };
}

function saveSettings(settings: ReadingSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export default function ReadingMode() {
  const [settings, setSettings] = useState<ReadingSettings>({
    fontSize: DEFAULT_SIZE,
    sepia: false,
  });
  const [mounted, setMounted] = useState(false);

  const applySettings = useCallback((s: ReadingSettings) => {
    const el = document.querySelector(".article-content");
    if (!el) return;
    (el as HTMLElement).style.setProperty(
      "--reading-font-size",
      `${s.fontSize}rem`
    );
    (el as HTMLElement).style.fontSize = `${s.fontSize}rem`;
    if (s.sepia) {
      (el as HTMLElement).style.background = "linear-gradient(135deg, #f5f0e8, #faf6ee)";
      (el as HTMLElement).style.padding = "2rem";
      (el as HTMLElement).style.borderRadius = "16px";
    } else {
      (el as HTMLElement).style.background = "";
      (el as HTMLElement).style.padding = "";
      (el as HTMLElement).style.borderRadius = "";
    }
  }, []);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setMounted(true);
    applySettings(s);
  }, [applySettings]);

  const update = (patch: Partial<ReadingSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    applySettings(next);
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.5rem 0.75rem",
        borderRadius: "9999px",
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        border: "1px solid var(--border)",
        fontFamily: "var(--font-heading)",
        animation: "fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      <button
        onClick={() =>
          update({
            fontSize: Math.min(settings.fontSize + STEP, MAX_SIZE),
          })
        }
        title="تكبير الخط"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "9999px",
          border: "none",
          background:
            settings.fontSize >= MAX_SIZE
              ? "transparent"
              : "var(--glow)",
          color: "var(--foreground)",
          fontSize: "0.95rem",
          fontWeight: 700,
          fontFamily: "var(--font-heading)",
          cursor:
            settings.fontSize >= MAX_SIZE ? "not-allowed" : "pointer",
          opacity: settings.fontSize >= MAX_SIZE ? 0.35 : 1,
          transition: "all 0.2s ease",
          lineHeight: 1,
        }}
      >
        A+
      </button>

      <button
        onClick={() =>
          update({
            fontSize: Math.max(settings.fontSize - STEP, MIN_SIZE),
          })
        }
        title="تصغير الخط"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "9999px",
          border: "none",
          background:
            settings.fontSize <= MIN_SIZE
              ? "transparent"
              : "var(--glow)",
          color: "var(--foreground)",
          fontSize: "0.95rem",
          fontWeight: 700,
          fontFamily: "var(--font-heading)",
          cursor:
            settings.fontSize <= MIN_SIZE ? "not-allowed" : "pointer",
          opacity: settings.fontSize <= MIN_SIZE ? 0.35 : 1,
          transition: "all 0.2s ease",
          lineHeight: 1,
        }}
      >
        A-
      </button>

      <button
        onClick={() => update({ fontSize: DEFAULT_SIZE })}
        title="إعادة ضبط الخط"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "9999px",
          border: "none",
          background:
            settings.fontSize === DEFAULT_SIZE
              ? "transparent"
              : "var(--glow)",
          color: "var(--foreground)",
          fontSize: "0.9rem",
          fontWeight: 600,
          fontFamily: "var(--font-heading)",
          cursor: "pointer",
          opacity: settings.fontSize === DEFAULT_SIZE ? 0.35 : 1,
          transition: "all 0.2s ease",
          lineHeight: 1,
        }}
      >
        A
      </button>

      <div
        style={{
          width: "1px",
          height: "1.25rem",
          background: "var(--border)",
          margin: "0 0.15rem",
        }}
      />

      <button
        onClick={() => update({ sepia: !settings.sepia })}
        title={settings.sepia ? "إلغاء الخلفية المريحة" : "خلفية مريحة للقراءة"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "9999px",
          border: "none",
          background: settings.sepia ? "var(--accent)" : "var(--glow)",
          color: settings.sepia ? "#fff" : "var(--foreground)",
          fontSize: "0.8rem",
          fontWeight: 600,
          fontFamily: "var(--font-heading)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          lineHeight: 1,
        }}
      >
        {settings.sepia ? "☀" : "☾"}
      </button>

      <style>{`
        .dark .reading-mode-bar {
          background: rgba(10, 11, 20, 0.82) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
