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

  return (
    <View style={styles.header}>
      {showBanner ? <BrandBanner showTagline={false} /> : null}
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <SymbolView name="chevron.left" tintColor={theme.accentLight} size={22} weight="semibold" />
        </Pressable>
      ) : null}
      {role ? <RoleBadge role={role} /> : null}
      <View style={styles.titleRow}>
        <Text style={[styles.title, trailing ? styles.titleWithTrailing : null]} numberOfLines={2}>
          {title}
        </Text>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.three,
    alignItems: 'stretch',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -Spacing.one,
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    flexShrink: 1,
  },
  titleWithTrailing: {
    flex: 1,
  },
  trailing: {
    flexShrink: 0,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
