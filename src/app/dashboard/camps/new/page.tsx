import { requireStaff } from "@/services/auth";
import { PageHeader, Card } from "@/components/ui";
import { CampForm } from "@/features/operations/forms";
import { AccessNotice } from "@/features/operations/navigation";
export default async function NewCamp() { const staff = await requireStaff(); if (!staff.permissions.includes("camps.manage")) return <AccessNotice />; return <><PageHeader title="Create a camp" description="Plan the date, venue and team’s outreach." /><Card><CampForm /></Card></>; }
