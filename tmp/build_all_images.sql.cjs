// Builds supabase/phase2_image_urls.sql: updates products.image_url to the
// public storage URLs the upload script will produce. Run AFTER upload.
const fs = require('fs');
const envRaw = fs.readFileSync('/workspace/.env.local','utf8');
const BASE = envRaw.match(/VITE_SUPABASE_URL=(\S+)/)[1];
const map = JSON.parse(fs.readFileSync('/workspace/tmp/drive_images/mapped/mapping.json','utf8'));
let out = `-- Diatomlife Phase 2: point product images at Supabase Storage.\n-- Run AFTER node scripts/upload_product_images.cjs succeeds.\n-- (RLS is temporarily disabled because the SQL Editor role is not an admin.)\n\nalter table public.products disable row level security;\n\n`;
for (const [file, slugs] of Object.entries(map)) {
  for (const slug of slugs) {
    const url = `${BASE}/storage/v1/object/public/product-images/products/${slug}/main.jpg`;
    out += `update public.products set image_url = '${url}', updated_at = now() where slug = '${slug}';\n`;
  }
}
out += `\nalter table public.products enable row level security;\n`;
fs.writeFileSync('/workspace/supabase/phase2_image_urls.sql', out);
console.log(out);
