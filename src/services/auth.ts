import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/env";
// Request-scoped deduplication, never a cross-user persistent cache.
export const requireStaff = cache(async () => {
  if (!getSupabaseConfig()) redirect("/login");
  const supabase = await serverClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError) redirect("/login?notice=access");
  if (assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2") redirect("/auth/security");
  const { data: memberships, error: membershipError } = await supabase.rpc("staff_contexts");
  if (membershipError || !memberships?.length) redirect("/login?notice=access");
  const selected = (await cookies()).get("active-trust")?.value;
  const membership = memberships.find((item) => item.trust_id === selected) ?? (memberships.length === 1 ? memberships[0] : null);
  if (!membership) redirect("/auth/trust");
  const { data: permissions, error: permissionError } = await supabase.rpc("staff_permissions", { p_trust_id: membership.trust_id });
  if (permissionError) throw new Error("Unable to verify workspace permissions.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  return {
    userId: user.id,
    trustId: membership.trust_id,
    trustName: membership.trust_name,
    roles: membership.role_ids,
    permissions: permissions?.map((item) => item.permission_id) ?? [],
    assuranceLevel: assurance?.currentLevel,
    displayName: profile?.display_name || "Staff member",
  };
});
