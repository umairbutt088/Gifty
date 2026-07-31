import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandBanner } from '@/components/brand-banner';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';

import { RoleBadge } from './role-badge';

/** Shared header metrics — keep tab and stack headers aligned. */
const TOOLBAR_MIN_HEIGHT = 44;
const SIDE_LEADING_WIDTH = 32;
const SIDE_TRAILING_MIN_WIDTH = 32;
const TITLE_FONT_SIZE = 22;
const TITLE_LINE_HEIGHT = 26;

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  role?: string;
  variant?: 'default' | 'tab';
  showBanner?: boolean;
  showBack?: boolean;
  backHref?: Href;
  onBack?: () => void;
  trailing?: ReactNode;
};

export function DashboardHeader({
  title,
  subtitle,
  role,
  variant = 'default',
  showBanner = false,
  showBack = false,
  backHref,
  onBack,
  trailing,
}: DashboardHeaderProps) {
  const colors = useColors();

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (backHref) {
      router.replace(backHref);
    }
  }

  const trailingContent =
    variant === 'tab' ? (role ? <RoleBadge role={role} /> : null) : (trailing ?? null);

  return (
    <View style={styles.headerShell}>
      {variant === 'default' && showBanner ? <BrandBanner showTagline={false} /> : null}

      <View style={styles.toolbar}>
        {variant === 'default' && showBack ? (
          <View style={styles.sideSlotLeading}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
              <SymbolView
                name="chevron.left"
                tintColor={Colors.text}
                size={22}
                weight="semibold"
              />
            </Pressable>
          </View>
        ) : null}

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>

        {trailingContent ? (
          <View style={styles.sideSlotTrailing}>{trailingContent}</View>
        ) : null}
      </View>

      {variant === 'default' && subtitle ? (
        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary },
            showBack && styles.subtitleWithBack,
          ]}
          numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerShell: {
    gap: Spacing.two,
    alignItems: 'stretch',
    marginHorizontal: -Spacing.one,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: TOOLBAR_MIN_HEIGHT,
  },
  sideSlotLeading: {
    width: SIDE_LEADING_WIDTH,
    height: TOOLBAR_MIN_HEIGHT,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideSlotTrailing: {
    minWidth: SIDE_TRAILING_MIN_WIDTH,
    minHeight: TOOLBAR_MIN_HEIGHT,
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconButton: {
    width: SIDE_LEADING_WIDTH,
    height: TOOLBAR_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    marginLeft: -Spacing.one,
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
    lineHeight: TITLE_LINE_HEIGHT,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: Spacing.one,
  },
  subtitleWithBack: {
    paddingLeft: SIDE_LEADING_WIDTH + Spacing.one,
  },
});
