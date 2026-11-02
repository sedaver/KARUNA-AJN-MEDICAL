import { LoginForm } from "@/features/auth/login-form";
import { getSupabaseConfig } from "@/lib/env";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const configured = !!getSupabaseConfig();
  const { notice } = await searchParams;
  return (
    <section className="login-layout container">
      <div>
        <p className="eyebrow">FOR THE PEOPLE BEHIND THE CARE</p>
        <h1>
          Welcome
          <br />
          <em>back.</em>
        </h1>
        <p className="hero-description">
          Your workspace for a more connected
          <br />
          community eye-care journey.
        </p>
        <p className="muted">Authorised trust staff only.</p>
      </div>
      <div className="card login-card">
        <span className="badge">Secure staff portal</span>
        <h2>Sign in to your workspace</h2>
        <p className="muted">Use the account provided by your administrator.</p>
        {!configured && (
          <p className="notice" role="status">
            Staff access is awaiting setup. Your administrator needs to connect
            the trust’s Supabase project.
          </p>
        )}
        {notice === "access" && (
          <p className="notice" role="alert">
            This account does not have active staff access. Contact your
            administrator.
          </p>
        )}
        <LoginForm configured={configured} />
      </div>
    </section>
  );
}
