import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GradientText } from './gradient-text';
import { getLinearGradientSteps } from '@/constants/colors';
import { Fonts } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

const BANNER_GRADIENT_STOPS = 36;
const WORDMARK = 'gifty';
const TAGLINE = 'GIFTING REIMAGINED';
const SHIMMER_WIDTH = 72;
const SHIMMER_DURATION_MS = 2800;

export type BrandBannerProps = {
  showTagline?: boolean;
};

function BannerGradient({ gradientStart, gradientEnd }: { gradientStart: string; gradientEnd: string }) {
  const stops = getLinearGradientSteps(gradientStart, gradientEnd, BANNER_GRADIENT_STOPS);

  return (
    <Animated.View style={styles.gradientRow}>
      {stops.map((color, index) => (
        <Animated.View key={index} style={[styles.gradientSlice, { backgroundColor: color }]} />
      ))}
    </Animated.View>
  );
}

function ShimmerOverlay({ width }: { width: number }) {
  const translateX = useSharedValue(-SHIMMER_WIDTH);

  useEffect(() => {
    if (width <= 0) return;

    translateX.value = -SHIMMER_WIDTH;
    translateX.value = withRepeat(
      withTiming(width + SHIMMER_WIDTH, {
        duration: SHIMMER_DURATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [translateX, width]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: '18deg' }],
  }));

  if (width <= 0) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.shimmerTrack, shimmerStyle]}>
      <View style={styles.shimmerGlowEdge} />
      <View style={styles.shimmerGlowCore} />
      <View style={styles.shimmerGlowEdge} />
    </Animated.View>
  );
}

function AnimatedRing({
  style,
  delay = 0,
  ringColor,
}: {
  style: ViewStyle;
  delay?: number;
  ringColor: string;
}) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.75, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.35, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ring, { borderColor: ringColor }, style, ringStyle]} />;
}

function AccentDot({ color }: { color: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [scale]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.accentDot, { backgroundColor: color }, dotStyle]} />;
}

function DecorativeRings({ ringColor, accentColor }: { ringColor: string; accentColor: string }) {
  return (
    <>
      <AnimatedRing style={styles.ringBottomOuter} delay={0} ringColor={ringColor} />
      <AnimatedRing style={styles.ringBottomInner} delay={400} ringColor={ringColor} />
      <AnimatedRing style={styles.ringTopOuter} delay={200} ringColor={ringColor} />
      <AnimatedRing style={styles.ringTopInner} delay={600} ringColor={ringColor} />
      <AccentDot color={accentColor} />
    </>
  );
}

export function BrandBanner({ showTagline = true }: BrandBannerProps) {
  const theme = useScreenTheme();
  const banner = theme.brandBanner;
  const [bannerWidth, setBannerWidth] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    setBannerWidth(event.nativeEvent.layout.width);
  }

  const wordmarkColors = getLinearGradientSteps(
    banner.wordmarkGradientStart,
    banner.wordmarkGradientEnd,
    WORDMARK.length,
  );
  const taglineColors = getLinearGradientSteps(
    banner.taglineGradientStart,
    banner.taglineGradientEnd,
    TAGLINE.length,
  );

  return (
    <Animated.View
      entering={FadeInDown.duration(600)}
      onLayout={handleLayout}
      style={styles.banner}
      accessibilityRole="image"
      accessibilityLabel="Gifty brand banner">
      <BannerGradient gradientStart={banner.gradientStart} gradientEnd={banner.gradientEnd} />
      <ShimmerOverlay width={bannerWidth} />
      <DecorativeRings ringColor={banner.ring} accentColor={theme.brandGradient.start} />

      <Animated.View style={styles.content}>
        <GradientText
          text={WORDMARK}
          colors={wordmarkColors}
          style={styles.wordmark}
          letterSpacing={14}
          baseDelay={200}
        />
        {showTagline ? (
          <GradientText
            text={TAGLINE}
            colors={taglineColors}
            style={styles.tagline}
            letterSpacing={5}
            baseDelay={520}
          />
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    minHeight: 128,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientRow: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  gradientSlice: {
    flex: 1,
    height: '100%',
  },
  shimmerTrack: {
    position: 'absolute',
    top: -48,
    bottom: -48,
    left: 0,
    width: SHIMMER_WIDTH,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  shimmerGlowCore: {
    flex: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
  },
  shimmerGlowEdge: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 24,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  ringBottomOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    bottom: -58,
    left: -42,
  },
  ringBottomInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    bottom: -38,
    left: -24,
  },
  ringTopOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    top: -28,
    right: -18,
  },
  ringTopInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    top: 8,
    right: 28,
  },
  accentDot: {
    position: 'absolute',
    right: 36,
    top: '46%',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: -3.5,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 10,
  },
  wordmark: {
    fontSize: 44,
    fontWeight: '200',
    textTransform: 'lowercase',
    fontFamily: Platform.select({
      ios: Fonts.rounded,
      android: 'sans-serif-light',
      default: Fonts.rounded,
    }),
  },
  tagline: {
    fontSize: 10,
    fontWeight: '400',
    textTransform: 'uppercase',
    fontFamily: Platform.select({
      ios: Fonts.sans,
      android: 'sans-serif',
      default: Fonts.sans,
    }),
  },
});
