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
