import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/screen-background';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';

import { DashboardHeader } from './dashboard-header';

/** Pull headers slightly closer to the notch while keeping content readable. */
const TOP_INSET_TRIM = 14;

/** Horizontal padding used by ScreenShell scroll content and full-bleed screens. */
export const SCREEN_HORIZONTAL_PADDING = Spacing.three;

type ScreenShellProps = ViewProps & {
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  children: React.ReactNode;
};

function isDashboardHeaderElement(child: ReactNode): child is ReactElement {
  return isValidElement(child) && child.type === DashboardHeader;
}

function partitionStickyHeader(children: ReactNode) {
  const items = Children.toArray(children);
  let header: ReactNode = null;
  const body: ReactNode[] = [];

  for (const child of items) {
    if (!header && isDashboardHeaderElement(child)) {
      header = child;
      continue;
    }

    body.push(child);
  }

  return { header, body };
}

export function ScreenShell({
  scroll = true,
  scrollProps,
  style,
  children,
  ...props
}: ScreenShellProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const safeAreaPadding = {
    paddingTop: Math.max(insets.top - TOP_INSET_TRIM, Spacing.one),
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const { header, body } = partitionStickyHeader(children);
  const hasStickyHeader = header !== null;

  let content: ReactNode;

  if (scroll) {
    const scrollView = (
      <ScrollView
        style={hasStickyHeader ? styles.scroll : undefined}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        {...scrollProps}>
        {hasStickyHeader ? body : children}
      </ScrollView>
    );

    content = hasStickyHeader ? (
      <View style={styles.stickyLayout}>
        <View style={styles.stickyHeader}>{header}</View>
        {scrollView}
      </View>
    ) : (
      scrollView
    );
  } else if (hasStickyHeader) {
    content = (
      <View style={styles.stickyLayout}>
        <View style={styles.stickyHeader}>{header}</View>
        <View style={styles.body}>{body}</View>
      </View>
    );
  } else {
    content = children;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]} {...props}>
      <ScreenBackground />
      <View style={[styles.safeArea, safeAreaPadding]}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  stickyLayout: {
    flex: 1,
  },
  stickyHeader: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.two,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
});
