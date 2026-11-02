"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { operationContext, listPatients } from "@/services/operations";
import { campInput, patientInput, consentInput, visitInput } from "./schemas";
export type OperationResult = { error?: string; message?: string; id?: string };
export async function searchPatientsAction(input: unknown) {
  const parsed = z.object({ q: z.string().trim().max(80), by: z.enum(["full_name","mobile","patient_number"]), archived: z.boolean(), page: z.number().int().min(1).max(10000) }).safeParse(input);
  if (!parsed.success) return { error: "Check the search details." };
  const result = await listPatients(parsed.data.q,parsed.data.by,parsed.data.archived,parsed.data.page);
  return { data: result.data?.map((p) => ({ id:p.id,patient_number:p.patient_number,full_name:p.full_name,mobile:p.mobile,village:p.village,archived_at:p.archived_at })), count:result.count ?? 0 };
}
function failure(code?: string): OperationResult {
  const messages: Record<string, string> = {
    "23505": "A possible duplicate exists. Search existing records first, then acknowledge the warning if this is a different person or a repeat visit.",
    "40001": "This record changed since you opened it. Reload the page before editing again.",
    "42501": "Your role, verification, or workspace does not allow this change.",
    "23514": "Check the record status, consent, and required details. Screening consent is required, including guardian details for a child.",
  };
  return { error: messages[code ?? ""] ?? "Unable to save. Check the details or confirm that the Phase 3 database setup is available." };
}
export async function saveCampAction(input: unknown): Promise<OperationResult> {
  const parsed = campInput.safeParse(input); if (!parsed.success) return { error: "Check the camp name, date, location, district and status." };
  const { staff, client } = await operationContext("camps.manage");
  const { data, error } = await client.rpc("save_camp", { p_trust: staff.trustId, p_input: parsed.data });
  if (error) return failure(error.code);
  revalidatePath("/dashboard/camps"); return { id: data, message: "Camp saved." };
}
export async function savePatientAction(input: unknown): Promise<OperationResult> {
  const parsed = patientInput.safeParse(input); if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the patient details." };
  const { staff, client } = await operationContext("patients.write");
  if (parsed.data.mobile) parsed.data.mobile = parsed.data.mobile.replace(/\D/g, "");
  const { data, error } = await client.rpc("save_patient", { p_trust: staff.trustId, p_input: parsed.data });
  if (error) return failure(error.code);
  revalidatePath("/dashboard/patients"); return { id: data, message: "Patient saved." };
}
export async function recordConsentAction(input: unknown): Promise<OperationResult> {
  const parsed = consentInput.safeParse(input); if (!parsed.success) return { error: "Check consent details, notice version and guardian information where applicable." };
  const { staff, client } = await operationContext("consents.manage");
  const { error } = await client.rpc("record_consent", { p_trust: staff.trustId, p_input: parsed.data });
  if (error) return failure(error.code);
  revalidatePath(`/dashboard/patients/${parsed.data.patientId}`); return { message: "Consent decision recorded in history." };
}
export async function registerVisitAction(input: unknown): Promise<OperationResult> {
  const parsed = visitInput.safeParse(input); if (!parsed.success) return { error: "Select a patient and an available camp." };
  const { staff, client } = await operationContext("visits.manage");
  const { patientId, campId, repeatAcknowledged } = parsed.data;
  const { error } = await client.rpc("register_visit", { p_trust: staff.trustId, p_patient: patientId, p_camp: campId, p_repeat: repeatAcknowledged });
  if (error) return failure(error.code);
  revalidatePath(`/dashboard/patients/${patientId}`); revalidatePath(`/dashboard/camps/${campId}`); return { message: "Visit registered." };
}
export async function archivePatientAction(input: unknown): Promise<OperationResult> {
  const parsed = z.object({ patientId: z.uuid(), version: z.string().min(1), archive: z.boolean() }).safeParse(input);
  if (!parsed.success) return { error: "Reload this patient before continuing." };
  const { staff, client } = await operationContext("patients.write");
  const { error } = await client.rpc("archive_patient", { p_trust: staff.trustId, p_patient: parsed.data.patientId, p_version: parsed.data.version, p_archive: parsed.data.archive });
  if (error) return failure(error.code);
  revalidatePath("/dashboard/patients"); return { message: parsed.data.archive ? "Patient archived. History retained." : "Patient restored." };
}
export async function visitStatusAction(input: unknown): Promise<OperationResult> {
  const parsed = z.object({ visitId: z.uuid(), version: z.string().min(1), status: z.enum(["waiting", "in_progress", "completed"]) }).safeParse(input);
  if (!parsed.success) return { error: "Check the visit status." };
  const { staff, client } = await operationContext("visits.manage");
  const { error } = await client.rpc("update_visit_status", { p_trust: staff.trustId, p_visit: parsed.data.visitId, p_version: parsed.data.version, p_status: parsed.data.status });
  if (error) return failure(error.code);
  revalidatePath("/dashboard/patients"); revalidatePath("/dashboard/camps"); return { message: "Visit status updated. This status is administrative; no examination or diagnosis has been recorded." };
}
