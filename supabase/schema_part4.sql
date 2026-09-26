-- ============================================================
-- DIATOMLIFE SCHEMA - PART 4 of 4 (storage bucket policies)
-- Run ONLY after Part 3 succeeded.
--
-- NOTE: We do NOT insert into storage.buckets here — create the
-- 4 buckets manually in the dashboard (takes 30 seconds):
--   Storage -> New bucket -> for EACH of these names, PUBLIC bucket:
--     1. product-images
--     2. blog-images
--     3. user-avatars
--     4. category-banners
-- Then run this file to set the access policies.
-- ============================================================

drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read" on storage.objects for select using (bucket_id in
  ('product-images','blog-images','user-avatars','category-banners'));

drop policy if exists "storage_admin_insert" on storage.objects;
create policy "storage_admin_insert" on storage.objects for insert with check (public.is_admin());

drop policy if exists "storage_admin_update" on storage.objects;
create policy "storage_admin_update" on storage.objects for update using (public.is_admin());

drop policy if exists "storage_admin_delete" on storage.objects;
create policy "storage_admin_delete" on storage.objects for delete using (public.is_admin());
