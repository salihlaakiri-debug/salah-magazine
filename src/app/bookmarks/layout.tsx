import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المحفوظات | مجلة السُّدفة",
  description: "الأعمال الأدبية المحفوظة في مجلة السُّدفة.",
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
