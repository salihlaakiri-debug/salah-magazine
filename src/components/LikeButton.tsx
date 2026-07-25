"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { HeartIcon } from "./Icons";

export default function LikeButton({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    async function load() {
      const { count: total } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("article_id", articleId);
      setCount(total || 0);

      if (user) {
        const { data } = await supabase
          .from("likes")
          .select("user_id")
          .eq("article_id", articleId)
          .eq("user_id", user.id)
          .maybeSingle();
        setLiked(!!data);
      }
    }
    load();
  }, [articleId, user]);

  const toggle = async () => {
    if (!user) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("article_id", articleId)
        .eq("user_id", user.id);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase
        .from("likes")
        .insert({ article_id: articleId, user_id: user.id });
      setLiked(true);
      setCount((c) => c + 1);
    }
  };

  return (
    <button
      onClick={toggle}
      title={user ? (liked ? "إلغاء الإعجاب" : "أعجبني") : "سجّل الدخول للإعجاب"}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
        liked
          ? "bg-red-500/10 text-red-500 border-red-500/20"
          : "bg-surface border-border/50 text-text-muted hover:text-red-500 hover:border-red-500/20"
      } ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <HeartIcon size={14} filled={liked} className={animating ? "animate-bounce" : ""} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
