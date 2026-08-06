import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useAppTheme, useScreenTheme } from '@/providers/screen-theme-provider';

export function useThemedAuthStyles() {
  const theme = useScreenTheme();
  const colors = useColors();
  const { resolvedColorMode } = useAppTheme();
  const isLight = resolvedColorMode === 'light';

  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
        },
        flex: { flex: 1 },
        safeArea: { flex: 1 },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: Spacing.four,
          paddingTop: Spacing.two,
          paddingBottom: Spacing.five,
          gap: Spacing.four,
        },
        header: {
          gap: Spacing.three,
          alignItems: 'stretch',
        },
        title: {
          color: colors.text,
          fontSize: 28,
          fontWeight: '700',
          lineHeight: 34,
        },
        subtitle: {
          color: colors.textSecondary,
          fontSize: 15,
          lineHeight: 22,
        },
        helpText: {
          color: colors.textMuted,
          fontSize: 13,
          lineHeight: 20,
        },
        formCard: {
          padding: Spacing.four,
          gap: Spacing.three,
        },
        nameRow: {
          flexDirection: 'row',
          gap: Spacing.three,
        },
        field: {
          gap: Spacing.one,
        },
        halfField: {
          flex: 1,
        },
        fieldLabel: {
          color: colors.textSecondary,
          fontSize: 13,
          fontWeight: '500',
        },
        input: {
          backgroundColor: theme.input,
          borderWidth: 1,
          borderColor: theme.inputBorder,
          borderRadius: Spacing.two,
          paddingHorizontal: Spacing.three,
          paddingVertical: Platform.select({ ios: 14, default: 12 }),
          color: colors.text,
          fontSize: 16,
        },
        inputError: {
          borderColor: 'rgba(220, 100, 100, 0.6)',
        },
        errorText: {
          color: isLight ? '#C04040' : 'rgba(220, 130, 130, 0.9)',
          fontSize: 12,
        },
        button: {
          backgroundColor: theme.button,
          borderWidth: 1,
          borderColor: theme.buttonBorder,
          borderRadius: Spacing.two,
          paddingVertical: Spacing.three,
          alignItems: 'center',
          marginTop: Spacing.one,
        },
        buttonDisabled: {
          backgroundColor: theme.buttonDisabled,
        },
        buttonPressed: {
          backgroundColor: theme.buttonPressed,
        },
        buttonText: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '600',
        },
        linkButtonText: {
          color: theme.accent,
          fontSize: 15,
          fontWeight: '600',
          marginTop: Spacing.two,
        },
        footerText: {
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: 'center',
        },
        footerLink: {
          color: theme.accent,
          fontWeight: '600',
        },
        forgotPassword: {
          color: theme.accent,
          fontSize: 14,
          fontWeight: '600',
          alignSelf: 'flex-end',
        },
      }),
    [colors, theme, isLight],
  );
}
