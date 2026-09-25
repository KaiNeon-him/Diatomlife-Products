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
