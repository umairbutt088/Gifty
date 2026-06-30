import { StyleSheet, View } from 'react-native';

import type { BackgroundShape } from '@/constants/colors';
import { Colors } from '@/constants/colors';
import {
  BackgroundRoot,
  useBackgroundLayout,
  useBackgroundPalette,
  type BackgroundProps,
} from '@/components/backgrounds/shared';

type LayeredShapeProps = BackgroundShape & {
  screenWidth: number;
  screenHeight: number;
};

function LayeredShape({
  screenWidth,
  screenHeight,
  widthRatio,
  heightRatio,
  topRatio,
  leftRatio,
  colors,
  borderRadius,
  rotate,
  opacity,
}: LayeredShapeProps) {
  const width = screenWidth * widthRatio;
  const height = screenHeight * heightRatio;
  const highlight = colors[0];
  const mid = colors[Math.floor(colors.length / 2)];
  const base = colors[colors.length - 1];

  return (
    <View
      pointerEvents="none"
      style={[
        styles.shapeWrapper,
        {
          top: screenHeight * topRatio,
          left: screenWidth * leftRatio,
          width,
          height,
          opacity,
          transform: [{ rotate }],
        },
      ]}>
      <View style={[styles.shapeFill, { backgroundColor: base, borderRadius }]} />
      <View
        style={[
          styles.shapeFill,
          { backgroundColor: mid, borderRadius, opacity: 0.55, top: '18%', height: '62%' },
        ]}
      />
      <View
        style={[
          styles.shapeFill,
          { backgroundColor: highlight, borderRadius, opacity: 0.38, top: 0, height: '36%' },
        ]}
      />
      <View style={[styles.shapeGrain, { borderRadius }]} />
    </View>
  );
}

export function GeometricBackgroundStyle({ style, layout, ...props }: BackgroundProps) {
  const { width, height } = useBackgroundLayout(layout);
  const { shapes } = useBackgroundPalette();

  return (
    <BackgroundRoot style={style} {...props}>
      {shapes.map((shape) => (
        <LayeredShape key={shape.id} {...shape} screenWidth={width} screenHeight={height} />
      ))}
    </BackgroundRoot>
  );
}

const styles = StyleSheet.create({
  shapeWrapper: {
    position: 'absolute',
  },
  shapeFill: {
    ...StyleSheet.absoluteFill,
  },
  shapeGrain: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.grain,
  },
});
