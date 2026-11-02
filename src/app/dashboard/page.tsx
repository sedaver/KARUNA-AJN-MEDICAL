import Link from "next/link";
import { requireStaff } from "@/services/auth";
import { Badge, Card, PageHeader, StatCard, Table } from "@/components/ui";
import { demoStats, demoCamps } from "@/features/dashboard/demo";
export default async function Dashboard() {
  await requireStaff();
  return (
    <>
      <PageHeader
        eyebrow="YOUR TRUST AT A GLANCE"
        title="A clearer view of your work."
        description="A shared starting point for your team’s community eye-care activities."
      />
      <div className="notice">
        <strong>Demonstration data.</strong> All figures and camps below are
        fictional examples. No live patient data is connected.
      </div>
      <div className="stats-grid">
        {demoStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="dashboard-columns">
        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">OUTREACH</p>
              <h2>Camp overview</h2>
            </div>
            <Badge>Demo</Badge>
          </div>
          <Table
            caption="Illustrative camp schedule"
            headings={["Camp", "Date", "Status"]}
            rows={demoCamps.map((camp) => [
              <span key={camp.name}>
                <strong>{camp.name}</strong>
                <span className="table-sub">{camp.location}</span>
              </span>,
              camp.date,
              <Badge key={camp.status}>{camp.status}</Badge>,
            ])}
          />
        </Card>
        <Card className="next-step">
          <p className="eyebrow">BUILT WITH CARE</p>
          <h2>
            A foundation
            <br />
            for what’s next.
          </h2>
          <p>
            Manage staff permissions, choose your trust workspace, and protect
            your account with two-step verification.
          </p>
          <Link href="/dashboard/settings" className="text-link">
            Workspace settings →
          </Link>
          <hr />
          <p className="muted">
            Clinical workflows are not enabled in this phase.
          </p>
        </Card>
      </div>
      <Card className="privacy-callout">
        <span aria-hidden>◎</span>
        <div>
          <h3>Privacy is part of every interaction.</h3>
          <p>
            Patient information stays in authorised workflows. Public impact
            reporting will use reviewed, anonymous summaries.
          </p>
        </div>
      </Card>
    </>
  );
}
