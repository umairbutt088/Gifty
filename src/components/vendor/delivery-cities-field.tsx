import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { normalizeDeliveryCities } from '@/lib/vendor-store-helpers';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type DeliveryCitiesFieldProps = {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  hint?: string;
  error?: string | null;
};

export function DeliveryCitiesField({
  value,
  onChange,
  label = 'Delivery cities',
  hint = 'Add at least one city you deliver to.',
  error,
}: DeliveryCitiesFieldProps) {
  const theme = useScreenTheme();
  const colors = useColors();
  const [draft, setDraft] = useState('');

  function addCity() {
    const next = normalizeDeliveryCities([...value, draft]);
    if (next.length === value.length) {
      setDraft('');
      return;
    }
    onChange(next);
    setDraft('');
  }

  function removeCity(city: string) {
    onChange(value.filter((item) => item !== city));
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

      <View style={styles.chipRow}>
        {value.map((city) => (
          <Pressable
            key={city}
            accessibilityLabel={`Remove ${city}`}
            onPress={() => removeCity(city)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: colors.surfaceNested,
                borderColor: colors.surfaceBorder,
              },
              pressed && styles.chipPressed,
            ]}>
            <Text style={[styles.chipText, { color: colors.text }]}>{city}</Text>
            <Text style={[styles.chipRemove, { color: colors.textSecondary }]}>×</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Karachi"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={addCity}
          style={[
            styles.input,
            {
              backgroundColor: theme.input,
              borderColor: error ? '#E05D5D' : theme.inputBorder,
              color: colors.text,
            },
          ]}
        />
        <Pressable
          accessibilityLabel="Add city"
          onPress={addCity}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.accent },
            !draft.trim() && styles.addButtonDisabled,
            pressed && draft.trim() ? styles.addButtonPressed : null,
          ]}>
          <Text style={[styles.addButtonText, { color: colors.text }]}>Add</Text>
        </Pressable>
      </View>

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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipRemove: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  addButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  addButtonDisabled: {
    opacity: 0.45,
  },
  addButtonPressed: {
    opacity: 0.88,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
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
