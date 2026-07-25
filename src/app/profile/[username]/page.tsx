"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { UserProfile, Article } from "@/lib/types";
import WorkCard from "@/components/WorkCard";
import FollowButton from "@/components/FollowButton";
import { UserIcon, ClockIcon, FileTextIcon, HeartIcon, UsersIcon } from "@/components/Icons";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({ followers: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from("profiles").select("*").eq("username", username).single();
      if (!p) { setLoading(false); return; }
      setProfile(p as UserProfile);

      const { data: a } = await supabase
        .from("articles")
        .select("*")
        .eq("author_id", p.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      const articleList = (a || []) as Article[];
      setArticles(articleList);

      // Fetch follower count
      const { count: followerCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", p.id);

      // Fetch total likes on author's articles
      let totalLikes = 0;
      if (articleList.length > 0) {
        const { count: likeCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .in("article_id", articleList.map((a) => a.id));
        totalLikes = likeCount || 0;
      }

      setStats({ followers: followerCount || 0, totalLikes });
      setLoading(false);
    }
    load();
  }, [username]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  if (!profile) return (
    <div className="min-h-[60vh] flex items-center justify-center text-center">
      <div>
        <UserIcon size={48} className="mx-auto text-text-muted/20 mb-4" />
        <p className="text-text-muted">هذا الكاتب غير موجود</p>
        <Link href="/" className="text-accent text-sm mt-2 inline-block">العودة للرئيسية</Link>
      </div>
    </div>
  );

  const initials = profile.display_name?.startsWith("ال")
    ? (profile.display_name[2] || profile.display_name[0])
    : (profile.display_name?.[0] || profile.username[0]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-surface rounded-3xl border border-border/50 p-8 sm:p-10 mb-10">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-2xl font-bold font-[var(--font-heading)] shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold font-[var(--font-heading)]">{profile.display_name || profile.username}</h1>
              <FollowButton authorId={profile.id} />
            </div>
            <p className="text-sm text-text-muted mb-3">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-foreground/70 leading-relaxed mb-4">{profile.bio}</p>}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 text-text-muted">
                <FileTextIcon size={16} className="text-accent/60" />
                <span><strong className="text-foreground">{articles.length}</strong> عمل أدبي</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <HeartIcon size={16} className="text-red-400/60" />
                <span><strong className="text-foreground">{stats.totalLikes}</strong> إعجاب</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <UsersIcon size={16} className="text-accent/60" />
                <span><strong className="text-foreground">{stats.followers}</strong> متابع</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3 text-xs text-text-muted">
              <ClockIcon size={12} />
              عضو منذ {new Date(profile.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold font-[var(--font-heading)] mb-6">أعمال {profile.display_name || profile.username}</h2>
      {articles.length === 0 ? (
        <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border/30">
          <FileTextIcon size={40} className="mx-auto text-text-muted/20 mb-3" />
          <p className="text-sm text-text-muted">لم ينشر هذا الكاتب أي أعمال بعد.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {articles.map((a) => <WorkCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}
