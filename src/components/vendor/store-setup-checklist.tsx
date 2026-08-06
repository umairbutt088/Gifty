import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { getStoreCompleteness } from '@/lib/vendor-store-helpers';
import type { VendorStoreRow } from '@/types/vendor';

type StoreSetupChecklistProps = {
  store: VendorStoreRow | null;
  liveGiftCount?: number;
};

export function StoreSetupChecklist({ store, liveGiftCount = 0 }: StoreSetupChecklistProps) {
  const colors = useColors();
  const { items, percent } = getStoreCompleteness(store, liveGiftCount);

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: colors.surfaceBorder,
          backgroundColor: colors.surface,
        },
      ]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Store setup</Text>
        <Text style={[styles.percent, { color: colors.accent }]}>{percent}%</Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.surfaceNested }]}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: colors.accent }]} />
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>
              {item.done ? '✓' : '○'}
            </Text>
            <Text
              style={[
                styles.label,
                { color: item.done ? colors.text : colors.textSecondary },
                item.done && styles.labelDone,
              ]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  percent: {
    fontSize: 14,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  bullet: {
    fontSize: 14,
    width: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
  },
  labelDone: {
    fontWeight: '600',
  },
});
