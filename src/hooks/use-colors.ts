import { useMemo } from 'react';

import type { ScreenTheme } from '@/constants/color-themes';
import type { NeutralColors } from '@/constants/color-mode';
import { useAppTheme } from '@/providers/screen-theme-provider';

export type AppColors = NeutralColors & ScreenTheme;

export function useColors(): AppColors {
  const { theme, colors } = useAppTheme();

  return useMemo(
    () => ({
      ...colors,
      ...theme,
    }),
    [colors, theme],
  );
}
