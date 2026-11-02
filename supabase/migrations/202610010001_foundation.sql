-- Phase 1: private by default. Run using Supabase migrations, not the browser.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.trusts (
  id uuid primary key default gen_random_uuid(), name text not null check (length(name) between 1 and 200),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- auth.users is the sole identity/password store.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 120),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.trust_memberships (
  trust_id uuid not null references public.trusts(id), user_id uuid not null references public.profiles(id),
  active boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key (trust_id, user_id)
);
create index memberships_user_idx on public.trust_memberships(user_id);
create table public.roles (id text primary key, name text not null unique);
create table public.permissions (id text primary key, description text not null);
create table public.role_permissions (
  role_id text references public.roles(id), permission_id text references public.permissions(id),
  primary key (role_id, permission_id)
);
create table public.user_roles (
  trust_id uuid not null, user_id uuid not null, role_id text not null references public.roles(id),
  created_at timestamptz not null default now(), primary key (trust_id, user_id, role_id),
  foreign key (trust_id, user_id) references public.trust_memberships(trust_id, user_id)
);
insert into public.roles (id, name) values
  ('super_admin', 'Super Admin'), ('trust_admin', 'Trust Administrator'), ('clinician', 'Doctor / Optometrist'),
  ('camp_manager', 'Camp Manager'), ('data_entry', 'Data Entry Staff'), ('analyst', 'Analyst');
insert into public.permissions values
  ('patients.read', 'Read patient records'), ('patients.write', 'Manage patient records'),
  ('camps.manage', 'Manage camps'), ('clinical.manage', 'Record examinations and care'),
  ('reports.read', 'Read approved reports'), ('staff.manage', 'Manage trust staff'), ('media.publish', 'Publish reviewed media');
-- Deliberately no role_permissions mappings or clinical RLS grants in Phase 1.

create sequence public.patient_number_seq;
create table public.patients (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null references public.trusts(id),
  patient_number text not null unique default ('PAT-' || to_char(nextval('public.patient_number_seq'), 'FM000000000')),
  full_name text not null check (length(full_name) between 1 and 200),
  date_of_birth date, estimated_age smallint check (estimated_age between 0 and 130), age_recorded_on date,
  gender text check (gender in ('female', 'male', 'other', 'prefer_not_to_say')),
  mobile text check (mobile ~ '^\+?[0-9 ()-]{7,20}$'), address text, village text, local_body text, district text,
  archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (trust_id, id), check (date_of_birth is null or estimated_age is null),
  check ((estimated_age is null) = (age_recorded_on is null)),
  check (date_of_birth is null or date_of_birth <= created_at::date)
);
create index patients_trust_name_idx on public.patients(trust_id, full_name);
create index patients_trust_mobile_idx on public.patients(trust_id, mobile) where mobile is not null;
create table public.patient_consents (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, patient_id uuid not null,
  purpose text not null check (purpose in ('screening', 'follow_up_contact', 'media_publication')),
  status text not null check (status in ('granted', 'declined', 'withdrawn')),
  notice_version text not null, recorded_at timestamptz not null default now(),
  recorded_by uuid not null, method text not null check (method in ('written', 'verbal', 'digital', 'guardian')),
  created_at timestamptz not null default now(),
  foreign key (trust_id, patient_id) references public.patients(trust_id, id),
  foreign key (trust_id, recorded_by) references public.trust_memberships(trust_id, user_id)
);
create index consents_patient_idx on public.patient_consents(trust_id, patient_id, recorded_at desc);

