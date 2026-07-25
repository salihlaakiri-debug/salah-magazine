"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { UsersIcon } from "./Icons";

export default function FollowButton({ authorId }: { authorId: string }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { count: total } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("author_id", authorId);
      setCount(total || 0);

      if (user && user.id !== authorId) {
        const { data } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("author_id", authorId)
          .eq("follower_id", user.id)
          .maybeSingle();
        setFollowing(!!data);
      }
    }
    load();
  }, [authorId, user]);

  if (!user || user.id === authorId) return null;

  const toggle = async () => {
    if (following) {
      await supabase.from("follows").delete().eq("author_id", authorId).eq("follower_id", user!.id);
      setFollowing(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("follows").insert({ author_id: authorId, follower_id: user!.id });
      setFollowing(true);
      setCount((c) => c + 1);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
        following
          ? "bg-accent/10 text-accent border-accent/20"
          : "bg-accent text-white border-accent hover:bg-accent-dark shadow-lg shadow-accent/20"
      }`}
    >
      <UsersIcon size={14} />
      {following ? "متابَع" : "متابعة"}
      {count > 0 && <span className="opacity-70">({count})</span>}
    </button>
  );
}
