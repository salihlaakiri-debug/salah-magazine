"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { UserProfile, Article, SECTIONS } from "@/lib/types";
import WorkCard from "@/components/WorkCard";
import FollowButton from "@/components/FollowButton";
import { UserIcon, ClockIcon, FileTextIcon, HeartIcon, UsersIcon, SettingsIcon, GridIcon, BookmarkIcon } from "@/components/Icons";

type Tab = "articles" | "bookmarks";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user, profile: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [stats, setStats] = useState({ followers: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("articles");
  const isOwner = user && profile?.id === user.id;

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
        .eq("author_id", p.id);

      // Fetch total likes on author's articles
      let totalLikes = 0;
      if (articleList.length > 0) {
        const { count: likeCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .in("article_id", articleList.map((a) => a.id));
        totalLikes = likeCount || 0;
      }

      // Fetch bookmarks if viewing own profile
      if (isOwner) {
        const { data: bmData } = await supabase
          .from("bookmarks")
          .select("article_id")
          .eq("user_id", user!.id);

        if (bmData && bmData.length > 0) {
          const { data: bmArticles } = await supabase
            .from("articles")
            .select("*")
            .in("id", bmData.map((b) => b.article_id))
            .eq("status", "published")
            .order("published_at", { ascending: false });

          setBookmarks((bmArticles || []) as Article[]);
        }
      }

      setStats({ followers: followerCount || 0, totalLikes });
      setLoading(false);
    }
    load();
  }, [username, user?.id]);

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

  const sectionBreakdown = SECTIONS.map(s => ({
    name: s.name,
    slug: s.slug,
    count: articles.filter(a => a.section === s.name).length,
  })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Cover */}
      <div className="relative h-48 sm:h-56 rounded-3xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 mb-6">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/10 via-accent/5 to-background" />
        )}
      </div>

      {/* Profile card */}
      <div className="bg-surface rounded-3xl border border-border/50 p-8 sm:p-10 mb-8 -mt-20 relative z-10">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-2xl font-bold font-[var(--font-heading)] shrink-0 overflow-hidden ring-4 ring-surface">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold font-[var(--font-heading)]">{profile.display_name || profile.username}</h1>
              <div className="flex items-center gap-2">
                <FollowButton authorId={profile.id} />
                {isOwner && (
                  <Link
                    href="/settings"
                    className="w-9 h-9 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent hover:bg-accent/10 transition-all"
                    title="إعدادات الحساب"
                  >
                    <SettingsIcon size={16} />
                  </Link>
                )}
              </div>
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

            {/* Section breakdown */}
            {sectionBreakdown.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {sectionBreakdown.map(s => (
                  <Link key={s.slug} href={`/section/${s.slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/5 border border-accent/10 text-xs font-medium text-accent hover:bg-accent/10 transition-all">
                    {s.name}
                    <span className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-[10px] font-bold">{s.count}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 mt-3 text-xs text-text-muted">
              <ClockIcon size={12} />
              عضو منذ {new Date(profile.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border/50">
        <button
          onClick={() => setTab("articles")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            tab === "articles" ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-foreground"
          }`}
        >
          <GridIcon size={16} />
          الأعمال ({articles.length})
        </button>
        {isOwner && (
          <button
            onClick={() => setTab("bookmarks")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === "bookmarks" ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-foreground"
            }`}
          >
            <BookmarkIcon size={16} />
            المحفوظات ({bookmarks.length})
          </button>
        )}
      </div>

      {/* Content */}
      {tab === "articles" && (
        articles.length === 0 ? (
          <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border/30">
            <FileTextIcon size={40} className="mx-auto text-text-muted/20 mb-3" />
            <p className="text-sm text-text-muted">لم ينشر هذا الكاتب أي أعمال بعد.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((a) => <WorkCard key={a.id} article={a} />)}
          </div>
        )
      )}

      {tab === "bookmarks" && (
        bookmarks.length === 0 ? (
          <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border/30">
            <BookmarkIcon size={40} className="mx-auto text-text-muted/20 mb-3" />
            <p className="text-sm text-text-muted">لا توجد أعمال محفوظة بعد.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bookmarks.map((a) => <WorkCard key={a.id} article={a} />)}
          </div>
        )
      )}
    </div>
  );
}
