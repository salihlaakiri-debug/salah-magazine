import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أعمالي | مجلة السُّدفة",
  description: "إدارة الأعمال الأدبية المنشورة والمسودات في مجلة السُّدفة.",
};

export default function MyWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
