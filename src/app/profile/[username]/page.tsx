"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { UserProfile, Article, SECTIONS } from "@/lib/types";
import WorkCard from "@/components/WorkCard";
import FollowButton from "@/components/FollowButton";
import { UserIcon, ClockIcon, FileTextIcon, HeartIcon, UsersIcon, SettingsIcon, GridIcon, BookmarkIcon, CalendarIcon } from "@/components/Icons";

type Tab = "articles" | "bookmarks";

function initials(name: string, fallback: string): string {
  const n = name || fallback;
  if (n.startsWith("ال")) return n[2] || n[0];
  return n[0];
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  useEffect(() => { document.title = `${username} | مجلة السُّدفة`; }, [username]);
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

      const { count: followerCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("author_id", p.id);

      let totalLikes = 0;
      if (articleList.length > 0) {
        const { count: likeCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .in("article_id", articleList.map((a) => a.id));
        totalLikes = likeCount || 0;
      }

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

  const avatarInitial = initials(profile.display_name, profile.username);
  const memberSince = new Date(profile.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long" });

  const sectionBreakdown = SECTIONS.map(s => ({
    name: s.name,
    slug: s.slug,
    count: articles.filter(a => a.section === s.name).length,
  })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

  const maxSectionCount = Math.max(...sectionBreakdown.map(s => s.count), 1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Cover */}
      <div className="relative h-48 sm:h-56 rounded-3xl overflow-hidden">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/10 via-accent/5 to-background" />
        )}
      </div>

      {/* Profile card */}
      <div className="bg-surface rounded-3xl border border-border/50 p-8 sm:p-10 -mt-16 relative z-10 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent/25 to-accent-light/25 flex items-center justify-center text-accent text-3xl font-bold font-[var(--font-heading)] shrink-0 overflow-hidden ring-4 ring-surface shadow-xl -mt-14 sm:-mt-20">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              avatarInitial
            )}
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)]">{profile.display_name || profile.username}</h1>
                <p className="text-sm text-text-muted mt-0.5">@{profile.username}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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

            {profile.bio && (
              <p className="text-sm text-foreground/70 leading-relaxed mt-4 max-w-xl">{profile.bio}</p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-8 mt-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileTextIcon size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold font-[var(--font-heading)] leading-none">{articles.length}</p>
                  <p className="text-[11px] text-text-muted">عمل أدبي</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <HeartIcon size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="text-lg font-bold font-[var(--font-heading)] leading-none">{stats.totalLikes}</p>
                  <p className="text-[11px] text-text-muted">إعجاب</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <UsersIcon size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-bold font-[var(--font-heading)] leading-none">{stats.followers}</p>
                  <p className="text-[11px] text-text-muted">متابع</p>
                </div>
              </div>
            </div>

            {/* Section breakdown */}
            {sectionBreakdown.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border/40">
                <p className="text-xs font-medium text-text-muted mb-3">التوزيع الأقسام</p>
                <div className="space-y-2">
                  {sectionBreakdown.map(s => {
                    const sectionInfo = SECTIONS.find(si => si.name === s.name);
                    return (
                      <div key={s.slug} className="flex items-center gap-3">
                        <Link href={`/section/${s.slug}`} className="text-xs font-medium text-foreground/70 hover:text-accent transition-colors w-16 shrink-0">
                          {s.name}
                        </Link>
                        <div className="flex-1 h-3 rounded-full bg-accent/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-l transition-all duration-700"
                            style={{ width: `${(s.count / maxSectionCount) * 100}%`, background: "linear-gradient(270deg, #2d3561, #5b6abf)" }}
                          />
                        </div>
                        <span className="text-[11px] text-text-muted w-6 text-left">{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Social links */}
            {(profile.website || profile.twitter || profile.instagram) && (
              <div className="flex items-center gap-3 mt-4">
                {profile.website && (
                  <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-accent hover:text-accent-dark transition-colors flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    موقع إلكتروني
                  </a>
                )}
                {profile.twitter && (
                  <a href={`https://x.com/${profile.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-accent hover:text-accent-dark transition-colors flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    {profile.twitter.replace("@", "")}
                  </a>
                )}
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-accent hover:text-accent-dark transition-colors flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    {profile.instagram.replace("@", "")}
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center gap-1.5 mt-4 text-xs text-text-muted">
              <CalendarIcon size={12} />
              عضو منذ {memberSince}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mt-10 mb-6 border-b border-border/50">
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
            <div className="w-16 h-16 rounded-2xl bg-accent/5 flex items-center justify-center mx-auto mb-4">
              <FileTextIcon size={28} className="text-text-muted/30" />
            </div>
            <p className="text-sm text-text-muted mb-1">لم ينشر هذا الكاتب أي أعمال بعد.</p>
            {isOwner && (
              <Link href="/submit" className="text-sm text-accent hover:text-accent-dark transition-colors">أرسل عملك الأول</Link>
            )}
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
            <div className="w-16 h-16 rounded-2xl bg-accent/5 flex items-center justify-center mx-auto mb-4">
              <BookmarkIcon size={28} className="text-text-muted/30" />
            </div>
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
