import { SymbolView } from 'expo-symbols';
import { useRef, type RefObject } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftCategory, GiftOccasion } from '@/types/vendor';

export type MarketplaceCategory = GiftCategory | 'all';
export type MarketplaceOccasion = GiftOccasion | 'all';
export type MarketplaceSort = 'newest' | 'price_low' | 'price_high';

type MarketplaceDiscoveryControlsProps = {
  query: string;
  sort: MarketplaceSort;
  onQueryChange: (value: string) => void;
  onSortChange: (value: MarketplaceSort) => void;
  searchInputRef?: RefObject<TextInput | null>;
  showSearch?: boolean;
  showSort?: boolean;
};

const SORT_OPTIONS: { value: MarketplaceSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price ↑' },
  { value: 'price_high', label: 'Price ↓' },
];

export function MarketplaceDiscoveryControls({
  query,
  sort,
  onQueryChange,
  onSortChange,
  searchInputRef,
  showSearch = true,
  showSort = true,
}: MarketplaceDiscoveryControlsProps) {
  const colors = useColors();
  const theme = useScreenTheme();
  const localRef = useRef<TextInput>(null);
  const inputRef = searchInputRef ?? localRef;

  return (
    <View style={styles.container}>
      {showSearch ? (
        <View
          style={[
            styles.search,
            {
              backgroundColor: theme.input,
              borderColor: theme.inputBorder,
            },
          ]}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor={colors.textMuted}
            size={18}
          />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search gifts or stores"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={() => onQueryChange('')}
              style={({ pressed }) => pressed && styles.pressed}>
              <SymbolView
                name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                tintColor={colors.textMuted}
                size={18}
              />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showSort ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}>
          {SORT_OPTIONS.map((item) => {
            const selected = sort === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => onSortChange(item.value)}
                style={({ pressed }) => [
                  styles.sortChip,
                  {
                    borderBottomColor: selected ? theme.accent : 'transparent',
                  },
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.sortLabel,
                    {
                      color: selected ? colors.text : colors.textMuted,
                      fontWeight: selected ? '800' : '600',
                    },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  search: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: Spacing.two,
    fontSize: 15,
  },
  sortRow: {
    gap: Spacing.four,
    paddingRight: Spacing.three,
  },
  sortChip: {
    paddingBottom: Spacing.one,
    borderBottomWidth: 2,
  },
  sortLabel: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.72,
  },
});
