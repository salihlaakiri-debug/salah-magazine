import Link from "next/link";
import { useState } from "react";
import { Tag } from "@/lib/types";

const TAG_COLORS = [
  "bg-accent/10 text-accent hover:bg-accent/20",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20",
  "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20",
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
];

function getTagColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function TagBadge({ tag, size = "sm" }: { tag: Tag; size?: "xs" | "sm" | "md" }) {
  const color = getTagColor(tag.name);
  const sizeClasses = {
    xs: "text-[10px] px-2 py-0.5",
    sm: "text-[11px] px-2.5 py-1",
    md: "text-xs px-3 py-1.5",
  };

  return (
    <Link
      href={`/tag/${tag.slug}`}
      className={`inline-flex items-center gap-1 rounded-full font-semibold transition-all duration-200 ${color} ${sizeClasses[size]}`}
    >
      #{tag.name}
    </Link>
  );
}

export function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const newTag = input.trim();
      if (!tags.includes(newTag) && tags.length < 5) {
        onChange([...tags, newTag]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(idx: number) {
    onChange(tags.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-wrap gap-2 items-center p-2 min-h-[40px] rounded-xl border border-border bg-surface text-sm">
      {tags.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          #{tag}
          <button type="button" onClick={() => removeTag(i)} className="hover:text-red-500 transition-colors" aria-label={`إزالة ${tag}`}>
            &times;
          </button>
        </span>
      ))}
      {tags.length < 5 && (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "أضف وسوماً (اضغط Enter)" : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-text-muted"
        />
      )}
    </div>
  );
}
