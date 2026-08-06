import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MarketplaceSectionHeader } from '@/components/buyer/marketplace-section-header';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftOccasion, GiftRow } from '@/types/vendor';

type MarketplaceRecipientTilesProps = {
  gifts: GiftRow[];
  onSelectOccasion: (occasion: GiftOccasion) => void;
};

/** Large paired occasion banners — Winni “Gifts for Him/Her” pattern. */
export function MarketplaceRecipientTiles({
  gifts,
  onSelectOccasion,
}: MarketplaceRecipientTilesProps) {
  const colors = useColors();
  const theme = useScreenTheme();

  const tiles: {
    label: string;
    subtitle: string;
    value: GiftOccasion;
    tone: string;
  }[] = [
    {
      label: 'Birthday picks',
      subtitle: 'Make their day unforgettable',
      value: 'birthday',
      tone: 'rgba(100, 149, 237, 0.28)',
    },
    {
      label: 'For your love',
      subtitle: 'Anniversary-ready gifts',
      value: 'anniversary',
      tone: 'rgba(255, 105, 180, 0.22)',
    },
  ];

  return (
    <View style={styles.section}>
      <MarketplaceSectionHeader
        title="Shop by moment"
        subtitle="Curated for the occasions that matter"
      />
      <View style={styles.column}>
        {tiles.map((tile) => {
          const cover =
            gifts.find(
              (gift) =>
                (gift.occasion_tags ?? []).includes(tile.value) && gift.image_urls?.[0],
            )?.image_urls?.[0] ??
            gifts.find((gift) => gift.image_urls?.[0])?.image_urls?.[0] ??
            null;

          return (
            <Pressable
              key={tile.value}
              onPress={() => onSelectOccasion(tile.value)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: tile.tone, borderColor: theme.surfaceBorder },
                pressed && styles.pressed,
              ]}>
              <View style={styles.copy}>
                <Text style={[styles.label, { color: colors.text }]}>{tile.label}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {tile.subtitle}
                </Text>
              </View>
              <View style={styles.media}>
                {cover ? (
                  <Image source={{ uri: cover }} style={styles.image} contentFit="cover" />
                ) : (
                  <View style={[styles.fallback, { backgroundColor: theme.accentMuted }]} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  column: {
    gap: Spacing.three,
  },
  card: {
    minHeight: 118,
    borderRadius: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: 4,
  },
  label: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  media: {
    width: 118,
    height: 118,
  },
  image: {
    width: 118,
    height: 118,
  },
  fallback: {
    width: 118,
    height: 118,
  },
  pressed: {
    opacity: 0.92,
  },
});
