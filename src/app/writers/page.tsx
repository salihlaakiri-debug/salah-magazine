import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase-server";
import { FileTextIcon, HeartIcon, UsersIcon } from "@/components/Icons";

export const metadata = {
  title: "الكتّاب | مجلة السُّدفة",
  description: "تعرف على كتّاب مجلة السُّدفة الأدبية",
};

function initials(name: string, fallback: string): string {
  const n = name || fallback;
  if (n.startsWith("ال")) return n[2] || n[0];
  return n[0];
}

export default async function WritersPage() {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)] mb-3">الكتّاب</h1>
          <p className="text-text-muted max-w-lg mx-auto">خطأ في الاتصال بقاعدة البيانات</p>
        </div>
      </div>
    );
  }

  const { data: writers } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, created_at")
    .in("role", ["writer", "admin"])
    .order("display_name", { ascending: true });

  if (!writers?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-3xl font-bold font-[var(--font-heading)] mb-4">الكتّاب</h1>
        <p className="text-text-muted">لا يوجد كتّاب بعد.</p>
      </div>
    );
  }

  const enriched = await Promise.all(
    writers.map(async (w: any) => {
      const { count: articles } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("author_id", w.id)
        .eq("status", "published");

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("author_id", w.id);

      return { ...w, articleCount: articles || 0, followerCount: followers || 0 };
    })
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)] mb-3">الكتّاب</h1>
        <p className="text-text-muted max-w-lg mx-auto">
          نخبة من الكتّاب والمبدعين يثرون السُّدفة بإبداعاتهم
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enriched.map((writer: any) => (
          <Link
            key={writer.id}
            href={`/profile/${writer.username}`}
            className="group block bg-surface border border-border/50 rounded-3xl p-6 card-hover"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-2xl font-bold font-[var(--font-heading)] overflow-hidden mb-4 ring-2 ring-accent/5 group-hover:ring-accent/20 transition-all">
                {writer.avatar_url ? (
                  <img src={writer.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials(writer.display_name, writer.username)
                )}
              </div>
              <h2 className="text-lg font-bold font-[var(--font-heading)] group-hover:text-accent transition-colors">
                {writer.display_name || writer.username}
              </h2>
              <p className="text-xs text-text-muted mb-3">@{writer.username}</p>
              {writer.bio && (
                <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2 mb-4">{writer.bio}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <FileTextIcon size={13} className="text-accent/60" /> {writer.articleCount}
                </span>
                <span className="flex items-center gap-1">
                  <HeartIcon size={13} className="text-red-400/60" /> {0}
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon size={13} className="text-blue-400/60" /> {writer.followerCount}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
