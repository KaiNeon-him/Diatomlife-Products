// Generates supabase/phase2_new_products.sql matching the exact column style of seed_products_v3.sql.
const fs = require('fs');

function esc(s) { return String(s).replace(/'/g, "''"); }

const prods = [
  {
    name: 'Joint Care', slug: 'joint-care', category: 'anti-inflammatory-and-joint-health', price: 699,
    description: 'Calcium, Magnesium, Silica & Vitamin C - the complete structural quartet for strong bones, resilient joints and supple connective tissue.',
    holisticStory: 'Bones and joints are the architecture of your life. This formula brings together the four minerals of structure - the calcium of stone, the magnesium of flexibility, the silica of weaving, and the vitamin C that binds them all - so your frame moves with the ease of youth.',
    scientificWhy: 'Calcium provides the mineral density of bone; magnesium balances calcium and supports muscle relaxation around joints; silica is a cofactor for collagen synthesis in cartilage and connective tissue; vitamin C is essential for cross-linking collagen fibers and improves mineral absorption. Taken together they act synergistically on the same structural pathway.',
    ingredients: ['Calcium','Magnesium','Silica (Diatomaceous Earth)','Vitamin C'],
    benefits: ['Supports bone density & strength','Maintains healthy cartilage & joints','Collagen formation for connective tissue','Reduces exercise-related joint discomfort'],
    usage: 'Take as directed on the label, preferably with meals. Split the daily dose morning and evening for better absorption.'
  },
  {
    name: 'Diabetes Tea', slug: 'diabetes-tea', category: 'herbal-teas-and-relaxation', price: 599,
    description: 'A traditional herbal infusion crafted to support healthy blood-sugar balance and steady energy throughout the day.',
    holisticStory: 'Long before laboratories, healers reached for bitter leaves and warming spices to tame the sweetness of the blood. This tea carries that quiet tradition - a daily ritual of steeping, sipping, and restoring balance.',
    scientificWhy: 'Traditional blood-sugar-supporting herbs contain compounds studied for their ability to slow carbohydrate absorption, improve insulin sensitivity, and blunt post-meal glucose spikes, while polyphenols provide antioxidant protection for metabolic health.',
    ingredients: ['Traditional blood-sugar balancing herbs','Antioxidant-rich botanicals'],
    benefits: ['Supports healthy blood-glucose levels','Steady all-day energy','Rich in antioxidants','Soothing daily wellness ritual'],
    usage: 'Steep 1 bag or 1 teaspoon in hot water for 5-7 minutes. Enjoy 1-2 cups daily, ideally after meals.'
  },
  {
    name: 'Mimosa Pudica', slug: 'mimosa-pudica', category: 'digestive-health-and-focus', price: 799,
    description: 'The sensitive plant - a time-honored gentle cleanser that helps sweep parasites and calm an irritated gut.',
    holisticStory: 'When touched, the sensitive plant folds inward, as if teaching us when to withdraw and protect ourselves. In the body it works the same quiet way - gently binding what does not belong and letting the gut release it, restoring stillness to a turbulent digestive system.',
    scientificWhy: 'Mimosa pudica seeds are rich in tannins and mucilage, traditionally used to help expel intestinal parasites, soothe the gut lining, and firm loose stools. Its binding properties may also support detoxification by carrying waste through the tract.',
    ingredients: ['Mimosa Pudica seed powder'],
    benefits: ['Traditional parasite cleanse','Soothes & supports gut lining','Firms digestion','Calms digestive turbulence'],
    usage: 'Take on an empty stomach as directed on the label, typically twice daily for a short cleansing cycle.'
  },
  {
    name: 'Nutrisil + Natural C Duo [TEST]', slug: 'nutrisil-plus-natural-c', category: 'minerals-and-cellular-absorption', price: 1999,
    description: 'TEST PRODUCT - the structural duo: food-grade diatomaceous earth paired with whole-food baobab vitamin C. Delete before launch.',
    holisticStory: 'Silica builds the scaffold; vitamin C hangs the collagen upon it. Together they are the inner architect and its master builder.',
    scientificWhy: 'Silica from Nutrisil supports collagen matrix formation while the vitamin C in Natural C is the essential cofactor for collagen cross-linking - taking both covers the full connective-tissue pathway.',
    ingredients: ['Food-Grade Diatomaceous Earth','Baobab Fruit Powder'],
    benefits: ['Hair, skin & nails support','Collagen formation','Daily mineral & antioxidant foundation'],
    usage: 'Take each component as directed separately - Nutrisil in the morning on an empty stomach, Natural C with a meal.'
  }
];

let out = `-- ============================================================
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

`;

prods.forEach((p, i) => {
  out += `-- ${i+1}) ${p.name}\n`;
  out += `insert into public.products\n  (name, slug, category_id, price_kes, description, holistic_story, scientific_why,\n   ingredients, benefits, usage, image_url, stock_quantity, is_active)\nvalues (\n`;
  out += `  '${esc(p.name)}',\n  '${p.slug}',\n  (select id from public.categories where slug = '${p.category}'),\n  ${p.price},\n`;
  out += `  '${esc(p.description)}',\n  '${esc(p.holisticStory)}',\n  '${esc(p.scientificWhy)}',\n`;
  out += `  array[${p.ingredients.map(x=>`'${esc(x)}'`).join(',')}]::text[],\n`;
  out += `  array[${p.benefits.map(x=>`'${esc(x)}'`).join(',')}]::text[],\n`;
  out += `  '${esc(p.usage)}',\n  null,\n  50,\n  true\n)\n`;
  out += `on conflict (slug) do update set\n  name = excluded.name,\n  category_id = excluded.category_id,\n  price_kes = excluded.price_kes,\n  description = excluded.description,\n  holistic_story = excluded.holistic_story,\n  scientific_why = excluded.scientific_why,\n  ingredients = excluded.ingredients,\n  benefits = excluded.benefits,\n  usage = excluded.usage,\n  updated_at = now();\n\n`;
});

out += `-- restore RLS\nalter table public.products enable row level security;\n`;

fs.writeFileSync('/workspace/supabase/phase2_new_products.sql', out);
console.log('wrote', out.length, 'bytes');
