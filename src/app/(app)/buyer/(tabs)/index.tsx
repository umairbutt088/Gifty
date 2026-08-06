import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  BuyerGiftGridView,
  DeliveryCityControl,
  MarketplaceCategoryGrid,
  MarketplaceDiscoveryControls,
  MarketplaceGiftRail,
  MarketplaceHomeHeader,
  MarketplaceHomeSkeleton,
  MarketplaceIconRibbon,
  MarketplacePromoHero,
  MarketplaceRecipientTiles,
  MarketplaceSectionHeader,
  MarketplaceTrustStrip,
  type MarketplaceCategory,
  type MarketplaceOccasion,
  type MarketplaceRibbonKey,
  type MarketplaceSort,
} from '@/components/buyer';
import { EmptyState, ScreenShell } from '@/components/dashboard';
import { GlassCard } from '@/components/glass-card';
import { Spacing } from '@/constants/theme';
import { GIFT_CATEGORIES, GIFT_OCCASIONS } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
import { useListRefresh } from '@/hooks/use-list-refresh';
import {
  getStoredDeliveryCity,
  setStoredDeliveryCity,
} from '@/lib/delivery-city-storage';
import { fetchFavoriteGiftIds, toggleGiftFavorite } from '@/lib/gift-favorites';
import { fetchStartingFromPrices } from '@/lib/gift-variants';
import { fetchLiveGifts } from '@/lib/gifts';
import { giftAvailableInDeliveryCity } from '@/lib/vendor-store-helpers';
import { fetchPublicVendorStores } from '@/lib/vendor-store';
import { useAuth } from '@/providers/auth-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftCategory, VendorStorePublic } from '@/types/vendor';

function browseHref(input: {
  category?: MarketplaceCategory;
  occasion?: MarketplaceOccasion;
  title?: string;
  mode?: 'deals' | 'featured' | 'new' | 'bestsellers';
}): Href {
  const params = new URLSearchParams();
  if (input.category && input.category !== 'all') params.set('category', input.category);
  if (input.occasion && input.occasion !== 'all') params.set('occasion', input.occasion);
  if (input.title) params.set('title', input.title);
  if (input.mode) params.set('mode', input.mode);
  const query = params.toString();
  return (query ? `/buyer/browse?${query}` : '/buyer/browse') as Href;
}

