import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';

import { GIFT_STATUS_LABELS } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftStatus } from '@/types/vendor';

const STATUS_OPTIONS = (Object.keys(GIFT_STATUS_LABELS) as GiftStatus[]).map((value) => ({
  value,
  label: GIFT_STATUS_LABELS[value],
}));

type GiftStatusPickerProps = {
  value: GiftStatus;
  onChange: (status: GiftStatus) => void;
  disabled?: boolean;
};

export function GiftStatusPicker({ value, onChange, disabled = false }: GiftStatusPickerProps) {
  const theme = useScreenTheme();
  const colors = useColors();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>Status</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {STATUS_OPTIONS.map((item) => {
          const selected = item.value === value;

          return (
            <Pressable
              key={item.value}
              disabled={disabled}
              onPress={() => onChange(item.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.surfaceSelected : theme.surface,
                  borderColor: selected ? theme.surfaceSelectedBorder : theme.surfaceBorder,
                },
                disabled && styles.chipDisabled,
              ]}>
              <Text
                style={[
                  styles.chipLabel,
                  { color: colors.textSecondary },
                  selected && { color: colors.text },
                ]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
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
  chips: {
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
