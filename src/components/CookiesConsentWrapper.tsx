"use client";

import dynamic from "next/dynamic";

const CookiesConsent = dynamic(() => import("@/components/CookiesConsent"), { ssr: false });

export default function CookiesConsentWrapper() {
  return <CookiesConsent />;
}
