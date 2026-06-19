import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type GlassCardProps = ViewProps & {
  selected?: boolean;
  variant?: 'panel' | 'nested';
};

export function GlassCard({ style, selected, variant = 'panel', ...props }: GlassCardProps) {
  const theme = useScreenTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
        },
        variant === 'nested' && { backgroundColor: theme.surfaceNested },
        selected && {
          backgroundColor: theme.surfaceSelected,
          borderColor: theme.surfaceSelectedBorder,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
});
