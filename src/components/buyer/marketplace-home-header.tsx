import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CartHeaderButton } from '@/components/buyer/cart-header-button';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type MarketplaceHomeHeaderProps = {
  favoriteCount?: number;
  searchActive?: boolean;
  onSearchPress?: () => void;
};

export function MarketplaceHomeHeader({
  favoriteCount = 0,
  searchActive = false,
  onSearchPress,
}: MarketplaceHomeHeaderProps) {
  const colors = useColors();
  const theme = useScreenTheme();
  const badgeLabel = favoriteCount > 99 ? '99+' : String(favoriteCount);

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <Text style={[styles.wordmark, { color: theme.accentLight }]}>gifty</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          CELEBRATE RELATIONS
        </Text>
      </View>

      <View style={styles.actions}>
        {onSearchPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={searchActive ? 'Close search' : 'Search'}
            onPress={onSearchPress}
            style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}>
            <SymbolView
              name={
                searchActive
                  ? { ios: 'xmark', android: 'close', web: 'close' }
                  : { ios: 'magnifyingglass', android: 'search', web: 'search' }
              }
              tintColor={searchActive ? theme.accent : colors.text}
              size={22}
            />
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Favorites"
          onPress={() => router.push('/buyer/favorites')}
          style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'heart', android: 'favorite_border', web: 'favorite_border' }}
            tintColor={colors.text}
            size={22}
          />
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        </Pressable>

        <CartHeaderButton alwaysShowBadge />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    minHeight: 48,
  },
  brand: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  wordmark: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconHit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  pressed: {
    opacity: 0.7,
  },
});
