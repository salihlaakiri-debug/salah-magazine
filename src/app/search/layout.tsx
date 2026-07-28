import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بحث | مجلة السُّدفة",
  description: "ابحث في أعمال مجلة السُّدفة الأدبية. شعر، قصة، نثر، مقالات، وتأملات.",
  openGraph: {
    title: "بحث | مجلة السُّدفة",
    description: "ابحث في أعمال مجلة السُّدفة الأدبية",
    type: "website",
    locale: "ar_SA",
    siteName: "السُّدفة",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
