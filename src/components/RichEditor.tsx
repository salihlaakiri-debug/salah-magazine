"use client";

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { BoldIcon, ItalicIcon, HeadingIcon, QuoteIcon, ListIcon, ImageIcon, LinkIcon, CodeIcon } from "./Icons";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertText = useCallback((before: string, after: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }, [value, onChange]);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { data, error } = await supabase.storage.from("images").upload(fileName, file);
    if (!error && data) {
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(data.path);
      const markdown = `\n![صورة](${urlData.publicUrl})\n`;
      const ta = textareaRef.current;
      if (ta) {
        const pos = ta.selectionStart;
        const newText = value.substring(0, pos) + markdown + value.substring(pos);
        onChange(newText);
      }
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = "";
  };

  const toolbarButtons = [
    { icon: BoldIcon, action: () => insertText("**", "**"), title: "غامق" },
    { icon: ItalicIcon, action: () => insertText("*", "*"), title: "مائل" },
    { icon: HeadingIcon, action: () => insertText("\n## ", "\n"), title: "عنوان" },
    { icon: QuoteIcon, action: () => insertText("\n> ", "\n"), title: "اقتباس" },
    { icon: ListIcon, action: () => insertText("\n- ", "\n"), title: "قائمة" },
    { icon: CodeIcon, action: () => insertText("\n```\n", "\n```\n"), title: "كود" },
    { icon: LinkIcon, action: () => insertText("[", "](https://)"), title: "رابط" },
  ];

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-surface">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50 flex-wrap">
        {toolbarButtons.map((btn, i) => (
          <button
            key={i}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-foreground"
          >
            <btn.icon size={16} />
          </button>
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="إضافة صورة"
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-accent flex items-center gap-1"
        >
          <ImageIcon size={16} />
          {uploading && <span className="text-[10px]">جاري الرفع...</span>}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "اكتب محتواك هنا...\n\nيمكنك استخدام التنسيق:\n**غامق** | *مائل* | ## عنوان | > اقتباس | - قائمة | ![صورة](url)"}
        className="w-full min-h-[400px] p-5 bg-background resize-none focus:outline-none text-foreground/90 leading-relaxed text-sm"
        dir="rtl"
      />
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 text-[11px] text-text-muted">
        <span>{wordCount} كلمة · {charCount} حرف</span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Markdown
          </span>
        </span>
      </div>
    </div>
  );
}
