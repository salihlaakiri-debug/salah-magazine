"use client";

import Link from "next/link";
import { useState } from "react";
import { SECTIONS } from "@/lib/types";
import { useTheme } from "./ThemeProvider";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-lg font-[var(--font-heading)] shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-shadow">
              ص
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold font-[var(--font-heading)] gradient-text">
                صلاح
              </span>
              <span className="block text-[10px] text-text-muted -mt-1 tracking-wider">
                مجلة أدبية
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <NavLink href="/">الرئيسية</NavLink>
            {SECTIONS.map((s) => (
              <NavLink key={s.slug} href={`/section/${encodeURIComponent(s.slug)}`}>
                {s.name}
              </NavLink>
            ))}
            <NavLink href="/archive">الأرشيف</NavLink>
            <NavLink href="/search">بحث</NavLink>
            <NavLink href="/about">من نحن</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl hover:bg-surface-hover transition-colors"
              aria-label="تبديل الوضع"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-surface-hover transition-colors"
              aria-label="القائمة"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-border/50 mt-2 pt-3 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {[
                { href: "/", label: "الرئيسية" },
                ...SECTIONS.map((s) => ({ href: `/section/${encodeURIComponent(s.slug)}`, label: `${s.icon} ${s.name}` })),
                { href: "/archive", label: "📚 الأرشيف" },
                { href: "/search", label: "🔍 بحث" },
                { href: "/about", label: "من نحن" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors text-foreground/80 hover:text-foreground"
    >
      {children}
    </Link>
  );
}
