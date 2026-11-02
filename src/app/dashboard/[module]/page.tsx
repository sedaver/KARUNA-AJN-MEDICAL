import { notFound } from "next/navigation";
import { requireStaff } from "@/services/auth";
import { EmptyState, PageHeader } from "@/components/ui";
const modules: Record<string, { title: string; phase: string }> = {
  referrals: { title: "Referrals", phase: "Phase 4" },
  "follow-ups": { title: "Follow-ups", phase: "Phase 4" },
  reports: { title: "Reports", phase: "Phase 5" },
  gallery: { title: "Gallery management", phase: "Phase 5" },
};
export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  await requireStaff();
  const { module } = await params;
  if (!Object.hasOwn(modules, module)) notFound();
  const page = modules[module];
  return (
    <>
      <PageHeader
        eyebrow="TRUST WORKSPACE"
        title={page.title}
        description="A dedicated space for your team’s work."
      />
      <EmptyState
        title={`Planned for ${page.phase}`}
        description={`${page.title} will be implemented in ${page.phase}. This foundation does not yet allow viewing, adding, or changing records.`}
      />
    </>
  );
}
