-- Run AFTER the image upload script finishes: removes the temporary
-- anon policies so only admins can write/delete in storage again.
drop policy if exists "dev_anon_upload_product_images" on storage.objects;
drop policy if exists "dev_anon_delete_product_images" on storage.objects;

-- Optional: also remove the test probe file left during permission checks
-- (do this from Storage dashboard or after re-adding a delete policy):
-- delete from storage.objects where bucket_id='product-images' and name='probe/test.txt';
