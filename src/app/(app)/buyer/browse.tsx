import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import {
  BuyerGiftGridView,
  CartHeaderButton,
  MarketplaceDiscoveryControls,
  type MarketplaceCategory,
  type MarketplaceOccasion,
  type MarketplaceSort,
} from '@/components/buyer';
import { DashboardHeader, ScreenShell } from '@/components/dashboard';
import { GlassCard } from '@/components/glass-card';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { Spacing } from '@/constants/theme';
import { GIFT_CATEGORIES, GIFT_OCCASIONS } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
import { useListRefresh } from '@/hooks/use-list-refresh';
import { getStoredDeliveryCity } from '@/lib/delivery-city-storage';
import { fetchFavoriteGiftIds, toggleGiftFavorite } from '@/lib/gift-favorites';
import { fetchStartingFromPrices } from '@/lib/gift-variants';
import { fetchLiveGifts } from '@/lib/gifts';
import { giftAvailableInDeliveryCity } from '@/lib/vendor-store-helpers';
import { fetchPublicVendorStores } from '@/lib/vendor-store';
import { useAuth } from '@/providers/auth-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftCategory, GiftOccasion, VendorStorePublic } from '@/types/vendor';

function parseCategory(value: string | undefined): MarketplaceCategory {
  if (!value || value === 'all') return 'all';
  return GIFT_CATEGORIES.some((item) => item.value === value)
    ? (value as GiftCategory)
    : 'all';
}

function parseOccasion(value: string | undefined): MarketplaceOccasion {
  if (!value || value === 'all') return 'all';
  return GIFT_OCCASIONS.some((item) => item.value === value)
    ? (value as GiftOccasion)
    : 'all';
}

export default function BuyerBrowseScreen() {
  const params = useLocalSearchParams<{
    category?: string;
    occasion?: string;
    title?: string;
    mode?: string;
  }>();
  const { profile } = useAuth();
  const colors = useColors();
  const theme = useScreenTheme();
  const [vendorStores, setVendorStores] = useState<Map<string, VendorStorePublic>>(new Map());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [startingFromByGiftId, setStartingFromByGiftId] = useState<Map<string, number>>(
    new Map(),
  );
  const [deliveryCity, setDeliveryCity] = useState<string | null>(null);
  const [category, setCategory] = useState<MarketplaceCategory>(() =>
    parseCategory(params.category),
  );
  const [occasion, setOccasion] = useState<MarketplaceOccasion>(() =>
    parseOccasion(params.occasion),
  );
  const [sort, setSort] = useState<MarketplaceSort>('newest');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setCategory(parseCategory(params.category));
    setOccasion(parseOccasion(params.occasion));
  }, [params.category, params.occasion]);

  useEffect(() => {
    void getStoredDeliveryCity().then(setDeliveryCity);
  }, []);

  const loadGifts = useCallback(async () => {
    const gifts = await fetchLiveGifts();
    const vendorIds = [...new Set(gifts.map((gift) => gift.vendor_id))];
    const [stores, startingFrom, favorites] = await Promise.all([
      fetchPublicVendorStores(vendorIds),
      fetchStartingFromPrices(gifts.map((gift) => gift.id)),
      profile?.id ? fetchFavoriteGiftIds(profile.id) : Promise.resolve(new Set<string>()),
    ]);
    setVendorStores(stores);
    setStartingFromByGiftId(startingFrom);
    setFavoriteIds(favorites);
    return gifts;
  }, [profile?.id]);

  const { items: gifts, loading, refreshControl } = useListRefresh({ load: loadGifts });

  const visibleGifts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const mode = params.mode;
    const matches = gifts.filter((gift) => {
      if (!giftAvailableInDeliveryCity(vendorStores.get(gift.vendor_id), deliveryCity)) {
        return false;
      }
      if (category !== 'all' && gift.category !== category) return false;
      if (occasion !== 'all' && !(gift.occasion_tags ?? []).includes(occasion)) return false;
      if (mode === 'deals') {
        if (
          gift.original_price_cents == null ||
          gift.original_price_cents <= gift.price_cents
        ) {
          return false;
        }
      }
      if (mode === 'featured' && !gift.featured) return false;
      if (mode === 'combos' && gift.category !== 'custom' && gift.category !== 'experience') {
        return false;
      }
      if (!normalizedQuery) return true;
      const storeName = vendorStores.get(gift.vendor_id)?.name ?? '';
      return [gift.title, gift.description ?? '', storeName].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      );
    });

    return [...matches].sort((left, right) => {
      if (mode === 'bestsellers') {
        if (right.sales_count !== left.sales_count) {
          return right.sales_count - left.sales_count;
        }
        return Number(right.rating_avg) - Number(left.rating_avg);
      }
      if (mode === 'new' || sort === 'newest') {
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      }
      if (sort === 'price_low') return left.price_cents - right.price_cents;
      if (sort === 'price_high') return right.price_cents - left.price_cents;
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    });
  }, [category, deliveryCity, gifts, occasion, params.mode, query, sort, vendorStores]);

  const title =
    typeof params.title === 'string' && params.title.trim()
      ? params.title
      : category !== 'all'
        ? (GIFT_CATEGORIES.find((item) => item.value === category)?.label ?? 'Browse')
        : occasion !== 'all'
          ? (GIFT_OCCASIONS.find((item) => item.value === occasion)?.label ?? 'Browse')
          : 'Browse gifts';

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
        title={title}
        subtitle={
          deliveryCity ? `Delivering to ${deliveryCity}` : 'Gifts from local sellers'
        }
        showBanner={false}
        showBack
        backHref="/buyer"
        trailing={<CartHeaderButton />}
      />

      <MarketplaceDiscoveryControls
        query={query}
        sort={sort}
        onQueryChange={setQuery}
        onSortChange={setSort}
      />

      {loading ? (
        <ThemedActivityIndicator style={{ marginTop: 24 }} />
      ) : visibleGifts.length === 0 ? (
        <GlassCard variant="nested" style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No matching gifts</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Try another filter or go back to the home catalog.
          </Text>
          <Pressable
            onPress={() => router.replace('/buyer')}
            style={({ pressed }) => [
              styles.backHome,
              { backgroundColor: theme.accentMuted },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.backHomeText, { color: theme.accentLight }]}>Back to home</Text>
          </Pressable>
        </GlassCard>
      ) : (
        <BuyerGiftGridView
          gifts={visibleGifts}
          vendorStores={vendorStores}
          deliveryCity={deliveryCity}
          favoriteIds={favoriteIds}
          startingFromByGiftId={startingFromByGiftId}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  backHome: {
    alignSelf: 'center',
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backHomeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
});
