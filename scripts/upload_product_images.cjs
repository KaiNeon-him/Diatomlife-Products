#!/usr/bin/env node
/**
 * Diatomlife Phase 2 — product image uploader.
 *
 * Usage:
 *   node scripts/upload_product_images.cjs <image-dir> [--dry]
 *
 * Reads mapping.json ({ "<file>": ["slug", ...] }) from the image dir,
 * resizes each source photo to web-friendly JPGs (max 1200px), uploads
 * them to the Supabase `product-images` storage bucket under
 *   products/<slug>/<n>.jpg
 * and updates products.image_url (first image) in the database.
 *
 * Requires the temp anon-insert policy from
 * supabase/phase2_image_upload_setup.sql (run cleanup SQL afterwards).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const envRaw = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const URL_BASE = envRaw.match(/VITE_SUPABASE_URL=(\S+)/)[1];
const ANON_KEY = envRaw.match(/VITE_SUPABASE_ANON_KEY=(\S+)/)[1];

const BUCKET = 'product-images';
const DRY = process.argv.includes('--dry');
const DIR = process.argv[2];
if (!DIR || !fs.existsSync(DIR)) {
  console.error('Usage: node scripts/upload_product_images.cjs <image-dir> [--dry]');
  process.exit(1);
}

const mappingPath = path.join(DIR, 'mapping.json');
if (!fs.existsSync(mappingPath)) {
  console.error('No mapping.json found in', DIR);
  console.error('Expected format: { "IMG_6627.PNG": ["natural-c"], "IMG_6634.JPG": ["turmeric-and-curcumin", "moringa-powder"] }');
  process.exit(1);
}
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

async function getProduct(slug) {
  const r = await fetch(`${URL_BASE}/rest/v1/products?select=id,name,image_url&slug=eq.${slug}&limit=1`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } });
  const d = await r.json();
  return Array.isArray(d) && d.length ? d[0] : null;
}

async function updateImageUrl(id, url) {
  const r = await fetch(`${URL_BASE}/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'content-type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ image_url: url }),
  });
  return r.status;
}

async function uploadObject(key, buffer, contentType) {
  // upsert=true: replaces existing objects (requires anon select+delete
  // policies from phase2_run_all_v2.sql; removed by the cleanup script).
  const r = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${key}`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'content-type': contentType, 'x-upsert': 'true' },
    body: buffer,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`upload ${key} -> ${r.status}: ${text.slice(0, 200)}`);
  return `${URL_BASE}/storage/v1/object/public/${BUCKET}/${key}`;
}

(async () => {
  let ok = 0, fail = 0;
  for (const [file, slugs] of Object.entries(mapping)) {
    const src = path.join(DIR, file);
    if (!fs.existsSync(src)) { console.log('SKIP missing file', file); continue; }
    let jpg;
    try {
      jpg = await sharp(src).rotate().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    } catch (e) {
      console.log('CONVERT FAIL', file, e.message); fail++; continue;
    }
    for (const slug of slugs) {
      const key = `products/${slug}/main.jpg`;
      if (DRY) { console.log(`[dry] ${file} (${jpg.length} bytes) -> ${BUCKET}/${key}`); ok++; continue; }
      const prod = await getProduct(slug);
      if (!prod) { console.log('NO PRODUCT for slug', slug); fail++; continue; }
      try {
        const pubUrl = await uploadObject(key, jpg, 'image/jpeg');
        const st = await updateImageUrl(prod.id, pubUrl);
        console.log(`${file} -> ${slug} (${prod.name}) db:${st} ${pubUrl}`);
        ok++;
      } catch (e) { console.log('FAIL', slug, e.message); fail++; }
    }
  }
  console.log(`\nDone. ok=${ok} fail=${fail}`);
  process.exit(fail ? 2 : 0);
})();
