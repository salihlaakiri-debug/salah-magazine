import { fetchPublishedArticles } from "@/lib/supabase-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await fetchPublishedArticles();

  const items = articles
    .map(
      (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_URL}/work/${article.id}</link>
      <description>${escapeXml(article.excerpt)}</description>
      <pubDate>${new Date(article.published_at || article.date).toUTCString()}</pubDate>
      <author>${escapeXml(article.author)}</author>
      <guid isPermaLink="false">work-${escapeXml(article.id)}</guid>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml("السُّدفة | مجلة أدبية عربية")}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml("مجلة أدبية عربية مستقلة. حيث تلتقي القصيدة بالتأمل، وتولد الحكاية من رحم الصمت.")}</description>
    <language>ar</language>
    <atom:link href="${SITE_URL}/rss" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
