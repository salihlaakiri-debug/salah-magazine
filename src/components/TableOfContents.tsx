"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TocEntry {
  id: string;
  text: string;
}

function slugify(text: string): string {
  return text
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .toLowerCase();
}

function extractH2Headings(html: string): TocEntry[] {
  const regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const entries: TocEntry[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const rawText = match[1].replace(/<[^>]+>/g, "").trim();
    if (rawText) {
      entries.push({ id: slugify(rawText), text: rawText });
    }
  }
  return entries;
}

export default function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(() => extractH2Headings(content), [content]);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const visible = new Set<string>();

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        });

        if (visible.size > 0) {
          const firstVisible = headings.find((h) => visible.has(h.id));
          if (firstVisible) setActiveId(firstVisible.id);
        }
      },
      { threshold: 0.3, rootMargin: "-80px 0px -60% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.current?.observe(el);
    });

    return () => observer.current?.disconnect();
  }, [headings]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      setOpen(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile collapsible */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface border border-border text-foreground font-heading font-semibold text-sm transition-colors hover:bg-surface-hover"
        >
          <span>فهرس المحتوى</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {open && (
          <nav className="mt-2 px-4 py-3 rounded-xl bg-surface border border-border">
            <ul className="space-y-1">
              {headings.map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => scrollTo(h.id)}
                    className={`w-full text-right text-sm py-1.5 px-3 rounded-lg transition-all duration-200 leading-relaxed ${
                      activeId === h.id
                        ? "text-accent font-semibold border-r-2 border-accent bg-accent/5 pr-4"
                        : "text-text-muted hover:text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky" style={{ top: "100px" }}>
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-3">
              فهرس المحتوى
            </h3>
            <nav>
              <ul className="space-y-0.5">
                {headings.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => scrollTo(h.id)}
                      className={`w-full text-right text-[13px] py-1.5 px-3 rounded-lg transition-all duration-200 leading-relaxed ${
                        activeId === h.id
                          ? "text-accent font-semibold border-r-2 border-accent bg-accent/5 pr-4"
                          : "text-text-muted hover:text-foreground hover:bg-surface-hover"
                      }`}
                    >
                      {h.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
