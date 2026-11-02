# Security handover

## Implemented now

- Server-only staff access service verifies the current Auth user and active trust membership.
- Proxy verifies token claims and refreshes cookies; protected routes use private/no-store responses.
- No public signup or demo bypass; no service-role client.
- Login input checked in both form and server action. No raw database/auth errors shown to users.
- All 21 application tables use enabled, forced RLS with explicit grants.
- Anonymous access to application tables is revoked. Clinical/operational access is denied to normal authenticated clients too.
- Profiles, memberships and roles cannot be self-assigned or changed by application clients.
- Composite trust foreign keys prevent cross-trust relationships at the database level.
- Mutation audit records omit patient payloads; ordinary users cannot edit/delete them.
- Storage buckets are private and have file size/MIME allowlists. No upload or download policies exist yet.
- Baseline anti-framing, content-type, referrer and browser-permission headers.
- Fixed post-login destination avoids redirect injection. Next.js Server Actions retain their built-in same-origin checks.
- Secret environment files ignored by version control; `.env.example` contains no credentials.

## Explicit limitations and pre-launch work

1. Apply and test the migrations on a dedicated Supabase project. Local PostgreSQL tests stub Auth and Storage and do not replace live integration testing.
2. Verify unauthenticated direct requests, nested dashboard URLs, invalid/expired sessions, suspended memberships, sign-in, refresh and sign-out in a real browser. Browser back/history and already-rendered pages can retain content; avoid sharing staff devices/sessions.
3. Configure hosted Auth: disable public signup/anonymous auth, enforce account policy, confirm authorised staff, configure rate limits. Application-level distributed throttling, CAPTCHA, MFA enforcement, recovery and invite flows are deferred.
4. Set appropriate retention, consent/guardian processes, breach response, backups and restore tests with the trust. Obtain professional review of the obligations applicable to its actual operations before storing real health records. No legal-compliance claim is made.
5. Define and test permission policies before enabling any clinical query or mutation. Staff shell access does not grant clinical permissions.
6. Add trust selection before using live data for users with multiple memberships.
7. Introduce safe public publication projections and privacy-reviewed aggregates. An approval flag alone must never make a whole clinical or operational table public.
8. Add content sniffing, malware scanning where appropriate, filename randomisation, EXIF stripping, consent checks, safe path ownership and short-lived signed downloads when uploads are implemented. MIME allowlists alone are insufficient.
9. Plan read/export auditing and restricted audit review. Existing triggers audit mutations only, and privileged SQL changes may have no Auth actor UUID.
10. Complete accessibility testing with keyboard, screen reader, zoom and actual users. Current semantic HTML, labels, focus indicators, responsive navigation, native dialog, and contrast-conscious palette target accessibility but do not constitute WCAG certification. Some tertiary labels are small; validate readability with the trust’s audience.
11. Add a tested nonce-based Content Security Policy and monitoring strategy at deployment; do not break framework scripts with an untested CSP. Require HTTPS in production (Vercel provides it).
12. Confirm audit, database and storage grants in the actual target project, particularly if applying to a project with pre-existing broad storage policies or additional schemas. Migrations assume a clean application schema.

## Live acceptance checklist

- [ ] Correct development project and approved region selected.
- [ ] Both migrations applied; no migration errors.
- [ ] Hosted signup disabled and first staff member provisioned.
- [ ] Unauthenticated `/dashboard` and nested routes redirect to login.
- [ ] Incorrect password gets generic error; valid active staff reaches demo dashboard.
- [ ] Valid Auth account without membership cannot enter dashboard.
- [ ] Membership deactivation denies the next server request.
- [ ] Session refresh carries refreshed cookies to the browser.
- [ ] Sign-out prevents subsequent dashboard access.
- [ ] Anon and staff API calls cannot read patient, examination, referral or audit tables.
- [ ] Staff cannot create memberships or assign themselves roles.
- [ ] No private objects are accessible through public Storage URLs.
- [ ] No real patient details, secrets or tokens appear in browser bundles, public pages or logs.
- [ ] Official branding, contact details and public copy reviewed.

Do not enable later-phase features to get around a failed check.


