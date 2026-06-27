import { Stack } from 'expo-router';

import { CartProvider } from '@/providers/cart-provider';

export default function BuyerLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </CartProvider>
  );
}
