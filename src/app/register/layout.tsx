import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حساب جديد | مجلة السُّدفة",
  description: "انضم إلى مجتمع السُّدفة الأدبي. أنشئ حسابك وشارك أعمالك الأدبية.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
