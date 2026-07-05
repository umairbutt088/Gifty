import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type MenuRowProps = {
  title: string;
  description?: string;
  href: Href;
};

export function MenuRow({ title, description, href }: MenuRowProps) {
  const colors = useColors();
  const theme = useScreenTheme();

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <GlassCard style={styles.row}>
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {description ? (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
            ) : null}
          </View>
          <Text style={[styles.chevron, { color: theme.accentLight }]}>›</Text>
        </GlassCard>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.9,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
});
