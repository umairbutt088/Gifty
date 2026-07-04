import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/screen-background';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

/** Pull headers slightly closer to the notch while keeping content readable. */
const TOP_INSET_TRIM = 14;

/** Horizontal padding used by ScreenShell scroll content and full-bleed screens. */
export const SCREEN_HORIZONTAL_PADDING = Spacing.three;

type ScreenShellProps = ViewProps & {
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  children: React.ReactNode;
};

export function ScreenShell({
  scroll = true,
  scrollProps,
  style,
  children,
  ...props
}: ScreenShellProps) {
  const insets = useSafeAreaInsets();
  const safeAreaPadding = {
    paddingTop: Math.max(insets.top - TOP_INSET_TRIM, Spacing.one),
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      {...scrollProps}>
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <View style={[styles.root, style]} {...props}>
      <ScreenBackground />
      <View style={[styles.safeArea, safeAreaPadding]}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
});
