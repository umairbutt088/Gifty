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
  DefaultScreenTheme,
  ScreenThemes,
  type ScreenTheme,
  type ScreenThemeVariant,
} from '@/constants/color-themes';
import { getStoredThemeVariant, setStoredThemeVariant } from '@/lib/theme-storage';

type AppThemeContextValue = {
  theme: ScreenTheme;
  variant: ScreenThemeVariant;
  isReady: boolean;
  setThemeVariant: (variant: ScreenThemeVariant) => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue>({
  theme: DefaultScreenTheme,
  variant: 'gifty',
  isReady: false,
  setThemeVariant: async () => {},
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<ScreenThemeVariant>('gifty');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getStoredThemeVariant().then((stored) => {
      if (stored) {
        setVariant(stored);
      }
      setIsReady(true);
    });
  }, []);

  const setThemeVariant = useCallback(async (next: ScreenThemeVariant) => {
    setVariant(next);
    await setStoredThemeVariant(next);
  }, []);

  const value = useMemo(
    () => ({
      theme: ScreenThemes[variant],
      variant,
      isReady,
      setThemeVariant,
    }),
    [variant, isReady, setThemeVariant],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

/** Full theme context — variant, setter, and current palette */
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
