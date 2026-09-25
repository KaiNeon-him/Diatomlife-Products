-- ============================================================
-- DIATOMLIFE SCHEMA - PART 1 of 4 (tables only)
-- Paste this ENTIRE file into Supabase SQL Editor -> New query -> Run
-- If it errors, tell me the EXACT error text + which line.
-- ============================================================

-- ---------- 1. PROFILES (extends auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- ---------- 2. USER ROLES (multiple admins supported) ----------
create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('customer', 'admin')),
  created_at timestamptz default now(),
  primary key (user_id, role)
);

-- ---------- 3. CATEGORIES ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- 4. PRODUCTS (with inventory tracking) ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  price_kes numeric(10,2) not null check (price_kes >= 0),
  image_url text,
  description text not null default '',
  holistic_story text,
  scientific_why text,
  ingredients text[],
  benefits text[],
  usage text,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(is_active);

-- ---------- 5. ORDERS (M-Pesa Send Money flow) ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null unique,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','payment_verified','processing','shipped','delivered','cancelled')),
  subtotal_kes numeric(10,2) not null,
  delivery_fee_kes numeric(10,2) not null default 0,
  total_kes numeric(10,2) not null,
  mpesa_transaction_code text,
  shipping_full_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_county text not null,
  notes text,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);

-- ---------- 6. ORDER ITEMS ----------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity int not null check (quantity > 0),
  price_at_purchase_kes numeric(10,2) not null,
  product_name_snapshot text not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------- 7. BLOG POSTS ----------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  excerpt text,
  featured_image_url text,
  author_id uuid references auth.users(id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- 8. FAQS ----------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- 9. CONTACT MESSAGES ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new','responded','archived')),
  created_at timestamptz default now()
);

-- ---------- 10. WISHLISTS ----------
create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);

-- ---------- 11. REVIEWS ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  verified_purchase boolean default false,
  created_at timestamptz default now(),
  unique (product_id, user_id)
);

-- ---------- 12. SETTINGS ----------
create table if not exists public.settings (
  key text primary key,
  value text not null,
  type text not null default 'string' check (type in ('string','number','boolean','json')),
  updated_at timestamptz default now()
);

insert into public.settings (key, value, type) values
  ('mpesa_business_name', 'Diatomlife', 'string'),
  ('mpesa_phone_number', '2547XXXXXXXX', 'string'),
  ('mpesa_shortcode', '', 'string'),
  ('delivery_info', 'We deliver nationwide via Fargo Courier. Delivery fee depends on distance/county and is confirmed before dispatch.', 'string'),
  ('site_email', 'info@diatomlife.co.ke', 'string')
on conflict (key) do nothing;
-- ============================================================
-- DIATOMLIFE SCHEMA - PART 2 of 4 (functions + triggers)
-- Run ONLY after Part 1 succeeded.
-- ============================================================

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- auto-create profile + customer role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict do nothing;

  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- ============================================================
-- DIATOMLIFE SCHEMA - PART 3 of 4 (RLS enable + policies)
-- Run ONLY after Parts 1 and 2 succeeded.
-- Each policy is created with IF NOT EXISTS logic via DO blocks,
-- so you can safely re-run this file if it fails halfway.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.blog_posts enable row level security;
alter table public.faqs enable row level security;
alter table public.contact_messages enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;
alter table public.settings enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- user_roles
drop policy if exists "roles_select_own_or_admin" on public.user_roles;
create policy "roles_select_own_or_admin" on public.user_roles for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "roles_admin_manage" on public.user_roles;
create policy "roles_admin_manage" on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

-- categories
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- products
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select using (is_active = true or public.is_admin());
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products for insert with check (public.is_admin());
drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products for update using (public.is_admin());
drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products for delete using (public.is_admin());

-- orders
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders for select using (auth.uid() = customer_id or public.is_admin());
drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = customer_id);
drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders for update using (public.is_admin());
drop policy if exists "orders_cancel_own_pending" on public.orders;
create policy "orders_cancel_own_pending" on public.orders for update using (auth.uid() = customer_id and status = 'pending_payment');

-- order items
drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin" on public.order_items for select using (
  public.is_admin() or exists (
    select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()
  )
);
drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
);

-- blog
drop policy if exists "blog_public_read_published" on public.blog_posts;
create policy "blog_public_read_published" on public.blog_posts for select using (published = true or public.is_admin());
drop policy if exists "blog_admin_write" on public.blog_posts;
create policy "blog_admin_write" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

-- faqs
drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs for select using (true);
drop policy if exists "faqs_admin_write" on public.faqs;
create policy "faqs_admin_write" on public.faqs for all using (public.is_admin()) with check (public.is_admin());

-- contact messages
drop policy if exists "contact_insert_public" on public.contact_messages;
create policy "contact_insert_public" on public.contact_messages for insert with check (true);
drop policy if exists "contact_admin_read" on public.contact_messages;
create policy "contact_admin_read" on public.contact_messages for select using (public.is_admin());
drop policy if exists "contact_admin_update" on public.contact_messages;
create policy "contact_admin_update" on public.contact_messages for update using (public.is_admin());

-- wishlists
drop policy if exists "wishlists_owner_all" on public.wishlists;
create policy "wishlists_owner_all" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reviews
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "reviews_update_own_or_admin" on public.reviews;
create policy "reviews_update_own_or_admin" on public.reviews for update using (auth.uid() = user_id or public.is_admin());
drop policy if exists "reviews_delete_own_or_admin" on public.reviews;
create policy "reviews_delete_own_or_admin" on public.reviews for delete using (auth.uid() = user_id or public.is_admin());

-- settings
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings for select using (true);
drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings for all using (public.is_admin()) with check (public.is_admin());
-- ============================================================
-- DIATOMLIFE SCHEMA - PART 4 of 4 (storage bucket policies)
-- Run ONLY after Part 3 succeeded.
--
-- NOTE: We do NOT insert into storage.buckets here — create the
-- 4 buckets manually in the dashboard (takes 30 seconds):
--   Storage -> New bucket -> for EACH of these names, PUBLIC bucket:
--     1. product-images
--     2. blog-images
--     3. user-avatars
--     4. category-banners
-- Then run this file to set the access policies.
-- ============================================================

drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read" on storage.objects for select using (bucket_id in
  ('product-images','blog-images','user-avatars','category-banners'));

drop policy if exists "storage_admin_insert" on storage.objects;
create policy "storage_admin_insert" on storage.objects for insert with check (public.is_admin());

drop policy if exists "storage_admin_update" on storage.objects;
create policy "storage_admin_update" on storage.objects for update using (public.is_admin());

drop policy if exists "storage_admin_delete" on storage.objects;
create policy "storage_admin_delete" on storage.objects for delete using (public.is_admin());