-- Atomic per-trust/year counters avoid MAX()+1 races. Used only by camp trigger.
create table private.camp_counters (
  trust_id uuid references public.trusts(id), camp_year integer, last_number integer not null,
  primary key (trust_id, camp_year)
);
create table public.camps (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null references public.trusts(id),
  camp_number text not null, name text not null check (length(name) between 1 and 200),
  camp_type text not null, camp_date date not null, location text not null,
  village text, local_body text, district text, target_population text, description text,
  status text not null default 'planned' check (status in ('planned', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (trust_id, id), unique (trust_id, camp_number)
);
create function private.assign_camp_number() returns trigger language plpgsql security definer set search_path = '' as $$
declare counter integer; v_camp_year integer;
begin
  v_camp_year := extract(year from new.camp_date)::integer;
  insert into private.camp_counters values (new.trust_id, v_camp_year, 1)
  on conflict (trust_id, camp_year) do update set last_number = private.camp_counters.last_number + 1
  returning last_number into counter;
  new.camp_number := 'CAMP-' || v_camp_year || '-' || lpad(counter::text, greatest(3, length(counter::text)), '0');
  return new;
end $$;
revoke all on function private.assign_camp_number() from public, anon, authenticated;
create trigger camp_number before insert on public.camps for each row execute function private.assign_camp_number();
create index camps_trust_date_idx on public.camps(trust_id, camp_date);
create table public.camp_partners (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, camp_id uuid not null,
  organisation_name text not null, created_at timestamptz not null default now(),
  foreign key (trust_id, camp_id) references public.camps(trust_id, id), unique (camp_id, organisation_name)
);
create table public.visits (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, patient_id uuid not null, camp_id uuid not null,
  visited_at timestamptz not null default now(),
  screening_status text not null default 'waiting' check (screening_status in ('waiting', 'in_progress', 'completed')),
  examiner_id uuid, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (trust_id, id),
  foreign key (trust_id, patient_id) references public.patients(trust_id, id),
  foreign key (trust_id, camp_id) references public.camps(trust_id, id),
  foreign key (trust_id, examiner_id) references public.trust_memberships(trust_id, user_id)
);
create index visits_patient_idx on public.visits(trust_id, patient_id, visited_at desc);
create index visits_camp_idx on public.visits(trust_id, camp_id);
-- Multiple examinations allow repeat measurements during the same visit.
create table public.eye_examinations (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, visit_id uuid not null,
  visual_acuity_right text, visual_acuity_left text, near_vision_right text, near_vision_left text,
  refraction_right text, refraction_left text,
  iop_right numeric(5,2) check (iop_right between 0 and 100), iop_left numeric(5,2) check (iop_left between 0 and 100),
  examiner_id uuid, examined_at timestamptz not null default now(), notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (trust_id, id),
  foreign key (trust_id, visit_id) references public.visits(trust_id, id),
  foreign key (trust_id, examiner_id) references public.trust_memberships(trust_id, user_id)
);
create index examinations_visit_idx on public.eye_examinations(trust_id, visit_id);
create table public.examination_findings (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, examination_id uuid not null,
  finding text not null check (finding in ('normal', 'refractive_error', 'cataract', 'glaucoma_suspect', 'diabetic_retinopathy_suspect', 'corneal_condition', 'other')),
  eye text not null check (eye in ('right', 'left', 'both', 'unspecified')), notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (trust_id, examination_id) references public.eye_examinations(trust_id, id),
  unique (examination_id, finding, eye)
);
create table public.referrals (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, visit_id uuid not null,
  reason text not null, referred_facility text not null, referral_date date not null default current_date,
  priority text not null default 'routine' check (priority in ('routine', 'urgent')),
  status text not null default 'pending' check (status in ('pending', 'contacted', 'appointment_scheduled', 'visited', 'treatment_started', 'treatment_completed', 'unable_to_contact', 'closed')),
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (trust_id, id),
  foreign key (trust_id, visit_id) references public.visits(trust_id, id)
);
create index referrals_visit_idx on public.referrals(trust_id, visit_id);
create index referrals_status_idx on public.referrals(trust_id, status);
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, referral_id uuid not null,
  follow_up_date date not null, contact_result text not null, next_follow_up_date date,
  treatment_status text, notes text, recorded_by uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (trust_id, referral_id) references public.referrals(trust_id, id),
  foreign key (trust_id, recorded_by) references public.trust_memberships(trust_id, user_id),
  check (next_follow_up_date is null or next_follow_up_date >= follow_up_date)
);
create index follow_ups_referral_idx on public.follow_ups(trust_id, referral_id);
create index follow_ups_due_idx on public.follow_ups(trust_id, next_follow_up_date);
create table public.outcomes (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, referral_id uuid not null,
  outcome text not null, recorded_at timestamptz not null default now(), recorded_by uuid not null,
  created_at timestamptz not null default now(),
  foreign key (trust_id, referral_id) references public.referrals(trust_id, id),
  foreign key (trust_id, recorded_by) references public.trust_memberships(trust_id, user_id)
);
create index outcomes_referral_idx on public.outcomes(trust_id, referral_id);
create table public.camp_media (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, camp_id uuid not null,
  storage_path text not null unique, caption text, alt_text text,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  publication_consent_verified boolean not null default false, reviewed_by uuid, reviewed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (trust_id, camp_id) references public.camps(trust_id, id),
  foreign key (trust_id, reviewed_by) references public.trust_memberships(trust_id, user_id),
  check (review_status <> 'approved' or (publication_consent_verified and reviewed_by is not null and reviewed_at is not null and length(trim(alt_text)) > 0 and alt_text is not null))
);
create index media_camp_idx on public.camp_media(trust_id, camp_id);
create table public.imports (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null references public.trusts(id),
  storage_path text not null, status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  uploaded_by uuid not null, total_rows integer check (total_rows >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (trust_id, id),
  foreign key (trust_id, uploaded_by) references public.trust_memberships(trust_id, user_id)
);
create table public.import_errors (
  id uuid primary key default gen_random_uuid(), trust_id uuid not null, import_id uuid not null,
  row_number integer not null check (row_number > 0), error_code text not null, field_name text,
  -- No raw row, patient name, phone or clinical value in error records.
  created_at timestamptz not null default now(),
  foreign key (trust_id, import_id) references public.imports(trust_id, id)
);
create index import_errors_import_idx on public.import_errors(trust_id, import_id);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), trust_id uuid references public.trusts(id), actor_id uuid,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')), table_name text not null,
  record_id text not null, created_at timestamptz not null default now()
);
create index audit_trust_time_idx on public.audit_logs(trust_id, created_at desc);

