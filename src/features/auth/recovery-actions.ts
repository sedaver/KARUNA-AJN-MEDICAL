"use server";
import { z } from "zod";
import { serverClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/env";
import { newPasswordSchema } from "./access-schemas";
import { siteOrigin } from "@/lib/site-origin";
export async function requestRecovery(email: unknown) {
  const parsed = z.email().max(254).safeParse(email);
  if (!parsed.success) return { error: "Enter a valid email address." };
  if (!getSupabaseConfig()) return { error: "Password recovery is awaiting account setup." };
  const origin = siteOrigin(process.env.SITE_URL);
  if (!origin) return { error: "Account recovery is awaiting its approved website address." };
  try { const client = await serverClient(); await client.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${origin}/auth/callback` }); } catch { /* Same response prevents account enumeration. */ }
  return { message: "If this account can receive recovery emails, follow its recovery link in this browser. If the email includes a code, you can enter it below. Check your inbox and spam folder." };
}
export async function verifyRecovery(input: unknown) {
  const parsed = z.object({ email: z.email().max(254), token: z.string().regex(/^\d{6,10}$/) }).safeParse(input);
  if (!parsed.success || !getSupabaseConfig()) return { error: "Check your email and recovery code." };
  try { const client = await serverClient(); const { error } = await client.auth.verifyOtp({ ...parsed.data, type: "recovery" });
    if (error) return { error: "This recovery code is invalid or expired. Request a new code." };
    return { success: true };
  } catch { return { error: "Recovery is temporarily unavailable." }; }
}
export async function changePassword(input: unknown) {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: "Use a matching password of 12–128 characters." };
  if (!getSupabaseConfig()) return { error: "Staff access is awaiting setup." };
  try {
    const client = await serverClient(); const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return { error: "Verify your recovery code or sign in first." };
    const assurance = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error) return { error: "Unable to verify account security." };
    if (assurance.data.nextLevel === "aal2" && assurance.data.currentLevel !== "aal2") return { error: "Verify your authenticator at /auth/security before changing your password." };
    const updated = await client.auth.updateUser({ password: parsed.data.password });
    if (updated.error) return { error: "Password could not be changed. Check the password policy or request a new recovery code." };
    await client.auth.signOut({ scope: "global" });
    return { success: true };
  } catch { return { error: "Password update is temporarily unavailable." }; }
}

