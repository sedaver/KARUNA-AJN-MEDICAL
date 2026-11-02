# Phase 3 — Camp and patient workflows

## Release status

Initially implemented locally at the user's request. The owner subsequently authorised activation on the personal account: database migrations have been applied. See `DEPLOYMENT_STATUS.md` for the current state. Client transfer, administrator provisioning, real patient-data entry and server hosting are not yet completed. `.env.local` is ignored and must not be included in a client handover.

The migration was generated using `supabase migration new phase_3_operations` and has now been applied to the connected project. The automated database checks use disposable in-memory PGlite databases with fictional fixtures and Auth stubs. They never connect to the hosted project.

## Workflows

| Route | Behaviour |
| --- | --- |
| `/dashboard` | Current trust's camp, active patient and visit totals; no presentation fixtures |
| `/dashboard/camps` | Paginated private schedule |
| `/dashboard/camps/new` | Create a camp with a database-assigned stable camp number |
| `/dashboard/camps/[id]` | Edit camp details/status and review paginated visit roster |
| `/dashboard/patients` | Search names, mobile numbers or patient numbers; inspect active/archived records |
| `/dashboard/patients/new` | Register a permanent patient identity with duplicate review |
| `/dashboard/patients/[id]` | Demographics, append-only consent decisions, camp visits, queue status, archive/restore |

Patient search uses a server action rather than putting names/mobile numbers in URL parameters. Results are limited to 25 per page. Camp selection lists up to 100 open matching camps, with a name search to narrow the options. Consent and visit histories are separately paginated. Server rendering and actions use current active membership and the selected verified trust; the browser does not choose the trusted tenant ID.

## Access policy proposed for client review

All operational reads and writes require a verified AAL2 session and active membership. Enroll an authenticator using Phase 2 settings before using operational screens.

| Role | Private camps | Manage camps | Patients, consent and visits |
| --- | --- | --- | --- |
| Trust Administrator | Yes | Yes | Yes |
| Camp Manager | Yes | Yes | Yes |
| Doctor / Optometrist | Yes | No | Yes |
| Data Entry Staff | Yes | No | Yes |
| Analyst | No | No | No patient-level access |
| Super Admin | No implied bypass | No implied bypass | No implied bypass |

Access is scoped to the trust, not a camp assignment. The client must approve this matrix before activation. No examinations, referrals, treatment workflows, public gallery publication, patient export or public patient reads are enabled. Those later-phase tables remain closed.

## Integrity and consent rules

- A person has one patient record and can have many visits across different camps. Camp cancellation and patient archiving retain history; no application hard-delete action exists.
- A matching normalised name or shared phone prompts duplicate review. Acknowledgement permits legitimate family members or namesakes; the application does not automatically merge people or declare them the same person. Repeat visits at one camp need a separate explicit acknowledgement.
- Consent is purpose-specific and append-only. An ordered event number determines the latest decision even when timestamps match. Screening consent does not imply permission to contact or publish photos.
- Screening registration needs a current granted screening decision. Withdrawal blocks further visit registration and queue changes. Consent and registration lock the patient row to prevent a withdrawal racing the registration check.
- The release's under-18 rule requires guardian name and relationship for granted screening consent. If age is unknown, either record age information first or record an applicable guardian decision. Staff attest that they explained the approved notice. The client must approve notices, acceptable evidence, guardian authority checks, retention and the exact policy before use. No legal compliance certification is implied by this workflow.
- Visits cannot be registered for future, completed or cancelled camps. Dates for camp availability use Asia/Kolkata. Queue completion is administrative and does not record a clinical examination or outcome.
- Edits carry the last-seen `updated_at` version. The database rejects stale edits, so one staff member cannot silently overwrite another's update.
- Only reviewed RPCs may write records. RLS independently limits direct table reads. Mutation audits record actor/operation/record IDs without copying health payloads. Read/export auditing remains an operational requirement before sensitive production use.

## Local checks

```powershell
npm test
npm run test:database
npm run test:operations
npm run lint
$env:NEXT_BUILD_WORKER_THREADS='1'
node node_modules/next/dist/bin/next build --webpack
```

Webpack is the tested fallback for the restricted Windows environment. The local build and SQL tests do not prove real Supabase session lifecycle, provider email/MFA configuration, concurrent load behaviour or a browser-tested authenticated deployment.

## Activate only after client ownership is settled

1. Agree which client-owned Supabase organisation/project, Next.js server host and domain will be used. The current static Sites preview cannot execute these staff workflows.
2. Supply the client project's URL and publishable key using its host's environment settings. Do not copy a service-role key into the browser or source repository.
3. After explicit authorisation, inspect that project's migration history and apply the appropriate missing migrations in order, including `20261102080840_phase_3_operations.sql`. Do not apply them to the personal project while the hold is active.
4. Complete the Phase 2 administrator/MFA/email setup, then verify the Phase 3 workflows using fictional development records before admitting real records.
5. Review role scopes, consent rules and operational monitoring with the trust. Verify duplicate handling, stale forms, consent withdrawal, archived patients and cross-trust denials in real independent sessions.

Camp partners/assignments, clinical notes and examinations, diagnosis, referrals, follow-ups, imports, analytics exports and reviewed public publication remain separate future work.
