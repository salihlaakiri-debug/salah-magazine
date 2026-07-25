"use client";

import { useEffect, useRef } from "react";

function parseMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^> (.*$)/gm, "<blockquote><p>$1</p></blockquote>");
  html = html.replace(/^---$/gm, "<hr />");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure><img src="$2" alt="$1" loading="lazy" />$1<figcaption>$1</figcaption></figure>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/^- (.*$)/gm, "<li>$1</li>");

  const paragraphs = html.split("\n\n");
  html = paragraphs.map((p) => {
    p = p.trim();
    if (!p) return "";
    if (p.startsWith("<h") || p.startsWith("<blockquote") || p.startsWith("<pre") || p.startsWith("<figure") || p.startsWith("<hr") || p.startsWith("<li") || p.startsWith("<ul") || p.startsWith("<ol")) return p;
    if (p.includes("<li>")) return `<ul>${p}</ul>`;
    return `<p>${p.replace(/\n/g, "<br/>")}</p>`;
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
