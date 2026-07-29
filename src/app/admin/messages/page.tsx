"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MailIcon, TrashIcon, CheckIcon } from "@/components/Icons";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ar-SA", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  }

  async function toggleRead(msg: any) {
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: !msg.read })
      .eq("id", msg.id);
    if (!error) {
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: !m.read } : m));
      if (selected?.id === msg.id) setSelected({ ...selected, read: !selected.read });
    }
  }

  async function deleteMsg(id: string) {
    if (!confirm("حذف الرسالة؟")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">الرسائل</h1>
        <span className="text-sm text-text-muted">({messages.length})</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-10">لا توجد رسائل</p>
          ) : messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => setSelected(msg)}
              className={`w-full text-right p-4 rounded-xl border transition-all cursor-pointer ${
                selected?.id === msg.id
                  ? "bg-accent/5 border-accent/30"
                  : "bg-surface border-border/50 hover:border-accent/20"
              } ${!msg.read ? "border-r-4 border-r-accent" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm truncate">{msg.name}</span>
                <span className="text-[10px] text-text-muted shrink-0">{new Date(msg.created_at).toLocaleDateString("ar-SA")}</span>
              </div>
              <p className="text-xs text-text-muted truncate">{msg.subject || msg.message.slice(0, 60)}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-surface rounded-2xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold font-[var(--font-heading)]">{selected.name}</h2>
                  <a href={`mailto:${selected.email}`} className="text-sm text-accent hover:underline">{selected.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleRead(selected)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${selected.read ? "bg-surface-hover text-text-muted" : "bg-accent/10 text-accent"}`}>
                    <CheckIcon size={14} className="inline ml-1" />
                    {selected.read ? "مقروءة" : "تحديد كمقروءة"}
                  </button>
                  <button onClick={() => deleteMsg(selected.id)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer">
                    <TrashIcon size={14} className="inline ml-1" />
                    حذف
                  </button>
                </div>
              </div>
              {selected.subject && (
                <div className="mb-4 p-3 rounded-xl bg-surface-hover/50 border border-border/20">
                  <span className="text-xs text-text-muted">الموضوع: </span>
                  <span className="text-sm font-medium">{selected.subject}</span>
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap bg-background/50 rounded-xl p-4 border border-border/20">
                {selected.message}
              </div>
              <p className="text-xs text-text-muted mt-4">أُرسلت في {formatDate(selected.created_at)}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <MailIcon size={48} className="opacity-20 mb-4" />
              <p className="text-sm">اختر رسالة لعرضها</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
