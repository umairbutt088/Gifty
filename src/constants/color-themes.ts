import type { BackgroundShape } from '@/constants/colors';

export type ScreenThemeVariant =
  | 'gifty'
  | 'teal'
  | 'rose'
  | 'blush'
  | 'coral'
  | 'mauve'
  | 'gold'
  | 'lavender'
  | 'ocean'
  | 'emerald'
  | 'sunset'
  | 'berry'
  | 'mint'
  | 'midnight'
  | 'peach'
  | 'plum';

export type ScreenTheme = {
  variant: ScreenThemeVariant;
  accent: string;
  accentLight: string;
  accentDark: string;
  accentMuted: string;
  brandGradient: { start: string; mid: string; end: string };
  brandBanner: {
    gradientStart: string;
    gradientEnd: string;
    wordmarkGradientStart: string;
    wordmarkGradientEnd: string;
    taglineGradientStart: string;
    taglineGradientEnd: string;
    accent: string;
    ring: string;
    tagline: string;
  };
  surface: string;
  surfaceNested: string;
  surfaceBorder: string;
  surfaceSelected: string;
  surfaceSelectedBorder: string;
  tabTrack: string;
  tabActive: string;
  tabActiveBorder: string;
  tabActiveFillTop: string;
  tabActiveFillBottom: string;
  tabCornerAccent: string;
  input: string;
  inputBorder: string;
  button: string;
  buttonBorder: string;
  buttonPressed: string;
  buttonDisabled: string;
  backgroundShapes: readonly BackgroundShape[];
};

type HueFamily = {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
};

type ThemePalette = {
  hero: HueFamily;
  depth: HueFamily;
  accent: HueFamily;
  shadow: HueFamily;
  anchor: HueFamily;
};

function buildBackgroundShapes(p: ThemePalette): readonly BackgroundShape[] {
  return [
    {
      id: 'hero',
      widthRatio: 0.88,
      heightRatio: 0.44,
      topRatio: -0.04,
      leftRatio: -0.32,
      colors: [p.hero[200], p.hero[300], p.hero[500], p.depth[300]],
      borderRadius: 72,
      rotate: '-42deg',
      opacity: 0.9,
    },
    {
      id: 'depth-layer',
      widthRatio: 0.62,
      heightRatio: 0.32,
      topRatio: 0.1,
      leftRatio: 0.18,
      colors: [p.depth[100], p.depth[200], p.depth[400]],
      borderRadius: 64,
      rotate: '-42deg',
      opacity: 0.7,
    },
    {
      id: 'mid-accent',
      widthRatio: 0.5,
      heightRatio: 0.3,
      topRatio: 0.16,
      leftRatio: 0.48,
      colors: [p.accent[200], p.accent[400], p.accent[500]],
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
      colors: [p.accent[300], p.shadow[300], p.shadow[400]],
      borderRadius: 52,
      rotate: '-42deg',
      opacity: 0.65,
    },
    {
      id: 'base-anchor',
      widthRatio: 1.1,
      heightRatio: 0.5,
      topRatio: 0.55,
      leftRatio: -0.38,
      colors: [p.anchor[100], p.anchor[300], p.anchor[400], '#000000'],
      borderRadius: 80,
      rotate: '-42deg',
      opacity: 0.92,
    },
  ];
}

type SurfaceTokens = Pick<
  ScreenTheme,
  'surface' | 'surfaceNested' | 'surfaceSelected' | 'tabTrack' | 'input'
>;

const warmSurfaces: SurfaceTokens = {
  surface: 'rgba(28, 18, 24, 0.42)',
  surfaceNested: 'rgba(22, 14, 20, 0.86)',
  surfaceSelected: 'rgba(36, 24, 32, 0.94)',
  tabTrack: 'rgba(18, 10, 16, 0.75)',
  input: 'rgba(16, 10, 14, 0.88)',
};

const coolSurfaces: SurfaceTokens = {
  surface: 'rgba(22, 28, 42, 0.42)',
  surfaceNested: 'rgba(18, 24, 38, 0.86)',
  surfaceSelected: 'rgba(30, 40, 56, 0.94)',
  tabTrack: 'rgba(12, 16, 26, 0.75)',
  input: 'rgba(12, 16, 26, 0.88)',
};

