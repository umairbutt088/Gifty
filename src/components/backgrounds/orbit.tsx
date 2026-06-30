import { StyleSheet, View } from 'react-native';

import {
  BackgroundRoot,
  useBackgroundLayout,
  useBackgroundPalette,
  type BackgroundProps,
} from '@/components/backgrounds/shared';

export function OrbitBackgroundStyle({ style, layout, ...props }: BackgroundProps) {
  const { width, height } = useBackgroundLayout(layout);
  const palette = useBackgroundPalette();

  const rings = [
    {
      size: width * 0.72,
      top: -height * 0.08,
      left: -width * 0.18,
      borderColor: palette.start,
      fill: palette.start,
      fillOpacity: 0.12,
      borderWidth: 2,
    },
    {
      size: width * 0.48,
      top: height * 0.14,
      left: width * 0.58,
      borderColor: palette.mid,
      fill: palette.mid,
      fillOpacity: 0.1,
      borderWidth: 1.5,
    },
    {
      size: width * 0.9,
      top: height * 0.52,
      left: -width * 0.22,
      borderColor: palette.end,
      fill: palette.end,
      fillOpacity: 0.08,
      borderWidth: 2,
    },
    {
      size: width * 0.22,
      top: height * 0.68,
      left: width * 0.68,
      borderColor: palette.accentLight,
      fill: palette.accent,
      fillOpacity: 0.35,
      borderWidth: 0,
    },
  ] as const;

  return (
    <BackgroundRoot style={style} {...props}>
      {rings.map((ring, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            styles.ring,
            {
              width: ring.size,
              height: ring.size,
              top: ring.top,
              left: ring.left,
              borderRadius: ring.size / 2,
              borderWidth: ring.borderWidth,
              borderColor: ring.borderColor,
              backgroundColor: ring.fill,
              opacity: ring.fillOpacity,
            },
          ]}
        />
      ))}
    </BackgroundRoot>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
  },
});
