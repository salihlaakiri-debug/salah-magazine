"use client";

import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

export default function TrackView({ articleId, readTime }: { articleId: string; readTime?: string }) {
  const { user } = useAuth();

  useEffect(() => {
    async function track() {
      try {
        await fetch("/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId,
            userId: user?.id || null,
          }),
        });
      } catch {}
    }
    track();
  }, [articleId, user?.id]);

  return null;
}
