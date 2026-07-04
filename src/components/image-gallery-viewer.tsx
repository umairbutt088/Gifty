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

function toSelectedIndex(pagerIndex: number, imageCount: number, loopEnabled: boolean) {
  'worklet';

  if (!loopEnabled) return pagerIndex;
  if (pagerIndex === 0) return imageCount - 1;
  if (pagerIndex === imageCount + 1) return 0;
  return pagerIndex - 1;
}

export function ImageGalleryViewer({
  images,
  mainHeight = 280,
  thumbnailSize = 72,
  emptyLabel = 'No photos',
}: ImageGalleryViewerProps) {
  const theme = useScreenTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);

  const loopEnabled = images.length > 1;
  const loopImages = loopEnabled
    ? [images[images.length - 1], ...images, images[0]]
    : images;

  const frameWidth = useSharedValue(0);
  const pagerLength = useSharedValue(loopImages.length);
  const pagerIndex = useSharedValue(loopEnabled ? 1 : 0);
  const dragX = useSharedValue(0);

  useEffect(() => {
    pagerLength.value = loopImages.length;
    pagerIndex.value = loopEnabled ? 1 : 0;
    dragX.value = 0;
    setSelectedIndex(0);
  }, [dragX, images, loopEnabled, loopImages.length, pagerIndex, pagerLength]);

  useEffect(() => {
    if (selectedIndex >= images.length) {
      setSelectedIndex(Math.max(0, images.length - 1));
    }
  }, [images.length, selectedIndex]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(loopEnabled)
        .activeOffsetX([-12, 12])
        .failOffsetY([-20, 20])
        .onUpdate((event) => {
          dragX.value = event.translationX;
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
            nextIndex += 1;
          } else if (event.translationX > threshold || event.velocityX > SWIPE_VELOCITY) {
            nextIndex -= 1;
          }

          const previousIndex = pagerIndex.value;
          if (nextIndex !== previousIndex) {
            pagerIndex.value = nextIndex;
            dragX.value = dragX.value + (nextIndex - previousIndex) * width;
            runOnJS(setSelectedIndex)(toSelectedIndex(nextIndex, images.length, loopEnabled));

            dragX.value = withTiming(0, { duration: SLIDE_DURATION }, (finished) => {
              if (!finished || !loopEnabled) return;

              if (nextIndex === 0) {
                pagerIndex.value = images.length;
                dragX.value = 0;
                return;
              }

              if (nextIndex === images.length + 1) {
                pagerIndex.value = 1;
                dragX.value = 0;
              }
            });
            return;
          }

          dragX.value = withTiming(0, { duration: SLIDE_DURATION });
        }),
    [dragX, frameWidth, images.length, loopEnabled, pagerIndex],
  );

  const pagerStyle = useAnimatedStyle(() => ({
    width: frameWidth.value * pagerLength.value,
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

    const targetPagerIndex = loopEnabled ? index + 1 : index;
    const from = pagerIndex.value;

    setSelectedIndex(index);
    pagerIndex.value = targetPagerIndex;

    if (frameWidth.value === 0) {
      dragX.value = 0;
      return;
    }

    dragX.value = (from - targetPagerIndex) * frameWidth.value;
    dragX.value = withTiming(0, { duration: SLIDE_DURATION });
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
            {loopImages.map((uri, index) => (
              <View
                key={`${uri}-${index}`}
                style={[styles.page, layoutWidth > 0 ? { width: layoutWidth } : styles.pageFlex]}>
                <Image
                  source={{ uri }}
                  style={styles.mainImage}
                  contentFit="cover"
                  backgroundColor="transparent"
                />
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
      </View>

      {loopEnabled ? (
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
    backgroundColor: 'transparent',
  },
  pager: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  page: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  pageFlex: {
    flex: 1,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
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
