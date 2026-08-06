import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type MarketplaceSectionHeaderProps = {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  trailing?: ReactNode;
};

export function MarketplaceSectionHeader({
  title,
  subtitle,
  onViewAll,
  trailing,
}: MarketplaceSectionHeaderProps) {
  const colors = useColors();
  const theme = useScreenTheme();

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {onViewAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View all ${title}`}
          onPress={onViewAll}
          style={({ pressed }) => [
            styles.viewAll,
            {
              backgroundColor: theme.surfaceNested,
              borderColor: theme.surfaceBorder,
            },
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.viewAllText, { color: colors.text }]}>VIEW ALL</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.25,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  viewAll: {
    minHeight: 32,
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.75,
  },
});
