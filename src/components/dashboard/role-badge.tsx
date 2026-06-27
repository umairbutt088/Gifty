import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type RoleBadgeProps = {
  role: string;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const theme = useScreenTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.accentMuted,
          borderColor: theme.surfaceSelectedBorder,
        },
      ]}>
      <Text style={[styles.label, { color: theme.accentLight }]}>{role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
