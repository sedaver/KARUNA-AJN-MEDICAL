import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/env";
import { siteOrigin } from "@/lib/site-origin";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const origin = siteOrigin(process.env.SITE_URL);
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
  if (!origin || !getSupabaseConfig()) return new NextResponse("Account recovery is awaiting configuration.", { status: 503, headers });
  const invalid = () => NextResponse.redirect(new URL("/auth/password?notice=expired", origin), { headers });
  const codes = request.nextUrl.searchParams.getAll("code");
  if (codes.length !== 1 || !/^[a-zA-Z0-9_-]{10,2048}$/.test(codes[0])) return invalid();
  try {
    const client = await serverClient();
    const { error } = await client.auth.exchangeCodeForSession(codes[0]);
    if (error) return invalid();
    return NextResponse.redirect(new URL("/auth/password", origin), { headers });
  } catch { return invalid(); }
}

