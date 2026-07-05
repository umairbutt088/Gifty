import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components';
import { BackgroundPreview } from '@/components/screen-background';
import {
  DashboardHeader,
  MenuRow,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { BackgroundOptions, type ScreenBackgroundVariant } from '@/constants/background-styles';
import { ColorModeOptions, type ColorModePreference } from '@/constants/color-mode';
import { ThemeOptions, type ScreenThemeVariant } from '@/constants/color-themes';
import { useColors } from '@/hooks/use-colors';
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

function ColorModeOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useScreenTheme();
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeOption,
        {
          borderColor: selected ? theme.accent : theme.surfaceBorder,
          backgroundColor: selected ? theme.surfaceSelected : theme.surface,
        },
        pressed && styles.swatchPressed,
      ]}>
      <Text style={[styles.modeLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.modeDescription, { color: colors.textSecondary }]}>{description}</Text>
    </Pressable>
  );
}

function ThemeSwatch({ label, description, preview, selected, onPress }: ThemeSwatchProps) {
  const theme = useScreenTheme();
  const colors = useColors();

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
        <Text style={[styles.swatchLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.swatchDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      {selected ? (
        <View style={[styles.selectedBadge, { backgroundColor: theme.accent }]}>
          <Text style={[styles.selectedBadgeText, { color: colors.text }]}>Active</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function BackgroundSwatch({
  label,
  description,
  variant,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  variant: ScreenBackgroundVariant;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useScreenTheme();
  const colors = useColors();

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
      <BackgroundPreview variant={variant} selected={selected} />
      <View style={styles.swatchText}>
        <Text style={[styles.swatchLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.swatchDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      {selected ? (
        <View style={[styles.selectedBadge, { backgroundColor: theme.accent }]}>
          <Text style={[styles.selectedBadgeText, { color: colors.text }]}>Active</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { profile, user, signOut } = useAuth();
  const { variant, backgroundVariant, colorMode, setThemeVariant, setBackgroundVariant, setColorMode } =
    useAppTheme();
  const colors = useColors();
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

  function handleSelectBackground(next: ScreenBackgroundVariant) {
    void setBackgroundVariant(next);
  }

  function handleSelectColorMode(next: ColorModePreference) {
    void setColorMode(next);
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
        <Text style={[styles.themeHint, { color: colors.textSecondary }]}>
          Choose light or dark mode, then pick accent colors and a background pattern.
        </Text>
        <Text style={[styles.groupLabel, { color: colors.text }]}>Color mode</Text>
        <View style={styles.modeList}>
          {ColorModeOptions.map((option) => (
            <ColorModeOption
              key={option.value}
              label={option.label}
              description={option.description}
              selected={colorMode === option.value}
              onPress={() => handleSelectColorMode(option.value)}
            />
          ))}
        </View>
        <Text style={[styles.groupLabel, { color: colors.text }]}>Color theme</Text>
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
        <Text style={[styles.groupLabel, { color: colors.text }]}>Background style</Text>
        <View style={styles.swatchList}>
          {BackgroundOptions.map((option) => (
            <BackgroundSwatch
              key={option.variant}
              label={option.label}
              description={option.description}
              variant={option.variant}
              selected={backgroundVariant === option.variant}
              onPress={() => handleSelectBackground(option.variant)}
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
    fontSize: 14,
    lineHeight: 20,
  },
  modeList: {
    gap: Spacing.two,
  },
  modeOption: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: Spacing.one,
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
    fontSize: 16,
    fontWeight: '600',
  },
  swatchDescription: {
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
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
