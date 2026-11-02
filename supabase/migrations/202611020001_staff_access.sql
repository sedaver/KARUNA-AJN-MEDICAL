-- Phase 2: trust-scoped staff access only. Clinical tables remain closed.
begin;
insert into public.role_permissions(role_id, permission_id) values ('trust_admin','staff.manage') on conflict do nothing;

create function public.staff_contexts() returns table(trust_id uuid, trust_name text, role_ids text[])
language sql stable security definer set search_path = '' as $$
  select m.trust_id, t.name, coalesce(array_agg(r.role_id) filter (where r.role_id is not null), array[]::text[])
  from public.trust_memberships m join public.trusts t on t.id=m.trust_id
  left join public.user_roles r on r.trust_id=m.trust_id and r.user_id=m.user_id
  where m.user_id=auth.uid() and m.active group by m.trust_id,t.name
$$;

create function public.staff_permissions(p_trust_id uuid) returns table(permission_id text)
language sql stable security definer set search_path = '' as $$
  select distinct rp.permission_id from public.trust_memberships m
  join public.user_roles ur on ur.trust_id=m.trust_id and ur.user_id=m.user_id
  join public.role_permissions rp on rp.role_id=ur.role_id
  where m.user_id=auth.uid() and m.trust_id=p_trust_id and m.active
$$;

create function private.can_manage_staff(p_trust_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt()->>'aal','')='aal2' and exists (
    select 1 from public.staff_permissions(p_trust_id) p where p.permission_id='staff.manage'
  )
$$;

create function public.list_trust_staff(p_trust_id uuid)
returns table(user_id uuid, display_name text, active boolean, role_ids text[])
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.can_manage_staff(p_trust_id) then raise exception 'Access denied' using errcode='42501'; end if;
  return query select m.user_id,p.display_name,m.active,
    coalesce(array_agg(r.role_id) filter (where r.role_id is not null),array[]::text[])
    from public.trust_memberships m join public.profiles p on p.id=m.user_id
    left join public.user_roles r on r.trust_id=m.trust_id and r.user_id=m.user_id
    where m.trust_id=p_trust_id group by m.user_id,p.display_name,m.active order by p.display_name;
end $$;

create function public.manage_trust_staff(p_trust_id uuid,p_user_id uuid,p_display_name text,p_role_id text,p_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  -- A trust row lock serialises all membership changes, including concurrent admin removal.
  perform 1 from public.trusts where id=p_trust_id for update;
  if not private.can_manage_staff(p_trust_id) then raise exception 'Access denied' using errcode='42501'; end if;
  if p_active is null or p_role_id is null or p_role_id not in ('trust_admin','clinician','camp_manager','data_entry','analyst')
    or p_display_name is null or length(trim(p_display_name)) not between 1 and 120 then
    raise exception 'Invalid staff details' using errcode='22023';
  end if;
  if not exists(select 1 from auth.users where id=p_user_id) then raise exception 'Account must be provisioned first' using errcode='22023'; end if;
  if exists(select 1 from public.user_roles where trust_id=p_trust_id and user_id=p_user_id and role_id='trust_admin')
    and (not p_active or p_role_id <> 'trust_admin')
    and not exists(select 1 from public.trust_memberships m join public.user_roles r on r.trust_id=m.trust_id and r.user_id=m.user_id
      where m.trust_id=p_trust_id and m.active and r.role_id='trust_admin' and m.user_id<>p_user_id) then
    raise exception 'Keep at least one active trust administrator' using errcode='23514';
  end if;
  -- Never rename a global profile from another trust's workspace.
  insert into public.profiles(id,display_name) values(p_user_id,trim(p_display_name)) on conflict(id) do nothing;
  insert into public.trust_memberships(trust_id,user_id,active) values(p_trust_id,p_user_id,p_active)
    on conflict(trust_id,user_id) do update set active=excluded.active;
  delete from public.user_roles where trust_id=p_trust_id and user_id=p_user_id;
  insert into public.user_roles(trust_id,user_id,role_id) values(p_trust_id,p_user_id,p_role_id);
end $$;

revoke all on function public.staff_contexts(), public.staff_permissions(uuid), public.list_trust_staff(uuid), public.manage_trust_staff(uuid,uuid,text,text,boolean) from public,anon,authenticated;
revoke all on function private.can_manage_staff(uuid) from public,anon,authenticated;
grant execute on function public.staff_contexts(), public.staff_permissions(uuid), public.list_trust_staff(uuid), public.manage_trust_staff(uuid,uuid,text,text,boolean) to authenticated;
-- No table mutation grants: only the reviewed RPC may change staff membership.
commit;
