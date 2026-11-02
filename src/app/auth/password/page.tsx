import Link from "next/link";
import { getSupabaseConfig } from "@/lib/env";
import { serverClient } from "@/lib/supabase/server";
import { RecoveryForm } from "@/features/auth/recovery-form";
export const dynamic = "force-dynamic";
export default async function PasswordPage() {
  let signedIn = false;
  if (getSupabaseConfig()) { const client = await serverClient(); const { data: { user } } = await client.auth.getUser(); signedIn = !!user; }
  return <main className="access-page"><section className="card"><p className="eyebrow">STAFF ACCOUNT</p><h1>{signedIn ? "Update your password." : "Find your way back."}</h1>{getSupabaseConfig() ? <RecoveryForm signedIn={signedIn} /> : <p className="notice">Account recovery will be available once staff access is configured.</p>}<Link className="text-link" href="/login">Back to sign in →</Link></section></main>;
}
