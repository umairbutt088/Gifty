import { supabase } from '@/lib/supabase';
import type { GiftReviewRow } from '@/types/vendor';

export async function fetchGiftReviews(giftId: string): Promise<GiftReviewRow[]> {
  const { data, error } = await supabase
    .from('gift_reviews')
    .select('*')
    .eq('gift_id', giftId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as GiftReviewRow[];
}

export async function fetchBuyerGiftReview(
  giftId: string,
  buyerId: string,
): Promise<GiftReviewRow | null> {
  const { data, error } = await supabase
    .from('gift_reviews')
    .select('*')
    .eq('gift_id', giftId)
    .eq('buyer_id', buyerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as GiftReviewRow;
}

export async function upsertGiftReview(input: {
  giftId: string;
  buyerId: string;
  rating: number;
  comment?: string | null;
}): Promise<{ data: GiftReviewRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('gift_reviews')
    .upsert(
      {
        gift_id: input.giftId,
        buyer_id: input.buyerId,
        rating: input.rating,
        comment: input.comment?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'gift_id,buyer_id' },
    )
    .select('*')
    .single();

  return {
    data: (data as GiftReviewRow | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}

export async function canBuyerReviewGift(giftId: string, buyerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .select('id')
    .eq('gift_id', giftId)
    .eq('buyer_id', buyerId)
    .eq('status', 'delivered')
    .limit(1);

  if (error || !data) {
    return false;
  }

  return data.length > 0;
}
