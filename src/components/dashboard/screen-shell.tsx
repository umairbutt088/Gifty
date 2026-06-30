import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/screen-background';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

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
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
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
      <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
});
