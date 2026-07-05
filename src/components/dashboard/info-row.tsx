import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';

/** Fixed label column so values align vertically across rows. */
export const INFO_LABEL_WIDTH = 132;

type InfoRowProps = {
  label: string;
  value: string;
  capitalize?: boolean;
  italic?: boolean;
  multiline?: boolean;
};

export function InfoRow({
  label,
  value,
  capitalize = false,
  italic = false,
  multiline = false,
}: InfoRowProps) {
  const colors = useColors();

  return (
    <View style={[styles.row, multiline && styles.rowMultiline]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={[
          styles.value,
          { color: colors.text },
          capitalize && styles.valueCapitalized,
          italic && styles.valueItalic,
        ]}
        numberOfLines={multiline ? undefined : 1}
        ellipsizeMode={multiline ? undefined : 'tail'}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowMultiline: {
    alignItems: 'flex-start',
  },
  label: {
    width: INFO_LABEL_WIDTH,
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 20,
  },
  value: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  valueCapitalized: {
    textTransform: 'capitalize',
  },
  valueItalic: {
    fontStyle: 'italic',
    fontWeight: '500',
  },
});
