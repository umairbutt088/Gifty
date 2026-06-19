import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components';
import { AuthGate } from '@/components/auth-gate';
import { Colors } from '@/constants/colors';
import { AuthProvider } from '@/providers/auth-provider';

const GiftyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
    border: Colors.surfaceBorder,
    primary: Colors.accent,
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={GiftyTheme}>
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
      </ThemeProvider>
    </AuthProvider>
  );
}
