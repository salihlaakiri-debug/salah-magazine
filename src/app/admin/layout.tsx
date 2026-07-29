"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  BarChartIcon, FileTextIcon, MessageIcon, SettingsIcon,
  LogOutIcon, PenIcon, HomeIcon, MailIcon,
  UsersIcon, TagIcon, RssIcon,
} from "@/components/Icons";

const navItems = [
  { href: "/admin/dashboard", label: "الرئيسية", icon: BarChartIcon },
  { href: "/admin/submissions", label: "المراجعات", icon: PenIcon },
  { href: "/admin/articles", label: "المقالات", icon: FileTextIcon },
  { href: "/admin/users", label: "المستخدمون", icon: UsersIcon },
  { href: "/admin/tags", label: "الوسوم", icon: TagIcon },
  { href: "/admin/subscribers", label: "المشتركون", icon: RssIcon },
  { href: "/admin/comments", label: "التعليقات", icon: MessageIcon },
  { href: "/admin/messages", label: "الرسائل", icon: MailIcon },
  { href: "/admin/settings", label: "الإعدادات", icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (!isAdmin) router.replace("/");
    }
  }, [user, isAdmin, loading, router]);

  if (loading || (!user && pathname !== "/admin")) return null;
  if (user && !isAdmin) return null;

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden lg:flex w-64 bg-surface border-l border-border/50 flex-col p-6 sticky top-16 h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white">
            <PenIcon size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm font-[var(--font-heading)]">لوحة التحكم</h2>
            <p className="text-[10px] text-text-muted">مجلة السُّدفة</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 pt-4 mt-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-foreground transition-all"
          >
            <HomeIcon size={18} />
            عرض الموقع
          </Link>
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOutIcon size={18} />
            خروج
          </button>
        </div>
      </aside>

      <div className="flex-1 p-6 lg:p-8">
        <div className="lg:hidden flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-text-muted bg-surface border border-border/50"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-500/10 whitespace-nowrap"
          >
            خروج
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
