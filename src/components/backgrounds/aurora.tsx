import { StyleSheet, View } from 'react-native';

import {
  BackgroundRoot,
  useBackgroundLayout,
  useBackgroundPalette,
  type BackgroundProps,
} from '@/components/backgrounds/shared';

export function AuroraBackgroundStyle({ style, layout, ...props }: BackgroundProps) {
  const { width, height } = useBackgroundLayout(layout);
  const palette = useBackgroundPalette();

  const orbs = [
    {
      size: width * 0.95,
      top: -height * 0.22,
      left: -width * 0.28,
      color: palette.start,
      opacity: 0.42,
    },
    {
      size: width * 0.72,
      top: height * 0.08,
      left: width * 0.42,
      color: palette.mid,
      opacity: 0.34,
    },
    {
      size: width * 1.05,
      top: height * 0.48,
      left: -width * 0.35,
      color: palette.end,
      opacity: 0.38,
    },
    {
      size: width * 0.55,
      top: height * 0.62,
      left: width * 0.55,
      color: palette.accent,
      opacity: 0.22,
    },
  ] as const;

  return (
    <BackgroundRoot style={style} {...props}>
      {orbs.map((orb, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            styles.orb,
            {
              width: orb.size,
              height: orb.size,
              top: orb.top,
              left: orb.left,
              backgroundColor: orb.color,
              opacity: orb.opacity,
              borderRadius: orb.size / 2,
            },
          ]}
        />
      ))}
    </BackgroundRoot>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
  },
});
