import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

const SLIDE_DURATION = 280;
const SWIPE_DISTANCE_RATIO = 0.2;
const SWIPE_VELOCITY = 400;

type ImageGalleryViewerProps = {
  images: string[];
  mainHeight?: number;
  thumbnailSize?: number;
  emptyLabel?: string;
};

export function ImageGalleryViewer({
  images,
  mainHeight = 280,
  thumbnailSize = 72,
  emptyLabel = 'No photos',
}: ImageGalleryViewerProps) {
  const theme = useScreenTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);

  const frameWidth = useSharedValue(0);
  const imageCount = useSharedValue(images.length);
  const pagerIndex = useSharedValue(0);
  const dragX = useSharedValue(0);

  useEffect(() => {
    imageCount.value = images.length;
  }, [imageCount, images.length]);

  useEffect(() => {
    if (selectedIndex >= images.length) {
      const nextIndex = Math.max(0, images.length - 1);
      setSelectedIndex(nextIndex);
      pagerIndex.value = nextIndex;
      dragX.value = 0;
    }
  }, [dragX, images.length, pagerIndex, selectedIndex]);

  useEffect(() => {
    if (pagerIndex.value === selectedIndex) return;

    const from = pagerIndex.value;
    pagerIndex.value = selectedIndex;

    if (frameWidth.value === 0) {
      dragX.value = 0;
      return;
    }

    dragX.value = (from - selectedIndex) * frameWidth.value;
    dragX.value = withTiming(0, { duration: SLIDE_DURATION });
  }, [dragX, frameWidth, pagerIndex, selectedIndex]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(images.length > 1)
        .activeOffsetX([-12, 12])
        .failOffsetY([-20, 20])
        .onUpdate((event) => {
          const width = frameWidth.value;
          if (width === 0) return;

          let offset = event.translationX;
          const index = pagerIndex.value;
          const lastIndex = imageCount.value - 1;

          if (index <= 0 && offset > 0) offset *= 0.35;
          if (index >= lastIndex && offset < 0) offset *= 0.35;

          dragX.value = offset;
        })
        .onEnd((event) => {
          const width = frameWidth.value;
          if (width === 0) {
            dragX.value = withTiming(0, { duration: SLIDE_DURATION });
            return;
          }

          const threshold = width * SWIPE_DISTANCE_RATIO;
          let nextIndex = pagerIndex.value;

          if (event.translationX < -threshold || event.velocityX < -SWIPE_VELOCITY) {
            nextIndex = Math.min(nextIndex + 1, imageCount.value - 1);
          } else if (event.translationX > threshold || event.velocityX > SWIPE_VELOCITY) {
            nextIndex = Math.max(nextIndex - 1, 0);
          }

          const previousIndex = pagerIndex.value;
          if (nextIndex !== previousIndex) {
            pagerIndex.value = nextIndex;
            dragX.value = dragX.value + (nextIndex - previousIndex) * width;
            runOnJS(setSelectedIndex)(nextIndex);
          }

          dragX.value = withTiming(0, { duration: SLIDE_DURATION });
        }),
    [dragX, frameWidth, imageCount, pagerIndex, images.length],
  );

  const pagerStyle = useAnimatedStyle(() => ({
    width: frameWidth.value * imageCount.value,
    transform: [{ translateX: -pagerIndex.value * frameWidth.value + dragX.value }],
  }));

  if (images.length === 0) {
    return (
      <View style={[styles.empty, { height: mainHeight }]}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  const safeIndex = Math.min(selectedIndex, images.length - 1);

  function selectImage(index: number) {
    if (index === safeIndex) return;
    setSelectedIndex(index);
  }

  return (
    <View style={styles.root}>
      <View
        style={[styles.mainFrame, { height: mainHeight }]}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          setLayoutWidth(width);
          frameWidth.value = width;
        }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.pager, { height: mainHeight }, pagerStyle]}>
            {images.map((uri, index) => (
              <View
                key={`${uri}-${index}`}
                style={[styles.page, layoutWidth > 0 ? { width: layoutWidth } : styles.pageFlex]}>
                <Image source={{ uri }} style={styles.mainImage} contentFit="cover" />
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
      </View>

      {images.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailRow}>
          {images.map((uri, index) => {
            const selected = index === safeIndex;

            return (
              <Pressable
                key={`${uri}-${index}`}
                onPress={() => selectImage(index)}
                style={({ pressed }) => [pressed && styles.thumbnailPressed]}>
                <View
                  style={[
                    styles.thumbnailWrap,
                    {
                      width: thumbnailSize,
                      height: thumbnailSize,
                      borderColor: selected ? theme.accent : theme.surfaceBorder,
                      backgroundColor: selected ? theme.surfaceSelected : theme.surface,
                    },
                  ]}>
                  <Image source={{ uri }} style={styles.thumbnailImage} contentFit="cover" />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
  mainFrame: {
    width: '100%',
    borderRadius: Spacing.four,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceNested,
  },
  pager: {
    flexDirection: 'row',
  },
  page: {
    height: '100%',
  },
  pageFlex: {
    flex: 1,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailRow: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  thumbnailWrap: {
    borderWidth: 2,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  thumbnailPressed: {
    opacity: 0.85,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  empty: {
    width: '100%',
    borderRadius: Spacing.four,
    backgroundColor: Colors.surfaceNested,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
