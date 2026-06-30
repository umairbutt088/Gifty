export type PaletteBackgroundPattern =
  | 'aurora'
  | 'minimal'
  | 'bands'
  | 'orbit'
  | 'waves'
  | 'bloom'
  | 'mesh'
  | 'geometric';

export type ScreenBackgroundVariant =
  | 'geometric'
  | 'aurora'
  | 'minimal'
  | 'bands'
  | 'orbit'
  | 'waves'
  | 'bloom'
  | 'mesh'
  | 'gifty-classic'
  | 'teal-glow'
  | 'mint-cool'
  | 'berry-blush'
  | 'sunset-warm'
  | 'emerald-forest'
  | 'ocean-deep'
  | 'rose-petal'
  | 'coral-warm'
  | 'lavender-haze'
  | 'midnight-sky'
  | 'plum-royal'
  | 'peach-cream'
  | 'gold-amber'
  | 'mauve-dust'
  | 'blush-soft'
  | 'hot-pink';

/** Visual pattern for each background — colors always come from the active color theme. */
export const BackgroundPatternByVariant: Record<ScreenBackgroundVariant, PaletteBackgroundPattern> = {
  geometric: 'geometric',
  aurora: 'aurora',
  minimal: 'minimal',
  bands: 'bands',
  orbit: 'orbit',
  waves: 'waves',
  bloom: 'bloom',
  mesh: 'mesh',
  'gifty-classic': 'geometric',
  'teal-glow': 'aurora',
  'mint-cool': 'waves',
  'berry-blush': 'bloom',
  'sunset-warm': 'bands',
  'emerald-forest': 'minimal',
  'ocean-deep': 'mesh',
  'rose-petal': 'aurora',
  'coral-warm': 'orbit',
  'lavender-haze': 'bloom',
  'midnight-sky': 'geometric',
  'plum-royal': 'orbit',
  'peach-cream': 'waves',
  'gold-amber': 'bands',
  'mauve-dust': 'mesh',
  'blush-soft': 'minimal',
  'hot-pink': 'bloom',
};

export type BackgroundOption = {
  variant: ScreenBackgroundVariant;
  label: string;
  description: string;
};

export const BackgroundOptions: readonly BackgroundOption[] = [
  { variant: 'geometric', label: 'Geometric', description: 'Layered diagonal shapes' },
  { variant: 'aurora', label: 'Aurora', description: 'Soft glowing orbs' },
  { variant: 'minimal', label: 'Minimal', description: 'Clean top glow' },
  { variant: 'bands', label: 'Bands', description: 'Diagonal color stripes' },
  { variant: 'orbit', label: 'Orbit', description: 'Floating rings' },
  { variant: 'waves', label: 'Waves', description: 'Rolling curved layers' },
  { variant: 'bloom', label: 'Bloom', description: 'Large soft color blooms' },
  { variant: 'mesh', label: 'Mesh', description: 'Angled overlapping tiles' },
  { variant: 'gifty-classic', label: 'Classic Layers', description: 'Deep geometric stack' },
  { variant: 'hot-pink', label: 'Pink Bloom', description: 'Bold bloom layout' },
  { variant: 'sunset-warm', label: 'Sunset Bands', description: 'Warm diagonal bands' },
  { variant: 'mint-cool', label: 'Cool Waves', description: 'Flowing wave layers' },
  { variant: 'berry-blush', label: 'Berry Bloom', description: 'Rich bloom spread' },
  { variant: 'emerald-forest', label: 'Forest Glow', description: 'Minimal bottom wash' },
  { variant: 'ocean-deep', label: 'Deep Mesh', description: 'Layered mesh tiles' },
  { variant: 'rose-petal', label: 'Petal Aurora', description: 'Soft orb aurora' },
  { variant: 'coral-warm', label: 'Coral Orbit', description: 'Ring orbit layout' },
  { variant: 'lavender-haze', label: 'Haze Bloom', description: 'Wide bloom haze' },
  { variant: 'midnight-sky', label: 'Night Geometry', description: 'Dark geometric stack' },
  { variant: 'plum-royal', label: 'Royal Orbit', description: 'Violet ring orbit' },
  { variant: 'peach-cream', label: 'Cream Waves', description: 'Gentle wave flow' },
  { variant: 'gold-amber', label: 'Amber Bands', description: 'Golden stripe bands' },
  { variant: 'mauve-dust', label: 'Dust Mesh', description: 'Dusty mesh overlap' },
  { variant: 'blush-soft', label: 'Soft Minimal', description: 'Light minimal glow' },
  { variant: 'teal-glow', label: 'Teal Aurora', description: 'Cool aurora wash' },
] as const;

export const DefaultScreenBackgroundVariant: ScreenBackgroundVariant = 'geometric';

export const BackgroundVariantSet = new Set<ScreenBackgroundVariant>(
  BackgroundOptions.map((option) => option.variant),
);

export function getBackgroundPattern(variant: ScreenBackgroundVariant): PaletteBackgroundPattern {
  return BackgroundPatternByVariant[variant] ?? 'geometric';
}
