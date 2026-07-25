"use client";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const links = [
    { name: "تويتر", href: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`, icon: "𝕏" },
    { name: "فيسبوك", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, icon: "f" },
    { name: "واتساب", href: `https://wa.me/?text=${text}%20${encoded}`, icon: "w" },
    { name: "نسخ", href: "#", icon: "⧉", action: () => navigator.clipboard.writeText(url) },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted ml-2">مشاركة:</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          onClick={(e) => {
            if (l.action) {
              e.preventDefault();
              l.action();
            }
          }}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg bg-surface border border-border/50 flex items-center justify-center text-xs font-bold hover:bg-accent hover:text-white hover:border-accent transition-all"
          title={l.name}
        >
          {l.icon}
        </a>
      ))}
    </div>
  );
}
