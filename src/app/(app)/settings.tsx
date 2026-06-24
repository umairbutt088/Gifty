import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components';
import {
  DashboardHeader,
  MenuRow,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { ThemeOptions, type ScreenThemeVariant } from '@/constants/color-themes';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { getRoleHomeHref } from '@/lib/role-routes';
import { useAuth } from '@/providers/auth-provider';
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
  const { profile, user, signOut } = useAuth();
  const { variant, setThemeVariant } = useAppTheme();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.replace('/');
  }

  function handleSelectTheme(next: ScreenThemeVariant) {
    void setThemeVariant(next);
  }

  return (
    <ScreenShell>
      <DashboardHeader
        title="Settings"
        subtitle={user?.email ?? undefined}
        role={profile?.role}
        showBanner={false}
      />

      <SectionTitle>Appearance</SectionTitle>
      <GlassCard style={styles.themeCard}>
        <Text style={styles.themeHint}>
          Choose a gradient theme. It applies across the whole app instantly.
        </Text>
        <View style={styles.swatchList}>
          {ThemeOptions.map((option) => (
            <ThemeSwatch
              key={option.variant}
              label={option.label}
              description={option.description}
              preview={option.preview}
              selected={variant === option.variant}
              onPress={() => handleSelectTheme(option.variant)}
            />
          ))}
        </View>
      </GlassCard>

      <SectionTitle>Account</SectionTitle>
      {profile ? (
        <MenuRow
          title="Back to dashboard"
          description="Return to your role home screen"
          href={getRoleHomeHref(profile.role)}
        />
      ) : null}

      <PrimaryButton label="Sign out" loading={signingOut} onPress={handleSignOut} variant="secondary" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  themeCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  themeHint: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  swatchList: {
    gap: Spacing.two,
  },
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
