import Link from "next/link";
import { ArrowLeftIcon } from "@/components/Icons";

export const metadata = {
  title: "شروط الاستخدام | السُّدفة",
  description: "شروط الاستخدام لمجلة السُّدفة الأدبية العربية",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dark transition-colors mb-8"
      >
        <ArrowLeftIcon size={16} />
        العودة
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">شروط الاستخدام</h1>
      </div>

      <div className="prose prose-arabic max-w-none space-y-6 text-foreground/80 leading-relaxed">
        <p className="text-sm text-text-muted">آخر تحديث: يوليو 2026</p>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">١. قبول الشروط</h2>
          <p>
            باستخدامك لموقع السُّدفة الأدبية، أنت توافق على هذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام الموقع.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٢. الحسابات والتسجيل</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>يجب أن يكون عمرك ١٣ عاماً أو أكثر لإنشاء حساب.</li>
            <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك.</li>
            <li>يجب أن تكون جميع المعلومات التي تقدمها دقيقة ومحدثة.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٣. المحتوى</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>تحتفظ بالملكية الفكرية لمحتواك الأصلي الذي تنشره.</li>
            <li>بنشر المحتوى، تمنحنا حق عرضه وترويجه على المنصة.</li>
            <li>يجب أن لا يحتوي محتواك على مواد مسيئة أو مخالفة للقوانين.</li>
            <li>يحق لنا حذف أي محتوى يخالف هذه الشروط.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٤. سلوك المستخدمين</h2>
          <p>يُحظر عليك:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>انتحال شخصية مستخدم آخر.</li>
            <li>نشر محتوى يحتوي على فيروسات أو برامج ضارة.</li>
            <li>محاولة الوصول غير المصرح به إلى أنظمتنا.</li>
            <li>استخدام المنصة لأغراض تجارية غير مصرح بها.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٥. الإعلانات والمدفوعات</h2>
          <p>
            يمكننا عرض إعلانات على الموقع. نحتفظ بالحق في تغيير أو إيقاف أي خدمة مدفوعة في أي وقت مع إشعار مسبق.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٦. إخلاء المسؤولية</h2>
          <p>
            يُقدم الموقع &quot;كما هو&quot; دون ضمانات. لا نتحمل المسؤولية عن أي أضرار ناتجة عن استخدام الموقع.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٧. تعديل الشروط</h2>
          <p>
            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٨. التواصل معنا</h2>
          <p>
            لأي استفسارات حول شروط الاستخدام، يرجى التواصل معنا عبر البريد الإلكتروني: terms@sudfeh.com
          </p>
        </section>
      </div>
    </div>
  );
}
