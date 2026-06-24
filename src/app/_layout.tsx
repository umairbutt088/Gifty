import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, type ReactNode } from 'react';

import { AnimatedSplashOverlay } from '@/components';
import { AuthGate } from '@/components/auth-gate';
import { Colors } from '@/constants/colors';
import { AuthProvider } from '@/providers/auth-provider';
import { AppThemeProvider, useScreenTheme } from '@/providers/screen-theme-provider';

function NavigationThemeProvider({ children }: { children: ReactNode }) {
  const theme = useScreenTheme();

  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: Colors.background,
        card: Colors.background,
        text: Colors.text,
        border: theme.surfaceBorder,
        primary: theme.accent,
      },
    }),
    [theme],
  );

  return <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>;
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <NavigationThemeProvider>
          <StatusBar style="light" />
          <AnimatedSplashOverlay />
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: 'fade',
              }}
            />
          </AuthGate>
        </NavigationThemeProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
