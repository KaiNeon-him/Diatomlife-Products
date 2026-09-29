-- ============================================================
-- Diatomlife Phase 2: new products from Google Drive photos
-- Run in Supabase Dashboard -> SQL Editor. Idempotent (upsert on slug).
--   IMG_6631 Joint Care      KES  699
--   IMG_6632 Diabetes Tea     KES  599
--   IMG_6637 Mimosa Pudica    KES  799
--   IMG_6633 Nutrisil + Natural C  -> test product, KES 1999 (delete before launch)
-- Column list matches seed_products_v3.sql. image_url left NULL here;
-- the upload script fills it after images are pushed to storage.
-- ============================================================

alter table public.products disable row level security;

-- 1) Joint Care
insert into public.products
  (name, slug, category_id, price_kes, description, holistic_story, scientific_why,
   ingredients, benefits, usage, image_url, stock_quantity, is_active)
values (
  'Joint Care',
  'joint-care',
  (select id from public.categories where slug = 'anti-inflammatory-and-joint-health'),
  699,
  'Calcium, Magnesium, Silica & Vitamin C - the complete structural quartet for strong bones, resilient joints and supple connective tissue.',
  'Bones and joints are the architecture of your life. This formula brings together the four minerals of structure - the calcium of stone, the magnesium of flexibility, the silica of weaving, and the vitamin C that binds them all - so your frame moves with the ease of youth.',
  'Calcium provides the mineral density of bone; magnesium balances calcium and supports muscle relaxation around joints; silica is a cofactor for collagen synthesis in cartilage and connective tissue; vitamin C is essential for cross-linking collagen fibers and improves mineral absorption. Taken together they act synergistically on the same structural pathway.',
  array['Calcium','Magnesium','Silica (Diatomaceous Earth)','Vitamin C']::text[],
  array['Supports bone density & strength','Maintains healthy cartilage & joints','Collagen formation for connective tissue','Reduces exercise-related joint discomfort']::text[],
  'Take as directed on the label, preferably with meals. Split the daily dose morning and evening for better absorption.',
  null,
  50,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  price_kes = excluded.price_kes,
  description = excluded.description,
  holistic_story = excluded.holistic_story,
  scientific_why = excluded.scientific_why,
  ingredients = excluded.ingredients,
  benefits = excluded.benefits,
  usage = excluded.usage,
  updated_at = now();

-- 2) Diabetes Tea
insert into public.products
  (name, slug, category_id, price_kes, description, holistic_story, scientific_why,
   ingredients, benefits, usage, image_url, stock_quantity, is_active)
values (
  'Diabetes Tea',
  'diabetes-tea',
  (select id from public.categories where slug = 'herbal-teas-and-relaxation'),
  599,
  'A traditional herbal infusion crafted to support healthy blood-sugar balance and steady energy throughout the day.',
  'Long before laboratories, healers reached for bitter leaves and warming spices to tame the sweetness of the blood. This tea carries that quiet tradition - a daily ritual of steeping, sipping, and restoring balance.',
  'Traditional blood-sugar-supporting herbs contain compounds studied for their ability to slow carbohydrate absorption, improve insulin sensitivity, and blunt post-meal glucose spikes, while polyphenols provide antioxidant protection for metabolic health.',
  array['Traditional blood-sugar balancing herbs','Antioxidant-rich botanicals']::text[],
  array['Supports healthy blood-glucose levels','Steady all-day energy','Rich in antioxidants','Soothing daily wellness ritual']::text[],
  'Steep 1 bag or 1 teaspoon in hot water for 5-7 minutes. Enjoy 1-2 cups daily, ideally after meals.',
  null,
  50,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  price_kes = excluded.price_kes,
  description = excluded.description,
  holistic_story = excluded.holistic_story,
  scientific_why = excluded.scientific_why,
  ingredients = excluded.ingredients,
  benefits = excluded.benefits,
  usage = excluded.usage,
  updated_at = now();

-- 3) Mimosa Pudica
insert into public.products
  (name, slug, category_id, price_kes, description, holistic_story, scientific_why,
   ingredients, benefits, usage, image_url, stock_quantity, is_active)
values (
  'Mimosa Pudica',
  'mimosa-pudica',
  (select id from public.categories where slug = 'digestive-health-and-focus'),
  799,
  'The sensitive plant - a time-honored gentle cleanser that helps sweep parasites and calm an irritated gut.',
  'When touched, the sensitive plant folds inward, as if teaching us when to withdraw and protect ourselves. In the body it works the same quiet way - gently binding what does not belong and letting the gut release it, restoring stillness to a turbulent digestive system.',
  'Mimosa pudica seeds are rich in tannins and mucilage, traditionally used to help expel intestinal parasites, soothe the gut lining, and firm loose stools. Its binding properties may also support detoxification by carrying waste through the tract.',
  array['Mimosa Pudica seed powder']::text[],
  array['Traditional parasite cleanse','Soothes & supports gut lining','Firms digestion','Calms digestive turbulence']::text[],
  'Take on an empty stomach as directed on the label, typically twice daily for a short cleansing cycle.',
  null,
  50,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  price_kes = excluded.price_kes,
  description = excluded.description,
  holistic_story = excluded.holistic_story,
  scientific_why = excluded.scientific_why,
  ingredients = excluded.ingredients,
  benefits = excluded.benefits,
  usage = excluded.usage,
  updated_at = now();

-- 4) Nutrisil + Natural C Duo [TEST]
insert into public.products
  (name, slug, category_id, price_kes, description, holistic_story, scientific_why,
   ingredients, benefits, usage, image_url, stock_quantity, is_active)
values (
  'Nutrisil + Natural C Duo [TEST]',
  'nutrisil-plus-natural-c',
  (select id from public.categories where slug = 'minerals-and-cellular-absorption'),
  1999,
  'TEST PRODUCT - the structural duo: food-grade diatomaceous earth paired with whole-food baobab vitamin C. Delete before launch.',
  'Silica builds the scaffold; vitamin C hangs the collagen upon it. Together they are the inner architect and its master builder.',
  'Silica from Nutrisil supports collagen matrix formation while the vitamin C in Natural C is the essential cofactor for collagen cross-linking - taking both covers the full connective-tissue pathway.',
  array['Food-Grade Diatomaceous Earth','Baobab Fruit Powder']::text[],
  array['Hair, skin & nails support','Collagen formation','Daily mineral & antioxidant foundation']::text[],
  'Take each component as directed separately - Nutrisil in the morning on an empty stomach, Natural C with a meal.',
  null,
  50,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  price_kes = excluded.price_kes,
  description = excluded.description,
  holistic_story = excluded.holistic_story,
  scientific_why = excluded.scientific_why,
  ingredients = excluded.ingredients,
  benefits = excluded.benefits,
  usage = excluded.usage,
  updated_at = now();

-- restore RLS
alter table public.products enable row level security;
