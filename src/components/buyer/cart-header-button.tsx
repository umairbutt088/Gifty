import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useCart } from '@/providers/cart-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type CartHeaderButtonProps = {
  alwaysShowBadge?: boolean;
};

export function CartHeaderButton({ alwaysShowBadge = false }: CartHeaderButtonProps) {
  const { itemCount } = useCart();
  const colors = useColors();
  const theme = useScreenTheme();
  const badgeLabel = itemCount > 99 ? '99+' : String(itemCount);
  const showBadge = alwaysShowBadge || itemCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart'}
      onPress={() => router.push('/buyer/cart')}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <SymbolView
        name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
        tintColor={colors.text}
        size={22}
      />
      {showBadge ? (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
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
});
