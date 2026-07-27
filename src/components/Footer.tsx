import Link from "next/link";
import { SECTIONS } from "@/lib/types";
import SudfehLogo from "./SudfehLogo";
import NewsletterSignup from "./NewsletterSignup";
import { MailIcon, RssIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="relative bg-foreground text-background mt-auto overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-accent-light/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main footer content */}
        <div className="py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <SudfehLogo size={40} showText={false} />
                <span className="text-xl font-bold font-[var(--font-heading)] gradient-text leading-none">السُّدفة</span>
              </div>
              <p className="text-sm opacity-50 leading-relaxed max-w-sm mb-6">
                مجلة أدبية عربية مستقلة. نكتب لنفهم، وصمتاً لنسمع. ننشر القصائد
                والتأملات والحكايات من عوالم اللغة والصمت.
              </p>
              <div className="flex gap-3">
                <a
                  href="mailto:contact@sudfeh.com"
                  aria-label="تواصل معنا"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/5 active:scale-95"
                >
                  <MailIcon size={16} />
                </a>
                <a
                  href="/rss"
                  aria-label="خلاصة RSS"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/5 active:scale-95"
                >
                  <RssIcon size={16} />
                </a>
              </div>
            </div>

            {/* Sections */}
            <div className="lg:col-span-3">
              <h4 className="font-bold mb-4 text-sm tracking-wider opacity-80">الأقسام</h4>
              <ul className="space-y-2.5">
                {SECTIONS.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/section/${encodeURIComponent(s.slug)}`}
                      className="text-sm opacity-50 hover:opacity-100 transition-all duration-300 inline-block hover:translate-x-[-4px]"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-4 text-sm tracking-wider opacity-80">روابط</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/archive", label: "الأرشيف" },
                  { href: "/search", label: "بحث" },
                  { href: "/about", label: "من نحن" },
                  { href: "/submit", label: "إرسال عمل" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm opacity-50 hover:opacity-100 transition-all duration-300 inline-block hover:translate-x-[-4px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-4 text-sm tracking-wider opacity-80">معلومات</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/privacy", label: "سياسة الخصوصية" },
                  { href: "/terms", label: "شروط الاستخدام" },
                  { href: "/rss", label: "خلاصة RSS" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm opacity-50 hover:opacity-100 transition-all duration-300 inline-block hover:translate-x-[-4px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-white/8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="font-bold text-sm mb-2 opacity-80">النشرة البريدية</h4>
            <p className="text-xs opacity-40 mb-4">احصل على آخر الأعمال الأدبية مباشرة في بريدك</p>
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs opacity-30 order-2 sm:order-1">
            © {new Date().getFullYear()} مجلة السُّدفة. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs opacity-30 order-1 sm:order-2">
            صُمّمت بشغفٍ للكلمة العربية
          </p>
        </div>
      </div>
    </footer>
  );
}
