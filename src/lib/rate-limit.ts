import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sb = url && serviceKey ? createClient(url, serviceKey) : null;

const MEMORY_CACHE = new Map<string, { count: number; timestamp: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of MEMORY_CACHE) {
    if (now - val.timestamp > 600000) MEMORY_CACHE.delete(key);
  }
}, 300000);

export async function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  if (sb) {
    try {
      const windowStart = new Date(Date.now() - windowMs).toISOString();
      const { data, error } = await sb.rpc("check_rate_limit", {
        p_identifier: identifier,
        p_limit: limit,
        p_window_start: windowStart,
      });
      if (!error && data) {
        return { allowed: data.allowed, remaining: data.remaining };
      }
    } catch {}
  }

  const now = Date.now();
  const entry = MEMORY_CACHE.get(identifier);

  if (!entry || now - entry.timestamp > windowMs) {
    MEMORY_CACHE.set(identifier, { count: 1, timestamp: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}
