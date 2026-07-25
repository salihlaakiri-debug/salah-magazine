"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { BookmarkIcon } from "./Icons";

export default function BookmarkButton({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [animating, setAnimating] = useState(false);

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
    if (!user) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (saved) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("article_id", articleId)
        .eq("user_id", user.id);
      setSaved(false);
    } else {
      await supabase
        .from("bookmarks")
        .insert({ article_id: articleId, user_id: user.id });
      setSaved(true);
    }
  };

  return (
    <button
      onClick={toggle}
      title={user ? (saved ? "إزالة من المحفوظات" : "حفظ") : "سجّل الدخول للحفظ"}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
        saved
          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
          : "bg-surface border-border/50 text-text-muted hover:text-amber-500 hover:border-amber-500/20"
      } ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <BookmarkIcon size={14} filled={saved} className={animating ? "animate-bounce" : ""} />
    </button>
  );
}
