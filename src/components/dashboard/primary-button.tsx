import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type PrimaryButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({
  label,
  loading,
  disabled,
  variant = 'primary',
  ...props
}: PrimaryButtonProps) {
  const theme = useScreenTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const labelColor = isDisabled ? Colors.textMuted : Colors.text;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isPrimary && !isDisabled && styles.buttonPrimary,
        isPrimary && !isDisabled && { borderColor: theme.buttonBorder },
        isPrimary && isDisabled && {
          backgroundColor: theme.buttonDisabled,
          borderColor: theme.buttonBorder,
        },
        !isPrimary && {
          backgroundColor: theme.surfaceNested,
          borderColor: theme.surfaceBorder,
        },
        pressed && !isDisabled && styles.buttonPressed,
      ]}
      {...props}>
      {isPrimary && !isDisabled ? (
        <View
          pointerEvents="none"
          style={[
            styles.gradientLayer,
            {
              experimental_backgroundImage: `linear-gradient(180deg, ${theme.accent}, ${theme.accentDark}, ${theme.tabActiveFillBottom})`,
            },
          ]}
        />
      ) : null}

      {loading ? (
        <ThemedActivityIndicator muted={isDisabled} />
      ) : (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonPrimary: {
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    opacity: 0.88,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFill,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
