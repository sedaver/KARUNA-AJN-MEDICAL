"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/services/auth";
import { serverClient } from "@/lib/supabase/server";
import { staffAccessSchema } from "./access-schemas";

export async function selectTrust(form: FormData) {
  const id = z.uuid().safeParse(form.get("trustId"));
  if (!id.success) redirect("/auth/trust?error=selection");
  const client = await serverClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await client.rpc("staff_contexts");
  if (error || !data?.some((item) => item.trust_id === id.data)) redirect("/auth/trust?error=selection");
  (await cookies()).set("active-trust", id.data, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  redirect("/dashboard");
}
export async function saveStaff(input: unknown): Promise<{ error?: string; success?: string }> {
  const staff = await requireStaff();
  const parsed = staffAccessSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the account ID, name, and role." };
  if (parsed.data.trustId !== staff.trustId || !staff.permissions.includes("staff.manage") || staff.assuranceLevel !== "aal2") return { error: "An administrator with two-step verification must make this change." };
  const { userId, displayName, role, active } = parsed.data;
  const client = await serverClient();
  const { error } = await client.rpc("manage_trust_staff", { p_trust_id: staff.trustId, p_user_id: userId, p_display_name: displayName, p_role_id: role, p_active: active });
  if (error) return { error: error.code === "23514" ? "Keep at least one active trust administrator." : "Unable to save access. Check that this account has been provisioned and try again." };
  revalidatePath("/dashboard/users");
  return { success: "Staff access saved." };
}
