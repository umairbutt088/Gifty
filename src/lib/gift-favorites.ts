import { fetchLiveGifts } from '@/lib/gifts';
import { supabase } from '@/lib/supabase';
import type { GiftRow } from '@/types/vendor';

export async function fetchFavoriteGiftIds(buyerId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('gift_favorites')
    .select('gift_id')
    .eq('buyer_id', buyerId);

  if (error || !data) {
    return new Set();
  }

  return new Set(data.map((row) => row.gift_id as string));
}

export async function fetchFavoriteGifts(buyerId: string): Promise<GiftRow[]> {
  const favoriteIds = await fetchFavoriteGiftIds(buyerId);
  if (favoriteIds.size === 0) return [];

  const gifts = await fetchLiveGifts();
  const order = new Map([...favoriteIds].map((id, index) => [id, index]));

  return gifts
    .filter((gift) => favoriteIds.has(gift.id))
    .sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
}

export async function toggleGiftFavorite(
  buyerId: string,
  giftId: string,
  favorited: boolean,
): Promise<{ favorited: boolean; error: Error | null }> {
  if (favorited) {
    const { error } = await supabase
      .from('gift_favorites')
      .delete()
      .eq('buyer_id', buyerId)
      .eq('gift_id', giftId);

    return {
      favorited: false,
      error: error ? new Error(error.message) : null,
    };
  }

  const { error } = await supabase.from('gift_favorites').insert({
    buyer_id: buyerId,
    gift_id: giftId,
  });

  return {
    favorited: true,
    error: error ? new Error(error.message) : null,
  };
}
