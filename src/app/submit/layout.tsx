import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إرسال عمل | مجلة السُّدفة",
  description: "أرسل عملك الأدبي إلى مجلة السُّدفة. شعر، قصة، نثر، مقالات، وتأملات.",
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
