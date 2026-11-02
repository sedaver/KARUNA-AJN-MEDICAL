"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Input, Select, Table } from "@/components/ui";
import { searchPatientsAction } from "./actions";
import type { Patient } from "@/types/operations";
type Result = Pick<Patient,"id"|"patient_number"|"full_name"|"mobile"|"village"|"archived_at">;
export function PatientSearch({ initial, count }: { initial: Result[]; count: number }) {
  const [rows,setRows]=useState(initial); const [total,setTotal]=useState(count); const [page,setPage]=useState(1); const [q,setQ]=useState("");
  const [by,setBy]=useState<"full_name"|"mobile"|"patient_number">("full_name"); const [archived,setArchived]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const [submitted,setSubmitted]=useState({q:"",by:"full_name" as typeof by,archived:false});
  async function run(next: number, criteria = submitted) {
    setBusy(true); setError(""); try { const result=await searchPatientsAction({...criteria,page:next});
      if ("error" in result) { setError(result.error ?? "Search failed."); return; } setRows(result.data ?? []); setTotal(result.count); setPage(next); setSubmitted(criteria);
    } catch { setError("Unable to search. Check your workspace access and try again."); } finally { setBusy(false); }
  }
  return <><form className="operation-search" onSubmit={(e)=>{e.preventDefault();void run(1,{q,by,archived});}}><label>Find by<Select value={by} onChange={(e)=>setBy(e.target.value as typeof by)}><option value="full_name">Name</option><option value="mobile">Mobile</option><option value="patient_number">Patient number</option></Select></label><label>Search<Input value={q} onChange={(e)=>setQ(e.target.value)} maxLength={80} placeholder="Leave empty for all patients" /></label><label className="checkbox-label"><input type="checkbox" checked={archived} onChange={(e)=>setArchived(e.target.checked)} /> Archived records</label><Button disabled={busy}>Search</Button></form><p className="muted">Check names and shared mobile numbers before registering someone new.</p>{error && <p className="error-message" role="alert">{error}</p>}
    {rows.length ? <Table caption="Private patient search results" headings={["Patient","Mobile","Village","Status"]} rows={rows.map((p)=>[<Link key={p.id} href={`/dashboard/patients/${p.id}`} className="text-link">{p.patient_number} · {p.full_name}</Link>,p.mobile ?? "Not recorded",p.village ?? "Not recorded",p.archived_at ? "Archived" : "Active"])} /> : <p>No matching patients. Try another search before creating a new record.</p>}
    <nav className="operation-pagination" aria-label="Patient result pages"><span role="status">{total} records · Page {page}</span>{page>1 && <Button className="secondary" disabled={busy} onClick={()=>void run(page-1)}>← Previous</Button>}{page*25<total && <Button className="secondary" disabled={busy} onClick={()=>void run(page+1)}>Next →</Button>}</nav></>;
}
