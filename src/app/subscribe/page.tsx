import Link from "next/link";
import { ArrowLeftIcon, MailIcon, HeartIcon, BellIcon } from "@/components/Icons";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata = {
  title: "الاشتراكات | مجلة السُّدفة",
  description: "اشترك في النشرة البريدية لمجلة السُّدفة الأدبية واستلم أحدث الأعمال الشعرية والنثرية",
};

export default function SubscribePage() {
  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-accent/20 to-transparent" />
          <div className="absolute top-[10%] right-[5%] w-64 h-64 rounded-full bg-accent/[0.03] blur-[100px]" />
          <div className="absolute bottom-[20%] left-[10%] w-48 h-48 rounded-full bg-accent/[0.04] blur-[80px]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <MailIcon size={24} className="text-accent" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[var(--font-heading)] mb-4 leading-tight">
            اشترك في النشرة البريدية
          </h1>
          <p className="text-text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            احصل على أحدث الأعمال الأدبية — قصائد، قصص، نثر، مقالات وتأملات — تصلك مباشرة إلى بريدك الإلكتروني
          </p>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 -mt-8 mb-16">
        <NewsletterSignup />
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="bg-surface border border-border/40 rounded-3xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <MailIcon size={20} className="text-accent" />
            </div>
            <h3 className="font-bold font-[var(--font-heading)] mb-2">محتوى أسبوعي</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              نختار لك أبرز ما نَُشر في السُّدفة كل أسبوع، من قصائد وتأملات ومقالات
            </p>
          </div>
          <div className="bg-surface border border-border/40 rounded-3xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <HeartIcon size={20} className="text-accent" />
            </div>
            <h3 className="font-bold font-[var(--font-heading)] mb-2">أعمال حصرية</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              انضم إلى مجتمع السُّدفة الأدبي واحصل على محتوى حصري يُنشر للمشتركين أولاً
            </p>
          </div>
          <div className="bg-surface border border-border/40 rounded-3xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <BellIcon size={20} className="text-accent" />
            </div>
            <h3 className="font-bold font-[var(--font-heading)] mb-2">إشعارات فورية</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              يصلك إشعار فوري عند نشر عمل جديد لكاتب تتابعه أو في قسمك المفضل
            </p>
          </div>
        </div>
      </section>

      {/* CTA back */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <div className="bg-surface/50 border border-border/30 rounded-3xl p-8">
          <h2 className="text-xl font-bold font-[var(--font-heading)] mb-3">اكتشف المزيد</h2>
          <p className="text-sm text-text-muted mb-6">
            تصفح أحدث الأعمال الأدبية في أقسام المجلة
          </p>
          <Link
            href="/archive"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all active:scale-95"
          >
            <ArrowLeftIcon size={15} />
            تصفّح الأرشيف
          </Link>
        </div>
      </section>
    </div>
  );
}
