import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

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
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.button,
    borderWidth: 1,
    borderColor: Colors.buttonBorder,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: Colors.surfaceNested,
    borderColor: Colors.surfaceBorder,
  },
  buttonDisabled: {
    backgroundColor: Colors.buttonDisabled,
  },
  buttonPressed: {
    backgroundColor: Colors.buttonPressed,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
