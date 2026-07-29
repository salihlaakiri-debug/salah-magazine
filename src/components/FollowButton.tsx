"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { createNotification } from "@/lib/notify";
import { showToast } from "@/lib/toast";
import { UsersIcon, LoaderIcon, CheckIcon, XIcon } from "./Icons";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

export default function FollowButton({ authorId }: { authorId: string }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState<"idle" | "follow" | "unfollow" | "loading">("idle");
  const animatedCount = useAnimatedCounter(count, 300);

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
    if (animating === "loading") return;
    setAnimating("loading");

    if (following) {
      await supabase.from("follows").delete().eq("author_id", authorId).eq("follower_id", user!.id);
      setFollowing(false);
      setCount((c) => Math.max(0, c - 1));
      setAnimating("unfollow");
      setTimeout(() => setAnimating("idle"), 300);
    } else {
      await supabase.from("follows").insert({ author_id: authorId, follower_id: user!.id });
      setFollowing(true);
      setCount((c) => c + 1);
      const { data: profile } = await supabase.from("profiles").select("display_name,username").eq("id", user!.id).single();
      createNotification({
        userId: authorId, type: "follow", fromUserId: user!.id,
        message: `${profile?.display_name || profile?.username || "شخص"} بدأ بمتابعتك`,
      });
      setAnimating("follow");
      showToast("تمت المتابعة بنجاح", "success", { duration: 2000 });
      setTimeout(() => setAnimating("idle"), 500);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={animating === "loading"}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 border select-none active:scale-90 ${
        following
          ? "bg-accent/10 text-accent border-accent/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 group"
          : "bg-accent text-white border-accent hover:bg-accent-dark shadow-lg shadow-accent/20"
      } ${animating === "loading" ? "opacity-70" : ""}`}
    >
      {animating === "loading" ? (
        <LoaderIcon size={14} className="animate-spin" />
      ) : following ? (
        <>
          <span className="group-hover:hidden flex items-center gap-1.5">
            <CheckIcon size={14} /> متابَع
          </span>
          <span className="hidden group-hover:flex items-center gap-1.5">
            <XIcon size={14} /> إلغاء
          </span>
        </>
      ) : (
        <>
          <UsersIcon size={14} />
          <span className={animating === "follow" ? "animate-pop-in" : ""}>متابعة</span>
        </>
      )}
      {count > 0 && (
        <span className={`opacity-70 mr-1 tabular-nums ${animating === "follow" || animating === "unfollow" ? "animate-counter-ping" : ""}`}>
          {Math.round(animatedCount)}
        </span>
      )}
    </button>
  );
}
