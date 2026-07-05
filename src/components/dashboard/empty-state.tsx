import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  const colors = useColors();

  return (
    <GlassCard style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
  },
});