function buildTheme(
  variant: ScreenThemeVariant,
  palette: ThemePalette,
  banner: ScreenTheme['brandBanner'],
  accentHex: string,
  surfaces: SurfaceTokens = warmSurfaces,
): ScreenTheme {
  return {
    variant,
    accent: accentHex,
    accentLight: palette.hero[100],
    accentDark: palette.hero[400],
    accentMuted: `${accentHex}47`,
    brandGradient: {
      start: palette.hero[100],
      mid: palette.hero[200],
      end: palette.accent[200],
    },
    brandBanner: banner,
    surface: surfaces.surface,
    surfaceNested: surfaces.surfaceNested,
    surfaceBorder: 'rgba(255, 255, 255, 0.14)',
    surfaceSelected: surfaces.surfaceSelected,
    surfaceSelectedBorder: `${accentHex}8C`,
    tabTrack: surfaces.tabTrack,
    tabActive: `${accentHex}59`,
    tabActiveBorder: `${accentHex}8C`,
    tabActiveFillTop: palette.hero[100],
    tabActiveFillBottom: palette.depth[300],
    tabCornerAccent: palette.accent[100],
    input: surfaces.input,
    inputBorder: 'rgba(255, 255, 255, 0.12)',
    button: `${palette.hero[200]}E0`,
    buttonBorder: `${accentHex}66`,
    buttonPressed: `${palette.hero[200]}F2`,
    buttonDisabled: `${palette.hero[200]}59`,
    backgroundShapes: buildBackgroundShapes(palette),
  };
}

/** Light red — signup */
const rosePalette: ThemePalette = {
  hero: { 100: '#E87878', 200: '#C85858', 300: '#A04040', 400: '#782E2E', 500: '#521F1F', 600: '#3A1515' },
  depth: { 100: '#8F4048', 200: '#6E3038', 300: '#4A2028', 400: '#2E1418', 500: '#1A0C10', 600: '#0E0608' },
  accent: { 100: '#F0A0A8', 200: '#C87080', 300: '#985060', 400: '#6A3848', 500: '#442430', 600: '#281418' },
  shadow: { 100: '#6A4858', 200: '#503848', 300: '#382830', 400: '#241820', 500: '#140C10', 600: '#0A0608' },
  anchor: { 100: '#3A2830', 200: '#281820', 300: '#181018', 400: '#0C080C', 500: '#050406', 600: '#000000' },
};

/** Soft pink — login */
const blushPalette: ThemePalette = {
  hero: { 100: '#E8A0C0', 200: '#D080A8', 300: '#B06888', 400: '#884E68', 500: '#603848', 600: '#402830' },
  depth: { 100: '#985878', 200: '#784860', 300: '#543440', 400: '#382428', 500: '#201418', 600: '#100A0C' },
  accent: { 100: '#F0B8D0', 200: '#D890B0', 300: '#B07090', 400: '#885070', 500: '#583848', 600: '#382028' },
  shadow: { 100: '#806080', 200: '#604860', 300: '#403040', 400: '#281E28', 500: '#141014', 600: '#0A080A' },
  anchor: { 100: '#382838', 200: '#281C28', 300: '#181018', 400: '#0C080C', 500: '#050406', 600: '#000000' },
};

/** Warm coral — password reset */
const coralPalette: ThemePalette = {
  hero: { 100: '#F0A088', 200: '#D88068', 300: '#B86850', 400: '#8F5038', 500: '#603820', 600: '#402818' },
  depth: { 100: '#A06048', 200: '#804838', 300: '#583020', 400: '#382018', 500: '#201010', 600: '#100808' },
  accent: { 100: '#F8C0A8', 200: '#E8A080', 300: '#C88060', 400: '#985840', 500: '#603820', 600: '#402818' },
  shadow: { 100: '#806050', 200: '#604840', 300: '#403028', 400: '#281E18', 500: '#141010', 600: '#0A0806' },
  anchor: { 100: '#382820', 200: '#281C18', 300: '#181010', 400: '#0C0808', 500: '#050404', 600: '#000000' },
};

