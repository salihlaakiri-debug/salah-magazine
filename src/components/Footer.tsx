import Link from "next/link";
import { SECTIONS } from "@/lib/types";
import SudfehLogo from "./SudfehLogo";

import { MailIcon, RssIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-surface to-[#0d0e1a] dark:from-[#0a0b14] dark:to-[#06070e]" role="contentinfo">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-accent/20 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-accent/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        <div className="absolute bottom-[20%] right-[5%] w-32 h-32 border border-accent/[0.04] rounded-full" />
        <div className="absolute top-[40%] left-[8%] w-20 h-20 border border-accent/[0.03] rounded-full" />
        <div className="absolute top-[30%] right-[15%] w-3 h-3 rounded-full bg-accent/10" />
        <div className="absolute bottom-[40%] left-[20%] w-2 h-2 rounded-full bg-accent/8" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main grid */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full" />
                  <SudfehLogo size={42} showText={false} className="relative" />
                </div>
                <span className="text-xl font-bold font-[var(--font-heading)] text-white/90">السُّدفة</span>
              </div>
              <div className="max-w-sm mb-6">
                <div className="relative pr-4 border-r-2 border-accent/20">
                  <p className="text-sm leading-relaxed text-white/50">
                    مجلة أدبية عربية مستقلة. حيث تلتقي القصيدة بالتأمل، وتولد الحكاية من رحم الصمت.
                  </p>
                  <p className="text-sm leading-relaxed mt-3 text-accent/70 font-[var(--font-heading)] tracking-wide">
                    نكتب لنفهم، ونُصغي لنرى.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <a href="mailto:contact@sudfeh.com" aria-label="تواصل معنا"
                  className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-accent/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-accent/10 active:scale-95 text-white/40 hover:text-accent">
                  <MailIcon size={16} />
                </a>
                <a href="/rss" aria-label="خلاصة RSS"
                  className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-accent/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-accent/10 active:scale-95 text-white/40 hover:text-accent">
                  <RssIcon size={16} />
                </a>
              </div>
            </div>

            {/* Sections */}
            <div className="lg:col-span-3">
              <h4 className="font-bold mb-5 text-xs tracking-widest text-white/30 uppercase" id="footer-sections">الأقسام</h4>
              <ul className="space-y-3" aria-labelledby="footer-sections">
                {SECTIONS.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/section/${encodeURIComponent(s.slug)}`}
                      className="text-sm text-white/50 hover:text-accent transition-all duration-300 inline-block hover:translate-x-[-4px]">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-5 text-xs tracking-widest text-white/30 uppercase" id="footer-links">روابط</h4>
              <ul className="space-y-3" aria-labelledby="footer-links">
                {[
                  { href: "/archive", label: "الأرشيف" },
                  { href: "/search", label: "بحث" },
                  { href: "/about", label: "من نحن" },
                  { href: "/writers", label: "الكتّاب" },
                  { href: "/contact", label: "تواصل معنا" },
                  { href: "/subscribe", label: "الاشتراكات" },
                  { href: "/submit", label: "إرسال عمل" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-white/50 hover:text-accent transition-all duration-300 inline-block hover:translate-x-[-4px]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div className="lg:col-span-3">
              <h4 className="font-bold mb-5 text-xs tracking-widest text-white/30 uppercase" id="footer-info">معلومات</h4>
              <ul className="space-y-3" aria-labelledby="footer-info">
                {[
                  { href: "/privacy", label: "سياسة الخصوصية" },
                  { href: "/terms", label: "شروط الاستخدام" },
                  { href: "/contact", label: "اتصل بنا" },
                  { href: "/rss", label: "خلاصة RSS" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-white/50 hover:text-accent transition-all duration-300 inline-block hover:translate-x-[-4px]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <Link href="/submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/15 text-accent text-sm font-medium hover:bg-accent/25 transition-all duration-300 active:scale-95">
                  شاركنا كتاباتك
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <p className="text-xs text-white/25 order-2 sm:order-1">
            © {new Date().getFullYear()} مجلة السُّدفة. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs text-white/25 order-1 sm:order-2 font-[var(--font-heading)] tracking-wide">
            صُمّمت بشغفٍ للكلمة العربية
          </p>
        </div>
      </div>
    </footer>
  );
}
