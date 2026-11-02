-- Prepared for client deployment only. Do not apply to hosted Supabase during local development.
begin;
insert into public.permissions(id,description) values
  ('camps.read','Read private camp schedules'),('consents.manage','Record consent decisions'),('visits.manage','Register and manage visits') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select role_id, permission_id from (values ('trust_admin'),('clinician'),('camp_manager'),('data_entry')) roles(role_id)
cross join (values ('camps.read'),('patients.read'),('patients.write'),('consents.manage'),('visits.manage')) permissions(permission_id)
on conflict do nothing;
insert into public.role_permissions values ('trust_admin','camps.manage'),('camp_manager','camps.manage') on conflict do nothing;

create function private.has_operation(p_trust uuid,p_permission text) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and coalesce(auth.jwt()->>'aal','')='aal2' and exists(
   select 1 from public.staff_permissions(p_trust) p where p.permission_id=p_permission
 )
$$;
revoke all on function private.has_operation(uuid,text) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.has_operation(uuid,text) to authenticated;
grant select on public.camps,public.patients,public.patient_consents,public.visits to authenticated;
create policy camps_operational_read on public.camps for select to authenticated using(private.has_operation(trust_id,'camps.read'));
create policy patients_operational_read on public.patients for select to authenticated using(private.has_operation(trust_id,'patients.read'));
create policy consent_operational_read on public.patient_consents for select to authenticated using(private.has_operation(trust_id,'patients.read'));
create policy visits_operational_read on public.visits for select to authenticated using(private.has_operation(trust_id,'patients.read'));

-- Stable total order for append-only consent history, including same-transaction decisions.
alter table public.patient_consents add column event_number bigint generated always as identity;
alter table public.patient_consents add column guardian_name text;
alter table public.patient_consents add column guardian_relationship text;
alter table public.patient_consents add constraint consent_guardian_details check(method<>'guardian' or
  (length(trim(guardian_name)) between 1 and 200 and length(trim(guardian_relationship)) between 1 and 200 and guardian_name is not null and guardian_relationship is not null));
create index consents_latest_event_idx on public.patient_consents(trust_id,patient_id,purpose,event_number desc);
create index patients_normalised_name_idx on public.patients(trust_id,lower(trim(full_name)));
create index patients_normalised_mobile_idx on public.patients(trust_id,(regexp_replace(mobile,'[^0-9]','','g'))) where mobile is not null;
create or replace function private.set_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=clock_timestamp(); return new; end $$;

