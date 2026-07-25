"use client";

import { useEffect, useRef } from "react";

function parseMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`{3}([\s\S]*?)`{3}/g, '<pre class="bg-surface border border-border/50 rounded-xl p-4 my-4 overflow-x-auto text-sm"><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-surface/80 px-1.5 py-0.5 rounded text-sm">$1</code>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold font-[var(--font-heading)] mt-8 mb-4">$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold font-[var(--font-heading)] mt-6 mb-3">$1</h3>');
  html = html.replace(/^> (.*$)/gm, '<blockquote class="border-r-4 border-accent/50 pr-4 my-4 text-text-muted italic">$1</blockquote>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-6"><img src="$2" alt="$1" class="rounded-2xl w-full object-cover max-h-[500px]" loading="lazy" /></div>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/^- (.*$)/gm, '<li class="mr-4 mb-1 list-disc">$1</li>');

  const paragraphs = html.split("\n\n");
  html = paragraphs.map((p) => {
    p = p.trim();
    if (!p) return "";
    if (p.startsWith("<h") || p.startsWith("<blockquote") || p.startsWith("<pre") || p.startsWith("<div") || p.startsWith("<li")) return p;
    if (p.includes("<li>")) return `<ul class="my-3">${p}</ul>`;
    return `<p class="mb-4 leading-loose">${p.replace(/\n/g, "<br/>")}</p>`;
  }).join("\n");

  return html;
}

export default function MarkdownContent({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = parseMarkdown(content);
    }
  }, [content]);

  return <div ref={ref} className="prose-content" />;
}
