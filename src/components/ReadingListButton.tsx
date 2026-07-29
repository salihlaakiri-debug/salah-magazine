"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { BookmarkIcon, CheckIcon, ClockIcon } from "./Icons";

type ListType = "want_to_read" | "reading" | "finished";

const listOptions: { type: ListType; label: string; icon: any }[] = [
  { type: "want_to_read", label: "أريد قراءته", icon: BookmarkIcon },
  { type: "reading", label: "أقرأه الآن", icon: ClockIcon },
  { type: "finished", label: "أنهيت قراءته", icon: CheckIcon },
];

export default function ReadingListButton({ articleId }: { articleId: string }) {
  const { user, profile } = useAuth();
  const [currentList, setCurrentList] = useState<ListType | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("reading_lists")
      .select("list_type")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .single()
      .then(({ data }) => {
        if (data) setCurrentList(data.list_type as ListType);
      });
  }, [user, articleId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleList = async (type: ListType) => {
    if (!user) { showToast("سجّل الدخول لإضافة العمل إلى قائمة", "error"); return; }
    try {
      if (currentList === type) {
        await supabase.from("reading_lists").delete().eq("user_id", user.id).eq("article_id", articleId).eq("list_type", type);
        setCurrentList(null);
      } else {
        await supabase.from("reading_lists").upsert(
          { user_id: user.id, article_id: articleId, list_type: type },
          { onConflict: "user_id, article_id, list_type" }
        );
        setCurrentList(type);
      }
      setOpen(false);
    } catch {}
  };

  if (!user) return null;

  const currentLabel = listOptions.find((o) => o.type === currentList)?.label;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          currentList ? "bg-accent/10 text-accent" : "bg-surface-hover text-text-muted hover:text-foreground"
        }`}
        title={currentLabel || "قائمة القراءة"}
      >
        <BookmarkIcon size={14} />
        {currentLabel || "قائمة"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-48 bg-surface border border-border/50 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
            {listOptions.map((opt) => {
              const active = currentList === opt.type;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  onClick={() => toggleList(opt.type)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-right ${
                    active ? "bg-accent/10 text-accent font-medium" : "hover:bg-surface-hover"
                  }`}
                >
                  <Icon size={16} />
                  {opt.label}
                  {active && <CheckIcon size={14} className="mr-auto" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
