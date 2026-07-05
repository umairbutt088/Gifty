import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type ThemedActivityIndicatorProps = ActivityIndicatorProps & {
  muted?: boolean;
};

export function ThemedActivityIndicator({
  color,
  muted = false,
  ...props
}: ThemedActivityIndicatorProps) {
  const theme = useScreenTheme();
  const colors = useColors();

  return (
    <ActivityIndicator
      {...props}
      color={color ?? (muted ? colors.textMuted : theme.accentLight)}
    />
  );
}
