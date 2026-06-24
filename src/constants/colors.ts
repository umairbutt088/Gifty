/**
 * Shared Gifty tokens — text, background, and color utilities.
 * Per-screen accent palettes live in color-themes.ts.
 */

import { DefaultScreenTheme } from '@/constants/color-themes';

export const Palette = {
  black: '#000000',
} as const;

/** Shared neutrals used on every screen */
export const Colors = {
  background: Palette.black,

  text: '#F0F2F4',
  textSecondary: 'rgba(240, 242, 244, 0.62)',
  textMuted: 'rgba(240, 242, 244, 0.38)',

  /** Default accent when no ScreenThemeProvider is present */
  accent: DefaultScreenTheme.accent,
  accentLight: DefaultScreenTheme.accentLight,
  accentDark: DefaultScreenTheme.accentDark,
  accentMuted: DefaultScreenTheme.accentMuted,

  brandGradient: DefaultScreenTheme.brandGradient,
  brandBanner: DefaultScreenTheme.brandBanner,

  surface: DefaultScreenTheme.surface,
  surfaceNested: DefaultScreenTheme.surfaceNested,
  surfaceBorder: DefaultScreenTheme.surfaceBorder,
  surfaceSelected: DefaultScreenTheme.surfaceSelected,
  surfaceSelectedBorder: DefaultScreenTheme.surfaceSelectedBorder,

  tabTrack: DefaultScreenTheme.tabTrack,
  tabActive: DefaultScreenTheme.tabActive,
  tabActiveBorder: DefaultScreenTheme.tabActiveBorder,
  tabActiveFillTop: DefaultScreenTheme.tabActiveFillTop,
  tabActiveFillBottom: DefaultScreenTheme.tabActiveFillBottom,
  tabCornerAccent: DefaultScreenTheme.tabCornerAccent,

  input: DefaultScreenTheme.input,
  inputBorder: DefaultScreenTheme.inputBorder,

  button: DefaultScreenTheme.button,
  buttonBorder: DefaultScreenTheme.buttonBorder,
  buttonPressed: DefaultScreenTheme.buttonPressed,
  buttonDisabled: DefaultScreenTheme.buttonDisabled,

  grain: 'rgba(255, 255, 255, 0.018)',
  vignette: 'rgba(0, 0, 0, 0.5)',
} as const;

export function getLinearGradientSteps(from: string, to: string, count: number): string[] {
  if (count <= 1) return [from];

  return Array.from({ length: count }, (_, index) =>
    blendHexColors(from, to, index / (count - 1)),
  );
}

export function getBrandGradientSteps(
  count: number,
  gradient = Colors.brandGradient,
): string[] {
  const { start, mid, end } = gradient;
  if (count <= 1) return [start];

  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    if (t <= 0.5) return blendHexColors(start, mid, t * 2);
    return blendHexColors(mid, end, (t - 0.5) * 2);
  });
}

function blendHexColors(from: string, to: string, amount: number): string {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);

  return rgbToHex(mix(start.r, end.r), mix(start.g, end.g), mix(start.b, end.b));
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

export type BackgroundShape = {
  id: string;
  widthRatio: number;
  heightRatio: number;
  topRatio: number;
  leftRatio: number;
  colors: readonly [string, string, ...string[]];
  borderRadius: number;
  rotate: string;
  opacity: number;
};
