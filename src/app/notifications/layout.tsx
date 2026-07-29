import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الإشعارات | مجلة السُّدفة",
  description: "صفحة الإشعارات في مجلة السُّدفة. تابع كل التفاعلات مع أعمالك.",
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
