import { StyleSheet, useWindowDimensions, View, type ViewProps } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';

export type BackgroundLayout = {
  width: number;
  height: number;
};

export type BackgroundProps = ViewProps & {
  layout?: BackgroundLayout;
};

export function useBackgroundLayout(layout?: BackgroundLayout): BackgroundLayout {
  const window = useWindowDimensions();
  return {
    width: layout?.width ?? window.width,
    height: layout?.height ?? window.height,
  };
}

export function useBackgroundPalette() {
  const theme = useScreenTheme();

  return {
    start: theme.brandGradient.start,
    mid: theme.brandGradient.mid,
    end: theme.brandGradient.end,
    accent: theme.accent,
    accentLight: theme.accentLight,
    accentDark: theme.accentDark,
    shapes: theme.backgroundShapes,
  };
}

export function BackgroundRoot({ style, children, ...props }: ViewProps) {
  const colors = useColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]} {...props}>
      {children}
      <GrainOverlay />
      <VignetteOverlay />
    </View>
  );
}

function GrainOverlay() {
  const colors = useColors();

  return <View pointerEvents="none" style={[styles.grainOverlay, { backgroundColor: colors.grain }]} />;
}

function VignetteOverlay() {
  const colors = useColors();

  return (
    <View pointerEvents="none" style={styles.vignette}>
      <View style={styles.vignetteFade} />
      <View style={[styles.vignetteBase, { backgroundColor: colors.vignette }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  grainOverlay: {
    ...StyleSheet.absoluteFill,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  vignetteFade: {
    flex: 1,
  },
  vignetteBase: {
    height: '42%',
  },
});