create function private.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create function private.audit_change() returns trigger language plpgsql security definer set search_path = '' as $$
declare row_data jsonb;
begin
  if tg_op = 'DELETE' then row_data := to_jsonb(old); else row_data := to_jsonb(new); end if;
  insert into public.audit_logs(trust_id, actor_id, action, table_name, record_id)
  values ((row_data->>'trust_id')::uuid, auth.uid(), tg_op, tg_table_name,
    coalesce(row_data->>'id', concat_ws(':', row_data->>'trust_id', row_data->>'user_id', row_data->>'role_id', row_data->>'permission_id')));
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.audit_change() from public, anon, authenticated;

-- Do not rely on Supabase project default grants. Every foundation table gets RLS.
do $$ declare tab text; begin
  foreach tab in array array['trusts','profiles','trust_memberships','roles','permissions','role_permissions','user_roles',
    'patients','patient_consents','camps','camp_partners','visits','eye_examinations','examination_findings','referrals',
    'follow_ups','outcomes','camp_media','imports','import_errors','audit_logs'] loop
    execute format('alter table public.%I enable row level security', tab);
    execute format('alter table public.%I force row level security', tab);
    execute format('revoke all on table public.%I from public, anon, authenticated', tab);
    if tab <> 'audit_logs' then
      execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function private.audit_change()', tab);
    end if;
  end loop;
  foreach tab in array array['trusts','profiles','trust_memberships','patients','camps','visits','eye_examinations',
    'examination_findings','referrals','follow_ups','camp_media','imports'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()', tab);
  end loop;
end $$;
revoke all on sequence public.patient_number_seq from public, anon, authenticated;
grant select on public.profiles, public.trust_memberships, public.user_roles, public.roles, public.permissions, public.role_permissions to authenticated;
create policy profile_self_read on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy membership_self_read on public.trust_memberships for select to authenticated using (user_id = (select auth.uid()));
create policy user_roles_self_read on public.user_roles for select to authenticated using (
  user_id = (select auth.uid()) and exists (select 1 from public.trust_memberships m where m.trust_id = user_roles.trust_id and m.user_id = (select auth.uid()) and m.active)
);
create policy roles_staff_read on public.roles for select to authenticated using (exists (select 1 from public.trust_memberships where user_id = (select auth.uid()) and active));
create policy permissions_staff_read on public.permissions for select to authenticated using (exists (select 1 from public.trust_memberships where user_id = (select auth.uid()) and active));
create policy role_permissions_staff_read on public.role_permissions for select to authenticated using (exists (select 1 from public.trust_memberships where user_id = (select auth.uid()) and active));
-- No anon grants; no clinical grants; no self-service membership/role updates.
commit;
