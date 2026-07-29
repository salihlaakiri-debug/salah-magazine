import Link from "next/link";
import { ArrowLeftIcon } from "@/components/Icons";
import { CheckIcon } from "@/components/Icons";

export const metadata = {
  title: "تأكيد الاشتراك",
  description: "تم تأكيد اشتراكك في النشرة البريدية لمجلة السُّدفة",
};

export default function NewsletterConfirmedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckIcon size={36} className="text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] mb-3">تم تأكيد الاشتراك!</h1>
        <p className="text-text-muted mb-8 leading-relaxed">
          شكراً لك! تم تأكيد اشتراكك في النشرة البريدية لمجلة السُّدفة.
          سنرسل لك أحدث الأعمال الأدبية والحكايات من عوالم اللغة والصمت.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all shadow-lg shadow-accent/25 text-sm"
        >
          <ArrowLeftIcon size={15} />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
