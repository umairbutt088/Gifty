import { StyleSheet, View, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';

type CardListProps = ViewProps & {
  children: React.ReactNode;
};

export function CardList({ style, children, ...props }: CardListProps) {
  return (
    <View style={[styles.list, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
});
