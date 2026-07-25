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
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <Link href="/" className="flex items-center gap-3 group">
            <SudfehLogo size={36} className="drop-shadow-sm group-hover:drop-shadow-md transition-shadow" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <NavLink href="/">الرئيسية</NavLink>
            {SECTIONS.map((s) => (
              <NavLink key={s.slug} href={`/section/${encodeURIComponent(s.slug)}`}>{s.name}</NavLink>
            ))}
            <NavLink href="/archive">الأرشيف</NavLink>
            <NavLink href="/search"><SearchIcon size={14} className="inline-block ml-1" />بحث</NavLink>
            <NavLink href="/about">من نحن</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/submit" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors">
              <PenIcon size={12} /> إرسال عمل
            </Link>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
            ) : user ? (
              <>
                <NotificationsBell />
                <div ref={userMenuRef} className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-hover transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-xs font-bold">
                      {profile?.display_name?.[0] || profile?.username?.[0] || user.email?.[0]}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-surface rounded-2xl border border-border/50 shadow-xl py-2 animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-border/30">
                        <p className="font-bold text-sm truncate">{profile?.display_name || profile?.username}</p>
                        <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                      </div>
                      <Link href={`/profile/${profile?.username}`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors">
                        <UserIcon size={16} /> ملفي الشخصي
                      </Link>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors">
                        <PenIcon size={16} /> لوحة الكاتب
                      </Link>
                      <Link href="/my-works" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors">
                        <PenIcon size={16} /> أعمالي
                      </Link>
                      <Link href="/bookmarks" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors">
                        <BookmarkIcon size={16} /> المحفوظات
                      </Link>
                      {isAdmin && (
                        <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-accent">
                          <ShieldIcon size={16} /> لوحة التحكم
                        </Link>
                      )}
                      <div className="border-t border-border/30 mt-1 pt-1">
                        <button onClick={async () => { await signOut(); setUserMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full">
                          <LogOutIcon size={16} /> خروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors">دخول</Link>
                <Link href="/register" className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all">حساب جديد</Link>
              </div>
            )}

            <button onClick={toggle} className="p-2.5 rounded-xl hover:bg-surface-hover transition-colors text-text-muted hover:text-foreground" aria-label="تبديل الوضع">
              {theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2.5 rounded-xl hover:bg-surface-hover transition-colors text-text-muted hover:text-foreground" aria-label="القائمة">
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
                { href: "/submit", label: "إرسال عمل" },
                ...(user ? [{ href: "/dashboard", label: "لوحة الكاتب" }, { href: "/bookmarks", label: "المحفوظات" }, { href: "/my-works", label: "أعمالي" }] : []),
                ...(!user ? [{ href: "/login", label: "دخول" }] : []),
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors">
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
    <Link href={href} className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors text-foreground/80 hover:text-foreground flex items-center">
      {children}
    </Link>
  );
}
