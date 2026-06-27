import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type QuantityStepperProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
}: QuantityStepperProps) {
  const theme = useScreenTheme();
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <View style={styles.row}>
      <Pressable
        disabled={!canDecrease}
        onPress={() => onChange(value - 1)}
        style={({ pressed }) => [
          styles.button,
          {
            borderColor: theme.surfaceBorder,
            backgroundColor: theme.surface,
          },
          !canDecrease && styles.buttonDisabled,
          pressed && canDecrease && styles.buttonPressed,
        ]}>
        <Text style={styles.buttonLabel}>−</Text>
      </Pressable>

      <Text style={styles.value}>{value}</Text>

      <Pressable
        disabled={!canIncrease}
        onPress={() => onChange(value + 1)}
        style={({ pressed }) => [
          styles.button,
          {
            borderColor: theme.surfaceBorder,
            backgroundColor: theme.surface,
          },
          !canIncrease && styles.buttonDisabled,
          pressed && canIncrease && styles.buttonPressed,
        ]}>
        <Text style={styles.buttonLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  button: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  value: {
    minWidth: 24,
    textAlign: 'center',
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
