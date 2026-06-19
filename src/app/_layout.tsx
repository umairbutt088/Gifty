import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components';
import { Colors } from '@/constants/colors';

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
    <ThemeProvider value={GiftyTheme}>
      <StatusBar style="light" />
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      />
    </ThemeProvider>
  );
}
