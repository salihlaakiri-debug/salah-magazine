import Link from "next/link";
import { ArrowLeftIcon } from "@/components/Icons";

export const metadata = {
  title: "سياسة الخصوصية | السُّدفة",
  description: "سياسة الخصوصية لمجلة السُّدفة الأدبية العربية",
};

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">سياسة الخصوصية</h1>
      </div>

      <div className="prose prose-arabic max-w-none space-y-6 text-foreground/80 leading-relaxed">
        <p className="text-sm text-text-muted">آخر تحديث: يوليو 2026</p>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">١. المقدمة</h2>
          <p>
            تلتزم مجلة السُّدفة الأدبية (&quot;نحن&quot;) بحماية خصوصيات المستخدمين. تشرح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام موقعنا.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٢. المعلومات التي نجمعها</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>معلومات الحساب:</strong> اسم المستخدم، البريد الإلكتروني، واسم العرض عند التسجيل.</li>
            <li><strong>المحتوى:</strong> المقالات والتعليقات التي تنشرها على المنصة.</li>
            <li><strong>بيانات الاستخدام:</strong> معلومات حول كيفية تصفحك للموقع مثل الصفحات المزارة والأوقات.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٣. كيف نستخدم معلوماتك</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>لتشغيل وتحسين خدماتنا وتقديم تجربة مستخدم أفضل.</li>
            <li>لإدارة حسابك وتخصيص محتواه.</li>
            <li>للتواصل معك حول تحديثات أو إشعارات تتعلق بالمنصة.</li>
            <li>لحماية أمن موقعنا ومنع الاحتيال.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٤. حماية المعلومات</h2>
          <p>
            نستخدم تقنيات تشفير قوية لحماية بياناتك. لا نبيع معلوماتك الشخصية لأي طرف ثالث. نحتفظ ببياناتك فقط طالما كان حسابك نشطاً أو كما هو مطلوب قانونياً.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٥. ملفات تعريف الارتباط</h2>
          <p>
            نستخدم ملفات تعريف ارتباط ضرورية لتشغيل الموقع بشكل صحيح. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من متصفحك.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٦. حقوقك</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>الوصول إلى معلوماتك الشخصية وتعديلها.</li>
            <li>حذف حسابك وبياناتك الشخصية.</li>
            <li>الاعتراض على معالجة معلوماتك لأغراض تسويقية.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-3">٧. التواصل معنا</h2>
          <p>
            لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: privacy@sudfeh.com
          </p>
        </section>
      </div>
    </div>
  );
}