export default function BuyerGiftsTabScreen() {
  const { profile } = useAuth();
  const colors = useColors();
  const theme = useScreenTheme();
  const searchRef = useRef<TextInput>(null);
  const feedScrollRef = useRef<ScrollView>(null);
  const [vendorStores, setVendorStores] = useState<Map<string, VendorStorePublic>>(new Map());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [startingFromByGiftId, setStartingFromByGiftId] = useState<Map<string, number>>(
    new Map(),
  );
  const [deliveryCity, setDeliveryCity] = useState<string | null>(null);
  const [cityReady, setCityReady] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('all');
  const [occasion, setOccasion] = useState<MarketplaceOccasion>('all');
  const [sort, setSort] = useState<MarketplaceSort>('newest');
  const [bestsellerPill, setBestsellerPill] = useState<GiftCategory | 'all'>('all');

  useEffect(() => {
    let active = true;
    void getStoredDeliveryCity().then((city) => {
      if (!active) return;
      setDeliveryCity(city);
      setCityReady(true);
    });
    return () => {
      active = false;
    };
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

  const { items: gifts, loading, refreshControl } = useListRefresh({
    load: loadGifts,
  });

  const normalizedQuery = query.trim().toLocaleLowerCase();

  const cityFilteredGifts = useMemo(
    () =>
      gifts.filter((gift) =>
        giftAvailableInDeliveryCity(vendorStores.get(gift.vendor_id), deliveryCity),
      ),
    [deliveryCity, gifts, vendorStores],
  );

  const visibleGifts = useMemo(() => {
    const matches = cityFilteredGifts.filter((gift) => {
      if (category !== 'all' && gift.category !== category) return false;
      if (occasion !== 'all' && !(gift.occasion_tags ?? []).includes(occasion)) return false;
      if (!normalizedQuery) return true;
      const storeName = vendorStores.get(gift.vendor_id)?.name ?? '';
      return [gift.title, gift.description ?? '', storeName].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      );
    });

    return [...matches].sort((left, right) => {
      if (sort === 'price_low') return left.price_cents - right.price_cents;
      if (sort === 'price_high') return right.price_cents - left.price_cents;
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    });
  }, [category, cityFilteredGifts, normalizedQuery, occasion, sort, vendorStores]);

  const hasActiveFilters =
    normalizedQuery.length > 0 || category !== 'all' || occasion !== 'all';

  const feedScrollKey = `${category}|${occasion}|${normalizedQuery}|${hasActiveFilters ? 'f' : 'h'}`;

  const curated = useMemo(() => {
    const featured = cityFilteredGifts.filter((gift) => gift.featured);
    const carousel =
      featured.length > 0
        ? featured.slice(0, 5)
        : [...cityFilteredGifts]
            .sort((left, right) => right.sales_count - left.sales_count)
            .slice(0, 5);
    const popular = [...cityFilteredGifts].sort((left, right) => {
      if (right.sales_count !== left.sales_count) {
        return right.sales_count - left.sales_count;
      }
      return Number(right.rating_avg) - Number(left.rating_avg);
    });
    const bestsellers =
      bestsellerPill === 'all'
        ? popular.slice(0, 10)
        : popular.filter((gift) => gift.category === bestsellerPill).slice(0, 10);
    const deals = cityFilteredGifts
      .filter(
        (gift) =>
          gift.original_price_cents != null && gift.original_price_cents > gift.price_cents,
      )
      .slice(0, 10);
    const newest = [...cityFilteredGifts]
      .sort(
        (left, right) =>
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      )
      .slice(0, 10);
    const trending = popular.slice(0, 10);

    return { carousel, bestsellers, deals, newest, trending };
  }, [bestsellerPill, cityFilteredGifts]);

  const storeNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const [id, store] of vendorStores) {
      map.set(id, store.name);
    }
    return map;
  }, [vendorStores]);

  const storeCities = useMemo(() => {
    const cities = new Set<string>();
    for (const store of vendorStores.values()) {
      for (const city of store.delivery_cities) {
        if (city.trim()) cities.add(city.trim());
      }
    }
    return [...cities];
  }, [vendorStores]);

  const bestsellerPills = useMemo(() => {
    const present = new Set(cityFilteredGifts.map((gift) => gift.category));
    return [
      { value: 'all' as const, label: 'All' },
      ...GIFT_CATEGORIES.filter((item) => present.has(item.value)).map((item) => ({
        value: item.value,
        label: item.label,
      })),
    ];
  }, [cityFilteredGifts]);

  function handleRibbonSelect(key: MarketplaceRibbonKey) {
    if (key.kind === 'all') {
      setCategory('all');
      setOccasion('all');
      return;
    }
    if (key.kind === 'category') {
      setCategory(key.value);
      setOccasion('all');
      return;
    }
    setOccasion(key.value);
    setCategory('all');
  }

  function clearFilters() {
    setQuery('');
    setCategory('all');
    setOccasion('all');
    setSort('newest');
  }

  async function handleDeliveryCityChange(city: string | null) {
    setDeliveryCity(city);
    await setStoredDeliveryCity(city);
  }

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

  const showSkeleton = loading || !cityReady;

  const resultsSection = (
    <View style={styles.resultsBlock}>
      <MarketplaceSectionHeader
        title={hasActiveFilters ? 'Results' : 'All gifts'}
        subtitle={
          hasActiveFilters
            ? [
                category !== 'all'
                  ? GIFT_CATEGORIES.find((item) => item.value === category)?.label
                  : null,
                occasion !== 'all'
                  ? GIFT_OCCASIONS.find((item) => item.value === occasion)?.label
                  : null,
                normalizedQuery ? `"${query.trim()}"` : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Matching gifts'
            : deliveryCity
              ? `Available in ${deliveryCity}`
              : 'Everything nearby'
        }
        trailing={
          <View style={[styles.countBadge, { backgroundColor: theme.surfaceNested }]}>
            <Text style={[styles.countBadgeText, { color: colors.text }]}>
              {visibleGifts.length}
            </Text>
          </View>
        }
      />

      <MarketplaceDiscoveryControls
        query={query}
        sort={sort}
        onQueryChange={setQuery}
        onSortChange={setSort}
        showSearch={false}
        showSort
      />

      {visibleGifts.length > 0 ? (
        <BuyerGiftGridView
          gifts={visibleGifts}
          vendorStores={vendorStores}
          deliveryCity={deliveryCity}
          favoriteIds={favoriteIds}
          startingFromByGiftId={startingFromByGiftId}
          marketplaceStyle
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <GlassCard variant="nested" style={styles.noResults}>
          <Text style={[styles.noResultsTitle, { color: colors.text }]}>No matching gifts</Text>
          <Text style={[styles.noResultsBody, { color: colors.textSecondary }]}>
            Try another city or clear filters.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={clearFilters}
            style={({ pressed }) => [
              styles.clearButton,
              { borderColor: theme.surfaceBorder },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.clearButtonText, { color: colors.text }]}>Clear filters</Text>
          </Pressable>
        </GlassCard>
      )}
    </View>
  );

  return (
    <ScreenShell
      backgroundVariant="minimal"
      scrollRef={feedScrollRef}
      scrollKey={feedScrollKey}
      scrollProps={{
        refreshControl,
        keyboardShouldPersistTaps: 'handled',
      }}>
      <MarketplaceHomeHeader
        favoriteCount={favoriteIds.size}
        onSearchPress={() => {
          requestAnimationFrame(() => searchRef.current?.focus());
        }}
      />

      {cityReady ? (
        <DeliveryCityControl
          city={deliveryCity}
          extraCities={storeCities}
          onCityChange={(city) => void handleDeliveryCityChange(city)}
        />
      ) : null}

      {showSkeleton ? (
        <MarketplaceHomeSkeleton />
      ) : gifts.length === 0 ? (
        <EmptyState
          title="No gifts available yet"
          message="When vendors publish live gifts, they will appear here for you to browse and send."
        />
      ) : (
        <>
          <MarketplaceDiscoveryControls
            query={query}
            sort={sort}
            onQueryChange={setQuery}
            onSortChange={setSort}
            searchInputRef={searchRef}
            showSearch
            showSort={false}
          />

          {hasActiveFilters ? (
            <View style={styles.filteredFeed}>
              <MarketplaceIconRibbon
                category={category}
                occasion={occasion}
                onSelect={handleRibbonSelect}
              />
              {resultsSection}
            </View>
          ) : (
            <>
              <MarketplaceIconRibbon
                category={category}
                occasion={occasion}
                onSelect={handleRibbonSelect}
              />

              <MarketplacePromoHero
                gifts={curated.carousel}
                storeNames={storeNames}
                deliveryCity={deliveryCity}
                hasDeals={curated.deals.length > 0}
                onBrowseDeals={() =>
                  router.push(browseHref({ title: 'Deals', mode: 'deals' }))
                }
              />

              <MarketplaceCategoryGrid
                gifts={cityFilteredGifts}
                onSelect={handleRibbonSelect}
                onViewAll={() => router.push(browseHref({ title: 'All gifts' }))}
              />

              <MarketplaceRecipientTiles
                gifts={cityFilteredGifts}
                onSelectOccasion={(value) => {
                  setOccasion(value);
                  setCategory('all');
                }}
              />

              <MarketplaceTrustStrip />

              <MarketplaceGiftRail
                title="Bestsellers"
                subtitle="What shoppers love right now"
                gifts={curated.bestsellers}
                vendorStores={vendorStores}
                deliveryCity={deliveryCity}
                favoriteIds={favoriteIds}
                startingFromByGiftId={startingFromByGiftId}
                onToggleFavorite={handleToggleFavorite}
                subPills={bestsellerPills}
                activeSubPill={bestsellerPill}
                onSubPillChange={setBestsellerPill}
                onViewAll={() =>
                  router.push(
                    browseHref({
                      category: bestsellerPill === 'all' ? 'all' : bestsellerPill,
                      title: 'Bestsellers',
                      mode: 'bestsellers',
                    }),
                  )
                }
              />

              <MarketplaceGiftRail
                title="Trending gifts"
                subtitle="Rising favorites nearby"
                gifts={curated.trending}
                vendorStores={vendorStores}
                deliveryCity={deliveryCity}
                favoriteIds={favoriteIds}
                startingFromByGiftId={startingFromByGiftId}
                onToggleFavorite={handleToggleFavorite}
                compact
                onViewAll={() =>
                  router.push(browseHref({ title: 'Trending gifts', mode: 'bestsellers' }))
                }
              />

              {curated.deals.length > 0 ? (
                <MarketplaceGiftRail
                  title="Celebration sale"
                  subtitle="Special pricing while it lasts"
                  gifts={curated.deals}
                  vendorStores={vendorStores}
                  deliveryCity={deliveryCity}
                  favoriteIds={favoriteIds}
                  startingFromByGiftId={startingFromByGiftId}
                  onToggleFavorite={handleToggleFavorite}
                  onViewAll={() =>
                    router.push(browseHref({ title: 'On sale', mode: 'deals' }))
                  }
                />
              ) : null}

              <MarketplaceGiftRail
                title="New arrivals"
                subtitle="Freshly listed by local makers"
                gifts={curated.newest}
                vendorStores={vendorStores}
                deliveryCity={deliveryCity}
                favoriteIds={favoriteIds}
                startingFromByGiftId={startingFromByGiftId}
                onToggleFavorite={handleToggleFavorite}
                onViewAll={() =>
                  router.push(browseHref({ title: 'Just added', mode: 'new' }))
                }
              />

              {resultsSection}
            </>
          )}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filteredFeed: {
    gap: Spacing.three,
  },
  resultsBlock: {
    gap: Spacing.three,
  },
  countBadge: {
    minWidth: 32,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  noResults: {
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  noResultsTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  noResultsBody: {
    maxWidth: 260,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  clearButton: {
    minHeight: 38,
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.one,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
