import { MetadataRoute } from "next";
import { fetchPublishedArticles } from "@/lib/supabase-data";
import { SECTIONS } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://salah-magazine.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchPublishedArticles();
  const baseUrl = SITE_URL;

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/archive`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    ...SECTIONS.map((s) => ({
      url: `${baseUrl}/section/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  const articlePages = articles.map((a) => ({
    url: `${baseUrl}/work/${a.id}`,
    lastModified: new Date(a.published_at || a.created_at || new Date()),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...articlePages];
}
