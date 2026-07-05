import { StyleSheet, View, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';

type ButtonStackProps = ViewProps & {
  children: React.ReactNode;
  horizontal?: boolean;
};

export function ButtonStack({ style, children, horizontal = false, ...props }: ButtonStackProps) {
  return (
    <View
      style={[
        styles.stack,
        !horizontal && styles.stackOffsetTop,
        horizontal && styles.stackHorizontal,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.two,
  },
  stackOffsetTop: {
    marginTop: Spacing.six,
    
  },
  stackHorizontal: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
});
