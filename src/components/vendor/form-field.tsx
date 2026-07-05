import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string | null;
};

export function FormField({ label, hint, error, style, ...props }: FormFieldProps) {
  const theme = useScreenTheme();
  const colors = useColors();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.input,
            borderColor: theme.inputBorder,
            color: colors.text,
          },
          error ? styles.inputError : null,
          style,
        ]}
        {...props}
      />
      {hint ? <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  inputError: {
    borderColor: '#E05D5D',
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: '#E05D5D',
    fontSize: 12,
  },
});
