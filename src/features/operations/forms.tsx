"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Select, Textarea } from "@/components/ui";
import type { Camp, Patient, Visit } from "@/types/operations";
import { saveCampAction, savePatientAction, recordConsentAction, registerVisitAction, archivePatientAction, visitStatusAction, type OperationResult } from "./actions";
function ActionForm({ submit, children, label, destination, reset = false }: { submit: (form: FormData) => Promise<OperationResult>; children: ReactNode; label: string; destination?: string; reset?: boolean }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [result, setResult] = useState<OperationResult>({});
  return <form className="form-stack" onSubmit={async (event) => {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setResult({});
    try { const saved = await submit(new FormData(form)); setResult(saved); if (!saved.error) { if (reset) form.reset(); if (destination && saved.id) router.push(`${destination}/${saved.id}`); router.refresh(); } }
    catch { setResult({ error: "Unable to save right now. Check your access and try again." }); } finally { setBusy(false); }
  }}><fieldset disabled={busy} className="operation-fields">{children}</fieldset>{result.error && <p role="alert" className="error-message">{result.error}</p>}{result.message && <p role="status">{result.message}</p>}<Button disabled={busy}>{busy ? "Saving…" : label}</Button></form>;
}
const value = (form: FormData, key: string) => String(form.get(key) ?? "");
export function CampForm({ camp }: { camp?: Camp }) {
  return <ActionForm label="Save camp" destination="/dashboard/camps" submit={(form) => saveCampAction({ id: camp?.id ?? null, expectedVersion: camp?.updated_at ?? null, name: value(form,"name"), campType: value(form,"campType"), campDate: value(form,"campDate"), location: value(form,"location"), district: value(form,"district"), status: value(form,"status"), description: value(form,"description") })}>
    <div className="operation-form-grid"><label>Camp name<Input name="name" defaultValue={camp?.name} required maxLength={200} /></label><label>Camp type<Select name="campType" defaultValue={camp?.camp_type ?? "community"}><option value="community">Community screening</option><option value="school">School screening</option><option value="workplace">Workplace screening</option><option value="other">Other</option></Select></label>
    <label>Date<Input type="date" name="campDate" defaultValue={camp?.camp_date} required /></label><label>Status<Select name="status" defaultValue={camp?.status ?? "planned"}>{["planned","ongoing","completed","cancelled"].map((s) => <option key={s}>{s}</option>)}</Select></label>
    <label>Location<Input name="location" defaultValue={camp?.location} required maxLength={200} /></label><label>District<Input name="district" defaultValue={camp?.district ?? ""} required maxLength={200} /></label></div><label>Description<Textarea name="description" defaultValue={camp?.description ?? ""} maxLength={2000} /></label>
    <p className="muted">Camp information here is private. Completing a camp does not publish it on the public website.</p>
  </ActionForm>;
}
export function PatientForm({ patient }: { patient?: Patient }) {
  return <ActionForm label={patient ? "Save patient details" : "Register patient"} destination="/dashboard/patients" submit={(form) => savePatientAction({ id: patient?.id ?? null, expectedVersion: patient?.updated_at ?? null, fullName: value(form,"fullName"), dateOfBirth: value(form,"dateOfBirth"), estimatedAge: value(form,"estimatedAge"), ageRecordedOn: value(form,"ageRecordedOn"), gender: value(form,"gender"), mobile: value(form,"mobile"), village: value(form,"village"), district: value(form,"district"), address: value(form,"address"), localBody: value(form,"localBody"), duplicateAcknowledged: form.get("duplicateAcknowledged") === "on" })}>
    <div className="operation-form-grid"><label>Full name<Input name="fullName" defaultValue={patient?.full_name} required maxLength={200} /></label><label>Mobile number (optional)<Input name="mobile" type="tel" defaultValue={patient?.mobile ?? ""} maxLength={20} /></label>
    <label>Date of birth (if known)<Input name="dateOfBirth" type="date" defaultValue={patient?.date_of_birth ?? ""} /></label><label>Estimated age (if birth date unknown)<Input name="estimatedAge" type="number" min={0} max={130} defaultValue={patient?.estimated_age ?? ""} /></label>
    <label>Date estimated age was recorded<Input name="ageRecordedOn" type="date" defaultValue={patient?.age_recorded_on ?? ""} /></label><label>Gender (optional)<Select name="gender" defaultValue={patient?.gender ?? ""}><option value="">Not recorded</option>{["female","male","other","prefer_not_to_say"].map((s) => <option key={s}>{s}</option>)}</Select></label>
    <label>Village<Input name="village" defaultValue={patient?.village ?? ""} maxLength={500} /></label><label>District<Input name="district" defaultValue={patient?.district ?? ""} maxLength={500} /></label><label>Local body<Input name="localBody" defaultValue={patient?.local_body ?? ""} maxLength={500} /></label><label>Address<Input name="address" defaultValue={patient?.address ?? ""} maxLength={500} /></label></div>
    <p className="muted">Use a birth date or an estimated age with its recording date. Never enter government ID numbers. Family members may share a phone number.</p>
    <label className="checkbox-label"><input type="checkbox" name="duplicateAcknowledged" /> I reviewed possible matches and confirm this is a distinct person.</label><Link className="text-link" href="/dashboard/patients">Search existing patients →</Link>
  </ActionForm>;
}
export function ConsentForm({ patientId }: { patientId: string }) {
  return <ActionForm label="Record consent decision" reset submit={(form) => recordConsentAction({ patientId, purpose: value(form,"purpose"), status: value(form,"status"), method: value(form,"method"), noticeVersion: value(form,"noticeVersion"), guardianName: value(form,"guardianName"), guardianRelationship: value(form,"guardianRelationship") })}>
    <div className="operation-form-grid"><label>Purpose<Select name="purpose"><option value="screening">Eye screening</option><option value="follow_up_contact">Follow-up contact</option><option value="media_publication">Media publication</option></Select></label><label>Decision<Select name="status"><option value="declined">Declined</option><option value="granted">Granted</option><option value="withdrawn">Withdrawn</option></Select></label><label>How was consent recorded?<Select name="method"><option value="written">Written</option><option value="verbal">Verbal</option><option value="digital">Digital</option><option value="guardian">Guardian</option></Select></label><label>Notice version explained<Input name="noticeVersion" required maxLength={200} placeholder="Approved trust notice version" /></label><label>Guardian name (if applicable)<Input name="guardianName" maxLength={200} /></label><label>Guardian relationship<Input name="guardianRelationship" maxLength={200} /></label></div>
    <label className="checkbox-label"><input type="checkbox" required /> I explained the applicable notice and accurately recorded the person’s or guardian’s decision.</label><p className="muted">For children, record guardian consent. Each decision is added to history; earlier decisions remain available. Media consent alone does not publish any photo.</p>
  </ActionForm>;
}
export function VisitForm({ patientId, camps }: { patientId: string; camps: Pick<Camp,"id"|"camp_number"|"name"|"camp_date">[] }) {
  if (!camps.length) return <p>No camps are available for registration. Create an open camp first.</p>;
  return <ActionForm label="Register visit" reset submit={(form) => registerVisitAction({ patientId, campId: value(form,"campId"), repeatAcknowledged: form.get("repeat") === "on" })}><label>Camp<Select name="campId" required><option value="">Select camp</option>{camps.map((c) => <option value={c.id} key={c.id}>{c.camp_number} · {c.name} · {c.camp_date}</option>)}</Select></label><p className="muted">A current screening consent is required. Future, completed and cancelled camps cannot accept visits.</p><label className="checkbox-label"><input type="checkbox" name="repeat" /> This is an intentional return assessment at the same camp.</label></ActionForm>;
}
export function ArchiveForm({ patient }: { patient: Patient }) {
  return <ActionForm label={patient.archived_at ? "Restore patient" : "Archive patient"} submit={() => archivePatientAction({ patientId: patient.id, version: patient.updated_at, archive: !patient.archived_at })}><p>{patient.archived_at ? "Restore this patient to resume authorised registration." : "Archive this record when it is no longer in active use. Consent and visit history will be retained."}</p><label className="checkbox-label"><input type="checkbox" required /> I confirm this change.</label></ActionForm>;
}
export function VisitStatusForm({ visit }: { visit: Visit }) {
  return <ActionForm label="Update status" submit={(form) => visitStatusAction({ visitId: visit.id, version: visit.updated_at, status: value(form,"status") })}><label>Screening queue status<Select name="status" defaultValue={visit.screening_status}>{["waiting","in_progress","completed"].map((s) => <option key={s}>{s}</option>)}</Select></label></ActionForm>;
}
