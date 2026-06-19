import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, getLinearGradientSteps } from '@/constants/colors';

export type NotchedShapeProps = {
  width: number;
  height: number;
  chamfer?: number;
  fill?: string;
  fillSecondary?: string;
  stroke?: string;
  cornerAccent?: string;
  showCornerAccents?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

function clampChamfer(width: number, height: number, chamfer: number) {
  return Math.min(chamfer, width / 2 - 1, height / 2 - 1);
}

type CornerProps = {
  chamfer: number;
  color: string;
  corner: 'tl' | 'tr' | 'bl' | 'br';
};

function CornerFill({ chamfer, color, corner }: CornerProps) {
  const base = {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderStyle: 'solid' as const,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  };

  if (corner === 'tl') {
    return (
      <View
        style={[
          base,
          {
            top: 0,
            left: chamfer,
            borderLeftWidth: chamfer,
            borderLeftColor: color,
            borderBottomWidth: chamfer,
            borderBottomColor: color,
          },
        ]}
      />
    );
  }

  if (corner === 'tr') {
    return (
      <View
        style={[
          base,
          {
            top: 0,
            right: chamfer,
            borderRightWidth: chamfer,
            borderRightColor: color,
            borderBottomWidth: chamfer,
            borderBottomColor: color,
          },
        ]}
      />
    );
  }

  if (corner === 'bl') {
    return (
      <View
        style={[
          base,
          {
            bottom: 0,
            left: chamfer,
            borderLeftWidth: chamfer,
            borderLeftColor: color,
            borderTopWidth: chamfer,
            borderTopColor: color,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        base,
        {
          bottom: 0,
          right: chamfer,
          borderRightWidth: chamfer,
          borderRightColor: color,
          borderTopWidth: chamfer,
          borderTopColor: color,
        },
      ]}
    />
  );
}

function getChamferHorizontalBounds(
  width: number,
  height: number,
  chamfer: number,
  y: number,
): { left: number; right: number } {
  if (y < chamfer) {
    const inset = chamfer - y;
    return { left: inset, right: width - inset };
  }

  if (y > height - chamfer) {
    const inset = y - (height - chamfer);
    return { left: inset, right: width - inset };
  }

  return { left: 0, right: width };
}

const GRADIENT_SLICE_MIN = 14;
const GRADIENT_SLICE_MAX = 28;

function getGradientSliceCount(height: number) {
  return Math.min(GRADIENT_SLICE_MAX, Math.max(GRADIENT_SLICE_MIN, Math.round(height)));
}

type ChamferFillProps = {
  width: number;
  height: number;
  chamfer: number;
  fill: string;
  fillSecondary?: string;
};

function SolidChamferFill({ width, height, chamfer, fill }: ChamferFillProps) {
  const c = clampChamfer(width, height, chamfer);

  return (
    <>
      <View style={{ position: 'absolute', top: c, bottom: c, left: c, right: c, backgroundColor: fill }} />
      <View style={{ position: 'absolute', top: 0, left: c, right: c, height: c, backgroundColor: fill }} />
      <View style={{ position: 'absolute', bottom: 0, left: c, right: c, height: c, backgroundColor: fill }} />
      <View style={{ position: 'absolute', top: c, bottom: c, left: 0, width: c, backgroundColor: fill }} />
      <View style={{ position: 'absolute', top: c, bottom: c, right: 0, width: c, backgroundColor: fill }} />
      <CornerFill chamfer={c} color={fill} corner="tl" />
      <CornerFill chamfer={c} color={fill} corner="tr" />
      <CornerFill chamfer={c} color={fill} corner="bl" />
      <CornerFill chamfer={c} color={fill} corner="br" />
    </>
  );
}

function GradientChamferFill({ width, height, chamfer, fill, fillSecondary }: ChamferFillProps) {
  const c = clampChamfer(width, height, chamfer);
  const sliceCount = getGradientSliceCount(height);
  const stops = getLinearGradientSteps(fill, fillSecondary ?? fill, sliceCount);
  const sliceHeight = height / sliceCount;

  return (
    <>
      {stops.map((color, index) => {
        const y = index * sliceHeight;
        const yMid = y + sliceHeight / 2;
        const { left, right } = getChamferHorizontalBounds(width, height, c, yMid);

        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              top: y,
              left,
              width: right - left,
              height: sliceHeight + 1,
              backgroundColor: color,
            }}
          />
        );
      })}
    </>
  );
}

