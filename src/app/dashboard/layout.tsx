import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة الكاتب | مجلة السُّدفة",
  description: "لوحة تحكم الكاتب في مجلة السُّدفة. أدر أعمالك وتابع إحصائياتك.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
