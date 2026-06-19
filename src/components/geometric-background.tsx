import { StyleSheet, useWindowDimensions, View, type ViewProps } from 'react-native';

import { BackgroundShapes, Colors, type BackgroundShape } from '@/constants/colors';

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

type GeometricBackgroundProps = ViewProps;

export function GeometricBackground({ style, ...props }: GeometricBackgroundProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, style]} {...props}>
      {BackgroundShapes.map((shape) => (
        <LayeredShape key={shape.id} {...shape} screenWidth={width} screenHeight={height} />
      ))}
      <View pointerEvents="none" style={styles.grainOverlay} />
      <View pointerEvents="none" style={styles.vignette}>
        <View style={styles.vignetteFade} />
        <View style={styles.vignetteBase} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
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
  grainOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.grain,
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
    backgroundColor: Colors.vignette,
  },
});
