begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('camp-media-private', 'camp-media-private', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
       ('imports-private', 'imports-private', false, 10485760, array['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
-- No object access policies in Phase 1: uploads, downloads and publication are disabled.
-- Phase 2+ must verify trust membership, permission, path ownership, MIME and content.
commit;