/** Dusty mauve */
const mauvePalette: ThemePalette = {
  hero: { 100: '#C098C0', 200: '#A078A8', 300: '#806088', 400: '#604868', 500: '#403048', 600: '#282030' },
  depth: { 100: '#785878', 200: '#584460', 300: '#3C3040', 400: '#241C28', 500: '#141018', 600: '#0A080C' },
  accent: { 100: '#D8B0D8', 200: '#B890C0', 300: '#9870A0', 400: '#705078', 500: '#483848', 600: '#302830' },
  shadow: { 100: '#685870', 200: '#504058', 300: '#382838', 400: '#241820', 500: '#140C14', 600: '#0A060A' },
  anchor: { 100: '#302838', 200: '#201820', 300: '#121018', 400: '#08080C', 500: '#040406', 600: '#000000' },
};

/** App icon — coral → pink → purple */
const giftyPalette: ThemePalette = {
  hero: { 100: '#FF8070', 200: '#FF5E3A', 300: '#E84850', 400: '#C83058', 500: '#902048', 600: '#601830' },
  depth: { 100: '#E85078', 200: '#C83868', 300: '#982058', 400: '#681040', 500: '#400828', 600: '#280418' },
  accent: { 100: '#FF5088', 200: '#FF2A68', 300: '#D82078', 400: '#A81888', 500: '#781070', 600: '#500858' },
  shadow: { 100: '#A858C8', 200: '#7B2CBF', 300: '#5A2090', 400: '#381860', 500: '#201040', 600: '#100820' },
  anchor: { 100: '#301848', 200: '#201030', 300: '#120820', 400: '#080414', 500: '#04020A', 600: '#000000' },
};

/** Original teal-green wallpaper theme */
const tealPalette: ThemePalette = {
  hero: { 100: '#3A8F82', 200: '#2E7268', 300: '#245A52', 400: '#1A4540', 500: '#123530', 600: '#0D2B26' },
  depth: { 100: '#1C4A42', 200: '#153A34', 300: '#0F2A24', 400: '#0A1F1B', 500: '#061512', 600: '#030C0A' },
  accent: { 100: '#5A6A8F', 200: '#4A5A8F', 300: '#3A4768', 400: '#2A3448', 500: '#1A2233', 600: '#101620' },
  shadow: { 100: '#4A5A8F', 200: '#3A4768', 300: '#2A3448', 400: '#1A2233', 500: '#101620', 600: '#080C14' },
  anchor: { 100: '#222B3D', 200: '#1A2233', 300: '#121826', 400: '#0A0F18', 500: '#050810', 600: '#000000' },
};

/** Festive amber gold */
const goldPalette: ThemePalette = {
  hero: { 100: '#E8C070', 200: '#D4A048', 300: '#B08030', 400: '#886020', 500: '#604018', 600: '#402810' },
  depth: { 100: '#A07840', 200: '#806030', 300: '#584020', 400: '#382818', 500: '#201810', 600: '#100C08' },
  accent: { 100: '#F0D890', 200: '#E0B860', 300: '#C09840', 400: '#987030', 500: '#685020', 600: '#403018' },
  shadow: { 100: '#806848', 200: '#605038', 300: '#403828', 400: '#282018', 500: '#141008', 600: '#0A0804' },
  anchor: { 100: '#382818', 200: '#281C10', 300: '#181008', 400: '#0C0804', 500: '#050402', 600: '#000000' },
};

/** Soft lavender */
const lavenderPalette: ThemePalette = {
  hero: { 100: '#B8A8E8', 200: '#9888D0', 300: '#7868B0', 400: '#585090', 500: '#383870', 600: '#282850' },
  depth: { 100: '#7868A8', 200: '#585088', 300: '#403868', 400: '#282848', 500: '#181830', 600: '#0C0C18' },
  accent: { 100: '#D0C0F0', 200: '#B0A0E0', 300: '#9080C0', 400: '#7060A0', 500: '#504880', 600: '#383060' },
  shadow: { 100: '#6860A0', 200: '#504880', 300: '#383060', 400: '#242040', 500: '#141020', 600: '#0A0810' },
  anchor: { 100: '#282040', 200: '#1C1830', 300: '#101020', 400: '#080810', 500: '#040408', 600: '#000000' },
};

/** Deep ocean blue */
const oceanPalette: ThemePalette = {
  hero: { 100: '#60C8F0', 200: '#38B0E8', 300: '#2090D0', 400: '#1868A8', 500: '#104880', 600: '#083058' },
  depth: { 100: '#2878B8', 200: '#205898', 300: '#183870', 400: '#102448', 500: '#081428', 600: '#040A18' },
  accent: { 100: '#78B8F8', 200: '#4898E8', 300: '#3078C8', 400: '#2058A0', 500: '#143870', 600: '#0C2048' },
  shadow: { 100: '#4068A8', 200: '#304880', 300: '#203058', 400: '#142038', 500: '#0A1020', 600: '#050810' },
  anchor: { 100: '#182840', 200: '#101830', 300: '#080C20', 400: '#040610', 500: '#020308', 600: '#000000' },
};

