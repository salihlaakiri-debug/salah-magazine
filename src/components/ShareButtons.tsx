"use client";

import { useState } from "react";
import { TwitterIcon, FacebookIcon, WhatsAppIcon, CopyIcon } from "./Icons";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const socialLinks = [
    { name: "تويتر", href: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`, Icon: TwitterIcon },
    { name: "فيسبوك", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, Icon: FacebookIcon },
    { name: "واتساب", href: `https://wa.me/?text=${text}%20${encoded}`, Icon: WhatsAppIcon },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {socialLinks.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface border border-border/50 flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent transition-all text-text-muted"
          title={l.name}
        >
          <l.Icon size={14} />
        </a>
      ))}
      <button
        onClick={copyLink}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface border border-border/50 flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent transition-all text-text-muted"
        title="نسخ الرابط"
      >
        <CopyIcon size={14} />
      </button>
    </div>
  );
}
