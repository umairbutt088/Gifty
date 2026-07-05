import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { getStoreCompleteness } from '@/lib/vendor-store-helpers';
import type { VendorStoreRow } from '@/types/vendor';

type StoreSetupChecklistProps = {
  store: VendorStoreRow | null;
  liveGiftCount?: number;
};

export function StoreSetupChecklist({ store, liveGiftCount = 0 }: StoreSetupChecklistProps) {
  const { items, percent } = getStoreCompleteness(store, liveGiftCount);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Store setup</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.bullet}>{item.done ? '✓' : '○'}</Text>
            <Text style={[styles.label, item.done && styles.labelDone]}>{item.label}</Text>
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
    borderColor: Colors.surfaceBorder,
    borderRadius: Spacing.four,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  percent: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceNested,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.accent,
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
    color: Colors.textSecondary,
    fontSize: 14,
    width: 16,
    textAlign: 'center',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  labelDone: {
    color: Colors.text,
    fontWeight: '600',
  },
});
