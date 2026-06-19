/**
 * Gifty color palette — derived from the wallpaper reference.
 * Cool, muted teal-green and slate indigo on pure black. No warm or red tones.
 */

/** Raw swatches matched to the reference wallpaper */
export const Palette = {
  black: '#000000',

  /** Blue-green family — hero lozenge, no yellow/warm cast */
  teal: {
    100: '#3A8F82',
    200: '#2E7268',
    300: '#245A52',
    400: '#1A4540',
    500: '#123530',
    600: '#0D2B26',
  },

  /** Deep green layers tucked behind the hero shape */
  forest: {
    100: '#1C4A42',
    200: '#153A34',
    300: '#0F2A24',
    400: '#0A1F1B',
  },

  /** Dusty indigo / slate blue — right-side shapes */
  indigo: {
    100: '#5A6A8F',
    200: '#4A5A8F',
    300: '#3A4768',
    400: '#2A3448',
    500: '#1A2233',
    600: '#101620',
  },

  /** Near-black navy for the bottom anchor shape */
  navy: {
    100: '#222B3D',
    200: '#1A2233',
    300: '#121826',
    400: '#0A0F18',
    500: '#050810',
  },
} as const;

/** Semantic tokens — subdued to match the moody wallpaper */
export const Colors = {
  background: Palette.black,

  text: '#F0F2F4',
  textSecondary: 'rgba(240, 242, 244, 0.62)',
  textMuted: 'rgba(240, 242, 244, 0.38)',

  accent: Palette.teal[100],
  accentLight: Palette.teal[200],
  accentDark: Palette.teal[400],
  accentMuted: 'rgba(58, 143, 130, 0.28)',

  brandGradient: {
    start: Palette.teal[100],
    mid: Palette.teal[200],
    end: Palette.indigo[200],
  },

  brandBanner: {
    gradientStart: '#267A6C',
    gradientEnd: '#081210',
    wordmarkGradientStart: '#FFFFFF',
    wordmarkGradientEnd: '#9AD4C8',
    taglineGradientStart: '#B8E8DE',
    taglineGradientEnd: '#6AADA2',
    accent: 'rgba(90, 170, 155, 0.35)',
    ring: 'rgba(90, 170, 155, 0.22)',
    tagline: 'rgba(120, 190, 175, 0.75)',
  },

  surface: 'rgba(22, 28, 42, 0.42)',
  surfaceNested: 'rgba(18, 24, 38, 0.86)',
  surfaceBorder: 'rgba(255, 255, 255, 0.14)',
  surfaceSelected: 'rgba(30, 40, 56, 0.94)',
  surfaceSelectedBorder: 'rgba(58, 143, 130, 0.55)',

  tabTrack: 'rgba(12, 16, 26, 0.75)',
  tabActive: 'rgba(58, 143, 130, 0.35)',
  tabActiveBorder: 'rgba(58, 143, 130, 0.55)',
  tabActiveFillTop: '#3D9488',
  tabActiveFillBottom: '#0F2A24',
  tabCornerAccent: '#56D4C8',

  input: 'rgba(12, 16, 26, 0.88)',
  inputBorder: 'rgba(255, 255, 255, 0.12)',

  button: 'rgba(46, 114, 104, 0.88)',
  buttonBorder: 'rgba(58, 143, 130, 0.4)',
  buttonPressed: 'rgba(46, 114, 104, 0.95)',
  buttonDisabled: 'rgba(46, 114, 104, 0.35)',

  grain: 'rgba(255, 255, 255, 0.018)',
  vignette: 'rgba(0, 0, 0, 0.5)',
} as const;

/** Smooth left-to-right gradient as evenly blended hex stops */
export function getLinearGradientSteps(from: string, to: string, count: number): string[] {
  if (count <= 1) return [from];

  return Array.from({ length: count }, (_, index) =>
    blendHexColors(from, to, index / (count - 1)),
  );
}

/** Evenly spaced colors along the brand gradient for wordmark letters */
export function getBrandGradientSteps(count: number): string[] {
  const { start, mid, end } = Colors.brandGradient;
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

/**
 * Layered lozenges — each shape stays within one hue family
 * so gradients never pass through warm/red tones.
 */
export const BackgroundShapes: readonly BackgroundShape[] = [
  {
    id: 'hero-teal',
    widthRatio: 0.88,
    heightRatio: 0.44,
    topRatio: -0.04,
    leftRatio: -0.32,
    colors: [Palette.teal[200], Palette.teal[300], Palette.teal[500], Palette.forest[300]],
    borderRadius: 72,
    rotate: '-42deg',
    opacity: 0.9,
  },
  {
    id: 'forest-layer',
    widthRatio: 0.62,
    heightRatio: 0.32,
    topRatio: 0.1,
    leftRatio: 0.18,
    colors: [Palette.forest[100], Palette.forest[200], Palette.forest[400]],
    borderRadius: 64,
    rotate: '-42deg',
    opacity: 0.7,
  },
  {
    id: 'mid-indigo',
    widthRatio: 0.5,
    heightRatio: 0.3,
    topRatio: 0.16,
    leftRatio: 0.48,
    colors: [Palette.indigo[200], Palette.indigo[400], Palette.indigo[500]],
    borderRadius: 60,
    rotate: '-42deg',
    opacity: 0.75,
  },
  {
    id: 'top-slate',
    widthRatio: 0.42,
    heightRatio: 0.24,
    topRatio: -0.02,
    leftRatio: 0.62,
    colors: [Palette.indigo[300], Palette.indigo[500], Palette.navy[300]],
    borderRadius: 52,
    rotate: '-42deg',
    opacity: 0.65,
  },
  {
    id: 'base-navy',
    widthRatio: 1.1,
    heightRatio: 0.5,
    topRatio: 0.55,
    leftRatio: -0.38,
    colors: [Palette.navy[100], Palette.navy[300], Palette.navy[400], Palette.black],
    borderRadius: 80,
    rotate: '-42deg',
    opacity: 0.92,
  },
] as const;
