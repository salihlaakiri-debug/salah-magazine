import Link from "next/link";
import { SECTIONS } from "@/lib/types";
import SectionIcon from "@/components/SectionIcon";
import { MailIcon } from "@/components/Icons";

export const metadata = {
  title: "من نحن | مجلة السُّدفة",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <nav className="text-sm text-text-muted mb-10">
        <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">من نحن</span>
      </nav>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-10 rounded-full bg-accent" />
        <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)]">
          عن مجلة السُّدفة
        </h1>
      </div>

      <div className="space-y-8 text-foreground/85 leading-relaxed text-lg">
        <div className="bg-surface rounded-3xl border border-border/50 p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-xl font-[var(--font-heading)] shadow-lg shadow-accent/25">
              س
            </div>
            <div>
              <h2 className="font-bold font-[var(--font-heading)] text-xl">مجلة السُّدفة</h2>
              <p className="text-xs text-text-muted">مجلة أدبية عربية مستقلة</p>
            </div>
          </div>
          <p className="leading-relaxed">
            مجلة أدبية رقمية مستقلة، تُنشر أعمالاً إبداعية في الشعر والقصة والنثر
            والتأملات والمقالات. تأسست على إيمان بأن الكلمة، حين تُكتب بصدق، تملك
            القدرة على تغيير طريقة نظرنا إلى أنفسنا وإلى العالم.
          </p>
        </div>

        <blockquote className="border-r-4 border-accent pr-6 py-4 bg-accent/5 rounded-l-2xl">
          <p className="text-xl italic text-foreground/70 font-[var(--font-arabic)] leading-loose">
            &quot;نحن لا نكتب لنُنسى. بل لنُتذكّر أننا كنا، وأننا سنبقى، في كل
            حرفٍ كتبناه يوماً.&quot;
          </p>
        </blockquote>

        <div className="bg-surface rounded-3xl border border-border/50 p-8 sm:p-10">
          <h2 className="text-xl font-bold font-[var(--font-heading)] mb-4">رؤيتنا</h2>
          <p className="leading-relaxed">
            نسعى لأن نكون مساحة حرة للأصوات الأدبية الصادقة. لا نخضع لأي توجه
            تجاري أو سياسي. ننشر ما نؤمن بقيمته الأدبية، ونفتح أبوابنا لكل كاتبٍ
            يحمل قلماً صادقاً وقلباً مستمعاً.
          </p>
        </div>

        <div className="bg-surface rounded-3xl border border-border/50 p-8 sm:p-10">
          <h2 className="text-xl font-bold font-[var(--font-heading)] mb-6">أقسام المجلة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECTIONS.map((s) => (
              <Link
                key={s.slug}
                href={`/section/${encodeURIComponent(s.slug)}`}
                className="flex items-start gap-3 p-4 rounded-xl hover:bg-surface-hover transition-colors group"
              >
                <div className="text-accent group-hover:scale-110 transition-transform">
                  <SectionIcon section={s.name} size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-[var(--font-heading)] group-hover:text-accent transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-accent-light/10 rounded-3xl border border-accent/20 p-8 sm:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
            <MailIcon size={32} />
          </div>
          <h2 className="text-xl font-bold font-[var(--font-heading)] mb-3">تواصل معنا</h2>
          <p className="text-text-muted text-sm leading-relaxed max-w-md mx-auto">
            إذا كنت كاتباً وترغب في نشر أعمالك في المجلة، أو إذا كان لديك أي
            استفسار، لا تتردد في التواصل معنا.
          </p>
        </div>
      </div>
    </div>
  );
}
