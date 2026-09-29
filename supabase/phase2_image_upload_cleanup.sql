-- Run AFTER the image upload script finishes: removes the temporary
-- anon-upload policy so only admins can write to storage again.
drop policy if exists "dev_anon_upload_product_images" on storage.objects;