/** Rich emerald green */
const emeraldPalette: ThemePalette = {
  hero: { 100: '#5EE8A8', 200: '#34D088', 300: '#20A868', 400: '#188050', 500: '#105838', 600: '#083820' },
  depth: { 100: '#289868', 200: '#187848', 300: '#105830', 400: '#083820', 500: '#042010', 600: '#021008' },
  accent: { 100: '#78F0C0', 200: '#40D8A0', 300: '#28B880', 400: '#189060', 500: '#106840', 600: '#084028' },
  shadow: { 100: '#388868', 200: '#286850', 300: '#184838', 400: '#102820', 500: '#081410', 600: '#040808' },
  anchor: { 100: '#102820', 200: '#081810', 300: '#040C08', 400: '#020604', 500: '#010302', 600: '#000000' },
};

/** Orange sunset glow */
const sunsetPalette: ThemePalette = {
  hero: { 100: '#FBB060', 200: '#F89040', 300: '#E87028', 400: '#C85020', 500: '#903818', 600: '#602010' },
  depth: { 100: '#E86048', 200: '#C84838', 300: '#983028', 400: '#681820', 500: '#401010', 600: '#280808' },
  accent: { 100: '#F878A8', 200: '#E85088', 300: '#C83878', 400: '#982860', 500: '#681848', 600: '#401030' },
  shadow: { 100: '#B84898', 200: '#903878', 300: '#682858', 400: '#401840', 500: '#280C28', 600: '#140614' },
  anchor: { 100: '#401830', 200: '#281020', 300: '#180818', 400: '#0C040C', 500: '#060206', 600: '#000000' },
};

/** Deep berry wine */
const berryPalette: ThemePalette = {
  hero: { 100: '#F06078', 200: '#E04058', 300: '#C02848', 400: '#981838', 500: '#681028', 600: '#400818' },
  depth: { 100: '#B83058', 200: '#982048', 300: '#701838', 400: '#481028', 500: '#280818', 600: '#140408' },
  accent: { 100: '#F078A8', 200: '#D85088', 300: '#B83870', 400: '#882858', 500: '#581840', 600: '#381028' },
  shadow: { 100: '#883878', 200: '#682860', 300: '#481848', 400: '#281030', 500: '#180820', 600: '#0C0408' },
  anchor: { 100: '#381028', 200: '#280818', 300: '#180410', 400: '#0C0208', 500: '#060104', 600: '#000000' },
};

/** Fresh mint seafoam */
const mintPalette: ThemePalette = {
  hero: { 100: '#80F0C8', 200: '#58E0B0', 300: '#38C098', 400: '#289878', 500: '#186858', 600: '#104038' },
  depth: { 100: '#48B898', 200: '#389878', 300: '#287858', 400: '#185038', 500: '#103020', 600: '#081810' },
  accent: { 100: '#70E8E0', 200: '#40D0C8', 300: '#28B0A8', 400: '#188880', 500: '#106058', 600: '#083838' },
  shadow: { 100: '#3898A8', 200: '#287888', 300: '#185868', 400: '#103848', 500: '#082028', 600: '#041014' },
  anchor: { 100: '#103030', 200: '#082020', 300: '#041010', 400: '#020808', 500: '#010404', 600: '#000000' },
};

/** Deep midnight indigo */
const midnightPalette: ThemePalette = {
  hero: { 100: '#9098F8', 200: '#6870E8', 300: '#5058D0', 400: '#3840A8', 500: '#283080', 600: '#182058' },
  depth: { 100: '#4858B8', 200: '#384898', 300: '#283070', 400: '#182048', 500: '#101030', 600: '#080818' },
  accent: { 100: '#A8A0F0', 200: '#8078E0', 300: '#6058C0', 400: '#4840A0', 500: '#302878', 600: '#201850' },
  shadow: { 100: '#4848A0', 200: '#383880', 300: '#282860', 400: '#181840', 500: '#0C0C28', 600: '#060614' },
  anchor: { 100: '#181830', 200: '#101020', 300: '#080810', 400: '#040408', 500: '#020204', 600: '#000000' },
};

