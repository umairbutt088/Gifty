import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

import { Colors } from '@/constants/colors';
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

  return (
    <ActivityIndicator
      {...props}
      color={color ?? (muted ? Colors.textMuted : theme.accentLight)}
    />
  );
}
