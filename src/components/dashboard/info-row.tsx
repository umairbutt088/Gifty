import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
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
  return (
    <View style={[styles.row, multiline && styles.rowMultiline]}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
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
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  value: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    color: Colors.text,
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
