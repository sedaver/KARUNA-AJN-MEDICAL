import "server-only";
import { cache } from "react";
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
  const { data: memberships, error: membershipError } = await supabase
    .from("trust_memberships")
    .select("trust_id, active")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(1);
  if (membershipError || !memberships?.length) redirect("/login?notice=access");
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  return {
    userId: user.id,
    trustId: memberships[0].trust_id,
    displayName: profile?.display_name || "Staff member",
  };
});
