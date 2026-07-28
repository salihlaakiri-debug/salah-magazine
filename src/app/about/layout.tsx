import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن | مجلة السُّدفة",
  description: "مجلة أدبية عربية مستقلة. ننشر القصائد والتأملات والحكايات من عوالم اللغة والصمت. تأسست على إيمان بالكلمة الصادقة.",
  openGraph: {
    title: "من نحن | مجلة السُّدفة",
    description: "مجلة أدبية عربية مستقلة. ننشر القصائد والتأملات والحكايات من عوالم اللغة والصمت.",
    type: "website",
    locale: "ar_SA",
    siteName: "السُّدفة",
  },
  twitter: {
    card: "summary_large_image",
    title: "من نحن | مجلة السُّدفة",
    description: "مجلة أدبية عربية مستقلة. ننشر القصائد والتأملات والحكايات من عوالم اللغة والصمت.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
