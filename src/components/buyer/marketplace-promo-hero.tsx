import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { formatMoney } from '@/lib/format';
import { getGiftDiscountPercent } from '@/lib/gift-marketplace';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftRow } from '@/types/vendor';

type MarketplacePromoHeroProps = {
  gifts: GiftRow[];
  storeNames?: Map<string, string>;
  deliveryCity?: string | null;
  onBrowseDeals?: () => void;
  hasDeals?: boolean;
};

/** Full-bleed promo carousel + delivery strip — Winni home pattern. */
export function MarketplacePromoHero({
  gifts,
  storeNames,
  deliveryCity,
  onBrowseDeals,
  hasDeals = false,
}: MarketplacePromoHeroProps) {
  const colors = useColors();
  const theme = useScreenTheme();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.max(windowWidth - Spacing.three * 2, 280);
  const [page, setPage] = useState(0);
  const scrolling = useRef(false);

  const slides = gifts.slice(0, 5);

  function onScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + Spacing.two));
    setPage(Math.max(0, Math.min(next, slides.length - 1)));
    scrolling.current = false;
  }

  if (slides.length === 0) {
    return (
      <View style={styles.stack}>
        <View
          style={[
            styles.empty,
            {
              backgroundColor: theme.surfaceNested,
              borderColor: theme.surfaceBorder,
            },
          ]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Local gifts, ready when you are
          </Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Browse makers near you for flowers, treats, and custom pieces.
          </Text>
          {hasDeals && onBrowseDeals ? (
            <Pressable onPress={onBrowseDeals} style={({ pressed }) => pressed && styles.pressed}>
              <Text style={[styles.link, { color: theme.accentLight }]}>See current deals</Text>
            </Pressable>
          ) : null}
        </View>
        <DeliveryStrip city={deliveryCity} />
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <ScrollView
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + Spacing.two}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={styles.carousel}>
        {slides.map((gift, index) => {
          const imageUrl = gift.image_urls?.[0] ?? null;
          const discount = getGiftDiscountPercent(gift);
          const storeName = storeNames?.get(gift.vendor_id);

          return (
            <Pressable
              key={gift.id}
              onPress={() => router.push(`/buyer/gift/${gift.id}`)}
              style={({ pressed }) => [
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: theme.surfaceNested,
                  borderColor: theme.surfaceBorder,
                },
                pressed && styles.pressed,
              ]}>
              <View style={styles.imageWrap}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
                ) : (
                  <View style={[styles.imageFallback, { backgroundColor: theme.accentMuted }]} />
                )}
                <View style={styles.overlay}>
                  <Text style={styles.kicker}>
                    {index === 0 ? 'FEATURED' : discount ? `${discount}% OFF` : 'PICK FOR YOU'}
                  </Text>
                  <Text style={styles.title} numberOfLines={2}>
                    {gift.title}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {storeName || 'Local seller'} · {formatMoney(gift.price_cents)}
                  </Text>
                  <View style={[styles.cta, { backgroundColor: theme.accent }]}>
                    <Text style={styles.ctaText}>Shop now ›</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {slides.length > 1 ? (
        <View style={styles.dots}>
          {slides.map((gift, index) => (
            <View
              key={gift.id}
              style={[
                styles.dot,
                {
                  backgroundColor: index === page ? colors.text : colors.textMuted,
                  opacity: index === page ? 1 : 0.35,
                  width: index === page ? 16 : 6,
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      <DeliveryStrip city={deliveryCity} />
    </View>
  );
}

function DeliveryStrip({ city }: { city?: string | null }) {
  const theme = useScreenTheme();
  const colors = useColors();

  return (
    <View style={[styles.strip, { backgroundColor: theme.accentMuted }]}>
      <Text style={[styles.stripText, { color: colors.text }]}>
        {city
          ? `Free & fast delivery options in ${city}`
          : 'Choose your city for delivery-ready gifts nearby'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.three,
  },
  carousel: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(127,127,127,0.12)',
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  imageFallback: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    padding: Spacing.four,
    gap: Spacing.one,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  kicker: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    maxWidth: '85%',
  },
  meta: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '600',
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  strip: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  stripText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  empty: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    marginTop: Spacing.one,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.92,
  },
});
