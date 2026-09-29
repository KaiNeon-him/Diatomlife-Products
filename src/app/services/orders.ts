import { supabase, generateOrderNumber, type Order } from '../lib/supabase';

export interface PlaceOrderInput {
  fullName: string;
  phone: string;
  address: string;
  county: string;
  notes?: string;
  deliveryFeeKes: number;
  items: { productId: string; quantity: number }[];
}

/**
 * Places an order through the `place_order` Postgres RPC so that stock
 * validation + decrement happens atomically server-side.
 * Requires: supabase/phase2_place_order_rpc.sql applied in the SQL Editor.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<string> {
  const { data, error } = await supabase.rpc('place_order', {
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_address: input.address,
    p_county: input.county,
    p_notes: input.notes ?? null,
    p_delivery_fee: input.deliveryFeeKes,
    p_items: input.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
  });
  if (error) throw new Error(error.message);
  return data as string;
}

/**
 * Fallback path (used only if the RPC hasn't been deployed yet).
 * Inserts the order + items directly via RLS-allowed policies.
 * NOTE: does not decrement stock — deploy the RPC for full inventory tracking.
 */
export async function placeOrderFallback(
  input: PlaceOrderInput,
  pricesAndNames: Record<string, { price: number; name: string }>
): Promise<Order> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('You must be signed in to place an order.');

  const subtotal = input.items.reduce(
    (s, i) => s + Number(pricesAndNames[i.productId]?.price ?? 0) * i.quantity,
    0
  );
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      customer_id: userId,
      order_number: orderNumber,
      status: 'pending_payment',
      subtotal_kes: subtotal,
      delivery_fee_kes: input.deliveryFeeKes,
      total_kes: subtotal + input.deliveryFeeKes,
      shipping_full_name: input.fullName,
      shipping_phone: input.phone,
      shipping_address: input.address,
      shipping_county: input.county,
      notes: input.notes || null,
    })
    .select()
    .single();
  if (orderErr) throw new Error(orderErr.message);

  const items = input.items.map((i) => ({
    order_id: order.id,
    product_id: i.productId,
    quantity: i.quantity,
    price_at_purchase_kes: pricesAndNames[i.productId]?.price ?? 0,
    product_name_snapshot: pricesAndNames[i.productId]?.name ?? 'Product',
  }));
  const { error: itemsErr } = await supabase.from('order_items').insert(items);
  if (itemsErr) throw new Error(itemsErr.message);

  return order as Order;
}

/** Attach the M-Pesa transaction code after the customer sends the money. */
export async function setOrderTransactionCode(orderId: string, code: string): Promise<void> {
  // Customers can update their own pending_payment orders (RLS policy),
  // but only the transaction code column is touched here.
  const { error } = await supabase
    .from('orders')
    .update({ mpesa_transaction_code: code.trim().toUpperCase() })
    .eq('id', orderId)
    .eq('status', 'pending_payment');
  if (error) throw new Error(error.message);
}

/** Cancel a still-pending order (RLS restricts this to pending_payment rows). */
export async function cancelOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .eq('status', 'pending_payment');
  if (error) throw new Error(error.message);
}

/** Current user's orders, newest first, with line items. */
export async function fetchMyOrders(): Promise<Order[]> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Order | null;
}
