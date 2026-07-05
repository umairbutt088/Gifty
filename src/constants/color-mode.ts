import type { ScreenTheme } from '@/constants/color-themes';

export type ColorModePreference = 'system' | 'light' | 'dark';
export type ResolvedColorMode = 'light' | 'dark';

export type NeutralColors = {
  background: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  grain: string;
  vignette: string;
};

export const ColorModeOptions: readonly {
  value: ColorModePreference;
  label: string;
  description: string;
}[] = [
  { value: 'system', label: 'System', description: 'Match your device setting' },
  { value: 'light', label: 'Light', description: 'Bright backgrounds and dark text' },
  { value: 'dark', label: 'Dark', description: 'Dark backgrounds and light text' },
];

const DarkNeutrals: NeutralColors = {
  background: '#000000',
  text: '#F0F2F4',
  textSecondary: 'rgba(240, 242, 244, 0.80)',
  textMuted: 'rgba(240, 242, 244, 0.58)',
  grain: 'rgba(255, 255, 255, 0.018)',
  vignette: 'rgba(0, 0, 0, 0.5)',
};

const LightNeutrals: NeutralColors = {
  background: '#F4F6F9',
  text: '#141820',
  textSecondary: 'rgba(20, 24, 32, 0.72)',
  textMuted: 'rgba(20, 24, 32, 0.52)',
  grain: 'rgba(0, 0, 0, 0.02)',
  vignette: 'rgba(255, 255, 255, 0.4)',
};

export function resolveColorMode(
  preference: ColorModePreference,
  systemScheme: string | null | undefined,
): ResolvedColorMode {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return systemScheme === 'light' ? 'light' : 'dark';
}

export function getNeutralColors(mode: ResolvedColorMode): NeutralColors {
  return mode === 'light' ? LightNeutrals : DarkNeutrals;
}

export function applyColorModeToTheme(
  theme: ScreenTheme,
  mode: ResolvedColorMode,
): ScreenTheme {
  if (mode === 'dark') {
    return theme;
  }

  return {
    ...theme,
    surface: 'rgba(255, 255, 255, 0.84)',
    surfaceNested: 'rgba(255, 255, 255, 0.96)',
    surfaceBorder: 'rgba(20, 24, 32, 0.12)',
    surfaceSelected: 'rgba(255, 255, 255, 0.98)',
    surfaceSelectedBorder: `${theme.accent}55`,
    tabTrack: 'rgba(255, 255, 255, 0.9)',
    tabActive: `${theme.accent}30`,
    tabActiveBorder: `${theme.accent}55`,
    tabActiveFillTop: theme.accentLight,
    tabActiveFillBottom: theme.accent,
    input: 'rgba(255, 255, 255, 0.96)',
    inputBorder: 'rgba(20, 24, 32, 0.12)',
    button: `${theme.accent}CC`,
    buttonBorder: `${theme.accent}44`,
    buttonPressed: `${theme.accent}E6`,
    buttonDisabled: `${theme.accent}44`,
    backgroundShapes: theme.backgroundShapes.map((shape) => ({
      ...shape,
      opacity: shape.opacity * 0.42,
      colors: shape.colors.map((color) =>
        color.toLowerCase() === '#000000' ? '#E4E9F0' : color,
      ) as typeof shape.colors,
    })),
  };
}
