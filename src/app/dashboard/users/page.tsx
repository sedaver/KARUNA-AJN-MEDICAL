import Link from "next/link";
import { requireStaff } from "@/services/auth";
import { serverClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { StaffForm } from "@/features/auth/staff-form";
export default async function UsersPage() {
  const staff = await requireStaff();
  if (!staff.permissions.includes("staff.manage")) return <Card><h1>Staff access</h1><p>Your workspace administrator manages team access.</p></Card>;
  if (staff.assuranceLevel !== "aal2") return <Card><h1>Verify your account first</h1><p>Staff changes require an authenticator app.</p><Link className="button" href="/auth/security">Set up two-step verification</Link></Card>;
  const client = await serverClient();
  const { data, error } = await client.rpc("list_trust_staff", { p_trust_id: staff.trustId });
  if (error) throw new Error("Unable to load staff access.");
  return <><PageHeader title="Your people. The right access." eyebrow={staff.trustName} description="Grant, change, or deactivate access within this workspace." />
    <p className="notice">Create a confirmed account in Supabase first, then enter its Auth user ID here. Existing names are preserved across workspaces. Every access change is audited.</p>
    <div className="three-grid">{data?.map((member) => <Card key={member.user_id}><StaffForm trustId={staff.trustId} member={member} /></Card>)}</div>
    <Card className="phase-two-add"><h2>Add an existing account</h2><StaffForm trustId={staff.trustId} /></Card>
  </>;
}
