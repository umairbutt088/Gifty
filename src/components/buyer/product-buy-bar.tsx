import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/dashboard';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { formatMoney } from '@/lib/format';
import { useScreenTheme } from '@/providers/screen-theme-provider';

/** Fallback when Android reports 0 bottom inset under gesture/3-button nav. */
const ANDROID_NAV_FALLBACK = 48;

type ProductBuyBarProps = {
  unitPrice: number;
  quantity: number;
  variantLabel?: string | null;
  disabled?: boolean;
  message?: string | null;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export function ProductBuyBar({
  unitPrice,
  quantity,
  variantLabel,
  disabled = false,
  message,
  onAddToCart,
  onBuyNow,
}: ProductBuyBarProps) {
  const colors = useColors();
  const theme = useScreenTheme();
  const insets = useSafeAreaInsets();
  const total = unitPrice * quantity;
  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? ANDROID_NAV_FALLBACK : Spacing.three,
  );

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderTopColor: theme.surfaceBorder,
          paddingBottom: bottomPadding,
        },
      ]}>
      <View style={styles.summary}>
        <Text style={[styles.price, { color: colors.text }]}>{formatMoney(total)}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
          {variantLabel ? `${variantLabel} · ` : ''}
          {quantity} item{quantity === 1 ? '' : 's'}
        </Text>
        {message ? (
          <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={1}>
            {message}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <View style={styles.action}>
          <PrimaryButton
            label="Add to cart"
            size="compact"
            onPress={onAddToCart}
            disabled={disabled}
          />
        </View>
        <View style={styles.action}>
          <PrimaryButton
            label="Buy now"
            size="compact"
            variant="secondary"
            onPress={onBuyNow}
            disabled={disabled}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  summary: {
    gap: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
  },
});
