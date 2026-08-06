import { supabase } from '@/lib/supabase';
import type { GiftVariantInput, GiftVariantRow } from '@/types/vendor';

export async function fetchGiftVariants(giftId: string): Promise<GiftVariantRow[]> {
  const { data, error } = await supabase
    .from('gift_variants')
    .select('*')
    .eq('gift_id', giftId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as GiftVariantRow[];
}

/** Lowest variant price per gift when that gift has options. */
export async function fetchStartingFromPrices(
  giftIds: string[],
): Promise<Map<string, number>> {
  if (giftIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('gift_variants')
    .select('gift_id, price_cents')
    .in('gift_id', giftIds);

  if (error || !data) {
    return new Map();
  }

  const mins = new Map<string, number>();
  for (const row of data) {
    const giftId = row.gift_id as string;
    const price = row.price_cents as number;
    const current = mins.get(giftId);
    if (current == null || price < current) {
      mins.set(giftId, price);
    }
  }
  return mins;
}

export async function replaceGiftVariants(
  giftId: string,
  variants: GiftVariantInput[],
): Promise<{ data: GiftVariantRow[]; error: Error | null }> {
  const { error: deleteError } = await supabase.from('gift_variants').delete().eq('gift_id', giftId);

  if (deleteError) {
    return { data: [], error: new Error(deleteError.message) };
  }

  const cleaned = variants
    .map((variant, index) => ({
      gift_id: giftId,
      label: variant.label.trim(),
      price_cents: variant.priceCents,
      stock: variant.stock,
      sort_order: variant.sortOrder ?? index,
    }))
    .filter((variant) => variant.label.length > 0);

  if (cleaned.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase.from('gift_variants').insert(cleaned).select('*');

  return {
    data: (data as GiftVariantRow[] | null) ?? [],
    error: error ? new Error(error.message) : null,
  };
}
