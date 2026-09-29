-- Run AFTER the image upload script finishes: removes the temporary
-- anon policies so only admins can write/delete in storage again.
drop policy if exists "dev_anon_upload_product_images" on storage.objects;
drop policy if exists "dev_anon_delete_product_images" on storage.objects;
drop policy if exists "dev_anon_read_objects" on storage.objects;

-- Remove the test probe files left during permission checks:
delete from storage.objects
 where bucket_id = 'product-images' and name like 'probe/%';
