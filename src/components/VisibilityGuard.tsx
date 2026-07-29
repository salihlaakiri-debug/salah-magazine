"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function VisibilityGuard({
  articleId,
  authorId,
  visibility,
  children,
}: {
  articleId: string;
  authorId?: string;
  visibility?: "public" | "followers" | "private";
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!visibility || visibility === "public") {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    if (!user) {
      router.push(`/login?redirect=/work/${articleId}`);
      return;
    }

    if (visibility === "private") {
      if (user.id === authorId) {
        setAuthorized(true);
      } else {
        router.push("/");
      }
      setChecking(false);
      return;
    }

    if (visibility === "followers") {
      if (user.id === authorId) {
        setAuthorized(true);
        setChecking(false);
        return;
      }
      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", authorId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setAuthorized(true);
          } else {
            router.push(`/login?redirect=/work/${articleId}`);
          }
          setChecking(false);
        });
    }
  }, [visibility, user, loading, authorId, articleId, router]);

  if (checking || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
