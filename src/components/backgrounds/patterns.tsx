import { StyleSheet, View } from 'react-native';

import type { BackgroundShape } from '@/constants/colors';
import { Colors } from '@/constants/colors';
import type { ThemePalette } from '@/constants/color-themes';
import type { PaletteBackgroundPattern } from '@/constants/background-styles';

export type ResolvedBackgroundPalette = {
  start: string;
  mid: string;
  end: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  shapes: readonly BackgroundShape[];
};

export function resolvePalette(palette: ThemePalette): ResolvedBackgroundPalette {
  return {
    start: palette.hero[200],
    mid: palette.accent[200],
    end: palette.shadow[200],
    accent: palette.hero[100],
    accentLight: palette.accent[100],
    accentDark: palette.depth[300],
    shapes: [],
  };
}

type PatternLayout = {
  width: number;
  height: number;
  palette: ResolvedBackgroundPalette;
  source: ThemePalette;
};

function LayeredShape({
  shape,
  screenWidth,
  screenHeight,
}: {
  shape: BackgroundShape;
  screenWidth: number;
  screenHeight: number;
}) {
  const width = screenWidth * shape.widthRatio;
  const height = screenHeight * shape.heightRatio;
  const highlight = shape.colors[0];
  const mid = shape.colors[Math.floor(shape.colors.length / 2)];
  const base = shape.colors[shape.colors.length - 1];

  return (
    <View
      pointerEvents="none"
      style={[
        patternStyles.shapeWrapper,
        {
          top: screenHeight * shape.topRatio,
          left: screenWidth * shape.leftRatio,
          width,
          height,
          opacity: shape.opacity,
          transform: [{ rotate: shape.rotate }],
        },
      ]}>
      <View style={[patternStyles.shapeFill, { backgroundColor: base, borderRadius: shape.borderRadius }]} />
      <View
        style={[
          patternStyles.shapeFill,
          { backgroundColor: mid, borderRadius: shape.borderRadius, opacity: 0.55, top: '18%', height: '62%' },
        ]}
      />
      <View
        style={[
          patternStyles.shapeFill,
          { backgroundColor: highlight, borderRadius: shape.borderRadius, opacity: 0.38, top: 0, height: '36%' },
        ]}
      />
      <View style={[patternStyles.shapeGrain, { borderRadius: shape.borderRadius }]} />
    </View>
  );
}

