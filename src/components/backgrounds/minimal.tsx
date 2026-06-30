import { StyleSheet, View } from 'react-native';

import {
  BackgroundRoot,
  useBackgroundLayout,
  useBackgroundPalette,
  type BackgroundProps,
} from '@/components/backgrounds/shared';

export function MinimalBackgroundStyle({ style, layout, ...props }: BackgroundProps) {
  const { width, height } = useBackgroundLayout(layout);
  const palette = useBackgroundPalette();

  return (
    <BackgroundRoot style={style} {...props}>
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: width * 1.2,
            height: height * 0.55,
            top: -height * 0.12,
            left: -width * 0.1,
            backgroundColor: palette.start,
            opacity: 0.28,
            borderRadius: width,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: width * 0.7,
            height: height * 0.35,
            top: height * 0.02,
            left: width * 0.35,
            backgroundColor: palette.mid,
            opacity: 0.16,
            borderRadius: width * 0.5,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.baseWash,
          {
            height: height * 0.45,
            backgroundColor: palette.accentDark,
            opacity: 0.35,
          },
        ]}
      />
    </BackgroundRoot>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
  baseWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
