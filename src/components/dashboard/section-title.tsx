import { StyleSheet, Text, type TextProps } from 'react-native';

import { useColors } from '@/hooks/use-colors';

export function SectionTitle({ style, ...props }: TextProps) {
  const colors = useColors();

  return <Text style={[styles.title, { color: colors.text }, style]} {...props} />;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
