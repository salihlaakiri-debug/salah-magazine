import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الأرشيف | مجلة السُّدفة",
  description: "تصفح جميع الأعمال الأدبية في أرشيف مجلة السُّدفة. شعر، قصة، نثر، مقالات، وتأملات.",
  openGraph: {
    title: "الأرشيف | مجلة السُّدفة",
    description: "تصفح جميع الأعمال الأدبية في أرشيف مجلة السُّدفة",
    type: "website",
    locale: "ar_SA",
    siteName: "السُّدفة",
  },
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
