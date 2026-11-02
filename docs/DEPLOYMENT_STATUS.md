# Activation status — 2 November 2026

The owner authorised activating the completed phases on the personal account before a future client transfer. This supersedes the migration hold recorded in earlier local-release documents.

## Database

- Supabase project: `pgpiihzzovfwkjafbnuj` (`karuna-ajn-medical`), Mumbai (`ap-south-1`).
- API URL: `https://pgpiihzzovfwkjafbnuj.supabase.co`.
- Applied migrations: `202610010001_foundation.sql`, `202610010002_storage.sql`, `202611020001_staff_access.sql`, `20261102080840_phase_3_operations.sql`, `20261102143558_foreign_key_indexes.sql`.
- Local migration filenames match the hosted migration history.
- All 21 application tables have enabled and forced RLS. Anonymous patient SELECT and visit-registration RPC access are denied. Direct authenticated patient INSERT/UPDATE permissions are denied.
- Both storage buckets remain private.
- The trust row has been created using a database-generated UUID; no patient data or fictional test records were added to the hosted project.
- `src/types/database.ts` is generated from the actual hosted schema.
- Local configuration contains only a project URL and publishable key in ignored `.env.local`. No service-role credential was added to source.

## Advisor results

The performance advisor's 11 missing foreign-key indexes were added. Remaining unused-index notices are expected for the newly created database and were not used as a reason to remove integrity-related indexes.

The security advisor flags 11 RLS-enabled tables with no policies: these are deliberately closed tables accessed only by reviewed administrative functions or reserved for later phases. It also flags the 10 intentionally callable SECURITY DEFINER RPCs. Each uses a fixed search path and explicit membership/permission checks (with AAL2 for sensitive operations); anonymous EXECUTE is revoked. The mutation RPCs are the controlled write boundary because direct table writes are denied. These advisories are documented, not claimed to be eliminated.

References: [closed-table advisory](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [SECURITY DEFINER advisory](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

## Still pending

- Create the confirmed first Auth administrator and attach active trust membership plus the trust_admin role. No such Auth account existed at the time of verification.
- Disable public signups/anonymous sign-in in hosted Auth settings, enable TOTP, configure password/recovery/SMTP settings and the approved host URL.
- Deploy the full Next.js application to a server-capable host. The existing owner-private ChatGPT Site is a static public preview and does not execute the staff portal.
- Verify real sign-in, recovery email delivery, MFA, staff workflows and cross-trust access using independent sessions.
- Client account transfer and any later cleanup are separate future operations; nothing was deleted as part of activation.
