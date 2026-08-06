import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { getGiftDeliveryCue } from '@/lib/vendor-store-helpers';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftCategory, GiftRow, VendorStorePublic } from '@/types/vendor';

import { GiftGridItem } from './gift-grid-item';
import { MarketplaceSectionHeader } from './marketplace-section-header';

type SubPill = {
  value: GiftCategory | 'all';
  label: string;
};

type MarketplaceGiftRailProps = {
  title: string;
  subtitle?: string;
  gifts: GiftRow[];
  vendorStores: Map<string, VendorStorePublic>;
  deliveryCity?: string | null;
  favoriteIds?: Set<string>;
  startingFromByGiftId?: Map<string, number>;
  onToggleFavorite?: (giftId: string, favorited: boolean) => void;
  onViewAll?: () => void;
  subPills?: SubPill[];
  activeSubPill?: GiftCategory | 'all';
  onSubPillChange?: (value: GiftCategory | 'all') => void;
  compact?: boolean;
};

export function MarketplaceGiftRail({
  title,
  subtitle,
  gifts,
  vendorStores,
  deliveryCity = null,
  favoriteIds,
  startingFromByGiftId,
  onToggleFavorite,
  onViewAll,
  subPills,
  activeSubPill = 'all',
  onSubPillChange,
  compact = false,
}: MarketplaceGiftRailProps) {
  const colors = useColors();
  const theme = useScreenTheme();

  if (gifts.length === 0 && !subPills?.length) return null;

  return (
    <View style={styles.section}>
      <MarketplaceSectionHeader title={title} subtitle={subtitle} onViewAll={onViewAll} />

      {subPills && subPills.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pills}>
          {subPills.map((pill) => {
            const selected = activeSubPill === pill.value;
            return (
              <Pressable
                key={pill.value}
                onPress={() => onSubPillChange?.(pill.value)}
                style={({ pressed }) => [
                  styles.pill,
                  {
                    backgroundColor: selected ? colors.text : colors.background,
                    borderColor: selected ? colors.text : theme.surfaceBorder,
                  },
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.pillLabel,
                    { color: selected ? colors.background : colors.text },
                  ]}>
                  {pill.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {gifts.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          contentContainerStyle={styles.rail}>
          {gifts.map((gift) => {
            const store = vendorStores.get(gift.vendor_id);
            const favorited = favoriteIds?.has(gift.id) ?? false;

            return (
              <View key={gift.id} style={[styles.card, compact && styles.cardCompact]}>
                <GiftGridItem
                  gift={gift}
                  href={`/buyer/gift/${gift.id}`}
                  vendorLogoUrl={store?.logo_url}
                  vendorName={store?.name}
                  deliveryCue={getGiftDeliveryCue(store, deliveryCity)}
                  startingFromCents={startingFromByGiftId?.get(gift.id)}
                  favorited={favorited}
                  marketplaceStyle
                  onToggleFavorite={
                    onToggleFavorite ? () => onToggleFavorite(gift.id, favorited) : undefined
                  }
                />
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={[styles.empty, { color: colors.textMuted }]}>Nothing here yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  pills: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  pill: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  rail: {
    gap: Spacing.three,
    paddingRight: Spacing.three,
  },
  card: {
    width: 168,
  },
  cardCompact: {
    width: 152,
  },
  empty: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.75,
  },
});
