import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

type GlassCardProps = ViewProps & {
  selected?: boolean;
  variant?: 'panel' | 'nested';
};

export function GlassCard({ style, selected, variant = 'panel', ...props }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'nested' && styles.cardNested,
        selected && styles.cardSelected,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  cardNested: {
    backgroundColor: Colors.surfaceNested,
  },
  cardSelected: {
    backgroundColor: Colors.surfaceSelected,
    borderColor: Colors.surfaceSelectedBorder,
  },
});
