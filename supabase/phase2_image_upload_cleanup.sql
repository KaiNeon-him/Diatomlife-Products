-- Run AFTER the image upload script finishes: removes the temporary
-- dev policies (v1/v2/v3 names) so only admins can write/delete in
-- storage again, and deletes the leftover probe files.
drop policy if exists "dev_anon_upload_product_images" on storage.objects;
drop policy if exists "dev_anon_delete_product_images" on storage.objects;
drop policy if exists "dev_anon_read_objects" on storage.objects;
drop policy if exists "dev_upload_product_images" on storage.objects;
drop policy if exists "dev_update_product_images" on storage.objects;
drop policy if exists "dev_delete_product_images" on storage.objects;
-- v4 temp policy names (also dropped by v4 re-run if needed):
drop policy if exists "temp_anon_upload_product_images" on storage.objects;
drop policy if exists "temp_anon_update_product_images" on storage.objects;
drop policy if exists "temp_anon_delete_product_images" on storage.objects;

-- Remove the test probe files left during permission checks:
delete from storage.objects
 where bucket_id = 'product-images' and name like 'probe/%';
