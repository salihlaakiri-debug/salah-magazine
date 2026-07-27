import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://salah-magazine.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/my-works/", "/bookmarks/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
