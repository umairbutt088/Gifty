import { supabase } from '@/lib/supabase';
import type { GiftInput, GiftRow } from '@/types/vendor';

export async function fetchVendorGifts(vendorId: string): Promise<GiftRow[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as GiftRow[];
}

export async function fetchGiftById(giftId: string): Promise<GiftRow | null> {
  const { data, error } = await supabase.from('gifts').select('*').eq('id', giftId).maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as GiftRow;
}

export async function createGift(
  vendorId: string,
  input: GiftInput,
): Promise<{ data: GiftRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('gifts')
    .insert({
      vendor_id: vendorId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      price_cents: input.priceCents,
      category: input.category,
      stock: input.stock,
      status: input.status ?? 'live',
      image_urls: input.imageUrls,
    })
    .select('*')
    .single();

  return {
    data: (data as GiftRow | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}

export async function updateGift(
  giftId: string,
  input: Partial<GiftInput>,
): Promise<{ data: GiftRow | null; error: Error | null }> {
  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) payload.description = input.description?.trim() || null;
  if (input.priceCents !== undefined) payload.price_cents = input.priceCents;
  if (input.category !== undefined) payload.category = input.category;
  if (input.stock !== undefined) payload.stock = input.stock;
  if (input.status !== undefined) payload.status = input.status;
  if (input.imageUrls !== undefined) payload.image_urls = input.imageUrls;

  const { data, error } = await supabase
    .from('gifts')
    .update(payload)
    .eq('id', giftId)
    .select('*')
    .single();

  return {
    data: (data as GiftRow | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}

export async function deleteGift(giftId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('gifts').delete().eq('id', giftId);
  return { error: error ? new Error(error.message) : null };
}
