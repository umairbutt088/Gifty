import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
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
      <Text style={[styles.label, { color: Colors.text }]}>{role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexShrink: 0,
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
