import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  DefaultScreenBackgroundVariant,
  type ScreenBackgroundVariant,
} from '@/constants/background-styles';
import {
  applyColorModeToTheme,
  getNeutralColors,
  resolveColorMode,
  type ColorModePreference,
  type NeutralColors,
  type ResolvedColorMode,
} from '@/constants/color-mode';
import {
  DefaultScreenTheme,
  LightFirstThemes,
  ScreenThemes,
  type ScreenTheme,
  type ScreenThemeVariant,
} from '@/constants/color-themes';
import {
  getStoredBackgroundVariant,
  setStoredBackgroundVariant,
} from '@/lib/background-storage';
import { getStoredColorMode, setStoredColorMode } from '@/lib/color-mode-storage';
import { getStoredThemeVariant, setStoredThemeVariant } from '@/lib/theme-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AppThemeContextValue = {
  theme: ScreenTheme;
  colors: NeutralColors;
  variant: ScreenThemeVariant;
  backgroundVariant: ScreenBackgroundVariant;
  colorMode: ColorModePreference;
  resolvedColorMode: ResolvedColorMode;
  isReady: boolean;
  setThemeVariant: (variant: ScreenThemeVariant) => Promise<void>;
  setBackgroundVariant: (variant: ScreenBackgroundVariant) => Promise<void>;
  setColorMode: (mode: ColorModePreference) => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue>({
  theme: DefaultScreenTheme,
  colors: getNeutralColors('dark'),
  variant: 'gifty',
  backgroundVariant: DefaultScreenBackgroundVariant,
  colorMode: 'system',
  resolvedColorMode: 'dark',
  isReady: false,
  setThemeVariant: async () => {},
  setBackgroundVariant: async () => {},
  setColorMode: async () => {},
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [variant, setVariant] = useState<ScreenThemeVariant>('gifty');
  const [backgroundVariant, setBackgroundVariantState] = useState<ScreenBackgroundVariant>(
    DefaultScreenBackgroundVariant,
  );
  const [colorMode, setColorModeState] = useState<ColorModePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Promise.all([
      getStoredThemeVariant(),
      getStoredBackgroundVariant(),
      getStoredColorMode(),
    ]).then(([storedTheme, storedBackground, storedColorMode]) => {
      if (storedTheme) {
        setVariant(storedTheme);
      }
      setBackgroundVariantState(storedBackground);
      if (storedColorMode) {
        setColorModeState(storedColorMode);
      }
      setIsReady(true);
    });
  }, []);

  const setThemeVariant = useCallback(async (next: ScreenThemeVariant) => {
    setVariant(next);
    await setStoredThemeVariant(next);

    if (LightFirstThemes.has(next)) {
      setColorModeState('light');
      setBackgroundVariantState('minimal');
      await Promise.all([setStoredColorMode('light'), setStoredBackgroundVariant('minimal')]);
    }
  }, []);

  const setBackgroundVariant = useCallback(async (next: ScreenBackgroundVariant) => {
    setBackgroundVariantState(next);
    await setStoredBackgroundVariant(next);
  }, []);

  const setColorMode = useCallback(async (next: ColorModePreference) => {
    if (LightFirstThemes.has(variant) && next !== 'light') {
      setColorModeState('light');
      await setStoredColorMode('light');
      return;
    }

    setColorModeState(next);
    await setStoredColorMode(next);
  }, [variant]);

  const resolvedColorMode = LightFirstThemes.has(variant)
    ? 'light'
    : resolveColorMode(colorMode, systemScheme);
  const baseTheme = ScreenThemes[variant];
  const theme = useMemo(
    () => applyColorModeToTheme(baseTheme, resolvedColorMode),
    [baseTheme, resolvedColorMode],
  );
  const colors = useMemo(() => getNeutralColors(resolvedColorMode), [resolvedColorMode]);

  const value = useMemo(
    () => ({
      theme,
      colors,
      variant,
      backgroundVariant: LightFirstThemes.has(variant) ? 'minimal' : backgroundVariant,
      colorMode: LightFirstThemes.has(variant) ? 'light' : colorMode,
      resolvedColorMode,
      isReady,
      setThemeVariant,
      setBackgroundVariant,
      setColorMode,
    }),
    [
      theme,
      colors,
      variant,
      backgroundVariant,
      colorMode,
      resolvedColorMode,
      isReady,
      setThemeVariant,
      setBackgroundVariant,
      setColorMode,
    ],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

/** Full theme context — variant, background, color mode, setters, and current palette */
export function useAppTheme() {
  return useContext(AppThemeContext);
}

/** Current palette tokens for UI components */
export function useScreenTheme(): ScreenTheme {
  return useContext(AppThemeContext).theme;
}

/** @deprecated Use AppThemeProvider at the app root instead */
export function ScreenThemeProvider({
  children,
}: {
  variant?: ScreenThemeVariant;
  children: ReactNode;
}) {
  return <>{children}</>;
}
