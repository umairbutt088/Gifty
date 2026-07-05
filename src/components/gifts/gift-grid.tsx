import { StyleSheet, View, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';

type GiftGridProps = ViewProps & {
  children: React.ReactNode;
};

export function GiftGrid({ style, children, ...props }: GiftGridProps) {
  return (
    <View style={[styles.grid, style]} {...props}>
      {children}
    </View>
  );
}

export function GiftGridCell({ children }: { children: React.ReactNode }) {
  return <View style={styles.cell}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.one,
  },
  cell: {
    width: '50%',
    paddingHorizontal: Spacing.one,
    paddingBottom: Spacing.two,
  },
});
