import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Platform, StyleSheet, type TextProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { useCart } from '@/providers/cart-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';

const SELECTED_SCALE = 1.14;
const TAB_SPRING = { damping: 14, stiffness: 180 };

type TabIconName = 'gift' | 'cart' | 'shippingbox' | 'bubble' | 'person';

function useSelectedScale(focused: boolean) {
  const scale = useSharedValue(focused ? SELECTED_SCALE : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? SELECTED_SCALE : 1, TAB_SPRING);
  }, [focused, scale]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: TabIconName;
  color: string;
  focused: boolean;
}) {
  const animatedStyle = useSelectedScale(focused);
  const symbolName =
    name === 'gift'
      ? 'gift.fill'
      : name === 'cart'
        ? 'cart.fill'
        : name === 'shippingbox'
          ? 'shippingbox.fill'
          : name === 'bubble'
            ? 'bubble.left.and.bubble.right.fill'
            : 'person.fill';

  return (
    <Animated.View style={animatedStyle}>
      <SymbolView name={symbolName} tintColor={color} size={22} />
    </Animated.View>
  );
}

function TabLabel({
  focused,
  color,
  children,
}: {
  focused: boolean;
  color: string;
  children: TextProps['children'];
}) {
  const animatedStyle = useSelectedScale(focused);

  return (
    <Animated.Text
      style={[styles.tabLabel, { color }, focused && styles.tabLabelSelected, animatedStyle]}>
      {children}
    </Animated.Text>
  );
}

export default function BuyerTabsLayout() {
  const theme = useScreenTheme();
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accentLight,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabel: ({ focused, color, children }) => (
          <TabLabel focused={focused} color={String(color)}>
            {children}
          </TabLabel>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Gifts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="gift" color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="cart" color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="shippingbox" color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bubble" color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={String(color)} focused={focused} />
          ),
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
  tabLabelSelected: {
    fontWeight: '700',
  },
});
