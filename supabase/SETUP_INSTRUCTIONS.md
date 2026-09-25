# Diatomlife — Supabase Setup (Read This First)

## ⚠️ The #1 mistake to avoid
In the SQL Editor you paste **SQL CODE**, not file names or file paths.

❌ WRONG — this is what caused your error:
```
supabase/schema.sql
```
(Postgres tried to read the word "supabase" as SQL and failed.)

✅ RIGHT — paste the actual contents of the file.

---

## Step-by-step (Dashboard method)

1. Open your project: https://supabase.com/dashboard
2. In the left sidebar click **SQL Editor** (the `</>` icon).
3. Click **New query**.
4. Open one of these files on your computer in a text editor
   (Notepad / VS Code — NOT in the browser preview):
   - `supabase/full_setup.sql`  ← everything in ONE go, OR run parts 1→4 in order
5. Select ALL the text (Ctrl+A / Cmd+A), copy (Ctrl+C / Cmd+C).
6. Paste into the SQL Editor box. You should see lines starting with
   `-- ...` and `create table ...` — NOT a file path.
7. Click **Run** (or press Ctrl+Enter / Cmd+Enter).
8. Wait for "Success. No rows returned". That's it — schema is created.

### If full_setup.sql errors out, run in this order instead:
| Order | File                          | What it does                        |
|-------|-------------------------------|-------------------------------------|
| 1     | `schema_part1.sql`            | All tables + seed settings          |
| 2     | `schema_part2.sql`            | Helper functions + triggers         |
| 3     | `schema_part3.sql`            | RLS security policies               |
| 4     | `schema_part4.sql`            | Storage bucket access policies      |

Each part depends on the previous one — always run top to bottom,
one file per query, click Run after each.

---

## Create the 4 storage buckets (manual — takes 30 seconds)

Part 4 only sets permissions, so create the buckets yourself:

1. Left sidebar → **Storage**
2. Click **New bucket** and create each of these as **Public**:
   - `product-images`
   - `blog-images`
   - `user-avatars`
   - `category-banners`
   (Toggle "Public bucket" ON for each.)
3. THEN run `schema_part4.sql` (or the last section of `full_setup.sql`)
   in the SQL Editor.

---

## Verify it worked

- **Table Editor** (sidebar) should show: profiles, user_roles,
  categories, products, orders, order_items, blog_posts, faqs,
  contact_messages, wishlists, reviews, settings.
- `settings` table should already contain 4 rows (M-Pesa number etc.).

## Next: connect the frontend

1. Project Settings → **API** → copy **Project URL** and the
   **anon public** key.
2. In the app folder create/edit `.env.local`:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. Restart dev server: `npm run dev`

## Make yourself an admin

1. Sign up on the site normally.
2. In Dashboard → **Authentication → Users**, open your user, copy the **UID**.
3. Run in SQL Editor (paste YOUR uid between the quotes):
   ```sql
   insert into public.user_roles (user_id, role)
   values ('PASTE-YOUR-UID-HERE', 'admin')
   on conflict do nothing;
   ```
4. Log out and back in → `/admin` should now load.
