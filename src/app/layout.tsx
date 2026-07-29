import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import CookiesConsent from "@/components/CookiesConsent";
import ToastProvider from "@/components/ToastProvider";
import { WebsiteJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: {
    default: "السُّدفة | مجلة أدبية عربية",
    template: "%s | مجلة السُّدفة",
  },
  description: "مجلة أدبية عربية تنشر القصائد والتأملات والحكايات من عوالم اللغة والصمت",
  keywords: ["أدب عربي", "شعر", "قصة", "نثر", "تأملات", "مجلة أدبية", "السُّدفة", "أدب", "كتابة"],
  authors: [{ name: "السُّدفة" }],
  creator: "السُّدفة",
  publisher: "السُّدفة",
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "السُّدفة",
    title: "السُّدفة | مجلة أدبية عربية",
    description: "مجلة أدبية عربية تنشر القصائد والتأملات والحكايات من عوالم اللغة والصمت",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "السُّدفة | مجلة أدبية عربية",
    description: "مجلة أدبية عربية تنشر القصائد والتأملات والحكايات من عوالم اللغة والصمت",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    types: {
      "application/rss+xml": [{ title: "السُّدفة RSS", url: "/rss" }],
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="h-full">
      <head>
        <WebsiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[999] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-accent focus:text-white focus:outline-none focus:ring-2 focus:ring-accent/50">
              الانتقال إلى المحتوى الرئيسي
            </a>
            <Header />
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
            <Footer />
            <CookiesConsent />
          </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
