-- Diatomlife Phase 2: point product images at Supabase Storage.
-- Run AFTER node scripts/upload_product_images.cjs succeeds.
-- (RLS is temporarily disabled because the SQL Editor role is not an admin.)

alter table public.products disable row level security;

update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/natural-c/main.jpg', updated_at = now() where slug = 'natural-c';
update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/chamomile/main.jpg', updated_at = now() where slug = 'chamomile';
update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/nutrisil/main.jpg', updated_at = now() where slug = 'nutrisil';
update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/joint-care/main.jpg', updated_at = now() where slug = 'joint-care';
update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/diabetes-tea/main.jpg', updated_at = now() where slug = 'diabetes-tea';
update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/nutrisil-plus-natural-c/main.jpg', updated_at = now() where slug = 'nutrisil-plus-natural-c';
update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/turmeric-and-curcumin/main.jpg', updated_at = now() where slug = 'turmeric-and-curcumin';
update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/mimosa-pudica/main.jpg', updated_at = now() where slug = 'mimosa-pudica';
update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/moringa-powder/main.jpg', updated_at = now() where slug = 'moringa-powder';
update public.products set image_url = 'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/sea-moss-gel/main.jpg', updated_at = now() where slug = 'sea-moss-gel';

alter table public.products enable row level security;
