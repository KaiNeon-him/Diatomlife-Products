-- ============================================================
-- Diatomlife Phase 2 — FIXUP (alternative to the corrected
-- phase2_run_all.sql; run EITHER one, not both).
--
-- ROOT CAUSE of the earlier half-failed runs (verified against
-- your live project mdifxjedxilqxaipbvzc):
--   * public.profiles table: MISSING
--   * public.is_admin() function: MISSING
--   ...but the SQL referenced public.is_admin() inside
--      `create policy` statements. Postgres validates policy
--      expressions at CREATE time -> "function public.is_admin()
--      does not exist" -> execution aborted at that statement,
--      so everything AFTER it (products, place_order RPC) never ran.
--   (Storage buckets/policies before that point DID succeed.)
--
-- This file creates the missing auth helpers FIRST, then re-applies
-- policies, products, and the place_order RPC. Idempotent, safe to
-- re-run. Ends with a verification query - read its output rows.
-- ============================================================

-- ========== 0) AUTH HELPERS (must exist BEFORE any policy that uses them) ==========

-- profiles table (backing table for admin flag), mirrors schema.sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- the admin-check function everyone else depends on (created first!)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== 1) STORAGE BUCKETS & POLICIES ==========
-- SECURITY DEFINER wrapper: the SQL Editor role cannot insert into
-- storage.buckets directly under its own RLS.
create or replace function public._tmp_create_buckets() returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into storage.buckets (id, name, public) values
    ('product-images',    'product-images',    true),
    ('blog-images',       'blog-images',       true),
    ('user-avatars',      'user-avatars',      true),
    ('category-banners',  'category-banners',  true)
  on conflict (id) do update set public = excluded.public;
end $$;

select public._tmp_create_buckets();
drop function public._tmp_create_buckets();

drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read" on storage.objects
  for select using (bucket_id in
    ('product-images','blog-images','user-avatars','category-banners'));

drop policy if exists "storage_admin_insert" on storage.objects;
create policy "storage_admin_insert" on storage.objects
  for insert with check (public.is_admin());

drop policy if exists "storage_admin_update" on storage.objects;
create policy "storage_admin_update" on storage.objects
  for update using (public.is_admin());

drop policy if exists "storage_admin_delete" on storage.objects;
create policy "storage_admin_delete" on storage.objects
  for delete using (public.is_admin());

-- TEMP dev-upload policy (removed by phase2_image_upload_cleanup.sql)
drop policy if exists "dev_anon_upload_product_images" on storage.objects;
create policy "dev_anon_upload_product_images" on storage.objects
  for insert to anon
  with check (bucket_id = 'product-images');

-- ========== 2) NEW PRODUCTS ==========
alter table public.products disable row level security;

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
  name = excluded.name, category_id = excluded.category_id, price_kes = excluded.price_kes,
  description = excluded.description, holistic_story = excluded.holistic_story,
  scientific_why = excluded.scientific_why, ingredients = excluded.ingredients,
  benefits = excluded.benefits, usage = excluded.usage, updated_at = now();

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
  name = excluded.name, category_id = excluded.category_id, price_kes = excluded.price_kes,
  description = excluded.description, holistic_story = excluded.holistic_story,
  scientific_why = excluded.scientific_why, ingredients = excluded.ingredients,
  benefits = excluded.benefits, usage = excluded.usage, updated_at = now();

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
  name = excluded.name, category_id = excluded.category_id, price_kes = excluded.price_kes,
  description = excluded.description, holistic_story = excluded.holistic_story,
  scientific_why = excluded.scientific_why, ingredients = excluded.ingredients,
  benefits = excluded.benefits, usage = excluded.usage, updated_at = now();

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
  name = excluded.name, category_id = excluded.category_id, price_kes = excluded.price_kes,
  description = excluded.description, holistic_story = excluded.holistic_story,
  scientific_why = excluded.scientific_why, ingredients = excluded.ingredients,
  benefits = excluded.benefits, usage = excluded.usage, updated_at = now();

