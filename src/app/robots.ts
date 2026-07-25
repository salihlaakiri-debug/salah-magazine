import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/my-works/", "/bookmarks/"],
      },
    ],
    sitemap: "https://salah-magazine.vercel.app/sitemap.xml",
  };
}
