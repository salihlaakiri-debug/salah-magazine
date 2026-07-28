"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const Comments = dynamic(() => import("@/components/Comments"), {
  ssr: false,
  loading: () => <div className="py-10 text-center text-text-muted text-sm">جاري تحميل التعليقات...</div>,
});

const ReadingMode = dynamic(() => import("@/components/ReadingMode"), { ssr: false });
const TableOfContents = dynamic(() => import("@/components/TableOfContents"), { ssr: false });
const ShareButtons = dynamic(() => import("@/components/ShareButtons"), { ssr: false });
const ShareCard = dynamic(() => import("@/components/ShareCard"), { ssr: false });

export function ClientComments({ articleId }: { articleId: string }) {
  return <Comments articleId={articleId} />;
}

export function ClientReadingMode() {
  return <ReadingMode />;
}

export function ClientTableOfContents({ content }: { content: string }) {
  return <TableOfContents content={content} />;
}

export function ClientShareButtons({ title, url }: { title: string; url: string }) {
  return <ShareButtons title={title} url={url} />;
}

export function ClientShareCard(props: { title: string; excerpt: string; section: string; author: string; articleId: string }) {
  return <ShareCard {...props} />;
}
