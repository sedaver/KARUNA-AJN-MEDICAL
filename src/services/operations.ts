import "server-only";
import { redirect } from "next/navigation";
import { requireStaff } from "./auth";
import { serverClient } from "@/lib/supabase/server";
export async function operationContext(permission: string) {
  const staff = await requireStaff();
  if (staff.assuranceLevel !== "aal2") redirect("/auth/security");
  if (!staff.permissions.includes(permission)) throw new Error("Your role does not have permission for this operation.");
  return { staff, client: await serverClient() };
}
export async function listCamps(page = 1) {
  const { staff, client } = await operationContext("camps.read");
  const result = await client.from("camps").select("*", { count: "exact" }).eq("trust_id", staff.trustId).order("camp_date", { ascending: false }).order("id").range((page - 1) * 25, page * 25 - 1);
  if (result.error) throw new Error("Unable to load camps. Confirm that the Phase 3 database setup is available.");
  return { ...result, staff };
}
export async function listPatients(q: string, by: "full_name" | "mobile" | "patient_number", archived: boolean, page: number) {
  const { staff, client } = await operationContext("patients.read");
  let query = client.from("patients").select("*", { count: "exact" }).eq("trust_id", staff.trustId);
  query = archived ? query.not("archived_at", "is", null) : query.is("archived_at", null);
  const term = q.slice(0, 80).replace(/[%_\\]/g, "");
  if (term) query = query.ilike(by, `%${by === "mobile" ? term.replace(/\D/g, "") : term}%`);
  const result = await query.order("created_at", { ascending: false }).order("id").range((page - 1) * 25, page * 25 - 1);
  if (result.error) throw new Error("Unable to load patients. Confirm that the Phase 3 database setup is available.");
  return { ...result, staff };
}
export function pageNumber(raw?: string) { const value = Number(raw); return Number.isSafeInteger(value) && value > 0 && value <= 10000 ? value : 1; }
