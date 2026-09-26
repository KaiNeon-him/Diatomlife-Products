# Diatomlife — Project Context (Handoff Document)

> **How to use this file:** Open a NEW chat, upload/paste this file (or just tell the new assistant "read PROJECT_CONTEXT.md in /workspace"), and continue from where we left off. Everything needed to resume is captured here.

---

## 1. What This Project Is

**Diatomlife** — "Nature's Gift To Humanity" — is a React/TypeScript e-commerce website for natural wellness & holistic health products (Nutrisil/diatomaceous earth, Ashwagandha, Activated Charcoal, Sea Moss, Spirulina, herbal remedies, etc.), targeted at the **Kenyan market**.

- **Frontend:** React 18.3 + TypeScript + Vite, React Router v7, Tailwind CSS, shadcn/ui components (~40), some Material-UI/Radix
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Row Level Security)
- **Payments:** M-Pesa **Send Money** (C2C — NOT Lipa Na M-Pesa, no Daraja API). Manual verification flow: customer sends money to business number → enters transaction code → admin verifies against their phone/bank statement.
- **Delivery:** Fargo Courier, distance-based fees (logic deferred — county stored per order, fee adjustable by admin)
- **Currency:** KES

## 2. Architecture Decisions (Locked In)

| Decision | Choice |
|---|---|
| Guest checkout | ❌ Not allowed — registration required |
| Admins | ✅ Multiple admins via `user_roles` table |
| Payment | M-Pesa Send Money + admin verification queue |
| Order numbers | Time-based: `DIAT-YYYYMMDD-XXXX` |
| Inventory tracking | ✅ Required (stock reduced on purchase) |
| Email notifications | Deferred to Phase 2+ |
| Water Tracker page | Keep as-is, localStorage only (no cloud sync) |
| Blog management | Add CRUD to Admin panel |
| Supabase project | NEW project created (old one abandoned) |
| Product images | User will share Google Drive link (PENDING) |

## 3. Current Status

### ✅ Completed (Phase 1 — Foundation)
- Full database schema deployed to Supabase (tables, types, triggers, RLS policies, helper functions) — confirmed "Success" in SQL Editor
- Tables: `profiles`, `user_roles`, `categories`, `products`, `orders`, `order_items`, `blog_posts`, `faqs`, `contact_messages`, `wishlists`, `reviews`, `settings`
- `.env.local` configured with Supabase credentials (gitignored)
- Supabase JS client wired up (`src/lib/supabase.ts`)
- Auth system scaffolding (register/login contexts + routes)
- Cart context with localStorage persistence
- Header updated, admin dashboard scaffold created
- TypeScript compiles with zero errors; dev server boots cleanly

### ⚠️ In Progress / Blocked
- **Product seeding:** The static 19 products from `src/app/data/products.ts` need to be inserted into Supabase. Multiple seed script attempts failed due to schema mismatches and CTE parsing errors. v2's likely killer: RLS insert policies on `categories`/`products` require `is_admin()`, which rejects SQL-Editor runs by non-admins (and the giant single VALUES block / BEGIN-COMMIT was fragile). **Rewritten as `supabase/seed_products_v3.sql`** (generator: `scripts/gen_seed_v3.cjs`; sanity-checked by `scripts/validate_seed.cjs` — 45 clean statements): temporarily disables RLS on the two tables, does one small idempotent upsert per row (no CTEs/BEGIN/COMMIT), then re-enables RLS. **User must paste v3 into the SQL Editor and confirm 19 categories + 19 products.**
- **GitHub push:** User had trouble pushing via the site's "publish to GitHub" feature. Git working tree was clean at last check; latest commit `f4d53cd4`.

### 📋 Still Needs Doing Manually (checklist)
1. Run seed SQL successfully → verify 19 rows in `categories` and `products`
2. Create 4 **public** storage buckets: `product-images`, `blog-images`, `user-avatars`, `category-banners`
3. Register on the site (`/register`), then promote self to admin via SQL Editor:
   ```sql
   insert into user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'YOUR_EMAIL';
   ```
4. Provide Google Drive link with real product photos → upload to Supabase Storage → update product image URLs
5. Correct placeholder prices (currently USD×130 conversion guesses)

## 4. Roadmap (Phases)

- **Phase 1: Foundation** ✅ (see above)
- **Phase 2: Customer Core** ← WE ARE HERE NEXT
  - Wire storefront pages to live Supabase data (remove ALL static imports from `src/app/data/`)
  - Checkout page: address form → delivery fee display → M-Pesa instructions screen → transaction code entry → order creation (`pending_payment`)
  - Customer order history with status timeline
- **Phase 3: Admin Panel**
  - Product CRUD + image upload to Storage
  - Order management: payment verification queue, status updates, stock adjustments
  - Blog post editor
- **Phase 4: Content Management** — FAQ CRUD, contact inbox, site settings (M-Pesa number etc.), wishlist
- **Phase 5: Polish** — reviews/ratings, search, loading states, error boundaries, 404 page, SEO meta tags, lazy loading

## 5. Key Files

| File | Purpose |
|---|---|
| `src/app/data/products.ts` | Legacy static product data (source of truth until DB seeded; 19 products) |
| `supabase/full_setup.sql` | Complete schema (already applied to live project) |
| `supabase/seed_products_v3.sql` | **Current seed — paste into SQL Editor** (v2 kept only for reference) |
| `scripts/gen_seed_v3.cjs` | Generator that converts products.ts → v3 seed SQL |
| `scripts/validate_seed.cjs` | Sanity checker (statement count, quote/paren balance) |
| `src/lib/supabase.ts` | Supabase client init (reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) |
| `.env.local` | Supabase credentials (NEVER commit) |

## 6. Live Supabase Project

- **URL:** `https://mdifxjedxilqxaipbvzc.supabase.co`
- Anon key is in `.env.local` (do not share service_role key publicly)
- REST API verified working (HTTP 200); tables exist but empty pending seed

## 7. Known Gotchas

- Supabase SQL Editor chokes on multi-line `WITH ... AS` CTEs — prefer plain sequential INSERT statements
- Schema uses `category_id` (FK to categories), `scientific_why`, `usage` — NOT `category`, `scientific_info`, `usage_instructions`
- `ingredients` / `benefits` are PostgreSQL `text[]` arrays
- Seed script is idempotent (`ON CONFLICT DO NOTHING` / `DO UPDATE`)
- Prices in seed are placeholders; images point to Unsplash temporarily

## 8. Immediate Next Steps (for new chat)

1. Run `supabase/seed_products_v3.sql` in the SQL Editor (it replaces v2; regenerate anytime with `node scripts/gen_seed_v3.cjs`, verify with `node scripts/validate_seed.cjs`). Confirm 19 rows in `categories` and `products`. If it still errors, paste the exact error message and diagnose from live schema (`select column_name from information_schema.columns where table_name='products';`).
2. Then begin **Phase 2**: replace static data imports with Supabase queries across Home/Products/Product Detail pages, then build the checkout flow with M-Pesa Send Money instructions.
