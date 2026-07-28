import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول | مجلة السُّدفة",
  description: "سجّل دخولك إلى مجلة السُّدفة للوصول إلى لوحة الكاتب والمحفوظات.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
