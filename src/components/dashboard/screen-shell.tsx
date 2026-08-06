import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketplaceHomeHeader } from '@/components/buyer/marketplace-home-header';
import { ScreenBackground } from '@/components/screen-background';
import type { ScreenBackgroundVariant } from '@/constants/background-styles';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

import { DashboardHeader } from './dashboard-header';

/** Pull headers slightly closer to the notch while keeping content readable. */
const TOP_INSET_TRIM = 14;

/** Horizontal padding used by ScreenShell scroll content and full-bleed screens. */
export const SCREEN_HORIZONTAL_PADDING = Spacing.three;

type ScreenShellProps = ViewProps & {
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  /** Stable ref for the shell ScrollView (preferred over scrollProps.ref). */
  scrollRef?: Ref<ScrollView>;
  /** Remount the ScrollView when this key changes (resets scroll offset). */
  scrollKey?: string | number;
  backgroundVariant?: ScreenBackgroundVariant;
  /** Which safe-area edges ScreenShell should pad. Defaults to all four. */
  safeAreaEdges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  children: React.ReactNode;
};

function isStickyHeaderElement(child: ReactNode): child is ReactElement {
  return (
    isValidElement(child) &&
    (child.type === DashboardHeader || child.type === MarketplaceHomeHeader)
  );
}

function partitionStickyHeader(children: ReactNode) {
  const items = Children.toArray(children);
  let header: ReactNode = null;
  const body: ReactNode[] = [];

  for (const child of items) {
    if (!header && isStickyHeaderElement(child)) {
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
  scrollRef,
  scrollKey,
  backgroundVariant,
  safeAreaEdges = ['top', 'right', 'bottom', 'left'],
  style,
  children,
  ...props
}: ScreenShellProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const edges = new Set(safeAreaEdges);
  const safeAreaPadding = {
    paddingTop: edges.has('top')
      ? Math.max(insets.top - TOP_INSET_TRIM, Spacing.one)
      : 0,
    paddingBottom: edges.has('bottom') ? insets.bottom : 0,
    paddingLeft: edges.has('left') ? insets.left : 0,
    paddingRight: edges.has('right') ? insets.right : 0,
  };

  const { header, body } = partitionStickyHeader(children);
  const hasStickyHeader = header !== null;
  const {
    contentContainerStyle: scrollContentStyle,
    style: scrollStyle,
    ...restScrollProps
  } = scrollProps ?? {};

  let content: ReactNode;

  if (scroll) {
    const scrollView = (
      <ScrollView
        key={scrollKey}
        ref={scrollRef}
        style={[hasStickyHeader ? styles.scroll : undefined, scrollStyle]}
        contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        {...restScrollProps}>
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
      <ScreenBackground variant={backgroundVariant} />
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
});
