"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldIcon } from "@/components/Icons";
import Link from "next/link";

export default function AdminLogin() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (isAdmin) router.replace("/admin/dashboard");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  if (user && !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-5">
            <ShieldIcon size={28} />
          </div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">غير مصرح</h1>
          <p className="text-sm text-text-muted mb-6">ليس لديك صلاحية الوصول إلى لوحة التحكم</p>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
}
