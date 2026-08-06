import { deleteGiftImagesFromStorage } from '@/lib/gift-image-upload';
import { supabase } from '@/lib/supabase';
import type { GiftInput, GiftRow } from '@/types/vendor';

function normalizeGift(row: GiftRow): GiftRow {
  return {
    ...row,
    original_price_cents: row.original_price_cents ?? null,
    featured: Boolean(row.featured),
    sales_count: row.sales_count ?? 0,
    prep_time_minutes: row.prep_time_minutes ?? null,
    rating_avg: Number(row.rating_avg ?? 0),
    rating_count: row.rating_count ?? 0,
    occasion_tags: Array.isArray(row.occasion_tags) ? row.occasion_tags : [],
  };
}

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

  return (data as GiftRow[]).map(normalizeGift);
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

  return (data as GiftRow[]).map(normalizeGift);
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

  return (data as GiftRow[]).map(normalizeGift);
}

export async function fetchLiveGiftsByVendor(vendorId: string): Promise<GiftRow[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('status', 'live')
    .is('deleted_at', null)
    .gt('stock', 0)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as GiftRow[]).map(normalizeGift);
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

  return normalizeGift(data as GiftRow);
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

  return normalizeGift(data as GiftRow);
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
      original_price_cents: input.originalPriceCents ?? null,
      category: input.category,
      stock: input.stock,
      status: input.status ?? 'live',
      image_urls: input.imageUrls,
      featured: input.featured ?? false,
      prep_time_minutes: input.prepTimeMinutes ?? null,
      occasion_tags: input.occasionTags ?? [],
    })
    .select('*')
    .single();

  return {
    data: data ? normalizeGift(data as GiftRow) : null,
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
  if (input.originalPriceCents !== undefined) {
    payload.original_price_cents = input.originalPriceCents;
  }
  if (input.category !== undefined) payload.category = input.category;
  if (input.stock !== undefined) payload.stock = input.stock;
  if (input.status !== undefined) payload.status = input.status;
  if (input.imageUrls !== undefined) payload.image_urls = input.imageUrls;
  if (input.featured !== undefined) payload.featured = input.featured;
  if (input.prepTimeMinutes !== undefined) payload.prep_time_minutes = input.prepTimeMinutes;
  if (input.occasionTags !== undefined) payload.occasion_tags = input.occasionTags;

  const { data, error } = await supabase
    .from('gifts')
    .update(payload)
    .eq('id', giftId)
    .is('deleted_at', null)
    .select('*')
    .single();

  // If occasion_tags migration is not applied yet, retry without that column so
  // the rest of the listing edits still save.
  if (
    error &&
    input.occasionTags !== undefined &&
    /occasion_tags/i.test(error.message)
  ) {
    const { occasion_tags: _ignored, ...withoutOccasions } = payload;
    const retry = await supabase
      .from('gifts')
      .update(withoutOccasions)
      .eq('id', giftId)
      .is('deleted_at', null)
      .select('*')
      .single();

    return {
      data: retry.data ? normalizeGift(retry.data as GiftRow) : null,
      error: retry.error
        ? new Error(retry.error.message)
        : new Error(
            'Gift saved, but occasion tags need migration 20240619133921_gift_occasion_tags.sql applied in Supabase.',
          ),
    };
  }

  return {
    data: data ? normalizeGift(data as GiftRow) : null,
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
