import Link from "next/link";
import { SECTIONS } from "@/lib/types";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white font-bold text-lg font-[var(--font-heading)]">
                  ص
                </div>
                <span className="text-2xl font-bold font-[var(--font-heading)]">
                  صلاح
                </span>
              </div>
              <p className="text-sm opacity-60 leading-relaxed max-w-md mb-6">
                مجلة أدبية عربية مستقلة. نكتب لنفهم، وصمتاً لنسمع. ننشر القصائد
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

            <div>
              <h4 className="font-bold mb-4 text-sm tracking-wider">روابط</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/archive", label: "الأرشيف" },
                  { href: "/search", label: "بحث" },
                  { href: "/about", label: "من نحن" },
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

        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-40">
            © {new Date().getFullYear()} مجلة صلاح. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs opacity-40">
            صُمّمت بشغفٍ للكلمة العربية
          </p>
        </div>
      </div>
    </footer>
  );
}
