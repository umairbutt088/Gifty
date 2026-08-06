import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandBanner } from '@/components/brand-banner';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';

import { RoleBadge } from './role-badge';

/** Shared header metrics — keep tab and stack headers aligned. */
const TOOLBAR_MIN_HEIGHT = 44;
const SIDE_LEADING_WIDTH = 40;
const SIDE_TRAILING_MIN_WIDTH = 40;
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
  const theme = useScreenTheme();
  const isStack = variant === 'default';

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
    variant === 'tab' ? (
      role ? (
        <RoleBadge role={role} />
      ) : null
    ) : (
      (trailing ?? null)
    );

  return (
    <View style={styles.headerShell}>
      {isStack && showBanner ? <BrandBanner showTagline={false} /> : null}

      <View style={styles.toolbar}>
        {isStack && showBack ? (
          <View style={styles.sideSlotLeading}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={handleBack}
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: theme.surfaceNested,
                  borderColor: theme.surfaceBorder,
                },
                pressed && styles.iconButtonPressed,
              ]}>
              <SymbolView
                name={{
                  ios: 'chevron.left',
                  android: 'arrow_back',
                  web: 'arrow_back',
                }}
                tintColor={colors.text}
                size={20}
                weight="semibold"
              />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {isStack && subtitle ? (
            <Text style={[styles.subtitleInline, { color: colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {trailingContent ? (
          <View style={styles.sideSlotTrailing}>{trailingContent}</View>
        ) : isStack && showBack ? (
          <View style={styles.sideSlotTrailing} />
        ) : null}
      </View>
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
    gap: Spacing.two,
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
    height: SIDE_LEADING_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIDE_LEADING_WIDTH / 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
    lineHeight: TITLE_LINE_HEIGHT,
  },
  subtitleInline: {
    fontSize: 13,
    lineHeight: 17,
  },
});
