// PostgreSQL engine smoke tests. Supabase Auth/Storage schemas are minimal stubs;
// these tests do not replace testing a real Supabase project before launch.
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
let checks = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks++;
  console.log(`PASS ${message}`);
};
async function rejected(sql, code, label) {
  let error;
  try {
    await db.exec(sql);
  } catch (caught) {
    error = caught;
  }
  check(
    error?.code === code,
    `${label} (${error?.code ?? "unexpected success"})`,
  );
}
try {
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth, public to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);`);
  for (const migration of [
    "202610010001_foundation.sql",
    "202610010002_storage.sql",
  ]) {
    await db.exec(
      await readFile(
        new URL(`../supabase/migrations/${migration}`, import.meta.url),
        "utf8",
      ),
    );
  }
  const tables = await db.query(
    `select relname, relrowsecurity, relforcerowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='public' and relkind='r'`,
  );
  check(tables.rows.length === 21, "all 21 application tables created");
  check(
    tables.rows.every((row) => row.relrowsecurity && row.relforcerowsecurity),
    "RLS enabled and forced on every application table",
  );
  const t1 = "11111111-1111-4111-8111-111111111111";
  const t2 = "22222222-2222-4222-8222-222222222222";
  const u1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const u2 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  await db.exec(`insert into public.trusts(id,name) values ('${t1}','Fictional Trust A'),('${t2}','Fictional Trust B');
    insert into auth.users values ('${u1}'),('${u2}');
    insert into public.profiles(id,display_name) values ('${u1}','Fictional Staff A'),('${u2}','Fictional Staff B');
    insert into public.trust_memberships(trust_id,user_id,active) values ('${t1}','${u1}',true),('${t2}','${u2}',true);`);
  const {
    rows: [patient],
  } = await db.query(
    `insert into public.patients(trust_id,full_name) values ($1,'Fictional Patient A') returning id, patient_number`,
    [t1],
  );
  const { rows: camps } = await db.query(
    `insert into public.camps(trust_id,name,camp_type,camp_date,location) values ($1,'Fictional Camp A','screening','2026-10-12','Example'),($1,'Fictional Camp B','screening','2026-10-18','Example') returning id,camp_number`,
    [t1],
  );
  check(patient.patient_number.startsWith("PAT-"), "patient number generated");
  check(
    camps[0].camp_number === "CAMP-2026-001" &&
      camps[1].camp_number === "CAMP-2026-002",
    "camp counters assign distinct numbers",
  );
  const {
    rows: [visit],
  } = await db.query(
    `insert into public.visits(trust_id,patient_id,camp_id) values ($1,$2,$3),($1,$2,$4) returning id`,
    [t1, patient.id, camps[0].id, camps[1].id],
  );
  check(
    (await db.query("select * from public.visits")).rows.length === 2,
    "one patient attends multiple camps",
  );
  await rejected(
    `insert into public.visits(trust_id,patient_id,camp_id) values ('${t2}','${patient.id}','${camps[0].id}')`,
    "23503",
    "cross-trust visit rejected",
  );
  await rejected(
    `insert into public.patients(trust_id,full_name,estimated_age) values ('${t1}','Fictional',60)`,
    "23514",
    "estimated age requires reference date",
  );
  await rejected(
    `insert into public.patients(trust_id,full_name,date_of_birth,estimated_age,age_recorded_on) values ('${t1}','Fictional','1966-01-01',60,'2026-10-01')`,
    "23514",
    "conflicting age and birth date rejected",
  );
  const {
    rows: [exam],
  } = await db.query(
    `insert into public.eye_examinations(trust_id,visit_id) values ($1,$2) returning id`,
    [t1, visit.id],
  );
  await db.query(
    `insert into public.examination_findings(trust_id,examination_id,finding,eye) values ($1,$2,'cataract','right'),($1,$2,'refractive_error','left')`,
    [t1, exam.id],
  );
  check(
    (await db.query("select * from public.examination_findings")).rows
      .length === 2,
    "multiple relational findings supported with optional exam measurements",
  );
  const {
    rows: [referral],
  } = await db.query(
    `insert into public.referrals(trust_id,visit_id,reason,referred_facility) values ($1,$2,'Fictional assessment','Example facility') returning id`,
    [t1, visit.id],
  );
  await db.query(
    `insert into public.follow_ups(trust_id,referral_id,follow_up_date,contact_result) values ($1,$2,'2026-10-13','No answer'),($1,$2,'2026-10-14','Contacted')`,
    [t1, referral.id],
  );
  check(
    (await db.query("select * from public.follow_ups")).rows.length === 2,
    "multiple follow-up attempts supported",
  );
  await rejected(
    `insert into public.follow_ups(trust_id,referral_id,follow_up_date,contact_result,next_follow_up_date) values ('${t1}','${referral.id}','2026-10-14','Contacted','2026-10-13')`,
    "23514",
    "invalid follow-up date rejected",
  );
  await rejected(
    `insert into public.camp_media(trust_id,camp_id,storage_path,review_status) values ('${t1}','${camps[0].id}','example','approved')`,
    "23514",
    "media approval requires consent and review",
  );
  const audit = await db.query("select * from public.audit_logs");
  check(
    audit.rows.length > 0 &&
      !JSON.stringify(audit.rows).includes("Fictional Patient A"),
    "audit events recorded without patient payloads",
  );
  check(
    (await db.query("select * from storage.buckets")).rows.every(
      (row) => !row.public,
    ),
    "storage buckets are private",
  );
  await db.exec("set role anon");
  for (const table of tables.rows)
    await rejected(
      `select * from public.${table.relname}`,
      "42501",
      `anonymous read blocked: ${table.relname}`,
    );
  await db.exec(
    `reset role; set request.jwt.claim.sub = '${u1}'; set role authenticated`,
  );
  check(
    (await db.query("select * from public.profiles")).rows.length === 1,
    "staff sees only own profile",
  );
  check(
    (await db.query("select * from public.trust_memberships")).rows.length ===
      1,
    "staff sees only own membership",
  );
  await rejected(
    `update public.trust_memberships set active=true`,
    "42501",
    "self-service privilege escalation blocked",
  );
  await rejected(
    `insert into public.user_roles(trust_id,user_id,role_id) values ('${t1}','${u1}','super_admin')`,
    "42501",
    "self-service role assignment blocked",
  );
  for (const table of [
    "patients",
    "patient_consents",
    "camps",
    "visits",
    "eye_examinations",
    "examination_findings",
    "referrals",
    "follow_ups",
    "outcomes",
    "camp_media",
    "imports",
    "import_errors",
    "audit_logs",
  ]) {
    await rejected(
      `select * from public.${table}`,
      "42501",
      `clinical/operational access closed: ${table}`,
    );
  }
  await rejected(
    "delete from public.audit_logs",
    "42501",
    "staff cannot erase audit history",
  );
  // Prove RLS still denies records if someone accidentally grants table SELECT.
  await db.exec(
    "reset role; grant select on public.patients to anon, authenticated; set role authenticated",
  );
  check(
    (await db.query("select * from public.patients")).rows.length === 0,
    "RLS independently prevents clinical reads after accidental grant",
  );
  await db.exec(
    `reset role; update public.trust_memberships set active=false where user_id='${u1}'; set role authenticated`,
  );
  check(
    (await db.query("select * from public.roles")).rows.length === 0,
    "inactive membership loses staff role catalogue access",
  );
  console.log(
    `\n${checks} database checks passed. Live Supabase integration still requires project credentials.`,
  );
} catch (error) {
  console.error(
    "Database check failed:",
    error.message,
    error.code ?? "",
    error.detail ?? "",
  );
  process.exitCode = 1;
} finally {
  await db.close();
}
