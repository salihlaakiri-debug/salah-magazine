"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

interface SubConfig {
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE";
  filter?: string;
}

export function useAdminRealtime(
  channelName: string,
  subscriptions: SubConfig[],
  onEvent: (payload: any) => void
) {
  const cb = useRef(onEvent);
  cb.current = onEvent;
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading || !user || !isAdmin) return;

    const channel = supabase.channel(channelName);
    subscriptions.forEach(({ table, event, filter }) => {
      const opts = { event, schema: "public" as const, table, ...(filter ? { filter } : {}) };
      channel.on("postgres_changes", opts as any, (p: any) => cb.current(p));
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, isAdmin, loading]);
}
