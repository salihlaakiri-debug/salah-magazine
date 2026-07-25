import Link from "next/link";
import { SECTIONS } from "@/lib/types";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-10 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c7bc0] to-[#4a5899] flex items-center justify-center text-white font-bold text-lg font-[var(--font-heading)]">
                  س
                </div>
                <span className="text-xl sm:text-2xl font-bold font-[var(--font-heading)]">
                  السُّدفة
                </span>
              </div>
              <p className="text-sm opacity-60 leading-relaxed max-w-md mb-6">
                مجلة أدبية عربية مستقلة. نكتب لنفهم، وصمتاً لنسمع. نشر القصائد
                والتأملات والحكايات من عوالم اللغة والصمت.
              </p>
              <div className="flex gap-3">
                {["تويتر", "فيسبوك", "انستغرام"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-xs hover:bg-white/20 transition-colors"
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div>
              <h4 className="font-bold mb-4 text-sm tracking-wider">الأقسام</h4>
              <ul className="space-y-2.5">
                {SECTIONS.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/section/${encodeURIComponent(s.slug)}`}
                      className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links */}
            <div>
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
                      className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <p className="text-xs opacity-40">
            © {new Date().getFullYear()} مجلة السُّدفة. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs opacity-40">
            صُمّمت بشغفٍ للكلمة العربية
          </p>
        </div>
      </div>
    </footer>
  );
}
