import { Tabs } from 'expo-router';

import { AppBottomTabBar } from '@/components/app-bottom-tab-bar';
import { useCart } from '@/providers/cart-provider';

export default function BuyerTabsLayout() {
  const { itemCount } = useCart();

  return (
    <Tabs
      tabBar={(props) => <AppBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Gifts' }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: itemCount > 0 ? (itemCount > 99 ? '99+' : itemCount) : undefined,
        }}
      />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
