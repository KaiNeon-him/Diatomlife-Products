-- ============================================================
-- Diatomlife Phase 2 — IMAGE URL UPDATE (v3, runs as postgres)
--
-- WHY THIS EXISTS: Anon PATCH requests to products return HTTP 204
-- but change NOTHING (verified live 2026-09-30). PostgREST's anon
-- role silently matches zero rows on UPDATE. The images themselves
-- ARE already uploaded and serving publicly from the product-images
-- bucket (all 10 verified with HTTP 200). Only this DB pointer
-- update remains — running it here in the SQL Editor (postgres
-- role, RLS bypassed) fixes that definitively.
--
-- Paste into Supabase Dashboard -> SQL Editor -> Run.
-- Idempotent; safe to re-run any time.
-- ============================================================

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/natural-c/main.jpg'
where slug = 'natural-c';

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/chamomile/main.jpg'
where slug = 'chamomile';

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/nutrisil/main.jpg'
where slug = 'nutrisil';

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/joint-care/main.jpg'
where slug = 'joint-care';

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/diabetes-tea/main.jpg'
where slug = 'diabetes-tea';

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/nutrisil-plus-natural-c/main.jpg'
where slug = 'nutrisil-plus-natural-c';

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/turmeric-and-curcumin/main.jpg'
where slug = 'turmeric-and-curcumin';

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/mimosa-pudica/main.jpg'
where slug = 'mimosa-pudica';

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/moringa-powder/main.jpg'
where slug = 'moringa-powder';

update public.products set image_url =
  'https://mdifxjedxilqxaipbvzc.supabase.co/storage/v1/object/public/product-images/products/sea-moss-gel/main.jpg'
where slug = 'sea-moss-gel';

-- Verification: expect exactly these 10 slugs listed.
select slug, right(image_url, 45) as image_tail
from public.products
where image_url like '%/storage/v1/object/public/product-images/%'
order by slug;
