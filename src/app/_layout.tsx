import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components';
import { AuthGate } from '@/components/auth-gate';
import { configurePushNotifications } from '@/lib/push-notifications';
import { AuthProvider } from '@/providers/auth-provider';
import { AppThemeProvider, useAppTheme } from '@/providers/screen-theme-provider';

configurePushNotifications();

function NavigationThemeProvider({ children }: { children: ReactNode }) {
  const { theme, colors, resolvedColorMode } = useAppTheme();
  const isDark = resolvedColorMode === 'dark';

  const navigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: theme.surfaceBorder,
        primary: theme.accent,
      },
    }),
    [colors.background, colors.text, isDark, theme.accent, theme.surfaceBorder],
  );

  return <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>;
}

function RootStack() {
  const { colors, resolvedColorMode } = useAppTheme();

  return (
    <>
      <StatusBar style={resolvedColorMode === 'dark' ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        />
      </AuthGate>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <AppThemeProvider>
          <AuthProvider>
            <NavigationThemeProvider>
              <RootStack />
            </NavigationThemeProvider>
          </AuthProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
