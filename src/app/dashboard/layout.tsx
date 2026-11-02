import Link from "next/link";
import { requireStaff } from "@/services/auth";
import { Brand } from "@/components/brand";
import { Navigation } from "@/components/navigation";
import { logout } from "@/features/auth/actions";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaff();
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Brand />
        <p className="eyebrow sidebar-label">TRUST WORKSPACE</p>
        <Navigation dashboard />
        <div className="sidebar-bottom">
          <span className="badge">Phase 3 · Camp operations</span>
          <Link href="/">View public website ↗</Link>
        </div>
      </aside>
      <div className="dashboard-body">
        <header className="dashboard-topbar">
          <nav aria-label="Breadcrumb">
            <Link href="/dashboard">Workspace</Link>
            <span aria-hidden> / </span>
            <Link href="/auth/trust">{staff.trustName}</Link>
          </nav>
          <details className="user-menu">
            <summary>
              <span className="avatar" aria-hidden>
                {staff.displayName.charAt(0).toUpperCase()}
              </span>
              {staff.displayName}
            </summary>
            <div>
              <p>Authorised staff account</p>
              <form action={logout}>
                <button className="button secondary" type="submit">
                  Sign out
                </button>
              </form>
            </div>
          </details>
        </header>
        <main id="main-content" className="dashboard-content">
          {children}
        </main>
        <footer className="dashboard-footer">
          Private staff workspace · Protecting every person’s information
        </footer>
      </div>
    </div>
  );
}
