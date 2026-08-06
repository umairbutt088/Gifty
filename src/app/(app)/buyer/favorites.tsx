import { useCallback, useMemo, useState } from 'react';

import { BuyerGiftGridView, CartHeaderButton } from '@/components/buyer';
import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useListRefresh } from '@/hooks/use-list-refresh';
import { fetchFavoriteGifts, toggleGiftFavorite } from '@/lib/gift-favorites';
import { fetchPublicVendorStores } from '@/lib/vendor-store';
import { useAuth } from '@/providers/auth-provider';
import type { VendorStorePublic } from '@/types/vendor';

export default function BuyerFavoritesScreen() {
  const { profile } = useAuth();
  const [vendorStores, setVendorStores] = useState<Map<string, VendorStorePublic>>(new Map());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async () => {
    if (!profile?.id) {
      setVendorStores(new Map());
      setFavoriteIds(new Set());
      return [];
    }

    const gifts = await fetchFavoriteGifts(profile.id);
    const vendorIds = [...new Set(gifts.map((gift) => gift.vendor_id))];
    const stores = await fetchPublicVendorStores(vendorIds);
    setVendorStores(stores);
    setFavoriteIds(new Set(gifts.map((gift) => gift.id)));
    return gifts;
  }, [profile?.id]);

  const { items: gifts, loading, refreshControl } = useListRefresh({
    load: loadFavorites,
  });

  const visibleGifts = useMemo(
    () => gifts.filter((gift) => favoriteIds.has(gift.id)),
    [favoriteIds, gifts],
  );

  async function handleToggleFavorite(giftId: string, favorited: boolean) {
    if (!profile?.id) return;

    setFavoriteIds((current) => {
      const next = new Set(current);
      if (favorited) next.delete(giftId);
      else next.add(giftId);
      return next;
    });

    const { favorited: nextFavorited, error } = await toggleGiftFavorite(
      profile.id,
      giftId,
      favorited,
    );
    if (error) {
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (favorited) next.add(giftId);
        else next.delete(giftId);
        return next;
      });
      return;
    }

    setFavoriteIds((current) => {
      const next = new Set(current);
      if (nextFavorited) next.add(giftId);
      else next.delete(giftId);
      return next;
    });
  }

  return (
    <ScreenShell
      backgroundVariant="minimal"
      scrollProps={{ refreshControl, keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title="Favorites"
        subtitle="Gifts you saved for later"
        showBanner={false}
        showBack
        backHref="/buyer"
        trailing={<CartHeaderButton />}
      />

      {loading ? (
        <ThemedActivityIndicator style={{ marginTop: 32 }} />
      ) : visibleGifts.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Tap the heart on any gift to save it here for quick browsing later."
        />
      ) : (
        <BuyerGiftGridView
          gifts={visibleGifts}
          vendorStores={vendorStores}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </ScreenShell>
  );
}
