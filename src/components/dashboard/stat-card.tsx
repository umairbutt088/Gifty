import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <GlassCard style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

type StatGridProps = {
  items: StatCardProps[];
};

export function StatGrid({ items }: StatGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.cell}>
          <StatCard {...item} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  cell: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 140,
  },
  card: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  value: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
