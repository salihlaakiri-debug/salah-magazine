"use client";

import { useState, useEffect } from "react";

export default function CookiesConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("sudfeh-cookies-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("sudfeh-cookies-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 right-0 left-0 z-50 p-4 animate-fade-in">
      <div className="max-w-3xl mx-auto bg-surface border border-border/60 rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-text-muted leading-relaxed flex-1">
          نستخدم ملفات تعريف الارتباط لتحسين تجربتك. باستخدامك للموقع، فإنك توافق على سياسة الخصوصية الخاصة بنا.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <a href="/privacy" className="text-xs text-accent hover:underline">سياسة الخصوصية</a>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all cursor-pointer"
          >
            موافق
          </button>
        </div>
      </div>
    </div>
  );
}
