import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GIFT_OCCASIONS } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftOccasion } from '@/types/vendor';

type OccasionTagsFieldProps = {
  value: GiftOccasion[];
  onChange: (value: GiftOccasion[]) => void;
};

export function OccasionTagsField({ value, onChange }: OccasionTagsFieldProps) {
  const theme = useScreenTheme();
  const colors = useColors();

  function toggle(tag: GiftOccasion) {
    if (value.includes(tag)) {
      onChange(value.filter((item) => item !== tag));
      return;
    }
    onChange([...value, tag]);
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>Occasions</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Help buyers find this gift for the right moment.
      </Text>
      <View style={styles.chips}>
        {GIFT_OCCASIONS.map((item) => {
          const selected = value.includes(item.value);

          return (
            <Pressable
              key={item.value}
              onPress={() => toggle(item.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.surfaceSelected : theme.surface,
                  borderColor: selected ? theme.surfaceSelectedBorder : theme.surfaceBorder,
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? theme.accentLight : colors.textSecondary },
                ]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
