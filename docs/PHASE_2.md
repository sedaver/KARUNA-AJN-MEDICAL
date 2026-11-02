# Phase 2 — Staff access and account security

## Implemented

- Explicit workspace selection at `/auth/trust`; an HTTP-only cookie is a preference, never an authority. Every request resolves it against current active membership.
- Server-verified permissions and trust-scoped database RPCs. No service-role key is used.
- `/dashboard/users`: MFA-verified trust administrators can list staff, attach an already provisioned Auth account, replace its workspace role, and activate/deactivate membership.
- All staff membership mutations are transactional and audited. A shared trust row lock serialises changes. The last active trust administrator cannot be demoted or deactivated through the application.
- No global super-administrator powers. Existing global profile names cannot be changed by another trust administrator.
- `/dashboard/settings`: current trust, role, permissions, workspace switch and security links.
- `/auth/security`: authenticator app enrollment and six-digit verification. An enrolled factor must be verified before dashboard entry. Staff-management RPCs independently require an AAL2 JWT.
- `/auth/password`: generic recovery request responses, default email-link recovery through a PKCE callback, optional email-code recovery, password confirmation and global sign-out request after password change. Enrolled MFA also gates password updates.

## Permission matrix for this release

| Role | Active staff workspace | Staff membership management | Clinical data |
| --- | --- | --- | --- |
| Trust Administrator | Yes | Own trust, with AAL2 | Closed |
| Doctor / Optometrist | Yes | No | Closed |
| Camp Manager | Yes | No | Closed |
| Data Entry Staff | Yes | No | Closed |
| Analyst | Yes | No | Closed |
| Super Admin | Own active memberships only | No global bypass | Closed |

This conservative matrix implements only Phase 2. Camp/patient/clinical/report permissions remain unassigned. The trust should review the proposed matrix before live use.

## Activation

1. Configure the Supabase URL and publishable key in the Next.js server environment as described in README. No credentials are bundled in source.
2. Apply migrations in order, including `202611020001_staff_access.sql`, using `supabase db push` against the intended development project.
3. Provision the first administrator using the trusted SQL procedure in README. A confirmed Auth user, profile, active membership and `trust_admin` role are required. Subsequent confirmed Auth accounts are created in the Supabase dashboard and attached using their UUID at `/dashboard/users`. No public registration or automatic account creation is enabled.
4. Enable Supabase TOTP enrollment and verification. Sign in as the administrator, visit `/auth/security`, scan the QR code and verify it. New sessions with an enrolled factor must verify it again. Admin staff changes always require two steps even if MFA is not enrolled yet.
5. Set the Auth Site URL and server-only `SITE_URL` to the approved **Next.js server deployment**. Allowlist `<SITE_URL>/auth/callback`. Default reset emails use a PKCE link; the callback exchanges its one-time code and redirects to the password form. Open the link in the browser that requested recovery. If custom SMTP/templates are available, the reset template can also show `{{ .Token }}` for the optional email-code flow. Configure provider rate limits, password policy and short OTP expiry in Supabase. Do not send recovery email to the static preview domain.
6. Supabase secure password change/reauthentication may impose additional provider requirements. Test the configured policy before rollout; the UI displays a safe error if the provider rejects an update.
7. If a user loses the authenticator, an authorised operator must verify their identity through the trust's agreed process before resetting factors using Supabase administration. No public MFA reset endpoint exists.

## Hosting boundary

The existing ChatGPT Site contains the Phase 1 static public website and a staff setup notice. It cannot execute Next.js server actions, Auth cookie refresh, or database access. Phase 2 must run on a server-capable Next.js deployment (the original plan uses Vercel), with the environment values above. Do not claim static publication enables staff workflows. No hosted database migration, SMTP configuration, real account provisioning or MFA policy change was performed here.

## Verification

`npm test`: access input validation, password length/matching and prior validation checks.

`npm run test:database`: applies all migrations in isolated PostgreSQL (PGlite), tests grants/RLS, cross-trust isolation, MFA enforcement, last-admin protections, revocation and audit events. Auth JWTs are test stubs; this is not a live Supabase integration test.

`npm run test:live-access`: optional read-only check against a real development project. Supply `LIVE_SUPABASE_URL`, `LIVE_SUPABASE_KEY`, `LIVE_ADMIN_TOKEN` (AAL2), `LIVE_STAFF_TOKEN` (no staff.manage permission) and `LIVE_OTHER_TRUST_ID` through environment variables. Never commit tokens. The script checks own contexts and rejects cross-trust/non-admin staff reads; it does not mutate memberships.

Before rollout manually verify: recovery email delivery, wrong/expired/reused codes, password policy, TOTP enrollment and challenges, two-workspace selection, revoked membership, two concurrent attempts to remove the remaining admins, sign-out and independent browser sessions. Hosted tests have not run without project access. Supabase logs and Auth rate limits require operational configuration; no in-memory rate limiter is presented as distributed protection.

## Remaining scope

Live project verification and provider configuration require the trust's Supabase development project. Account invitations/email automation, automatic global user provisioning, clinical workflows, camp management and patient records are not enabled. Phase 3 remains a separate implementation.

Primary references: [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp), [password recovery](https://supabase.com/docs/guides/auth/passwords).

