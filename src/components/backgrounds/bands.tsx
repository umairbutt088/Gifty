import { StyleSheet, View } from 'react-native';

import {
  BackgroundRoot,
  useBackgroundLayout,
  useBackgroundPalette,
  type BackgroundProps,
} from '@/components/backgrounds/shared';

export function BandsBackgroundStyle({ style, layout, ...props }: BackgroundProps) {
  const { width, height } = useBackgroundLayout(layout);
  const palette = useBackgroundPalette();

  const bands = [
    { color: palette.start, top: -height * 0.08, opacity: 0.55 },
    { color: palette.mid, top: height * 0.12, opacity: 0.42 },
    { color: palette.end, top: height * 0.32, opacity: 0.38 },
    { color: palette.accentDark, top: height * 0.52, opacity: 0.48 },
  ] as const;

  return (
    <BackgroundRoot style={style} {...props}>
      {bands.map((band, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            styles.band,
            {
              top: band.top,
              width: width * 1.6,
              left: -width * 0.3,
              height: height * 0.28,
              backgroundColor: band.color,
              opacity: band.opacity,
            },
          ]}
        />
      ))}
    </BackgroundRoot>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    borderRadius: 48,
    transform: [{ rotate: '-18deg' }],
  },
});
