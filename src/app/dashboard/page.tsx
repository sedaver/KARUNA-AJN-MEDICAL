import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/services/auth";
import { serverClient } from "@/lib/supabase/server";
import { Card, PageHeader, StatCard, Table } from "@/components/ui";
export default async function Dashboard() {
  const staff=await requireStaff();
  if (!staff.permissions.includes("camps.read")) return <><PageHeader title="Welcome to your workspace." description="Your role's tools will appear as they become available." eyebrow={staff.trustName} /><Card><p>Account security and workspace selection are available in settings.</p><Link className="button" href="/dashboard/settings">Workspace settings</Link></Card></>;
  if (staff.assuranceLevel!=="aal2") redirect("/auth/security");
  const client=await serverClient();
  const [camps,patients,visits,recent]=await Promise.all([
    client.from("camps").select("id",{count:"exact",head:true}).eq("trust_id",staff.trustId),
    client.from("patients").select("id",{count:"exact",head:true}).eq("trust_id",staff.trustId).is("archived_at",null),
    client.from("visits").select("id",{count:"exact",head:true}).eq("trust_id",staff.trustId),
    client.from("camps").select("id,camp_number,name,camp_date,status").eq("trust_id",staff.trustId).order("camp_date",{ascending:false}).limit(5),
  ]);
  if ([camps,patients,visits,recent].some(r=>r.error)) throw new Error("Unable to load workspace totals. Verify Phase 3 database setup.");
  return <><PageHeader eyebrow={staff.trustName} title="A clearer view of your work." description="Private operational totals for this trust, drawn from its current records." /><div className="three-grid"><StatCard label="Camps" value={String(camps.count??0)} detail="All private camp records" /><StatCard label="Active patients" value={String(patients.count??0)} detail="Distinct registered people; archives excluded" /><StatCard label="Visits" value={String(visits.count??0)} detail="Includes intentional return visits" /></div><Card className="phase-two-add operation-wide"><h2>Recent camp schedule</h2>{recent.data?.length ? <Table caption="Recent private camps" headings={["Camp","Date","Status"]} rows={recent.data.map(c=>[<Link key={c.id} className="text-link" href={`/dashboard/camps/${c.id}`}>{c.camp_number} · {c.name}</Link>,c.camp_date,c.status])} /> : <p>No camps registered yet.</p>}<div className="hero-actions"><Link className="text-link" href="/dashboard/camps">Manage camps →</Link><Link className="text-link" href="/dashboard/patients">Find patients →</Link></div></Card><Card><h2>Privacy is part of care.</h2><p>Records in this workspace are private. Queue completion does not record an examination, diagnosis or treatment. Public impact and gallery publication need separate review.</p></Card></>;
}
