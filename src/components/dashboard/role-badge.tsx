import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

type RoleBadgeProps = {
  role: string;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.label}>{role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.surfaceSelectedBorder,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  label: {
    color: Colors.accentLight,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
