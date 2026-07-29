import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/?error=invalid-token", req.url));
  }

  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.redirect(new URL("/?error=server-error", req.url));
  const { data, error } = await supabase.rpc("confirm_subscriber", { token });

  if (error || !data) {
    return NextResponse.redirect(new URL("/?error=confirm-failed", req.url));
  }

  return NextResponse.redirect(new URL("/newsletter/confirmed", req.url));
}
