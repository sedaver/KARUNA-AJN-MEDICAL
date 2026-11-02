-- Cover foreign-key lookups flagged by the hosted performance advisor.
-- Filename matches the version recorded by Supabase when this migration was applied.
begin;
create index camp_media_reviewer_idx on public.camp_media(trust_id,reviewed_by);
create index camp_partners_trust_camp_idx on public.camp_partners(trust_id,camp_id);
create index findings_trust_exam_idx on public.examination_findings(trust_id,examination_id);
create index examinations_examiner_idx on public.eye_examinations(trust_id,examiner_id);
create index follow_ups_recorder_idx on public.follow_ups(trust_id,recorded_by);
create index imports_uploader_idx on public.imports(trust_id,uploaded_by);
create index outcomes_recorder_idx on public.outcomes(trust_id,recorded_by);
create index consents_recorder_idx on public.patient_consents(trust_id,recorded_by);
create index role_permissions_permission_idx on public.role_permissions(permission_id);
create index user_roles_role_idx on public.user_roles(role_id);
create index visits_examiner_idx on public.visits(trust_id,examiner_id);
commit;
