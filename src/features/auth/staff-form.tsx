"use client";
import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { saveStaff } from "./staff-actions";
export function StaffForm({ trustId, member }: { trustId: string; member?: { user_id: string; display_name: string; active: boolean; role_ids: string[] } }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return <form className="form-stack" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await saveStaff({ trustId, userId: member?.user_id ?? form.get("userId"), displayName: member?.display_name ?? form.get("displayName"), role: form.get("role"), active: form.get("active") === "on" });
      setMessage(result.error ?? result.success ?? "Saved.");
    } catch { setMessage("Unable to save. Please try again."); } finally { setBusy(false); }
  }}>
    {member ? <><h3>{member.display_name}</h3><code style={{ overflowWrap: "anywhere" }}>{member.user_id}</code></> : <>
      <label>Provisioned account ID<Input name="userId" required placeholder="Auth user UUID" /></label>
      <label>Staff display name<Input name="displayName" required maxLength={120} /></label>
    </>}
    <label>Workspace role<Select name="role" defaultValue={member?.role_ids[0] ?? "data_entry"}>
      <option value="trust_admin">Trust Administrator</option><option value="clinician">Doctor / Optometrist</option><option value="camp_manager">Camp Manager</option><option value="data_entry">Data Entry Staff</option><option value="analyst">Analyst</option>
    </Select></label>
    <label><input name="active" type="checkbox" defaultChecked={member?.active ?? true} /> Active staff access</label>
    {message && <p role="status">{message}</p>}
    <Button disabled={busy}>{busy ? "Saving…" : "Save access"}</Button>
  </form>;
}