/** Soft peach cream */
const peachPalette: ThemePalette = {
  hero: { 100: '#FCC890', 200: '#F8A868', 300: '#E88848', 400: '#C86830', 500: '#984820', 600: '#683018' },
  depth: { 100: '#E89070', 200: '#C87058', 300: '#985040', 400: '#683028', 500: '#401818', 600: '#280C08' },
  accent: { 100: '#F8B0C8', 200: '#F088A8', 300: '#D86888', 400: '#B04868', 500: '#803048', 600: '#501830' },
  shadow: { 100: '#C87898', 200: '#A05878', 300: '#784058', 400: '#502838', 500: '#301820', 600: '#180C10' },
  anchor: { 100: '#402028', 200: '#281418', 300: '#180C10', 400: '#0C0608', 500: '#060304', 600: '#000000' },
};

/** Royal plum violet */
const plumPalette: ThemePalette = {
  hero: { 100: '#C888F0', 200: '#A868E0', 300: '#8848C0', 400: '#6830A0', 500: '#482078', 600: '#301050' },
  depth: { 100: '#7848A8', 200: '#583888', 300: '#402868', 400: '#281848', 500: '#180C30', 600: '#0C0618' },
  accent: { 100: '#D8A0F8', 200: '#B880E8', 300: '#9860D0', 400: '#7848B0', 500: '#583090', 600: '#381870' },
  shadow: { 100: '#6840A0', 200: '#503080', 300: '#382060', 400: '#241440', 500: '#140C28', 600: '#080614' },
  anchor: { 100: '#281040', 200: '#180828', 300: '#0C0418', 400: '#06020C', 500: '#030106', 600: '#000000' },
};

