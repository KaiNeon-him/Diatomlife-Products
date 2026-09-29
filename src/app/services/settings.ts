import { supabase, type Setting } from '../lib/supabase';

let cachedSettings: Record<string, string> | null = null;

/** Load site settings (M-Pesa number, delivery info, etc.). Public read via RLS. */
export async function fetchSettings(force = false): Promise<Record<string, string>> {
  if (cachedSettings && !force) return cachedSettings;
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw new Error(error.message);
  const map: Record<string, string> = {};
  for (const s of (data ?? []) as Setting[]) map[s.key] = s.value;
  cachedSettings = map;
  return map;
}

// ---------- Kenya counties (47) ----------
export const KENYA_COUNTIES = [
  'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
  'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni',
  'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Muranga', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya',
  'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot',
];

// Distance-based fee tiers for Fargo Courier (KES). Admin-adjustable later (Phase 3/4).
const FEE_TIERS: Record<string, number> = {
  // Zone 1 — Nairobi & immediate surrounds
  'Nairobi': 200,  'Kiambu': 250,  'Machakos': 300,  'Kajiado': 300,  'Nakuru': 350,
  // Zone 2 — Central / Rift Valley / Western towns
  'Muranga': 350,  'Nyeri': 350,  'Kirinyaga': 400,  'Laikipia': 400,  'Bomet': 400,
  'Kericho': 400,  'Nyandarua': 400,  'Embu': 400,  'Kitui': 400,  'Kisumu': 400,  'Siaya': 400,
  'Migori': 450,  'Homa Bay': 450,  'Nyamira': 400,  'Kisii': 400,  'Vihiga': 450,  'Kakamega': 450,
  'Bungoma': 500,  'Busia': 500,  'Trans Nzoia': 500,  'Uasin Gishu': 450,  'Nandi': 450,
  'Elgeyo-Marakwet': 450,  'West Pokot': 500,  'Turkana': 600,  'Samburu': 550,  'Isiolo': 500,
  'Meru': 450,  'Tharaka-Nithi': 450,  'Makueni': 350,  'Taita-Taveta': 500,
  // Zone 3 — Coast & North-Eastern
  'Mombasa': 500,  'Kwale': 550,  'Kilifi': 550,  'Lamu': 650,  'Tana River': 650,  'Garissa': 600,
  'Wajir': 700,  'Marsabit': 700,  'Mandera': 750,
};

export function deliveryFeeForCounty(county: string): number {
  return FEE_TIERS[county] ?? 500; // sensible default for unlisted counties
}
