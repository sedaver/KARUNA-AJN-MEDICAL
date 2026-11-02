import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/env";
import { selectTrust } from "@/features/auth/staff-actions";
export const dynamic = "force-dynamic";
export default async function TrustSelection() {
  if (!getSupabaseConfig()) redirect("/login");
  const client = await serverClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await client.rpc("staff_contexts");
  if (error || !data?.length) redirect("/login?notice=access");
  return <main className="access-page"><section className="card"><p className="eyebrow">STAFF WORKSPACE</p><h1>Choose your trust.</h1><p>Work within the right team and records.</p><form action={selectTrust} className="form-stack"><label htmlFor="trustId">Workspace</label><select className="input" id="trustId" name="trustId" required>{data.map((item) => <option value={item.trust_id} key={item.trust_id}>{item.trust_name}</option>)}</select><button className="button">Open workspace →</button></form></section></main>;
}
