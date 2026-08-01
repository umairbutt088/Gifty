import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type TabBarRenderer = NonNullable<ComponentProps<typeof Tabs>['tabBar']>;
type AppBottomTabBarProps = Parameters<TabBarRenderer>[0];
type TabIconName = 'index' | 'cart' | 'orders' | 'chat' | 'profile';

const TAB_ICONS = {
  index: {
    ios: 'gift.fill',
    android: 'featured_seasonal_and_gifts',
    web: 'featured_seasonal_and_gifts',
  },
  cart: { ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' },
  orders: { ios: 'shippingbox.fill', android: 'local_shipping', web: 'local_shipping' },
  chat: { ios: 'bubble.left.and.bubble.right.fill', android: 'forum', web: 'forum' },
  profile: { ios: 'person.fill', android: 'person', web: 'person' },
} as const;

function getLabel(routeName: string, title: string | undefined) {
  if (title) return title;
  if (routeName === 'index') return 'Gifts';
  return routeName.charAt(0).toUpperCase() + routeName.slice(1);
}

export function AppBottomTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: AppBottomTabBarProps) {
  const colors = useColors();
  const theme = useScreenTheme();
  const bottomPadding = Math.max(insets.bottom, Spacing.two);

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
          borderTopColor: theme.surfaceBorder,
          paddingBottom: bottomPadding,
          paddingLeft: Math.max(insets.left, Spacing.two),
          paddingRight: Math.max(insets.right, Spacing.two),
        },
      ]}>
      <View style={[styles.tabRow, { backgroundColor: theme.tabTrack }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = getLabel(
            route.name,
            typeof options.title === 'string' ? options.title : undefined,
          );
          const icon = TAB_ICONS[route.name as TabIconName] ?? TAB_ICONS.index;
          const badge = options.tabBarBadge;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              accessibilityState={{ selected: isFocused }}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.tabButtonPressed,
              ]}>
              <View
                style={[
                  styles.iconPill,
                  isFocused && {
                    backgroundColor: theme.accentMuted,
                    borderColor: theme.tabActiveBorder,
                  },
                ]}>
                <SymbolView
                  name={icon}
                  tintColor={isFocused ? theme.accentLight : colors.textSecondary}
                  size={23}
                />
                {badge !== undefined ? (
                  <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                    <Text style={styles.badgeText}>{String(badge)}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: isFocused ? theme.accentLight : colors.textSecondary },
                  isFocused && styles.labelFocused,
                ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
  },
  tabRow: {
    height: 66,
    borderRadius: Spacing.four,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: Spacing.one,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.half,
    paddingVertical: Spacing.one,
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  iconPill: {
    minWidth: 48,
    height: 31,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelFocused: {
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