export function AuroraPattern({ width, height, palette }: PatternLayout) {
  const orbs = [
    { size: width * 0.95, top: -height * 0.22, left: -width * 0.28, color: palette.start, opacity: 0.42 },
    { size: width * 0.72, top: height * 0.08, left: width * 0.42, color: palette.mid, opacity: 0.34 },
    { size: width * 1.05, top: height * 0.48, left: -width * 0.35, color: palette.end, opacity: 0.38 },
    { size: width * 0.55, top: height * 0.62, left: width * 0.55, color: palette.accent, opacity: 0.22 },
  ];

  return (
    <>
      {orbs.map((orb, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            patternStyles.absolute,
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
    </>
  );
}

export function MinimalPattern({ width, height, palette }: PatternLayout) {
  return (
    <>
      <View
        pointerEvents="none"
        style={[
          patternStyles.absolute,
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
          patternStyles.absolute,
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
          patternStyles.baseWash,
          { height: height * 0.45, backgroundColor: palette.accentDark, opacity: 0.35 },
        ]}
      />
    </>
  );
}

export function BandsPattern({ width, height, palette, source }: PatternLayout) {
  const bands = [
    { color: palette.start, top: -height * 0.08, opacity: 0.55 },
    { color: palette.mid, top: height * 0.12, opacity: 0.42 },
    { color: source.accent[100], top: height * 0.32, opacity: 0.38 },
    { color: palette.accentDark, top: height * 0.52, opacity: 0.48 },
  ];

  return (
    <>
      {bands.map((band, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            patternStyles.band,
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
    </>
  );
}

export function OrbitPattern({ width, height, palette, source }: PatternLayout) {
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
      borderColor: source.accent[100],
      fill: source.accent[200],
      fillOpacity: 0.35,
      borderWidth: 0,
    },
  ];

  return (
    <>
      {rings.map((ring, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            patternStyles.absolute,
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
    </>
  );
}

export function WavesPattern({ width, height, palette, source }: PatternLayout) {
  const waves = [
    { color: palette.start, top: height * 0.05, heightRatio: 0.22, opacity: 0.45 },
    { color: source.accent[100], top: height * 0.22, heightRatio: 0.2, opacity: 0.35 },
    { color: palette.mid, top: height * 0.38, heightRatio: 0.24, opacity: 0.32 },
    { color: palette.end, top: height * 0.58, heightRatio: 0.28, opacity: 0.4 },
  ];

  return (
    <>
      {waves.map((wave, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            patternStyles.wave,
            {
              top: wave.top,
              width: width * 1.4,
              left: -width * 0.2,
              height: height * wave.heightRatio,
              backgroundColor: wave.color,
              opacity: wave.opacity,
            },
          ]}
        />
      ))}
    </>
  );
}

export function BloomPattern({ width, height, palette, source }: PatternLayout) {
  const blooms = [
    {
      size: width * 1.1,
      top: -height * 0.15,
      left: -width * 0.25,
      color: palette.start,
      opacity: 0.3,
    },
    {
      size: width * 0.65,
      top: height * 0.18,
      left: width * 0.5,
      color: source.accent[100],
      opacity: 0.28,
    },
    {
      size: width * 0.85,
      top: height * 0.55,
      left: -width * 0.15,
      color: palette.mid,
      opacity: 0.22,
    },
  ];

  return (
    <>
      {blooms.map((bloom, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            patternStyles.absolute,
            {
              width: bloom.size,
              height: bloom.size,
              top: bloom.top,
              left: bloom.left,
              backgroundColor: bloom.color,
              opacity: bloom.opacity,
              borderRadius: bloom.size / 2,
            },
          ]}
        />
      ))}
    </>
  );
}

export function MeshPattern({ width, height, palette, source }: PatternLayout) {
  const tiles = [
    { color: palette.start, top: -height * 0.05, left: -width * 0.1, rotate: '-24deg', opacity: 0.4 },
    { color: source.accent[200], top: height * 0.15, left: width * 0.35, rotate: '18deg', opacity: 0.32 },
    { color: palette.mid, top: height * 0.42, left: -width * 0.2, rotate: '-12deg', opacity: 0.36 },
    { color: palette.end, top: height * 0.62, left: width * 0.45, rotate: '22deg', opacity: 0.28 },
  ];

  return (
    <>
      {tiles.map((tile, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            patternStyles.meshTile,
            {
              top: tile.top,
              left: tile.left,
              width: width * 0.75,
              height: height * 0.22,
              backgroundColor: tile.color,
              opacity: tile.opacity,
              transform: [{ rotate: tile.rotate }],
            },
          ]}
        />
      ))}
    </>
  );
}

export function GeometricPattern({
  width,
  height,
  shapes,
}: {
  width: number;
  height: number;
  shapes: readonly BackgroundShape[];
}) {
  return (
    <>
      {shapes.map((shape) => (
        <LayeredShape key={shape.id} shape={shape} screenWidth={width} screenHeight={height} />
      ))}
    </>
  );
}

export function renderPalettePattern(
  pattern: PaletteBackgroundPattern,
  layout: PatternLayout & { shapes: readonly BackgroundShape[] },
) {
  switch (pattern) {
    case 'minimal':
      return <MinimalPattern {...layout} />;
    case 'bands':
      return <BandsPattern {...layout} />;
    case 'orbit':
      return <OrbitPattern {...layout} />;
    case 'waves':
      return <WavesPattern {...layout} />;
    case 'bloom':
      return <BloomPattern {...layout} />;
    case 'mesh':
      return <MeshPattern {...layout} />;
    case 'geometric':
      return <GeometricPattern width={layout.width} height={layout.height} shapes={layout.shapes} />;
    case 'aurora':
    default:
      return <AuroraPattern {...layout} />;
  }
}

const patternStyles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
  shapeWrapper: {
    position: 'absolute',
  },
  shapeFill: {
    ...StyleSheet.absoluteFillObject,
  },
  shapeGrain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.grain,
  },
  baseWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  band: {
    position: 'absolute',
    borderRadius: 48,
    transform: [{ rotate: '-18deg' }],
  },
  wave: {
    position: 'absolute',
    borderRadius: 999,
    transform: [{ rotate: '-8deg' }],
  },
  meshTile: {
    position: 'absolute',
    borderRadius: 40,
  },
});
