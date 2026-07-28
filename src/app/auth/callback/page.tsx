"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (exchangeError) {
          setError(exchangeError.message);
        } else {
          router.replace(next);
        }
      });
      return;
    }

    // No code — check for hash (password recovery etc.)
    const hash = window.location.hash;
    if (hash) {
      // Supabase client handles hash automatically via onAuthStateChange
      // Wait for session to be established
      const checkSession = setInterval(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          clearInterval(checkSession);
          router.replace(next);
        }
      }, 200);

      setTimeout(() => {
        clearInterval(checkSession);
        setError("لم يتم تسجيل الدخول. يرجى المحاولة مرة أخرى.");
      }, 15000);

      return () => {
        clearInterval(checkSession);
      };
    }

    setError("رمز التحقق مفقود");
  }, []);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <Link href="/login" className="text-accent text-sm hover:underline">العودة لتسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-sm text-text-muted">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}
