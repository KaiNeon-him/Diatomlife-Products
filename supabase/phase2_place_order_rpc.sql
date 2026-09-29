-- Diatomlife — Phase 2: place_order RPC + stock trigger fix
-- Paste this whole file into the Supabase SQL Editor and click Run.
-- Safe to re-run (idempotent). Run AFTER full_setup.sql and seed_products_v3.sql.
-- RLS is only disabled while CREATE FUNCTION runs, then restored at the end.

alter table public.products disable row level security;

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

alter table public.products enable row level security;
