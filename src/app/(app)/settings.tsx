import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBanner, GeometricBackground, GlassCard } from '@/components';
import { ThemeOptions, type ScreenThemeVariant } from '@/constants/color-themes';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useAppTheme, useScreenTheme } from '@/providers/screen-theme-provider';

type ThemeSwatchProps = {
  label: string;
  description: string;
  preview: readonly [string, string, string];
  selected: boolean;
  onPress: () => void;
};

function ThemeSwatch({ label, description, preview, selected, onPress }: ThemeSwatchProps) {
  const theme = useScreenTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.swatch,
        {
          borderColor: selected ? theme.accent : theme.surfaceBorder,
          backgroundColor: selected ? theme.surfaceSelected : theme.surface,
        },
        pressed && styles.swatchPressed,
      ]}>
      <View style={styles.previewRow}>
        {preview.map((color) => (
          <View key={color} style={[styles.previewSlice, { backgroundColor: color }]} />
        ))}
      </View>
      <View style={styles.swatchText}>
        <Text style={styles.swatchLabel}>{label}</Text>
        <Text style={styles.swatchDescription}>{description}</Text>
      </View>
      {selected ? (
        <View style={[styles.selectedBadge, { backgroundColor: theme.accent }]}>
          <Text style={styles.selectedBadgeText}>Active</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { variant, setThemeVariant } = useAppTheme();
  const theme = useScreenTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  function handleSelect(next: ScreenThemeVariant) {
    void setThemeVariant(next);
  }

  return (
    <View style={styles.root}>
      <GeometricBackground />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <BrandBanner showTagline={false} />

          <View style={styles.header}>
            <Text style={styles.title}>Appearance</Text>
            <Text style={styles.subtitle}>
              Choose a gradient theme. It applies across the whole app instantly.
            </Text>
          </View>

          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>Theme</Text>
            <View style={styles.swatchList}>
              {ThemeOptions.map((option) => (
                <ThemeSwatch
                  key={option.variant}
                  label={option.label}
                  description={option.description}
                  preview={option.preview}
                  selected={variant === option.variant}
                  onPress={() => handleSelect(option.variant)}
                />
              ))}
            </View>
          </GlassCard>

          <Link href="/home" style={styles.backLink}>
            Back to home
          </Link>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useScreenTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.five,
      gap: Spacing.four,
    },
    header: {
      gap: Spacing.one,
    },
    title: {
      color: Colors.text,
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 34,
    },
    subtitle: {
      color: Colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    card: {
      padding: Spacing.four,
      gap: Spacing.three,
    },
    sectionTitle: {
      color: Colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    swatchList: {
      gap: Spacing.two,
    },
    backLink: {
      color: theme.accentLight,
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
}

const styles = StyleSheet.create({
  swatch: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  swatchPressed: {
    opacity: 0.92,
  },
  previewRow: {
    flexDirection: 'row',
    height: 56,
  },
  previewSlice: {
    flex: 1,
  },
  swatchText: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  swatchLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  swatchDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  selectedBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  selectedBadgeText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
