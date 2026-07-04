import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useCart } from '@/providers/cart-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';

export function CartHeaderButton() {
  const theme = useScreenTheme();
  const { itemCount } = useCart();
  const badgeLabel = itemCount > 99 ? '99+' : String(itemCount);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart'}
      onPress={() => router.push('/buyer/cart')}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <SymbolView name="cart.fill" tintColor={theme.accentLight} size={22} weight="semibold" />
      {itemCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
