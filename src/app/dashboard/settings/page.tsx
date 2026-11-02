import Link from "next/link";
import { requireStaff } from "@/services/auth";
import { Card, PageHeader } from "@/components/ui";
export default async function SettingsPage() {
  const staff = await requireStaff();
  return <><PageHeader title="Your workspace. Your security." description="Review your access and protect your staff account." eyebrow={staff.trustName} /><div className="three-grid"><Card><h2>Workspace</h2><p>{staff.trustName}</p><Link className="text-link" href="/auth/trust">Switch workspace →</Link></Card><Card><h2>Account security</h2><p>Session verification: {staff.assuranceLevel === "aal2" ? "Two steps verified" : "Password verified"}</p><Link className="text-link" href="/auth/security">Manage authenticator →</Link><Link className="text-link" href="/auth/password">Change password →</Link></Card><Card><h2>Your permissions</h2><p>{staff.roles.join(", ") || "No assigned role"}</p><ul>{staff.permissions.map((p) => <li key={p}>{p}</li>)}</ul><p className="muted">Clinical access is not enabled in Phase 2.</p></Card></div></>;
}
