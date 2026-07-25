import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "السُّدفة | مجلة أدبية عربية",
    template: "%s | مجلة السُّدفة",
  },
  description: "مجلة أدبية عربية تنشر القصائد والتأملات والحكايات من عوالم اللغة والصمت",
  keywords: ["أدب عربي", "شعر", "قصة", "نثر", "تأملات", "مجلة أدبية", "السُّدفة"],
  authors: [{ name: "السُّدفة" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "السُّدفة",
    title: "السُّدفة | مجلة أدبية عربية",
    description: "مجلة أدبية عربية تنشر القصائد والتأملات والحكايات من عوالم اللغة والصمت",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "السُّدفة | مجلة أدبية عربية",
    description: "مجلة أدبية عربية تنشر القصائد والتأملات والحكايات من عوالم اللغة والصمت",
    images: ["/logo.png"],
  },
  metadataBase: new URL("https://salah-magazine.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="h-full">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
