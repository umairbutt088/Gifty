import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';

const TRUST_ITEMS = [
  {
    label: 'Preferred prep times',
    icon: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
  },
  {
    label: 'Delivery across cities',
    icon: { ios: 'shippingbox.fill', android: 'local_shipping', web: 'local_shipping' },
  },
  {
    label: 'Loved by local shoppers',
    icon: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  },
  {
    label: 'Independent makers nearby',
    icon: { ios: 'storefront.fill', android: 'storefront', web: 'storefront' },
  },
] as const;

/** Soft trust / service highlights — Winni 2×2 feature grid. */
export function MarketplaceTrustStrip() {
  const colors = useColors();
  const theme = useScreenTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.surfaceNested }]}>
      <View style={styles.grid}>
        {TRUST_ITEMS.map((item) => (
          <View key={item.label} style={styles.item}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: colors.background,
                  borderColor: theme.accent,
                },
              ]}>
          <SymbolView name={item.icon as never} tintColor={theme.accentLight} size={20} />
            </View>
            <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  item: {
    width: '46%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
});
