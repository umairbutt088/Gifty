import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FavoriteButton } from '@/components/buyer/favorite-button';
import { GlassCard } from '@/components/glass-card';
import { Spacing } from '@/constants/theme';
import { GIFT_CATEGORIES } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
import { formatMoney } from '@/lib/format';
import {
  formatGiftRating,
  formatPrepTime,
  getGiftDiscountPercent,
} from '@/lib/gift-marketplace';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftRow } from '@/types/vendor';

type GiftGridItemProps = {
  gift: GiftRow;
  href?: Href;
  vendorLogoUrl?: string | null;
  vendorName?: string;
  deliveryCue?: string | null;
  startingFromCents?: number | null;
  favorited?: boolean;
  /** Cleaner Winni-style product tile for home rails/grids. */
  marketplaceStyle?: boolean;
  onToggleFavorite?: () => void;
};

export function GiftGridItem({
  gift,
  href,
  vendorLogoUrl,
  vendorName,
  deliveryCue = null,
  startingFromCents = null,
  favorited = false,
  marketplaceStyle = false,
  onToggleFavorite,
}: GiftGridItemProps) {
  const colors = useColors();
  const theme = useScreenTheme();
  const imageUrl = gift.image_urls?.[0] ?? null;
  const vendorInitial = (vendorName ?? 'S').slice(0, 1).toUpperCase();
  const categoryLabel =
    GIFT_CATEGORIES.find((category) => category.value === gift.category)?.label ?? 'Gift';
  const createdAt = new Date(gift.created_at).getTime();
  const isNew =
    Number.isFinite(createdAt) && Date.now() - createdAt < 14 * 24 * 60 * 60 * 1000;
  const discountPercent = getGiftDiscountPercent(gift);
  const ratingLabel = formatGiftRating(gift);
  const prepLabel = formatPrepTime(gift.prep_time_minutes);
  const showStartingFrom =
    startingFromCents != null &&
    startingFromCents > 0 &&
    startingFromCents !== gift.price_cents;
  const displayPrice = showStartingFrom ? startingFromCents : gift.price_cents;
  const badgeLabel = discountPercent
    ? `${discountPercent}% OFF`
    : gift.featured
      ? 'FEATURED'
      : isNew
        ? 'NEW'
        : null;
  const ratingShort =
    gift.rating_count > 0 ? `${Number(gift.rating_avg).toFixed(1)} ★` : null;

  const content = (
    <GlassCard variant="nested" style={styles.card}>
      <View style={[styles.imageWrap, marketplaceStyle && styles.imageWrapMarketplace]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={180}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceNested }]}>
            <Text style={[styles.imagePlaceholderText, { color: colors.textMuted }]}>Gift</Text>
          </View>
        )}
        {!marketplaceStyle ? (
          <View style={styles.imageBadges} pointerEvents="none">
            <View style={[styles.categoryBadge, { backgroundColor: colors.background }]}>
              <Text style={[styles.categoryBadgeText, { color: colors.text }]}>
                {categoryLabel}
              </Text>
            </View>
            {badgeLabel ? (
              <View style={[styles.newBadge, { backgroundColor: theme.accent }]}>
                <Text style={styles.newBadgeText}>{badgeLabel}</Text>
              </View>
            ) : null}
          </View>
        ) : ratingShort ? (
          <View style={styles.ratingBadgeWinni} pointerEvents="none">
            <Text style={styles.ratingBadgeWinniText}>{ratingShort}</Text>
          </View>
        ) : null}
        {onToggleFavorite ? (
          <View style={styles.favoriteWrap}>
            <FavoriteButton favorited={favorited} onPress={onToggleFavorite} size={16} />
          </View>
        ) : null}
        {!marketplaceStyle && ratingLabel ? (
          <View style={[styles.ratingPill, { backgroundColor: colors.background }]}>
            <Text style={[styles.ratingPillText, { color: colors.text }]}>★ {ratingLabel}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.meta, marketplaceStyle && styles.metaMarketplace]}>
        {!marketplaceStyle ? (
          <View style={styles.vendorRow}>
            {vendorLogoUrl ? (
              <Image source={{ uri: vendorLogoUrl }} style={styles.vendorLogo} contentFit="cover" />
            ) : (
              <View
                style={[
                  styles.vendorLogoPlaceholder,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.surfaceBorder,
                  },
                ]}>
                <Text style={[styles.vendorLogoInitial, { color: colors.text }]}>
                  {vendorInitial}
                </Text>
              </View>
            )}
            <Text style={[styles.vendorName, { color: colors.textMuted }]} numberOfLines={1}>
              {vendorName || 'Local seller'}
            </Text>
          </View>
        ) : null}

        <Text
          style={[styles.title, marketplaceStyle && styles.titleMarketplace, { color: colors.text }]}
          numberOfLines={marketplaceStyle ? 1 : 2}>
          {gift.title}
        </Text>

        {!marketplaceStyle && (deliveryCue || prepLabel) ? (
          <Text style={[styles.cue, { color: colors.textMuted }]} numberOfLines={1}>
            {[deliveryCue, prepLabel].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.priceColumn}>
            {showStartingFrom ? (
              <Text style={[styles.startingFrom, { color: colors.textMuted }]}>Starting from</Text>
            ) : null}
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.text }]} numberOfLines={1}>
                {formatMoney(displayPrice)}
              </Text>
              {gift.original_price_cents && gift.original_price_cents > gift.price_cents ? (
                <Text style={[styles.compareAt, { color: colors.textMuted }]} numberOfLines={1}>
                  {formatMoney(gift.original_price_cents)}
                </Text>
              ) : null}
              {discountPercent ? (
                <Text style={styles.discountWinni}>{discountPercent}% off</Text>
              ) : null}
            </View>
          </View>
          {!marketplaceStyle && gift.stock <= 5 ? (
            <Text style={[styles.lowStock, { color: theme.accentLight }]} numberOfLines={1}>
              {gift.stock === 1 ? 'Last one' : `${gift.stock} left`}
            </Text>
          ) : null}
        </View>
      </View>
    </GlassCard>
  );

  if (!href) {
    return content;
  }

  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  card: {
    gap: 0,
  },
  meta: {
    minHeight: 138,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  metaMarketplace: {
    minHeight: 84,
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
    backgroundColor: 'rgba(127,127,127,0.12)',
  },
  imageWrapMarketplace: {
    aspectRatio: 1,
    borderTopLeftRadius: Spacing.three,
    borderTopRightRadius: Spacing.three,
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  imageBadges: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    right: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.one,
    zIndex: 2,
  },
  favoriteWrap: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    zIndex: 3,
  },
  ratingPill: {
    position: 'absolute',
    left: Spacing.two,
    bottom: Spacing.two,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    zIndex: 2,
    opacity: 0.95,
  },
  ratingPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  ratingBadgeWinni: {
    position: 'absolute',
    left: Spacing.two,
    bottom: Spacing.two,
    backgroundColor: '#2E7D32',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  ratingBadgeWinniText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  categoryBadge: {
    maxWidth: '70%',
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    opacity: 0.92,
  },
  categoryBadgeText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    minHeight: 38,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    letterSpacing: -0.1,
  },
  titleMarketplace: {
    minHeight: 0,
    fontSize: 13,
    lineHeight: 17,
  },
  cue: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  vendorName: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  priceColumn: {
    flex: 1,
    gap: 2,
  },
  startingFrom: {
    fontSize: 10,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  vendorLogo: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  vendorLogoPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  vendorLogoInitial: {
    fontSize: 9,
    fontWeight: '700',
  },
  price: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  compareAt: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginBottom: 1,
  },
  discountWinni: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 1,
  },
  lowStock: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
  },
});
