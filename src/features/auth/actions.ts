"use server";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/env";
import { loginSchema } from "@/schemas";
export async function login(
  input: unknown,
): Promise<{ error: string } | { success: true }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success)
    return { error: "Check your email address and password." };
  if (!getSupabaseConfig())
    return {
      error:
        "Staff access is awaiting setup. Please contact the trust administrator.",
    };
  try {
    const supabase = await serverClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user)
      return {
        error:
          "Unable to sign in. Check your details or contact your administrator.",
      };
    const { data: memberships, error: accessError } = await supabase
      .from("trust_memberships")
      .select("trust_id")
      .eq("user_id", data.user.id)
      .eq("active", true)
      .limit(1);
    if (accessError || !memberships?.length) {
      await supabase.auth.signOut();
      return {
        error:
          "Staff access is not available for this account. Contact your administrator.",
      };
    }
    return { success: true };
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again." };
  }
}
export async function logout() {
  if (getSupabaseConfig()) {
    const supabase = await serverClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error)
      throw new Error("Sign-out could not be completed. Please try again.");
  }
  redirect("/login");
}
