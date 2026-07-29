"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { createNotification, getAuthorIdForArticle } from "@/lib/notify";
import { showToast } from "@/lib/toast";
import { HeartIcon, LoaderIcon } from "./Icons";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

export default function LikeButton({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState<"idle" | "like" | "unlike" | "loading">("idle");
  const animatedCount = useAnimatedCounter(count, 300);
  const prevAnim = useRef(animating);

  useEffect(() => {
    prevAnim.current = animating;
  }, [animating]);

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
    if (!user) {
      showToast("سجّل الدخول للإعجاب", "info", { duration: 3000 });
      return;
    }

    if (animating === "loading") return;

    if (liked) {
      setAnimating("unlike");
      await supabase
        .from("likes")
        .delete()
        .eq("article_id", articleId)
        .eq("user_id", user.id);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      setTimeout(() => setAnimating("idle"), 300);
    } else {
      setAnimating("like");
      await supabase
        .from("likes")
        .insert({ article_id: articleId, user_id: user.id });
      setLiked(true);
      setCount((c) => c + 1);
      const authorId = await getAuthorIdForArticle(articleId);
      if (authorId) {
        const { data: profile } = await supabase.from("profiles").select("display_name,username").eq("id", user.id).single();
        createNotification({
          userId: authorId, type: "like", fromUserId: user.id, articleId,
          message: `${profile?.display_name || profile?.username || "شخص"} أعجب بعملك`,
        });
      }
      setTimeout(() => setAnimating("idle"), 600);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={animating === "loading"}
      title={user ? (liked ? "إلغاء الإعجاب" : "أعجبني") : "سجّل الدخول للإعجاب"}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 border active:scale-85 select-none ${
        liked
          ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/10"
          : "bg-surface border-border/50 text-text-muted hover:text-red-500 hover:border-red-500/20 hover:shadow-lg hover:shadow-red-500/5"
      } ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`transition-transform duration-200 ${animating === "like" ? "animate-heart-beat" : ""} ${animating === "unlike" ? "animate-bounce-in scale-0" : ""}`}
      >
        {animating === "loading" ? (
          <LoaderIcon size={14} className="animate-spin" />
        ) : (
          <HeartIcon size={14} filled={liked} />
        )}
      </span>
      {count > 0 && (
        <span className={`tabular-nums ${animating === "like" || animating === "unlike" ? "animate-counter-ping" : ""}`}>
          {Math.round(animatedCount)}
        </span>
      )}
    </button>
  );
}
