import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MarketplaceSectionHeader } from '@/components/buyer/marketplace-section-header';
import { Spacing } from '@/constants/theme';
import { GIFT_CATEGORIES } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
import { formatMoney } from '@/lib/format';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftCategory, GiftRow } from '@/types/vendor';

import type { MarketplaceRibbonKey } from './marketplace-icon-ribbon';

type MarketplaceCategoryGridProps = {
  gifts: GiftRow[];
  onSelect: (key: MarketplaceRibbonKey) => void;
  onViewAll?: () => void;
};

const TILE_COLORS = [
  'rgba(255, 182, 193, 0.35)',
  'rgba(176, 224, 230, 0.45)',
  'rgba(255, 228, 181, 0.45)',
  'rgba(221, 160, 221, 0.3)',
  'rgba(152, 251, 152, 0.3)',
  'rgba(230, 230, 250, 0.5)',
];

/** Photo category cards with starting-from prices (Winni cakes / combos style). */
export function MarketplaceCategoryGrid({
  gifts,
  onSelect,
  onViewAll,
}: MarketplaceCategoryGridProps) {
  const colors = useColors();
  const theme = useScreenTheme();

  const tiles = GIFT_CATEGORIES.map((item, index) => {
    const inCategory = gifts.filter((gift) => gift.category === item.value);
    const cover =
      inCategory.find((gift) => gift.image_urls?.[0])?.image_urls?.[0] ?? null;
    const startingFrom =
      inCategory.length > 0
        ? Math.min(...inCategory.map((gift) => gift.price_cents))
        : null;

    return {
      ...item,
      cover,
      startingFrom,
      count: inCategory.length,
      wash: TILE_COLORS[index % TILE_COLORS.length],
    };
  }).filter((tile) => tile.count > 0);

  if (tiles.length === 0) return null;

  return (
    <View style={styles.section}>
      <MarketplaceSectionHeader
        title="Gift categories"
        subtitle="Shop by what they love"
        onViewAll={onViewAll}
      />
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.value}
            onPress={() => onSelect({ kind: 'category', value: tile.value as GiftCategory })}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.background,
                borderColor: theme.surfaceBorder,
              },
              pressed && styles.pressed,
            ]}>
            <View style={[styles.imageWrap, { backgroundColor: tile.wash }]}>
              {tile.cover ? (
                <Image source={{ uri: tile.cover }} style={styles.image} contentFit="cover" />
              ) : (
                <Text style={[styles.fallback, { color: theme.accentLight }]}>
                  {tile.label.slice(0, 1)}
                </Text>
              )}
            </View>
            <View style={styles.copy}>
              <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
                {tile.label}
              </Text>
              {tile.startingFrom != null ? (
                <Text style={[styles.price, { color: colors.textSecondary }]} numberOfLines={1}>
                  Starting from {formatMoney(tile.startingFrom)}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  card: {
    width: '47%',
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    fontSize: 36,
    fontWeight: '800',
  },
  copy: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: 4,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
});
