"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { UsersIcon, ShieldIcon, PenIcon, UserIcon, CheckIcon, XIcon } from "@/components/Icons";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";

interface Profile {
  id: string; username: string; display_name: string; email?: string;
  role: string; created_at: string; avatar_url?: string;
  article_count?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("الكل");
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  useAdminRealtime("admin-users", [
    { table: "profiles", event: "INSERT" },
    { table: "profiles", event: "UPDATE" },
  ], useCallback((payload: any) => {
    const { eventType, new: record } = payload;
    if (eventType === "INSERT") {
      setUsers(prev => [...prev, { ...record, article_count: 0 }]);
    } else if (eventType === "UPDATE") {
      setUsers(prev => prev.map(u => u.id === record.id ? { ...u, ...record } : u));
    }
  }, []));

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const profiles = (data || []) as Profile[];

    const { data: counts } = await supabase
      .from("articles")
      .select("author_id")
      .eq("status", "published");
    const countMap: Record<string, number> = {};
    (counts || []).forEach((a: any) => {
      if (a.author_id) countMap[a.author_id] = (countMap[a.author_id] || 0) + 1;
    });

    setUsers(profiles.map(p => ({ ...p, article_count: countMap[p.id] || 0 })));
    setLoading(false);
  }

  async function changeRole(userId: string, newRole: string) {
    setChangingRole(userId);
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setChangingRole(null);
  }

  const filtered = users.filter(u => {
    if (roleFilter !== "الكل" && u.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (u.display_name || "").toLowerCase().includes(q) ||
           (u.username || "").toLowerCase().includes(q) ||
           (u.id || "").toLowerCase().includes(q);
  });

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-600",
    writer: "bg-emerald-500/10 text-emerald-600",
    reader: "bg-blue-500/10 text-blue-600",
  };

  const roleLabels: Record<string, string> = {
    admin: "مشرف", writer: "كاتب", reader: "قارئ",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full bg-accent" />
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">المستخدمون</h1>
        <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border/50">{users.length}</span>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد..."
          className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <div className="flex gap-2 overflow-x-auto">
          {["الكل", "admin", "writer", "reader"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                roleFilter === r ? "bg-accent text-white" : "bg-surface border border-border/50 text-text-muted hover:bg-surface-hover"
              }`}
            >
              {r === "الكل" ? "الكل" : roleLabels[r] || r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-border/30">
          <UsersIcon size={48} className="mx-auto text-text-muted mb-4 opacity-30" />
          <p className="text-text-muted">لا يوجد مستخدمون مطابقون</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="bg-surface rounded-2xl border border-border/50 p-4 flex items-center gap-4 card-hover">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center text-accent text-sm font-bold shrink-0 overflow-hidden">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (u.display_name?.[0] || u.username?.[0] || "؟")
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-bold text-sm">{u.display_name || u.username}</span>
                  {u.display_name && u.username && (
                    <span className="text-xs text-text-muted">@{u.username}</span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColors[u.role] || "bg-border/50 text-text-muted"}`}>
                    {u.role === "admin" && <ShieldIcon size={10} className="inline ml-0.5" />}
                    {u.role === "writer" && <PenIcon size={10} className="inline ml-0.5" />}
                    {u.role === "reader" && <UserIcon size={10} className="inline ml-0.5" />}
                    {roleLabels[u.role] || u.role}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  {u.article_count ? `${u.article_count} مقال` : "لا يوجد منشورات"}
                  {" · "}منذ {new Date(u.created_at).toLocaleDateString("ar-SA")}
                </p>
              </div>
              <div className="shrink-0">
                <select
                  value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                  disabled={changingRole === u.id}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 cursor-pointer"
                >
                  <option value="reader">قارئ</option>
                  <option value="writer">كاتب</option>
                  <option value="admin">مشرف</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