function ChamferFill(props: ChamferFillProps) {
  if (props.fillSecondary) {
    return <GradientChamferFill {...props} />;
  }

  return <SolidChamferFill {...props} />;
}

type ChamferStrokeProps = {
  width: number;
  height: number;
  chamfer: number;
  stroke: string;
  accent?: string;
  showAccent?: boolean;
};

function ChamferStroke({ width, height, chamfer, stroke, accent, showAccent }: ChamferStrokeProps) {
  const c = clampChamfer(width, height, chamfer);
  const inset = showAccent ? 2 : 0;
  const accentColor = accent ?? stroke;
  const diagonal = Math.hypot(c, c);
  const angle = `${Math.atan2(c, c) * (180 / Math.PI)}deg`;

  const edge = (extra: ViewStyle) => [styles.edge, extra];

  return (
    <>
      <View style={edge({ top: 0, left: c, right: c, height: 1, backgroundColor: stroke })} />
      <View style={edge({ bottom: 0, left: c, right: c, height: 1, backgroundColor: stroke })} />
      <View style={edge({ top: c, bottom: c, left: 0, width: 1, backgroundColor: stroke })} />
      <View style={edge({ top: c, bottom: c, right: 0, width: 1, backgroundColor: stroke })} />

      <View
        style={edge({
          top: c / 2,
          left: inset,
          width: diagonal - inset,
          transform: [{ rotate: `-${angle}` }],
          backgroundColor: showAccent ? accentColor : stroke,
        })}
      />
      <View
        style={edge({
          top: c / 2,
          right: inset,
          width: diagonal - inset,
          transform: [{ rotate: angle }],
          backgroundColor: showAccent ? accentColor : stroke,
        })}
      />
      <View
        style={edge({
          bottom: c / 2,
          left: inset,
          width: diagonal - inset,
          transform: [{ rotate: angle }],
          backgroundColor: showAccent ? accentColor : stroke,
        })}
      />
      <View
        style={edge({
          bottom: c / 2,
          right: inset,
          width: diagonal - inset,
          transform: [{ rotate: `-${angle}` }],
          backgroundColor: showAccent ? accentColor : stroke,
        })}
      />
    </>
  );
}

export function NotchedShape({
  width,
  height,
  chamfer = 8,
  fill = Colors.tabTrack,
  fillSecondary,
  stroke = Colors.surfaceBorder,
  cornerAccent = Colors.tabCornerAccent,
  showCornerAccents = false,
  style,
  children,
}: NotchedShapeProps) {
  const c = clampChamfer(width, height, chamfer);
  const webClip =
    Platform.OS === 'web'
      ? ({
          clipPath: `polygon(${c}px 0, ${width - c}px 0, ${width}px ${c}px, ${width}px ${height - c}px, ${width - c}px ${height}px, ${c}px ${height}px, 0 ${height - c}px, 0 ${c}px)`,
        } as ViewStyle)
      : undefined;

  return (
    <View style={[{ width, height }, style]}>
      <View style={[styles.shape, webClip]}>
        <ChamferFill width={width} height={height} chamfer={c} fill={fill} fillSecondary={fillSecondary} />
        <ChamferStroke
          width={width}
          height={height}
          chamfer={c}
          stroke={stroke}
          accent={cornerAccent}
          showAccent={showCornerAccents}
        />
      </View>

      {children ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shape: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  edge: {
    position: 'absolute',
    height: 1,
  },
  content: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
