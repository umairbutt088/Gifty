import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string | null;
};

export function FormField({ label, hint, error, style, ...props }: FormFieldProps) {
  const theme = useScreenTheme();

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={Colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.input,
            borderColor: theme.inputBorder,
          },
          error ? styles.inputError : null,
          style,
        ]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    color: Colors.text,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  inputError: {
    borderColor: '#E05D5D',
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: '#E05D5D',
    fontSize: 12,
  },
});
