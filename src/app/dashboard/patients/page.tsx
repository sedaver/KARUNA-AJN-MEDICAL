import Link from "next/link";
import { requireStaff } from "@/services/auth";
import { listPatients } from "@/services/operations";
import { PageHeader, Card } from "@/components/ui";
import { AccessNotice } from "@/features/operations/navigation";
import { PatientSearch } from "@/features/operations/patient-search";
export default async function PatientsPage() {
  const staff=await requireStaff(); if (!staff.permissions.includes("patients.read")) return <AccessNotice />;
  const {data,count}=await listPatients("","full_name",false,1);
  return <><PageHeader eyebrow={staff.trustName} title="One person. A connected history." description="Find existing patients, review consent, and register each camp visit." />{staff.permissions.includes("patients.write") && <Link className="button" href="/dashboard/patients/new">Register patient +</Link>}<Card className="phase-two-add operation-wide"><PatientSearch initial={data ?? []} count={count ?? 0} /></Card></>;
}
