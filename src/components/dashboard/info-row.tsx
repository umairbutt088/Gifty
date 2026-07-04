import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

type InfoRowProps = {
  label: string;
  value: string;
  capitalize?: boolean;
};

export function InfoRow({ label, value, capitalize = false }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[styles.value, capitalize && styles.valueCapitalized]}
        numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  label: {
    flexShrink: 0,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  value: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  valueCapitalized: {
    textTransform: 'capitalize',
  },
});
