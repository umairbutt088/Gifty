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
  DefaultScreenTheme,
  ScreenThemes,
  type ScreenTheme,
  type ScreenThemeVariant,
} from '@/constants/color-themes';
import {
  getStoredBackgroundVariant,
  setStoredBackgroundVariant,
} from '@/lib/background-storage';
import { getStoredThemeVariant, setStoredThemeVariant } from '@/lib/theme-storage';

type AppThemeContextValue = {
  theme: ScreenTheme;
  variant: ScreenThemeVariant;
  backgroundVariant: ScreenBackgroundVariant;
  isReady: boolean;
  setThemeVariant: (variant: ScreenThemeVariant) => Promise<void>;
  setBackgroundVariant: (variant: ScreenBackgroundVariant) => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue>({
  theme: DefaultScreenTheme,
  variant: 'gifty',
  backgroundVariant: DefaultScreenBackgroundVariant,
  isReady: false,
  setThemeVariant: async () => {},
  setBackgroundVariant: async () => {},
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<ScreenThemeVariant>('gifty');
  const [backgroundVariant, setBackgroundVariantState] = useState<ScreenBackgroundVariant>(
    DefaultScreenBackgroundVariant,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Promise.all([getStoredThemeVariant(), getStoredBackgroundVariant()]).then(
      ([storedTheme, storedBackground]) => {
        if (storedTheme) {
          setVariant(storedTheme);
        }
        setBackgroundVariantState(storedBackground);
        setIsReady(true);
      },
    );
  }, []);

  const setThemeVariant = useCallback(async (next: ScreenThemeVariant) => {
    setVariant(next);
    await setStoredThemeVariant(next);
  }, []);

  const setBackgroundVariant = useCallback(async (next: ScreenBackgroundVariant) => {
    setBackgroundVariantState(next);
    await setStoredBackgroundVariant(next);
  }, []);

  const value = useMemo(
    () => ({
      theme: ScreenThemes[variant],
      variant,
      backgroundVariant,
      isReady,
      setThemeVariant,
      setBackgroundVariant,
    }),
    [variant, backgroundVariant, isReady, setThemeVariant, setBackgroundVariant],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

/** Full theme context — variant, background, setters, and current palette */
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
