import type { GiftRow, GiftVariantRow } from '@/types/vendor';

export function getGiftDiscountPercent(gift: GiftRow): number | null {
  if (
    gift.original_price_cents == null ||
    gift.original_price_cents <= gift.price_cents ||
    gift.original_price_cents <= 0
  ) {
    return null;
  }

  return Math.round(
    ((gift.original_price_cents - gift.price_cents) / gift.original_price_cents) * 100,
  );
}

export function getGiftEffectivePrice(
  gift: GiftRow,
  variant?: GiftVariantRow | null,
): number {
  return variant?.price_cents ?? gift.price_cents;
}

export function getGiftAvailableStock(
  gift: GiftRow,
  variant?: GiftVariantRow | null,
): number {
  return variant?.stock ?? gift.stock;
}

export function formatGiftRating(gift: GiftRow): string | null {
  if (!gift.rating_count || gift.rating_count <= 0) {
    return null;
  }

  return `${Number(gift.rating_avg).toFixed(1)} (${gift.rating_count})`;
}

export function formatPrepTime(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min prep`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m prep` : `${hours}h prep`;
}
