import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandBanner } from '@/components/brand-banner';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

import { RoleBadge } from './role-badge';

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
  const theme = useScreenTheme();

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

  if (variant === 'tab') {
    return (
      <View style={styles.tabToolbar}>
        <Text style={styles.tabTitle} numberOfLines={1}>
          {title}
        </Text>
        {role ? <RoleBadge role={role} /> : null}
      </View>
    );
  }

  return (
    <View style={styles.header}>
      {showBanner ? <BrandBanner showTagline={false} /> : null}

      <View style={styles.toolbar}>
        <View style={styles.sideSlot}>
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
              <SymbolView
                name="chevron.left"
                tintColor={theme.accentLight}
                size={22}
                weight="semibold"
              />
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.sideSlot}>{trailing ?? null}</View>
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    alignItems: 'stretch',
  },
  tabToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    minHeight: 36,
  },
  tabTitle: {
    flex: 1,
    flexShrink: 1,
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 44,
  },
  sideSlot: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: Spacing.one,
  },
});
