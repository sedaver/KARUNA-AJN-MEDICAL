"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { requestRecovery, verifyRecovery, changePassword } from "./recovery-actions";
export function RecoveryForm({ signedIn }: { signedIn: boolean }) {
  const [step, setStep] = useState(signedIn ? "password" : "email");
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  if (step === "done") return <><p role="status">Password updated. Please sign in again. Other sessions have been asked to sign out.</p><Link className="button" href="/login">Sign in</Link></>;
  return <form className="form-stack" onSubmit={async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setMessage("");
    try {
      if (step === "email") { const result = await requestRecovery(email); setMessage(result.error ?? result.message ?? ""); if (!result.error) setStep("code"); }
      else if (step === "code") { const result = await verifyRecovery({ email, token: form.get("token") }); if (result.error) setMessage(result.error); else setStep("password"); }
      else { const result = await changePassword({ password: form.get("password"), confirmPassword: form.get("confirmPassword") }); if (result.error) setMessage(result.error); else setStep("done"); }
    } catch { setMessage("Unable to continue. Try again."); } finally { setBusy(false); }
  }}>
    {step !== "password" && <label>Work email<Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} readOnly={step === "code"} /></label>}
    {step === "code" && <><label>Recovery code<Input name="token" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6,10}" required /></label><button type="button" className="text-link" onClick={() => { setStep("email"); setMessage(""); }}>Request another code</button></>}
    {step === "password" && <><label>New password<Input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><label>Confirm password<Input name="confirmPassword" type="password" autoComplete="new-password" required /></label><p className="muted">Use at least 12 characters. Your organisation may require a stronger password.</p></>}
    {message && <p role="status">{message}</p>}
    <Button disabled={busy}>{busy ? "Please wait…" : step === "email" ? "Send recovery email" : step === "code" ? "Verify code" : "Save new password"}</Button>
    <Link className="text-link" href="/auth/security">Verify an authenticator →</Link>
  </form>;
}

