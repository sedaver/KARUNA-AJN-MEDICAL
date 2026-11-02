import { requireStaff } from "@/services/auth";
import { PageHeader, Card } from "@/components/ui";
import { PatientForm } from "@/features/operations/forms";
import { AccessNotice } from "@/features/operations/navigation";
export default async function NewPatient() { const staff=await requireStaff(); if (!staff.permissions.includes("patients.write")) return <AccessNotice />; return <><PageHeader title="Register a patient" description="Create one permanent patient record. Add a separate visit for every camp attended." /><p className="notice">Search existing records first. A patient number identifies a person across all their visits.</p><Card><PatientForm /></Card></>; }
