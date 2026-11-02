import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { operationContext, pageNumber } from "@/services/operations";
import { Card, PageHeader, Table } from "@/components/ui";
import { PatientForm, ConsentForm, VisitForm, ArchiveForm, VisitStatusForm } from "@/features/operations/forms";
import { Pagination } from "@/features/operations/navigation";
export default async function PatientDetail({ params, searchParams }: { params: Promise<{id:string}>; searchParams: Promise<{ visits?:string; consents?:string; campSearch?:string }> }) {
  const {id}=await params; if (!z.uuid().safeParse(id).success) notFound();
  const search=await searchParams; const vp=pageNumber(search.visits); const cp=pageNumber(search.consents);
  const {staff,client}=await operationContext("patients.read");
  const record=await client.from("patients").select("*").eq("trust_id",staff.trustId).eq("id",id).maybeSingle();
  if(record.error) throw new Error("Unable to load patient."); const patient=record.data; if(!patient) notFound();
  const [consents,visits,latest]=await Promise.all([
    client.from("patient_consents").select("*",{count:"exact"}).eq("trust_id",staff.trustId).eq("patient_id",id).order("event_number",{ascending:false}).range((cp-1)*25,cp*25-1),
    client.from("visits").select("*",{count:"exact"}).eq("trust_id",staff.trustId).eq("patient_id",id).order("visited_at",{ascending:false}).order("id").range((vp-1)*25,vp*25-1),
    Promise.all(["screening","follow_up_contact","media_publication"].map((purpose)=>client.from("patient_consents").select("purpose,status,method").eq("trust_id",staff.trustId).eq("patient_id",id).eq("purpose",purpose).order("event_number",{ascending:false}).limit(1))),
  ]);
  if(consents.error||visits.error||latest.some((r)=>r.error)) throw new Error("Unable to load patient history.");
  const campIds=[...new Set(visits.data?.map(v=>v.camp_id)??[])];
  const historyCamps=campIds.length ? await client.from("camps").select("id,name,camp_number").eq("trust_id",staff.trustId).in("id",campIds) : null;
  if(historyCamps?.error) throw new Error("Unable to load camp history.");
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  let campQuery=client.from("camps").select("id,name,camp_number,camp_date").eq("trust_id",staff.trustId).in("status",["planned","ongoing"]).lte("camp_date",today);
  if(search.campSearch) campQuery=campQuery.ilike("name",`%${search.campSearch.slice(0,80).replace(/[%_\\]/g,"")}%`);
  const openCamps=staff.permissions.includes("visits.manage") ? await campQuery.order("camp_date",{ascending:false}).limit(100) : null;
  if(openCamps?.error) throw new Error("Unable to load registration camps.");
  const base=`/dashboard/patients/${id}`;
  return <><PageHeader eyebrow={`${patient.patient_number} · ${patient.archived_at ? "ARCHIVED" : "ACTIVE"}`} title={patient.full_name} description="Private patient record · Consent and visits remain linked to this person." /><Link className="text-link" href="/dashboard/patients">← Patient search</Link>
    <div className="operation-summary"><Card><h2>Patient details</h2><dl><dt>Mobile</dt><dd>{patient.mobile??"Not recorded"}</dd><dt>Birth date / estimated age</dt><dd>{patient.date_of_birth ?? (patient.estimated_age !== null ? `${patient.estimated_age} years, recorded ${patient.age_recorded_on}` : "Not recorded")}</dd><dt>Village / district</dt><dd>{[patient.village,patient.district].filter(Boolean).join(", ")||"Not recorded"}</dd></dl></Card><Card><h2>Latest consent decisions</h2>{["screening","follow_up_contact","media_publication"].map((purpose,i)=><p key={purpose}><strong>{purpose.replaceAll("_"," ")}</strong>: {latest[i].data?.[0]?.status ?? "Not recorded"}</p>)}<p className="muted">Consent can be withdrawn at any time. Earlier decisions are retained.</p></Card></div>
    {!patient.archived_at && staff.permissions.includes("patients.write") && <Card><details><summary>Edit patient details</summary><PatientForm patient={patient} /></details></Card>}
    {!patient.archived_at && staff.permissions.includes("consents.manage") && <Card><h2>Record a consent decision</h2><ConsentForm patientId={id} /></Card>}
    {!patient.archived_at && staff.permissions.includes("visits.manage") && <Card><h2>Register a camp visit</h2><form className="operation-search"><label>Find an open camp by name<input className="input" name="campSearch" defaultValue={search.campSearch} maxLength={80} /></label><button className="button">Find camp</button></form><p className="muted">Showing up to 100 matching open camps.</p><VisitForm patientId={id} camps={openCamps?.data ?? []} /></Card>}
    <Card><h2>Visit history</h2>{visits.data?.length ? visits.data.map((v)=>{const camp=historyCamps?.data?.find(c=>c.id===v.camp_id);return <article className="operation-visit" key={v.id}><h3><Link href={`/dashboard/camps/${v.camp_id}`}>{camp?.camp_number} · {camp?.name ?? "Camp"}</Link></h3><p>{new Date(v.visited_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})} · {v.screening_status}</p>{!patient.archived_at && staff.permissions.includes("visits.manage") && <VisitStatusForm visit={v} />}</article>;}) : <p>No visits yet. Registration will add a new visit without duplicating this patient.</p>}
    <nav className="operation-pagination" aria-label="Visit pages"><span>Page {vp} · {visits.count ?? 0} visits</span>{vp>1&&<Link href={`${base}?visits=${vp-1}`}>← Previous</Link>}{vp*25<(visits.count??0)&&<Link href={`${base}?visits=${vp+1}`}>Next →</Link>}</nav></Card>
    <Card><h2>Consent history</h2>{consents.data?.length ? <Table caption="Append-only consent decisions" headings={["Purpose","Decision","Notice","Method","Recorded","Guardian"]} rows={consents.data.map(c=>[c.purpose,c.status,c.notice_version,c.method,new Date(c.recorded_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"}),c.guardian_name ? `${c.guardian_name} (${c.guardian_relationship})` : "—"])} /> : <p>No decisions recorded.</p>}<Pagination page={cp} count={consents.count??0} href={base} parameter="consents" /></Card>
    {staff.permissions.includes("patients.write")&&<Card><h2>{patient.archived_at?"Restore record":"Archive record"}</h2><ArchiveForm patient={patient} /></Card>}
  </>;
}
