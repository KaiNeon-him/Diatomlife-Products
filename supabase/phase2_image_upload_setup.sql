-- ============================================================
-- Diatomlife Phase 2: storage setup for product image uploads
-- Run this in Supabase Dashboard -> SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================

-- 1) Create the four storage buckets (public read).
insert into storage.buckets (id, name, public) values
  ('product-images',    'product-images',    true),
  ('blog-images',       'blog-images',       true),
  ('user-avatars',      'user-avatars',      true),
  ('category-banners',  'category-banners',  true)
on conflict (id) do update set public = excluded.public;

-- 2) Public read on all app buckets.
drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read" on storage.objects
  for select using (bucket_id in
    ('product-images','blog-images','user-avatars','category-banners'));

-- 3) Admin-only write policies (uses existing public.is_admin()).
drop policy if exists "storage_admin_insert" on storage.objects;
create policy "storage_admin_insert" on storage.objects
  for insert with check (public.is_admin());

drop policy if exists "storage_admin_update" on storage.objects;
create policy "storage_admin_update" on storage.objects
  for update using (public.is_admin());

drop policy if exists "storage_admin_delete" on storage.objects;
create policy "storage_admin_delete" on storage.objects
  for delete using (public.is_admin());

-- 4) TEMPORARY dev-upload policy so the automated upload script can push
--    images without a logged-in admin session. DELETE THIS after uploading:
--    see cleanup at bottom of this file / run phase2_image_upload_cleanup.sql
drop policy if exists "dev_anon_upload_product_images" on storage.objects;
create policy "dev_anon_upload_product_images" on storage.objects
  for insert to anon
  with check (bucket_id = 'product-images');

-- ============================================================
-- AFTER IMAGES ARE UPLOADED, REMOVE THE TEMP POLICY:
-- drop policy if exists "dev_anon_upload_product_images" on storage.objects;
-- ============================================================
