import { Tabs } from 'expo-router';

import { AppBottomTabBar } from '@/components/app-bottom-tab-bar';
import { useVendorStore } from '@/providers/vendor-store-provider';

export default function VendorTabsLayout() {
  const { newOrderCount } = useVendorStore();

  return (
    <Tabs
      tabBar={(props) => <AppBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Gifts' }} />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarBadge:
            newOrderCount > 0 ? (newOrderCount > 99 ? '99+' : newOrderCount) : undefined,
        }}
      />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
