"use client";

import { TwitterIcon, FacebookIcon, WhatsAppIcon, CopyIcon } from "./Icons";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const links = [
    { name: "تويتر", href: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`, Icon: TwitterIcon },
    { name: "فيسبوك", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, Icon: FacebookIcon },
    { name: "واتساب", href: `https://wa.me/?text=${text}%20${encoded}`, Icon: WhatsAppIcon },
    { name: "نسخ", href: "#", Icon: CopyIcon, action: () => navigator.clipboard.writeText(url) },
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
          className="w-8 h-8 rounded-lg bg-surface border border-border/50 flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent transition-all text-text-muted"
          title={l.name}
        >
          <l.Icon size={14} />
        </a>
      ))}
    </div>
  );
}