export const ScreenThemes: Record<ScreenThemeVariant, ScreenTheme> = {
  gifty: buildTheme(
    'gifty',
    giftyPalette,
    {
      gradientStart: '#FF5E3A',
      gradientEnd: '#1A0830',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#FF6A98',
      taglineGradientStart: '#FFB090',
      taglineGradientEnd: '#FF2A68',
      accent: 'rgba(255, 90, 120, 0.35)',
      ring: 'rgba(255, 90, 120, 0.22)',
      tagline: 'rgba(255, 160, 180, 0.75)',
    },
    '#FF5E3A',
  ),

  teal: buildTheme(
    'teal',
    tealPalette,
    {
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
    '#3A8F82',
    coolSurfaces,
  ),

  rose: buildTheme(
    'rose',
    rosePalette,
    {
      gradientStart: '#A84858',
      gradientEnd: '#180810',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#F0B0B8',
      taglineGradientStart: '#F8D0D4',
      taglineGradientEnd: '#D88898',
      accent: 'rgba(220, 120, 130, 0.35)',
      ring: 'rgba(220, 120, 130, 0.22)',
      tagline: 'rgba(240, 160, 168, 0.75)',
    },
    '#E87878',
  ),

  blush: buildTheme(
    'blush',
    blushPalette,
    {
    gradientStart: '#B86888',
    gradientEnd: '#180818',
    wordmarkGradientStart: '#FFFFFF',
    wordmarkGradientEnd: '#F0C0D8',
    taglineGradientStart: '#F8D8E8',
    taglineGradientEnd: '#D898B8',
    accent: 'rgba(220, 140, 180, 0.35)',
    ring: 'rgba(220, 140, 180, 0.22)',
    tagline: 'rgba(240, 180, 208, 0.75)',
    },
    '#E8A0C0',
  ),

  coral: buildTheme(
    'coral',
    coralPalette,
    {
    gradientStart: '#C87058',
    gradientEnd: '#180808',
    wordmarkGradientStart: '#FFFFFF',
    wordmarkGradientEnd: '#F8C8B0',
    taglineGradientStart: '#F8E0D0',
    taglineGradientEnd: '#E8A888',
    accent: 'rgba(240, 160, 120, 0.35)',
    ring: 'rgba(240, 160, 120, 0.22)',
    tagline: 'rgba(248, 192, 168, 0.75)',
    },
    '#F0A088',
  ),

  mauve: buildTheme(
    'mauve',
    mauvePalette,
    {
    gradientStart: '#886898',
    gradientEnd: '#100818',
    wordmarkGradientStart: '#FFFFFF',
    wordmarkGradientEnd: '#D8B8E0',
    taglineGradientStart: '#E8D0F0',
    taglineGradientEnd: '#B898C8',
    accent: 'rgba(180, 140, 200, 0.35)',
    ring: 'rgba(180, 140, 200, 0.22)',
    tagline: 'rgba(216, 176, 216, 0.75)',
    },
    '#C098C0',
  ),

  gold: buildTheme(
    'gold',
    goldPalette,
    {
      gradientStart: '#C89840',
      gradientEnd: '#181008',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#F0D890',
      taglineGradientStart: '#F8E8C0',
      taglineGradientEnd: '#D4A848',
      accent: 'rgba(220, 180, 80, 0.35)',
      ring: 'rgba(220, 180, 80, 0.22)',
      tagline: 'rgba(240, 208, 140, 0.75)',
    },
    '#D4A048',
  ),

  lavender: buildTheme(
    'lavender',
    lavenderPalette,
    {
      gradientStart: '#7868B0',
      gradientEnd: '#100818',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#D0C0F0',
      taglineGradientStart: '#E8E0F8',
      taglineGradientEnd: '#B0A0E0',
      accent: 'rgba(160, 140, 220, 0.35)',
      ring: 'rgba(160, 140, 220, 0.22)',
      tagline: 'rgba(200, 180, 240, 0.75)',
    },
    '#9888D0',
  ),

  ocean: buildTheme(
    'ocean',
    oceanPalette,
    {
      gradientStart: '#2090D0',
      gradientEnd: '#081428',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#78C8F8',
      taglineGradientStart: '#B0E0F8',
      taglineGradientEnd: '#4898E8',
      accent: 'rgba(80, 160, 240, 0.35)',
      ring: 'rgba(80, 160, 240, 0.22)',
      tagline: 'rgba(140, 200, 248, 0.75)',
    },
    '#38B0E8',
    coolSurfaces,
  ),

  emerald: buildTheme(
    'emerald',
    emeraldPalette,
    {
      gradientStart: '#28A868',
      gradientEnd: '#041008',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#78F0C0',
      taglineGradientStart: '#B8F8E0',
      taglineGradientEnd: '#40D8A0',
      accent: 'rgba(60, 200, 140, 0.35)',
      ring: 'rgba(60, 200, 140, 0.22)',
      tagline: 'rgba(120, 232, 180, 0.75)',
    },
    '#34D088',
    coolSurfaces,
  ),

  sunset: buildTheme(
    'sunset',
    sunsetPalette,
    {
      gradientStart: '#F89040',
      gradientEnd: '#280818',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#F8A0C0',
      taglineGradientStart: '#FCD0A0',
      taglineGradientEnd: '#E85088',
      accent: 'rgba(248, 140, 100, 0.35)',
      ring: 'rgba(248, 140, 100, 0.22)',
      tagline: 'rgba(252, 180, 140, 0.75)',
    },
    '#F89040',
  ),

  berry: buildTheme(
    'berry',
    berryPalette,
    {
      gradientStart: '#C02848',
      gradientEnd: '#180410',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#F088A8',
      taglineGradientStart: '#F8C0D0',
      taglineGradientEnd: '#D85088',
      accent: 'rgba(220, 60, 100, 0.35)',
      ring: 'rgba(220, 60, 100, 0.22)',
      tagline: 'rgba(240, 120, 160, 0.75)',
    },
    '#E04058',
  ),

  mint: buildTheme(
    'mint',
    mintPalette,
    {
      gradientStart: '#38C098',
      gradientEnd: '#041010',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#80F0C8',
      taglineGradientStart: '#C0F8E8',
      taglineGradientEnd: '#40D0C8',
      accent: 'rgba(80, 220, 180, 0.35)',
      ring: 'rgba(80, 220, 180, 0.22)',
      tagline: 'rgba(140, 240, 210, 0.75)',
    },
    '#58E0B0',
    coolSurfaces,
  ),

  midnight: buildTheme(
    'midnight',
    midnightPalette,
    {
      gradientStart: '#5058D0',
      gradientEnd: '#080818',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#A8A0F0',
      taglineGradientStart: '#D0C8F8',
      taglineGradientEnd: '#8078E0',
      accent: 'rgba(120, 120, 240, 0.35)',
      ring: 'rgba(120, 120, 240, 0.22)',
      tagline: 'rgba(168, 160, 240, 0.75)',
    },
    '#6870E8',
    coolSurfaces,
  ),

  peach: buildTheme(
    'peach',
    peachPalette,
    {
      gradientStart: '#E88848',
      gradientEnd: '#180C08',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#F8C0A0',
      taglineGradientStart: '#FCE0C8',
      taglineGradientEnd: '#F088A8',
      accent: 'rgba(248, 160, 120, 0.35)',
      ring: 'rgba(248, 160, 120, 0.22)',
      tagline: 'rgba(252, 192, 160, 0.75)',
    },
    '#F8A868',
  ),

  plum: buildTheme(
    'plum',
    plumPalette,
    {
      gradientStart: '#8848C0',
      gradientEnd: '#0C0618',
      wordmarkGradientStart: '#FFFFFF',
      wordmarkGradientEnd: '#D8A0F8',
      taglineGradientStart: '#E8C8F8',
      taglineGradientEnd: '#B880E8',
      accent: 'rgba(168, 100, 240, 0.35)',
      ring: 'rgba(168, 100, 240, 0.22)',
      tagline: 'rgba(200, 140, 248, 0.75)',
    },
    '#A868E0',
  ),
};

export const DefaultScreenTheme = ScreenThemes.gifty;

export type ThemeOption = {
  variant: ScreenThemeVariant;
  label: string;
  description: string;
  /** Left-to-right gradient preview swatches */
  preview: readonly [string, string, string];
};

export const ThemeOptions: readonly ThemeOption[] = [
  {
    variant: 'gifty',
    label: 'Gifty',
    description: 'App icon — coral, pink & purple',
    preview: ['#FF5E3A', '#FF2A68', '#7B2CBF'],
  },
  {
    variant: 'teal',
    label: 'Teal',
    description: 'Original cool green theme',
    preview: ['#3A8F82', '#2E7268', '#4A5A8F'],
  },
  {
    variant: 'rose',
    label: 'Rose',
    description: 'Light red warmth',
    preview: ['#E87878', '#C85858', '#782E2E'],
  },
  {
    variant: 'blush',
    label: 'Blush',
    description: 'Soft pink glow',
    preview: ['#E8A0C0', '#D080A8', '#884E68'],
  },
  {
    variant: 'coral',
    label: 'Coral',
    description: 'Warm peachy red',
    preview: ['#F0A088', '#D88068', '#8F5038'],
  },
  {
    variant: 'mauve',
    label: 'Mauve',
    description: 'Dusty purple pink',
    preview: ['#C098C0', '#A078A8', '#604868'],
  },
  {
    variant: 'gold',
    label: 'Gold',
    description: 'Festive amber warmth',
    preview: ['#E8C070', '#D4A048', '#886020'],
  },
  {
    variant: 'lavender',
    label: 'Lavender',
    description: 'Soft purple haze',
    preview: ['#B8A8E8', '#9888D0', '#585090'],
  },
  {
    variant: 'ocean',
    label: 'Ocean',
    description: 'Sky blue to deep sea',
    preview: ['#60C8F0', '#38B0E8', '#104880'],
  },
  {
    variant: 'emerald',
    label: 'Emerald',
    description: 'Vivid green glow',
    preview: ['#5EE8A8', '#34D088', '#105838'],
  },
  {
    variant: 'sunset',
    label: 'Sunset',
    description: 'Orange, pink & magenta',
    preview: ['#FBB060', '#F878A8', '#B84898'],
  },
  {
    variant: 'berry',
    label: 'Berry',
    description: 'Rich raspberry wine',
    preview: ['#F06078', '#E04058', '#682860'],
  },
  {
    variant: 'mint',
    label: 'Mint',
    description: 'Fresh seafoam green',
    preview: ['#80F0C8', '#58E0B0', '#28B0A8'],
  },
  {
    variant: 'midnight',
    label: 'Midnight',
    description: 'Deep indigo night',
    preview: ['#9098F8', '#6870E8', '#283080'],
  },
  {
    variant: 'peach',
    label: 'Peach',
    description: 'Creamy peach & rose',
    preview: ['#FCC890', '#F8A868', '#F088A8'],
  },
  {
    variant: 'plum',
    label: 'Plum',
    description: 'Royal violet purple',
    preview: ['#C888F0', '#A868E0', '#482078'],
  },
] as const;
