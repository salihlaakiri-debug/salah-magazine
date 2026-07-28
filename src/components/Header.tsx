"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { SECTIONS } from "@/lib/types";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { MenuIcon, XIcon, MoonIcon, SunIcon, PenIcon, SearchIcon, ShieldIcon, UserIcon, LogOutIcon, BookmarkIcon } from "./Icons";
import NotificationsBell from "./NotificationsBell";
import SudfehLogo from "./SudfehLogo";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border/40" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <Link href="/" className="flex items-center gap-3 group" aria-label="السُّدفة - الصفحة الرئيسية">
            <SudfehLogo size={38} className="sm:h-10 h-9" showText={false} />
            <span className="hidden sm:block text-xl font-bold font-[var(--font-heading)] gradient-text leading-none">السُّدفة</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="القائمة الرئيسية">
            <NavLink href="/">الرئيسية</NavLink>
            {SECTIONS.map((s) => (
              <NavLink key={s.slug} href={`/section/${encodeURIComponent(s.slug)}`}>{s.name}</NavLink>
            ))}
            <NavLink href="/archive">الأرشيف</NavLink>
            <NavLink href="/search"><SearchIcon size={14} className="inline-block ml-1" />بحث</NavLink>
            <NavLink href="/about">من نحن</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/submit" className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 btn-ripple">
              <PenIcon size={12} /> إرسال عمل
            </Link>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
            ) : user ? (
              <>
                <NotificationsBell />
                <div ref={userMenuRef} className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-hover transition-all duration-200 active:scale-95">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/25 to-accent-light/25 flex items-center justify-center text-accent text-xs font-bold ring-2 ring-accent/10">
                      {profile?.display_name?.[0] || profile?.username?.[0] || user.email?.[0]}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 glass-strong rounded-2xl border border-border/50 shadow-2xl shadow-black/10 dark:shadow-black/40 py-2 animate-scale-in z-50">
                      <div className="px-4 py-3 border-b border-border/30">
                        <p className="font-bold text-sm truncate">{profile?.display_name || profile?.username}</p>
                        <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                      </div>
                      <Link href={`/profile/${profile?.username}`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-all duration-200">
                        <UserIcon size={16} /> ملفي الشخصي
                      </Link>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-all duration-200">
                        <PenIcon size={16} /> لوحة الكاتب
                      </Link>
                      <Link href="/my-works" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-all duration-200">
                        <PenIcon size={16} /> أعمالي
                      </Link>
                      <Link href="/bookmarks" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-all duration-200">
                        <BookmarkIcon size={16} /> المحفوظات
                      </Link>
                      {isAdmin && (
                        <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-all duration-200 text-accent">
                          <ShieldIcon size={16} /> لوحة التحكم
                        </Link>
                      )}
                      <div className="border-t border-border/30 mt-1 pt-1">
                        <button onClick={async () => { await signOut(); setUserMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-all duration-200 w-full">
                          <LogOutIcon size={16} /> خروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface-hover transition-all duration-200 active:scale-95">دخول</Link>
                <Link href="/register" className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 active:scale-95 btn-ripple">حساب جديد</Link>
              </div>
            )}

            <button onClick={toggle} className="p-2.5 rounded-xl hover:bg-surface-hover transition-all duration-300 text-text-muted hover:text-foreground active:scale-90" aria-label="تبديل الوضع">
              <span className={`block transition-transform duration-500 ${theme === "light" ? "rotate-0" : "rotate-180"}`}>
                {theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
              </span>
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2.5 rounded-xl hover:bg-surface-hover transition-all duration-200 text-text-muted hover:text-foreground active:scale-90" aria-label="القائمة">
              <span className={`block transition-transform duration-300 ${menuOpen ? "rotate-90" : ""}`}>
                {menuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
              </span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-border/40 mt-2 pt-3 animate-blur-in">
            <nav className="flex flex-col gap-0.5" aria-label="القائمة المحمولة">
              {[
                { href: "/", label: "الرئيسية" },
                ...SECTIONS.map((s) => ({ href: `/section/${encodeURIComponent(s.slug)}`, label: s.name })),
                { href: "/archive", label: "الأرشيف" },
                { href: "/search", label: "بحث" },
                { href: "/about", label: "من نحن" },
                { href: "/submit", label: "إرسال عمل" },
                ...(user ? [{ href: "/dashboard", label: "لوحة الكاتب" }, { href: "/bookmarks", label: "المحفوظات" }, { href: "/my-works", label: "أعمالي" }] : []),
                ...(!user ? [{ href: "/login", label: "دخول" }] : []),
              ].map((item, i) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-hover transition-all duration-200 active:scale-[0.98] animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
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
    <Link href={href} className="nav-underline px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-hover transition-all duration-200 text-foreground/75 hover:text-foreground flex items-center active:scale-95">
      {children}
    </Link>
  );
}