create function public.save_camp(p_trust uuid,p_input jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid; v_id uuid := (p_input->>'id')::uuid;
begin
 if not private.has_operation(p_trust,'camps.manage') then raise exception 'Access denied' using errcode='42501'; end if;
 if not coalesce(length(trim(p_input->>'name')) between 1 and 200,false)
  or not coalesce(length(trim(p_input->>'location')) between 1 and 200,false)
  or not coalesce(length(trim(p_input->>'district')) between 1 and 200,false)
  or not coalesce(p_input->>'campType' in ('community','school','workplace','other'),false)
  or not coalesce(p_input->>'status' in ('planned','ongoing','completed','cancelled'),false)
  or p_input->>'campDate' is null or length(coalesce(p_input->>'description',''))>2000 then
  raise exception 'Invalid camp' using errcode='23514'; end if;
 if v_id is null then
  insert into public.camps(trust_id,name,camp_type,camp_date,location,district,status,description)
  values(p_trust,trim(p_input->>'name'),p_input->>'campType',(p_input->>'campDate')::date,trim(p_input->>'location'),trim(p_input->>'district'),p_input->>'status',p_input->>'description') returning id into result;
 else
  perform 1 from public.camps where id=v_id and trust_id=p_trust for update;
  if not found then raise exception 'Access denied' using errcode='42501'; end if;
  update public.camps set name=trim(p_input->>'name'),camp_type=p_input->>'campType',camp_date=(p_input->>'campDate')::date,
   location=trim(p_input->>'location'),district=trim(p_input->>'district'),status=p_input->>'status',description=p_input->>'description'
  where id=v_id and trust_id=p_trust and updated_at=(p_input->>'expectedVersion')::timestamptz returning id into result;
  if result is null then raise exception 'Stale edit' using errcode='40001'; end if;
 end if;
 return result;
end $$;

create function public.save_patient(p_trust uuid,p_input jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid; v_id uuid := (p_input->>'id')::uuid; v_mobile text := nullif(regexp_replace(p_input->>'mobile','[^0-9]','','g'),'');
begin
 -- Serialise duplicate checks and saves per trust. No clinical payload enters an audit log.
 perform 1 from public.trusts where id=p_trust for update;
 if not private.has_operation(p_trust,'patients.write') then raise exception 'Access denied' using errcode='42501'; end if;
 if not coalesce(length(trim(p_input->>'fullName')) between 1 and 200,false)
  or (v_mobile is not null and length(v_mobile) not between 7 and 15)
  or (p_input->>'ageRecordedOn')::date > (clock_timestamp() at time zone 'Asia/Kolkata')::date
  or (p_input->>'dateOfBirth')::date > (clock_timestamp() at time zone 'Asia/Kolkata')::date
  or length(coalesce(p_input->>'address',''))>500 or length(coalesce(p_input->>'village',''))>500
  or length(coalesce(p_input->>'district',''))>500 or length(coalesce(p_input->>'localBody',''))>500 then
  raise exception 'Invalid patient' using errcode='23514'; end if;
 if v_id is not null then
  perform 1 from public.patients where id=v_id and trust_id=p_trust and archived_at is null for update;
  if not found then raise exception 'Access denied' using errcode='42501'; end if;
 end if;
 if not coalesce((p_input->>'duplicateAcknowledged')::boolean,false) and exists(
  select 1 from public.patients where trust_id=p_trust and (v_id is null or id<>v_id)
  and (lower(trim(full_name))=lower(trim(p_input->>'fullName')) or (v_mobile is not null and regexp_replace(mobile,'[^0-9]','','g')=v_mobile))
 ) then raise exception 'Possible duplicate: review existing records' using errcode='23505'; end if;
 if v_id is null then
  insert into public.patients(trust_id,full_name,date_of_birth,estimated_age,age_recorded_on,gender,mobile,address,village,local_body,district)
  values(p_trust,trim(p_input->>'fullName'),(p_input->>'dateOfBirth')::date,(p_input->>'estimatedAge')::smallint,
   (p_input->>'ageRecordedOn')::date,p_input->>'gender',v_mobile,p_input->>'address',p_input->>'village',p_input->>'localBody',p_input->>'district') returning id into result;
 else
  update public.patients set full_name=trim(p_input->>'fullName'),date_of_birth=(p_input->>'dateOfBirth')::date,
   estimated_age=(p_input->>'estimatedAge')::smallint,age_recorded_on=(p_input->>'ageRecordedOn')::date,gender=p_input->>'gender',
   mobile=v_mobile,address=p_input->>'address',village=p_input->>'village',local_body=p_input->>'localBody',district=p_input->>'district'
  where id=v_id and trust_id=p_trust and updated_at=(p_input->>'expectedVersion')::timestamptz returning id into result;
  if result is null then raise exception 'Stale edit' using errcode='40001'; end if;
 end if;
 return result;
end $$;

create function public.archive_patient(p_trust uuid,p_patient uuid,p_version timestamptz,p_archive boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.has_operation(p_trust,'patients.write') then raise exception 'Access denied' using errcode='42501'; end if;
 update public.patients set archived_at=case when p_archive then clock_timestamp() else null end
 where trust_id=p_trust and id=p_patient and updated_at=p_version and p_archive is not null;
 if not found then raise exception 'Stale edit or unavailable record' using errcode='40001'; end if;
end $$;

create function private.screening_consent_valid(p_trust uuid,p_patient uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce((select c.status='granted' and (
   c.method='guardian' or coalesce(p.date_of_birth <= ((clock_timestamp() at time zone 'Asia/Kolkata')::date - interval '18 years')::date,
    p.estimated_age + extract(year from age((clock_timestamp() at time zone 'Asia/Kolkata')::date,p.age_recorded_on)) >= 18,false)
 ) from public.patient_consents c join public.patients p on p.id=c.patient_id and p.trust_id=c.trust_id
 where c.trust_id=p_trust and c.patient_id=p_patient and c.purpose='screening' order by c.event_number desc limit 1),false)
$$;
revoke all on function private.screening_consent_valid(uuid,uuid) from public,anon,authenticated;

create function public.record_consent(p_trust uuid,p_input jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid; v_patient uuid := (p_input->>'patientId')::uuid;
begin
 if not private.has_operation(p_trust,'consents.manage') then raise exception 'Access denied' using errcode='42501'; end if;
 perform 1 from public.patients where trust_id=p_trust and id=v_patient and archived_at is null for update;
 if not found then raise exception 'Unavailable patient' using errcode='42501'; end if;
 if not coalesce(length(trim(p_input->>'noticeVersion')) between 1 and 200,false)
  or length(coalesce(p_input->>'guardianName',''))>200 or length(coalesce(p_input->>'guardianRelationship',''))>200 then
  raise exception 'Invalid notice or guardian details' using errcode='23514'; end if;
 insert into public.patient_consents(trust_id,patient_id,purpose,status,notice_version,recorded_by,method,guardian_name,guardian_relationship)
 values(p_trust,v_patient,p_input->>'purpose',p_input->>'status',trim(p_input->>'noticeVersion'),auth.uid(),p_input->>'method',
  nullif(trim(p_input->>'guardianName'),''),nullif(trim(p_input->>'guardianRelationship'),'')) returning id into result;
 if p_input->>'purpose'='screening' and p_input->>'status'='granted' and not private.screening_consent_valid(p_trust,v_patient) then
  raise exception 'Guardian consent or age details required' using errcode='23514'; end if;
 return result;
end $$;

create function public.register_visit(p_trust uuid,p_patient uuid,p_camp uuid,p_repeat boolean default false) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not private.has_operation(p_trust,'visits.manage') then raise exception 'Access denied' using errcode='42501'; end if;
 -- Camp first, patient second: status changes and consent withdrawals cannot race registration.
 perform 1 from public.camps where trust_id=p_trust and id=p_camp and status in ('planned','ongoing')
   and camp_date <= (clock_timestamp() at time zone 'Asia/Kolkata')::date for update;
 if not found then raise exception 'Camp not open for registration' using errcode='23514'; end if;
 perform 1 from public.patients where trust_id=p_trust and id=p_patient and archived_at is null for update;
 if not found then raise exception 'Unavailable patient' using errcode='42501'; end if;
 if not private.screening_consent_valid(p_trust,p_patient) then raise exception 'Screening consent required' using errcode='23514'; end if;
 if not coalesce(p_repeat,false) and exists(select 1 from public.visits where trust_id=p_trust and camp_id=p_camp and patient_id=p_patient) then
  raise exception 'Confirm repeat visit' using errcode='23505'; end if;
 insert into public.visits(trust_id,patient_id,camp_id) values(p_trust,p_patient,p_camp) returning id into result;
 return result;
end $$;

create function public.update_visit_status(p_trust uuid,p_visit uuid,p_version timestamptz,p_status text) returns void
language plpgsql security definer set search_path='' as $$
declare v_patient uuid;
begin
 if not private.has_operation(p_trust,'visits.manage') then raise exception 'Access denied' using errcode='42501'; end if;
 select patient_id into v_patient from public.visits where id=p_visit and trust_id=p_trust;
 perform 1 from public.patients where id=v_patient and trust_id=p_trust and archived_at is null for update;
 if not found then raise exception 'Unavailable patient' using errcode='42501'; end if;
 if not private.screening_consent_valid(p_trust,v_patient) then raise exception 'Screening consent required' using errcode='23514'; end if;
 if p_status not in ('waiting','in_progress','completed') or p_status is null then raise exception 'Invalid status' using errcode='23514'; end if;
 update public.visits set screening_status=p_status where trust_id=p_trust and id=p_visit and updated_at=p_version;
 if not found then raise exception 'Stale edit' using errcode='40001'; end if;
end $$;

revoke all on function public.save_camp(uuid,jsonb),public.save_patient(uuid,jsonb),public.record_consent(uuid,jsonb),
 public.register_visit(uuid,uuid,uuid,boolean),public.archive_patient(uuid,uuid,timestamptz,boolean),public.update_visit_status(uuid,uuid,timestamptz,text) from public,anon,authenticated;
grant execute on function public.save_camp(uuid,jsonb),public.save_patient(uuid,jsonb),public.record_consent(uuid,jsonb),
 public.register_visit(uuid,uuid,uuid,boolean),public.archive_patient(uuid,uuid,timestamptz,boolean),public.update_visit_status(uuid,uuid,timestamptz,text) to authenticated;
-- No direct INSERT/UPDATE/DELETE grants; examinations, referrals and public publication remain closed.
commit;
