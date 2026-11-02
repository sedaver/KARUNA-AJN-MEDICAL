import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { operationContext, pageNumber } from "@/services/operations";
import { Card, PageHeader, Table } from "@/components/ui";
import { CampForm } from "@/features/operations/forms";
import { Pagination } from "@/features/operations/navigation";
export default async function CampDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  const { id } = await params; if (!z.uuid().safeParse(id).success) notFound(); const page = pageNumber((await searchParams).page);
  const { staff, client } = await operationContext("camps.read"); const { data: camp, error } = await client.from("camps").select("*").eq("trust_id", staff.trustId).eq("id",id).maybeSingle();
  if (error) throw new Error("Unable to load camp."); if (!camp) notFound();
  let roster = null;
  if (staff.permissions.includes("patients.read")) { const result = await client.from("visits").select("*", { count: "exact" }).eq("trust_id",staff.trustId).eq("camp_id",id).order("visited_at", { ascending:false }).order("id").range((page-1)*25,page*25-1); if (result.error) throw new Error("Unable to load visits."); roster=result; }
  const ids = [...new Set(roster?.data?.map((v) => v.patient_id) ?? [])]; const patients = ids.length ? await client.from("patients").select("id,full_name,patient_number").eq("trust_id",staff.trustId).in("id",ids) : null;
  if (patients?.error) throw new Error("Unable to load patient names.");
  return <><PageHeader eyebrow={camp.camp_number} title={camp.name} description={`${camp.camp_date} · ${camp.location} · ${camp.status}`} /><Link href="/dashboard/camps" className="text-link">← All camps</Link>
    {staff.permissions.includes("camps.manage") && <Card><details><summary>Edit camp details</summary><CampForm camp={camp} /></details></Card>}
    <Card><h2>Camp visits</h2><Link href="/dashboard/patients" className="text-link">Find a patient to register →</Link>{roster?.data?.length ? <Table caption="Visits at this camp" headings={["Patient","Registered","Queue status"]} rows={roster.data.map((v) => { const p=patients?.data?.find((p)=>p.id===v.patient_id); return [<Link className="text-link" key={v.id} href={`/dashboard/patients/${v.patient_id}`}>{p?.patient_number} · {p?.full_name ?? "Patient"}</Link>,new Date(v.visited_at).toLocaleString("en-IN",{ timeZone:"Asia/Kolkata" }),v.screening_status]; })} /> : <p>No visits have been registered at this camp.</p>}<Pagination page={page} count={roster?.count ?? 0} href={`/dashboard/camps/${id}`} /></Card>
  </>;
}
