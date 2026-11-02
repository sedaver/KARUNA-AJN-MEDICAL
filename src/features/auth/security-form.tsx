"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { Button, Input } from "@/components/ui";
export function SecurityForm() {
  const router = useRouter();
  const [factor, setFactor] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("Loading security settings…");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { let alive = true; (async () => {
    const client = browserClient();
    const { data, error } = await client.auth.mfa.listFactors();
    if (!alive) return;
    if (error) { setMessage("Security settings are unavailable. Please sign in again."); return; }
    const verified = data.totp.find((item) => item.status === "verified");
    setFactor(verified?.id ?? ""); setReady(true); setMessage(verified ? "Enter a current code from your authenticator app." : "Add an authenticator app to protect your account.");
  })().catch(() => { if (alive) setMessage("Security settings are unavailable."); }); return () => { alive = false; }; }, []);
  return <div className="form-stack"><p role="status">{message}</p>
    {ready && !factor && <Button disabled={busy} onClick={async () => {
      setBusy(true); try { const client = browserClient(); const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: `Trust authenticator ${Date.now()}` });
        if (error) { setMessage("Could not start enrollment. Contact your administrator if you have unfinished enrollments."); return; }
        setFactor(data.id); setQr(data.totp.qr_code); setSecret(data.totp.secret); setMessage("Scan this QR code, then enter the six-digit code to activate it.");
      } catch { setMessage("Unable to enroll right now."); } finally { setBusy(false); }
    }}>Set up authenticator</Button>}
    {qr && <><div className="mfa-qr" role="img" aria-label="Authenticator enrollment QR code" style={{ backgroundImage: `url("${qr.startsWith("data:") ? qr : `data:image/svg+xml;utf-8,${encodeURIComponent(qr)}`}")` }} /><details><summary>Enter a setup key instead</summary><code style={{ overflowWrap: "anywhere" }}>{secret}</code></details></>}
    {factor && <form className="form-stack" onSubmit={async (event) => {
      event.preventDefault(); const code = String(new FormData(event.currentTarget).get("code") ?? ""); if (!/^\d{6}$/.test(code)) { setMessage("Enter a six-digit code."); return; }
      setBusy(true); try { const client = browserClient(); const { error } = await client.auth.mfa.challengeAndVerify({ factorId: factor, code });
        if (error) { setMessage("That code was not accepted. Try a fresh code."); return; }
        setQr(""); setSecret(""); router.replace("/dashboard"); router.refresh();
      } catch { setMessage("Verification is temporarily unavailable."); } finally { setBusy(false); }
    }}><label htmlFor="code">Authenticator code</label><Input id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6} required /><Button disabled={busy}>{busy ? "Verifying…" : "Verify and continue"}</Button></form>}
  </div>;
}
