import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin, hash } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    return NextResponse.redirect(`${origin}${next}?code=${code}`);
  }

  if (hash) {
    return NextResponse.redirect(`${origin}${next}${hash}`);
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
