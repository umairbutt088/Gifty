import {
  resolvePalette,
  renderPalettePattern,
} from '@/components/backgrounds/patterns';
import {
  BackgroundRoot,
  useBackgroundLayout,
  type BackgroundProps,
} from '@/components/backgrounds/shared';
import type { PaletteBackgroundPattern } from '@/constants/background-styles';
import {
  buildBackgroundShapesFromPalette,
  ThemePalettes,
  type ScreenThemeVariant,
  type ThemePalette,
} from '@/constants/color-themes';
import { useAppTheme } from '@/providers/screen-theme-provider';

type PaletteBackgroundStyleProps = BackgroundProps & {
  palette: ThemePalette;
  pattern: PaletteBackgroundPattern;
};

export function PaletteBackgroundStyle({
  palette,
  pattern,
  style,
  layout,
  ...props
}: PaletteBackgroundStyleProps) {
  const { width, height } = useBackgroundLayout(layout);
  const resolved = resolvePalette(palette);
  const shapes = buildBackgroundShapesFromPalette(palette);

  return (
    <BackgroundRoot style={style} {...props}>
      {renderPalettePattern(pattern, {
        width,
        height,
        palette: resolved,
        source: palette,
        shapes,
      })}
    </BackgroundRoot>
  );
}

export function PaletteBackgroundByTheme({
  themeKey,
  pattern,
  ...props
}: BackgroundProps & {
  themeKey: ScreenThemeVariant;
  pattern: PaletteBackgroundPattern;
}) {
  return <PaletteBackgroundStyle palette={ThemePalettes[themeKey]} pattern={pattern} {...props} />;
}

/** Background pattern using the user's currently selected color theme. */
export function ThemedBackgroundStyle({
  pattern,
  ...props
}: BackgroundProps & { pattern: PaletteBackgroundPattern }) {
  const { variant: themeVariant } = useAppTheme();

  return <PaletteBackgroundByTheme themeKey={themeVariant} pattern={pattern} {...props} />;
}
