"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    const channel = supabase.channel(channelName);
    subscriptions.forEach(({ table, event, filter }) => {
      const opts = { event, schema: "public" as const, table, ...(filter ? { filter } : {}) };
      channel.on("postgres_changes", opts as any, (p: any) => cb.current(p));
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
}
