"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { showToast } from "@/lib/toast";
import { BookmarkIcon, LoaderIcon } from "./Icons";

export default function BookmarkButton({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [animating, setAnimating] = useState<"idle" | "save" | "remove" | "loading">("idle");

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("bookmarks")
        .select("user_id")
        .eq("article_id", articleId)
        .eq("user_id", user!.id)
        .maybeSingle();
      setSaved(!!data);
    }
    load();
  }, [articleId, user]);

  const toggle = async () => {
    if (!user) {
      showToast("سجّل الدخول للحفظ", "info", { duration: 3000 });
      return;
    }
    if (animating === "loading") return;

    setAnimating("loading");
    if (saved) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("article_id", articleId)
        .eq("user_id", user.id);
      setSaved(false);
      setAnimating("remove");
      showToast("تمت الإزالة من المحفوظات", "info", { duration: 2500 });
      setTimeout(() => setAnimating("idle"), 300);
    } else {
      await supabase
        .from("bookmarks")
        .insert({ article_id: articleId, user_id: user.id });
      setSaved(true);
      setAnimating("save");
      showToast("تم الحفظ", "success", { duration: 2500 });
      setTimeout(() => setAnimating("idle"), 500);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={animating === "loading"}
      title={user ? (saved ? "إزالة من المحفوظات" : "حفظ") : "سجّل الدخول للحفظ"}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 border active:scale-85 select-none ${
        saved
          ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-lg shadow-amber-500/10"
          : "bg-surface border-border/50 text-text-muted hover:text-amber-500 hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5"
      } ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={animating === "save" ? "animate-spring-bounce" : animating === "remove" ? "animate-bounce-in" : ""}>
        {animating === "loading" ? (
          <LoaderIcon size={14} className="animate-spin" />
        ) : (
          <BookmarkIcon size={14} filled={saved} />
        )}
      </span>
    </button>
  );
}
