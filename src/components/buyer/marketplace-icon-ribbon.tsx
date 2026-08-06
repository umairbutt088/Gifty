import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { GIFT_CATEGORIES, GIFT_OCCASIONS } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
import type { GiftCategory, GiftOccasion } from '@/types/vendor';

import type { MarketplaceCategory, MarketplaceOccasion } from './marketplace-discovery-controls';

export type MarketplaceRibbonKey =
  | { kind: 'all' }
  | { kind: 'category'; value: GiftCategory }
  | { kind: 'occasion'; value: GiftOccasion };

type MarketplaceIconRibbonProps = {
  category: MarketplaceCategory;
  occasion: MarketplaceOccasion;
  onSelect: (key: MarketplaceRibbonKey) => void;
};

const CATEGORY_ICONS: Record<GiftCategory | 'all', { ios: string; android: string; web: string }> =
  {
    all: { ios: 'gift.fill', android: 'card_giftcard', web: 'card_giftcard' },
    flowers: { ios: 'leaf.fill', android: 'local_florist', web: 'local_florist' },
    chocolate: { ios: 'cup.and.saucer.fill', android: 'cake', web: 'cake' },
    jewelry: { ios: 'sparkles', android: 'diamond', web: 'diamond' },
    experience: { ios: 'star.fill', android: 'star', web: 'star' },
    custom: { ios: 'paintbrush.fill', android: 'brush', web: 'brush' },
    other: { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' },
  };

const OCCASION_ICONS: Partial<
  Record<GiftOccasion, { ios: string; android: string; web: string }>
> = {
  birthday: { ios: 'balloon.fill', android: 'celebration', web: 'celebration' },
  anniversary: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  thank_you: { ios: 'hand.thumbsup.fill', android: 'thumb_up', web: 'thumb_up' },
};

/** Icon + label strip with underline selection. */
export function MarketplaceIconRibbon({
  category,
  occasion,
  onSelect,
}: MarketplaceIconRibbonProps) {
  const colors = useColors();
  const allSelected = category === 'all' && occasion === 'all';

  const tabs = [
    {
      key: 'all',
      label: 'All Gifts',
      icon: CATEGORY_ICONS.all,
      selected: allSelected,
      onPress: () => onSelect({ kind: 'all' }),
    },
    ...GIFT_CATEGORIES.map((item) => ({
      key: `c-${item.value}`,
      label: item.label,
      icon: CATEGORY_ICONS[item.value],
      selected: category === item.value && occasion === 'all',
      onPress: () => onSelect({ kind: 'category', value: item.value }),
    })),
    ...(['birthday', 'anniversary', 'thank_you'] as GiftOccasion[]).map((value) => ({
      key: `o-${value}`,
      label: GIFT_OCCASIONS.find((item) => item.value === value)?.label ?? value,
      icon: OCCASION_ICONS[value] ?? CATEGORY_ICONS.all,
      selected: occasion === value && category === 'all',
      onPress: () => onSelect({ kind: 'occasion', value }),
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          accessibilityRole="button"
          accessibilityState={{ selected: tab.selected }}
          onPress={tab.onPress}
          style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
          <SymbolView
            name={tab.icon as never}
            tintColor={tab.selected ? colors.text : colors.textMuted}
            size={24}
          />
          <Text
            style={[
              styles.label,
              {
                color: tab.selected ? colors.text : colors.textSecondary,
                fontWeight: tab.selected ? '800' : '600',
              },
            ]}
            numberOfLines={1}>
            {tab.label}
          </Text>
          <View
            style={[
              styles.line,
              { backgroundColor: tab.selected ? colors.text : 'transparent' },
            ]}
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.four,
    paddingRight: Spacing.three,
    paddingTop: Spacing.one,
  },
  tab: {
    alignItems: 'center',
    minWidth: 64,
    gap: 6,
    paddingBottom: 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 15,
  },
  line: {
    marginTop: 4,
    height: 3,
    borderRadius: 2,
    width: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
});
