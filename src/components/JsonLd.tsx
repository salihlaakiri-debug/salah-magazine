export function WebsiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "السُّدفة",
          alternateName: "Al-Sudfeh Magazine",
          url: process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app",
          description: "مجلة أدبية عربية مستقلة. حيث تلتقي القصيدة بالتأمل، وتولد الحكاية من رحم الصمت.",
          inLanguage: "ar",
          publisher: {
            "@type": "Organization",
            name: "السُّدفة",
            url: process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app",
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app"}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  excerpt,
  author,
  datePublished,
  dateModified,
  section,
  id,
}: {
  title: string;
  excerpt: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  section: string;
  id: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app";

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: excerpt,
          author: {
            "@type": "Person",
            name: author,
          },
          publisher: {
            "@type": "Organization",
            name: "السُّدفة",
            url: baseUrl,
          },
          datePublished,
          dateModified: dateModified || datePublished,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${baseUrl}/work/${id}`,
          },
          articleSection: section,
          inLanguage: "ar",
        }),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app";

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`,
          })),
        }),
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "السُّدفة",
          alternateName: "Al-Sudfeh",
          url: process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app",
          logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://al-sudfeh.vercel.app"}/favicon.svg`,
          description: "مجلة أدبية عربية مستقلة",
          sameAs: ["https://www.instagram.com/al_sudfeh/"],
        }),
      }}
    />
  );
}
