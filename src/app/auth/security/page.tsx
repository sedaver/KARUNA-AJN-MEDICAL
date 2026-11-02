import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@/lib/env";
import { serverClient } from "@/lib/supabase/server";
import { SecurityForm } from "@/features/auth/security-form";
import { logout } from "@/features/auth/actions";
export const dynamic = "force-dynamic";
export default async function SecurityPage() {
  if (!getSupabaseConfig()) redirect("/login");
  const client = await serverClient(); const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  return <main className="access-page"><section className="card"><p className="eyebrow">ACCOUNT SECURITY</p><h1>A second layer of care.</h1><SecurityForm /><Link className="text-link" href="/dashboard">Back to workspace →</Link><form action={logout}><button className="text-link">Sign out</button></form><p className="muted">Lost your authenticator? Contact your administrator for identity-verified recovery.</p></section></main>;
}
