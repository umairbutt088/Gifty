import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, StyleSheet } from 'react-native';

import { Colors } from '@/constants/colors';
import { useVendorStore } from '@/providers/vendor-store-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type TabIconName = 'gift' | 'shippingbox' | 'bubble' | 'person';

function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  const symbolName =
    name === 'gift'
      ? 'gift.fill'
      : name === 'shippingbox'
        ? 'shippingbox.fill'
        : name === 'bubble'
          ? 'bubble.left.and.bubble.right.fill'
          : 'person.fill';

  return <SymbolView name={symbolName} tintColor={color as string} size={22} />;
}

export default function VendorTabsLayout() {
  const theme = useScreenTheme();
  const { newOrderCount } = useVendorStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accentLight,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Gifts',
          tabBarIcon: ({ color }) => <TabIcon name="gift" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarBadge: newOrderCount > 0 ? newOrderCount : undefined,
          tabBarIcon: ({ color }) => <TabIcon name="shippingbox" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabIcon name="bubble" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="person" color={String(color)} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopColor: Colors.surfaceBorder,
    borderTopWidth: 1,
    height: Platform.select({ ios: 84, default: 64 }),
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