alter table public.products enable row level security;

-- ========== 3) PLACE ORDER RPC ==========
create or replace function public.place_order(
  p_full_name text,
  p_phone text,
  p_address text,
  p_county text,
  p_notes text default null,
  p_delivery_fee numeric default 0,
  p_items jsonb default '[]'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_uid uuid := auth.uid();
  v_subtotal numeric(10,2) := 0;
  v_total numeric(10,2) := 0;
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_pid uuid;
  v_qty int;
  v_price numeric(10,2);
  v_stock int;
  v_name text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_full_name is null or trim(p_full_name) = '' then
    raise exception 'Full name is required';
  end if;
  if p_phone is null or trim(p_phone) = '' then
    raise exception 'Phone number is required';
  end if;
  if p_address is null or trim(p_address) = '' then
    raise exception 'Delivery address is required';
  end if;
  if p_county is null or trim(p_county) = '' then
    raise exception 'County is required';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  for i in 1..5 loop
    v_order_number := 'DIAT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));
    exit when not exists (select 1 from public.orders where order_number = v_order_number);
  end loop;

  insert into public.orders (
    customer_id, order_number, status, subtotal_kes, delivery_fee_kes, total_kes,
    shipping_full_name, shipping_phone, shipping_address, shipping_county, notes
  ) values (
    v_uid, v_order_number, 'pending_payment', 0, coalesce(p_delivery_fee, 0), 0,
    trim(p_full_name), trim(p_phone), trim(p_address), trim(p_county),
    nullif(trim(coalesce(p_notes, '')), '')
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid := (v_item ->> 'product_id')::uuid;
    v_qty := coalesce((v_item ->> 'quantity')::int, 0);

    if v_pid is null or v_qty <= 0 then
      raise exception 'Invalid cart item';
    end if;

    select price_kes, stock_quantity, name
      into v_price, v_stock, v_name
    from public.products
    where id = v_pid and is_active = true
    for update;

    if not found then
      raise exception 'Product not found or no longer available';
    end if;
    if v_stock < v_qty then
      raise exception 'Insufficient stock for %', v_name;
    end if;

    insert into public.order_items (order_id, product_id, quantity, price_at_purchase_kes, product_name_snapshot)
    values (v_order_id, v_pid, v_qty, v_price, v_name);

    v_subtotal := v_subtotal + v_price * v_qty;
    update public.products set stock_quantity = stock_quantity - v_qty where id = v_pid;
  end loop;

  v_total := v_subtotal + coalesce(p_delivery_fee, 0);

  update public.orders
  set subtotal_kes = v_subtotal, total_kes = v_total
  where id = v_order_id;

  return v_order_id;
end;
$fn$;

revoke execute on function public.place_order(text, text, text, text, text, numeric, jsonb) from anon;
grant execute on function public.place_order(text, text, text, text, text, numeric, jsonb) to authenticated;

create or replace function public.handle_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $trg$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p
    set stock_quantity = p.stock_quantity + oi.quantity
    from public.order_items oi
    where oi.order_id = new.id and oi.product_id = p.id;
  end if;
  new.updated_at = now();
  return new;
end;
$trg$;

drop trigger if exists orders_status_stock on public.orders;
create trigger orders_status_stock
  before update on public.orders
  for each row execute function public.handle_order_status_change();

-- ========== 4) VERIFICATION (read the output rows) ==========
select 'products_total' as check, count(*)::text as result from public.products
union all
select 'new_products_found', count(*)::text from public.products
  where slug in ('joint-care','diabetes-tea','mimosa-pudica','nutrisil-plus-natural-c')
union all
select 'is_admin_exists', count(*)::text from pg_proc where proname = 'is_admin'
union all
select 'place_order_exists', count(*)::text from pg_proc where proname = 'place_order'
union all
select 'product_images_bucket', count(*)::text from storage.buckets where id = 'product-images';
