import Link from "next/link";
import { requireStaff } from "@/services/auth";
import { listCamps, pageNumber } from "@/services/operations";
import { PageHeader, Card, Table, Badge } from "@/components/ui";
import { AccessNotice, Pagination } from "@/features/operations/navigation";
export default async function CampsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const staff = await requireStaff(); if (!staff.permissions.includes("camps.read")) return <AccessNotice />;
  const page = pageNumber((await searchParams).page); const { data, count } = await listCamps(page);
  return <><PageHeader eyebrow={staff.trustName} title="Care starts with a camp." description="Plan community screenings, update locations and track camp progress." />
    {staff.permissions.includes("camps.manage") && <Link href="/dashboard/camps/new" className="button">Create camp +</Link>}
    <Card className="phase-two-add operation-wide">{data?.length ? <Table caption="Private camp schedule" headings={["Camp","Date","Location","Status"]} rows={data.map((c) => [<Link key={c.id} className="text-link" href={`/dashboard/camps/${c.id}`}>{c.camp_number} · {c.name}</Link>,c.camp_date,`${c.location}, ${c.district ?? ""}`,<Badge key={c.status}>{c.status}</Badge>])} /> : <p>No camps found. Start by creating your first camp.</p>}<Pagination page={page} count={count ?? 0} href="/dashboard/camps" /></Card>
  </>;
}
