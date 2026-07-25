import Link from "next/link";
import { SECTIONS } from "@/lib/types";
import SudfehLogo from "./SudfehLogo";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
            {/* Brand — takes more space on large screens */}
            <div className="sm:col-span-2 lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <SudfehLogo size={36} />
                <span className="text-xl sm:text-2xl font-bold font-[var(--font-heading)]">
                  السُّدفة
                </span>
              </div>
              <p className="text-sm opacity-60 leading-relaxed max-w-sm mb-6">
                مجلة أدبية عربية مستقلة. نكتب لنفهم، وصمتاً لنسمع. ننشر القصائد
                والتأملات والحكايات من عوالم اللغة والصمت.
              </p>
              <div className="flex gap-3">
                {[
                  { name: "تويتر", letter: "ت", href: "#" },
                  { name: "فيسبوك", letter: "ف", href: "#" },
                  { name: "انستغرام", letter: "ا", href: "#" },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20 transition-colors"
                  >
                    {social.letter}
                  </a>
                ))}
              </div>
            </div>

            {/* Sections — compact list */}
            <div className="lg:col-span-3">
              <h4 className="font-bold mb-4 text-sm tracking-wider">الأقسام</h4>
              <ul className="space-y-2.5">
                {SECTIONS.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/section/${encodeURIComponent(s.slug)}`}
                      className="text-sm opacity-60 hover:opacity-100 transition-opacity inline-block"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-4 text-sm tracking-wider">روابط</h4>
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
                      className="text-sm opacity-60 hover:opacity-100 transition-opacity inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-4 text-sm tracking-wider">معلومات</h4>
              <ul className="space-y-2.5 text-sm opacity-60">
                <li>نشرة بريدية</li>
                <li>سياسة الخصوصية</li>
                <li>شروط الاستخدام</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs opacity-40 order-2 sm:order-1">
            © {new Date().getFullYear()} مجلة السُّدفة. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs opacity-40 order-1 sm:order-2">
            صُمّمت بشغفٍ للكلمة العربية
          </p>
        </div>
      </div>
    </footer>
  );
}
