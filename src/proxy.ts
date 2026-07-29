import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT = new Map<string, { count: number; timestamp: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of RATE_LIMIT) {
    if (now - val.timestamp > 600000) RATE_LIMIT.delete(key);
  }
}, 300000);

function getRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT.get(key);

  if (!entry || now - entry.timestamp > windowMs) {
    RATE_LIMIT.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

const API_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/auth/signup": { limit: 5, windowMs: 60000 },
  "/api/auth/auto-confirm": { limit: 10, windowMs: 60000 },
  "/api/contact": { limit: 5, windowMs: 60000 },
  "/api/newsletter": { limit: 10, windowMs: 60000 },
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const limitConfig = API_LIMITS[pathname] || { limit: 30, windowMs: 60000 };
    const key = `${pathname}:${ip}`;

    if (!getRateLimit(key, limitConfig.limit, limitConfig.windowMs)) {
      return NextResponse.json(
        { error: "تم تجاوز الحد المسموح من الطلبات. يُرجى المحاولة لاحقاً." },
        { status: 429 }
      );
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.svg|file.svg|globe.svg|logo.svg|logo-dark.svg|window.svg).*)"],
};
