import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type PressableStateCallbackType,
} from 'react-native';

import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type ButtonVariant = 'primary' | 'secondary' | 'share' | 'danger';

type PrimaryButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: 'default' | 'compact';
};

const BUTTON_GRADIENTS = {
  share: {
    border: 'rgba(100, 210, 255, 0.45)',
    disabled: 'rgba(10, 132, 255, 0.35)',
    stops: ['#7AD7FF', '#0A84FF', '#0040DD'] as const,
  },
  danger: {
    border: 'rgba(255, 105, 97, 0.45)',
    disabled: 'rgba(183, 28, 28, 0.35)',
    stops: ['#FF8A80', '#E53935', '#B71C1C'] as const,
  },
} as const;

function getGradientVariant(variant: ButtonVariant): keyof typeof BUTTON_GRADIENTS | null {
  if (variant === 'share' || variant === 'danger') return variant;
  return null;
}

export function PrimaryButton({
  label,
  loading,
  disabled,
  variant = 'primary',
  size = 'default',
  style,
  ...props
}: PrimaryButtonProps) {
  const theme = useScreenTheme();
  const colors = useColors();
  const isDisabled = disabled || loading;
  const isCompact = size === 'compact';
  const gradientVariant = getGradientVariant(variant);
  const isGradient = variant === 'primary' || gradientVariant !== null;
  const labelColor = isDisabled
    ? colors.textMuted
    : variant === 'secondary'
      ? colors.text
      : '#FFFFFF';

  const gradientStops =
    variant === 'primary'
      ? [theme.accent, theme.accentDark, theme.tabActiveFillBottom]
      : gradientVariant
        ? BUTTON_GRADIENTS[gradientVariant].stops
        : null;

  const borderColor =
    variant === 'primary'
      ? theme.buttonBorder
      : gradientVariant
        ? BUTTON_GRADIENTS[gradientVariant].border
        : theme.surfaceBorder;

  const disabledBackground =
    variant === 'primary'
      ? theme.buttonDisabled
      : gradientVariant
        ? BUTTON_GRADIENTS[gradientVariant].disabled
        : theme.surfaceNested;

  function getButtonStyle(state: PressableStateCallbackType) {
    const resolvedStyle = typeof style === 'function' ? style(state) : style;

    return [
      styles.button,
      isCompact && styles.buttonCompact,
      isGradient && !isDisabled && styles.buttonPrimary,
      isGradient && !isDisabled && { borderColor },
      isGradient && isDisabled && {
        backgroundColor: disabledBackground,
        borderColor,
      },
      variant === 'secondary' && {
        backgroundColor: theme.surfaceNested,
        borderColor: theme.surfaceBorder,
      },
      state.pressed && !isDisabled && styles.buttonPressed,
      resolvedStyle,
    ];
  }

  return (
    <Pressable disabled={isDisabled} style={getButtonStyle} {...props}>
      {isGradient && !isDisabled && gradientStops ? (
        <View
          pointerEvents="none"
          style={[
            styles.gradientLayer,
            {
              experimental_backgroundImage: `linear-gradient(180deg, ${gradientStops.join(', ')})`,
            },
          ]}
        />
      ) : null}

      {loading ? (
        <ThemedActivityIndicator muted={isDisabled} />
      ) : (
        <Text
          style={[
            styles.label,
            isCompact && styles.labelCompact,
            { color: labelColor, textAlign: 'center' },
          ]}
          numberOfLines={2}>
          {label}
        </Text>
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
  buttonCompact: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
    borderRadius: Spacing.three,
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
  labelCompact: {
    fontSize: 15,
    lineHeight: 16,
    fontWeight: '600',
  },
});
