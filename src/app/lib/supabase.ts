import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Helpful warning during development until you paste your new project keys into .env
  console.warn(
    'Supabase env vars missing. Copy .env.example to .env and add your new project URL + anon key.'
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key'
);

// ---------- Types matching our database schema ----------

export type OrderStatus =
  | 'pending_payment'
  | 'payment_verified'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  price_kes: number;
  image_url: string | null;
  description: string;
  holistic_story: string | null;
  scientific_why: string | null;
  ingredients: string[] | null;
  benefits: string[] | null;
  usage: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  categories?: Pick<Category, 'name' | 'slug'>;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase_kes: number;
  products?: Pick<Product, 'name' | 'image_url' | 'slug'>;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal_kes: number;
  delivery_fee_kes: number;
  total_kes: number;
  mpesa_transaction_code: string | null;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_county: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
}

export interface Setting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

// Time-based order number: DIAT-YYYYMMDD-XXXX (random suffix)
export function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DIAT-${ymd}-${rand}`;
}
