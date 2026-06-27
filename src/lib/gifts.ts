import { deleteGiftImagesFromStorage } from '@/lib/gift-image-upload';
import { supabase } from '@/lib/supabase';
import type { GiftInput, GiftRow } from '@/types/vendor';

export async function fetchVendorGifts(vendorId: string): Promise<GiftRow[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('vendor_id', vendorId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as GiftRow[];
}

export async function fetchDeletedVendorGifts(vendorId: string): Promise<GiftRow[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('vendor_id', vendorId)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as GiftRow[];
}

export async function fetchLiveGifts(): Promise<GiftRow[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('status', 'live')
    .is('deleted_at', null)
    .gt('stock', 0)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as GiftRow[];
}

export async function fetchLiveGiftById(giftId: string): Promise<GiftRow | null> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('id', giftId)
    .eq('status', 'live')
    .is('deleted_at', null)
    .gt('stock', 0)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as GiftRow;
}

export async function fetchGiftById(giftId: string): Promise<GiftRow | null> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('id', giftId)
    .is('deleted_at', null)
    .maybeSingle();

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
    .is('deleted_at', null)
    .select('*')
    .single();

  return {
    data: (data as GiftRow | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}

export async function softDeleteGift(giftId: string): Promise<{ error: Error | null }> {
  const { data: gift, error: fetchError } = await supabase
    .from('gifts')
    .select('id')
    .eq('id', giftId)
    .is('deleted_at', null)
    .maybeSingle();

  if (fetchError) {
    return { error: new Error(fetchError.message) };
  }

  if (!gift) {
    return { error: new Error('Gift not found.') };
  }

  const { error } = await supabase
    .from('gifts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', giftId)
    .is('deleted_at', null);

  return { error: error ? new Error(error.message) : null };
}

export async function restoreGift(giftId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('gifts')
    .update({ deleted_at: null })
    .eq('id', giftId)
    .not('deleted_at', 'is', null);

  return { error: error ? new Error(error.message) : null };
}

export async function permanentlyDeleteGift(giftId: string): Promise<{ error: Error | null }> {
  const { data: gift, error: fetchError } = await supabase
    .from('gifts')
    .select('id, image_urls')
    .eq('id', giftId)
    .not('deleted_at', 'is', null)
    .maybeSingle();

  if (fetchError) {
    return { error: new Error(fetchError.message) };
  }

  if (!gift) {
    return { error: new Error('Gift not found.') };
  }

  const imageUrls = (gift.image_urls as string[]) ?? [];
  if (imageUrls.length > 0) {
    const { error: storageError } = await deleteGiftImagesFromStorage(imageUrls);
    if (storageError) {
      return { error: storageError };
    }
  }

  const { error } = await supabase.from('gifts').delete().eq('id', giftId).not('deleted_at', 'is', null);

  if (error) {
    const message = error.message.includes('violates foreign key')
      ? 'This gift has orders and cannot be permanently removed.'
      : error.message;

    return { error: new Error(message) };
  }

  return { error: null };
}

/** @deprecated Use softDeleteGift */
export async function deleteGift(giftId: string): Promise<{ error: Error | null }> {
  return softDeleteGift(giftId);
}
