"use client";

import Link from "next/link";
import { useState } from "react";
import { SECTIONS } from "@/lib/types";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { MenuIcon, XIcon, MoonIcon, SunIcon, PenIcon, SearchIcon, ShieldIcon } from "./Icons";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-shadow">
              <PenIcon size={18} />
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
            <NavLink href="/search">
              <SearchIcon size={14} className="inline-block ml-1" />
              بحث
            </NavLink>
            <NavLink href="/about">من نحن</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="p-2.5 rounded-xl hover:bg-surface-hover transition-colors text-text-muted hover:text-foreground"
              title="لوحة التحكم"
            >
              <ShieldIcon size={18} />
            </Link>

            <button
              onClick={toggle}
              className="p-2.5 rounded-xl hover:bg-surface-hover transition-colors text-text-muted hover:text-foreground"
              aria-label="تبديل الوضع"
            >
              {theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-surface-hover transition-colors text-text-muted hover:text-foreground"
              aria-label="القائمة"
            >
              {menuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-border/50 mt-2 pt-3 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {[
                { href: "/", label: "الرئيسية" },
                ...SECTIONS.map((s) => ({ href: `/section/${encodeURIComponent(s.slug)}`, label: s.name })),
                { href: "/archive", label: "الأرشيف" },
                { href: "/search", label: "بحث" },
                { href: "/about", label: "من نحن" },
                { href: "/admin", label: "لوحة التحكم" },
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
      className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors text-foreground/80 hover:text-foreground flex items-center"
    >
      {children}
    </Link>
  );
}
