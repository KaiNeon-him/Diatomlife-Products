// Generates supabase/seed_products_v2.sql directly from src/app/data/products.ts
// Run: node scripts/gen_seed.js
const fs = require('fs');
let src = fs.readFileSync('/workspace/src/app/data/products.ts', 'utf8');

src = src.replace(/^import[^;]*;/gm, '');           // drop imports
src = src.replace(/export\s+interface\s+\w+\s*\{[\s\S]*?\n\}/g, ''); // drop interface blocks
src = src.replace(/export\s+const\s+products[^=]*=/, 'const products =');
src = src.split(/const\s+productCategories/)[0];
src = src.replace(/export\s+/g, '');

const fn = new Function(src + '\nreturn products;');
const prods = fn();
console.log('parsed products:', prods.length);
console.log('sample keys:', Object.keys(prods[0]).join(', '));

const esc = (s) => String(s).replace(/'/g, "''");
const slugify = (name) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const cats = [];
prods.forEach(p => { if (p.category && !cats.includes(p.category)) cats.push(p.category); });

const arr = (vals) => 'array[' + (vals || []).map(v => "'" + esc(v) + "'").join(', ') + ']::text[]';

let out = `-- Diatomlife seed (auto-generated from src/app/data/products.ts)
-- Safe to run multiple times. Run AFTER full_setup.sql.
-- NOTE: prices are USD->KES placeholders at 130/USD. Correct real prices in Admin.

BEGIN;

-- 1) Categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
` + cats.map((c, i) => `('${esc(c)}', '${slugify(c)}', ${i + 1})`).join(',\n') + `
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 2) Products
INSERT INTO public.products (name, slug, category_id, price_kes, description, holistic_story, scientific_why, ingredients, benefits, usage, image_url, stock_quantity, is_active) VALUES
`;

out += prods.map(p => '(' + [
  "'" + esc(p.name) + "'",
  "'" + slugify(p.name) + "'",
  "(SELECT id FROM public.categories WHERE slug = '" + slugify(p.category) + "')",
  String(Math.round((p.price || 0) * 130)),
  "'" + esc(p.description || '') + "'",
  "'" + esc(p.holisticStory || p.story || '') + "'",
  "'" + esc(p.scientificWhy || p.science || '') + "'",
  arr(p.ingredients),
  arr(p.benefits),
  "'" + esc(p.usage || p.usageInstructions || '') + "'",
  "'" + esc(p.image || p.imageUrl || '') + "'",
  '50',
  'true'
].join(', ') + ')').join(',\n') + `
ON CONFLICT (slug) DO NOTHING;

COMMIT;
`;

fs.writeFileSync('/workspace/supabase/seed_products_v2.sql', out);
console.log('categories:', cats.length, '| products:', prods.length);
console.log('names:', prods.map(p => p.name).join(' | '));
