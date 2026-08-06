import { StyleSheet, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type MarketplaceHomeSkeletonProps = {
  cards?: number;
};

export function MarketplaceHomeSkeleton({ cards = 4 }: MarketplaceHomeSkeletonProps) {
  const colors = useColors();
  const theme = useScreenTheme();
  const block = { backgroundColor: theme.surfaceNested };

  return (
    <View style={styles.container}>
      <View style={[styles.hero, block, { borderColor: theme.surfaceBorder }]} />
      <View style={[styles.search, block, { borderColor: theme.surfaceBorder }]} />
      <View style={styles.chipRow}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.chip, block]} />
        ))}
      </View>
      <View style={styles.grid}>
        {Array.from({ length: cards }).map((_, index) => (
          <GlassCard key={index} variant="nested" style={styles.card}>
            <View style={[styles.image, { backgroundColor: colors.surfaceNested }]} />
            <View style={styles.meta}>
              <View style={[styles.lineShort, block]} />
              <View style={[styles.line, block]} />
              <View style={[styles.lineTiny, block]} />
            </View>
          </GlassCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  hero: {
    height: 178,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  search: {
    height: 50,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    width: 84,
    height: 38,
    borderRadius: 999,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  card: {
    width: '47%',
    flexGrow: 1,
    gap: 0,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  meta: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  line: {
    height: 14,
    borderRadius: 7,
    width: '90%',
  },
  lineShort: {
    height: 12,
    borderRadius: 6,
    width: '55%',
  },
  lineTiny: {
    height: 12,
    borderRadius: 6,
    width: '40%',
  },
});
